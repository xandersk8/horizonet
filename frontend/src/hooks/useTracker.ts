'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { socket } from '@/lib/socket';
import { calculateDistance } from '@/lib/tripUtils';

export interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: string;
}

export function useTracker() {
    const [tripId, setTripId] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [path, setPath] = useState<LocationPoint[]>([]);
    const [distance, setDistance] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
    const [destination, setDestination] = useState<LocationPoint | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const tripWatchIdRef = useRef<number | null>(null);
    const pendingLocationsRef = useRef<LocationPoint[]>([]);

    // Sync pending locations to backend
    const syncLocations = async (locations: LocationPoint[]) => {
        if (!tripId || locations.length === 0) return;

        try {
            const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
                ? process.env.NEXT_PUBLIC_BACKEND_URL
                : 'https://sua-url-do-backend-no-render-ou-railway.com'; // Placeholder or env

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({ tripId, locations })
            });

            if (response.ok) {
                pendingLocationsRef.current = [];
            }
        } catch (err) {
            console.error('Failed to sync locations, will retry later:', err);
        }
    };

    const startTrip = async () => {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
            alert('Faça login primeiro!');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trips`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.session.access_token}`
                }
            });
            const data = await response.json();
            setTripId(data.id);
            setIsTracking(true);
            setPath(currentLocation ? [currentLocation] : []);
            setDistance(0);
            setStartTime(Date.now());
            socket.connect();
            socket.emit('join-trip', data.id);
        } catch (err) {
            console.error('Error starting trip:', err);
            alert('Erro ao iniciar viagem. Verifique se o servidor backend está rodando em ' + process.env.NEXT_PUBLIC_BACKEND_URL);
        }
    };

    useEffect(() => {
        // Continuous position watching for map centering
        if ("geolocation" in navigator) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const point = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: new Date().toISOString()
                    };
                    setCurrentLocation(point);

                    // If tracking, update path and distance
                    if (isTracking && tripId) {
                        setPath(prev => {
                            if (prev.length > 0) {
                                const lastPoint = prev[prev.length - 1];
                                const d = calculateDistance(
                                    lastPoint.latitude, lastPoint.longitude,
                                    point.latitude, point.longitude
                                );
                                setDistance(old => old + d);
                            }
                            return [...prev, point];
                        });
                        socket.emit('location-update', { tripId, ...point });
                        pendingLocationsRef.current.push(point);
                        if (pendingLocationsRef.current.length >= 5) {
                            syncLocations([...pendingLocationsRef.current]);
                        }
                    }
                },
                (err) => {
                    const messages = {
                        1: "Permissão de GPS negada pelo usuário.",
                        2: "Sinal de GPS indisponível ou fraco.",
                        3: "Tempo de espera pelo GPS esgotado."
                    };
                    const msg = messages[err.code as keyof typeof messages] || "Erro desconhecido no GPS.";
                    console.error("GPS Error Code " + err.code + ": " + msg);
                    // Don't alert on every check, maybe just once per session or console
                },
                { enableHighAccuracy: true }
            );
        }

        // Load persisted path on mount
        const savedPath = localStorage.getItem('current_trip_path');
        if (savedPath) {
            const parsedPath = JSON.parse(savedPath);
            setPath(parsedPath);
            let dist = 0;
            for (let i = 1; i < parsedPath.length; i++) {
                dist += calculateDistance(
                    parsedPath[i - 1].latitude, parsedPath[i - 1].longitude,
                    parsedPath[i].latitude, parsedPath[i].longitude
                );
            }
            setDistance(dist);
        }

        const savedTripId = localStorage.getItem('current_trip_id');
        const savedStart = localStorage.getItem('current_trip_start');
        if (savedTripId) {
            setTripId(savedTripId);
            setIsTracking(true);
            if (savedStart) setStartTime(Number(savedStart));
            socket.connect();
            socket.emit('join-trip', savedTripId);
        }

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [isTracking, tripId]);

    const stopTrip = async () => {
        if (!tripId) return;

        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trips/${tripId}/finish`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                }
            });

            setIsTracking(false);
            setTripId(null);
            setPath([]);
            setDistance(0);
            setStartTime(null);
            socket.disconnect();

            localStorage.removeItem('current_trip_id');
            localStorage.removeItem('current_trip_path');
            localStorage.removeItem('current_trip_start');
        } catch (err) {
            console.error('Error stopping trip:', err);
            setIsTracking(false);
            setTripId(null);
        }
    };

    useEffect(() => {
        if (path.length > 0) {
            localStorage.setItem('current_trip_path', JSON.stringify(path));
        }
        if (startTime) {
            localStorage.setItem('current_trip_start', startTime.toString());
        }
    }, [path, startTime]);

    useEffect(() => {
        if (tripId) {
            localStorage.setItem('current_trip_id', tripId);
        } else {
            localStorage.removeItem('current_trip_id');
            localStorage.removeItem('current_trip_path');
            localStorage.removeItem('current_trip_start');
        }
    }, [tripId]);

    return { isTracking, path, distance, startTime, currentLocation, destination, setDestination, startTrip, stopTrip, tripId };
}
