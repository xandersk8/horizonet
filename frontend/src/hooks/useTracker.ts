'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { socket } from '@/lib/socket';

export interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: string;
}

export function useTracker() {
    const [tripId, setTripId] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [path, setPath] = useState<LocationPoint[]>([]);
    const watchIdRef = useRef<number | null>(null);
    const pendingLocationsRef = useRef<LocationPoint[]>([]);

    // Sync pending locations to backend
    const syncLocations = async (locations: LocationPoint[]) => {
        if (!tripId || locations.length === 0) return;

        try {
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
            setPath([]);
            socket.connect();
            socket.emit('join-trip', data.id);
        } catch (err) {
            console.error('Error starting trip:', err);
        }
    };

    useEffect(() => {
        // Request GPS permission on mount
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => console.log("GPS Permission granted"),
                (err) => console.error("GPS Permission denied", err)
            );
        }

        // Load persisted path on mount
        const savedPath = localStorage.getItem('current_trip_path');
        if (savedPath) setPath(JSON.parse(savedPath));

        const savedTripId = localStorage.getItem('current_trip_id');
        if (savedTripId) {
            setTripId(savedTripId);
            setIsTracking(true);
            socket.connect();
            socket.emit('join-trip', savedTripId);
        }
    }, []);

    const stopTrip = async () => {
        if (!tripId) return;

        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trips/${tripId}/finish`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                }
            });

            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            setIsTracking(false);
            setTripId(null);
            setPath([]);
            socket.disconnect();

            // Clear persistence
            localStorage.removeItem('current_trip_id');
            localStorage.removeItem('current_trip_path');
        } catch (err) {
            console.error('Error stopping trip:', err);
            // Fallback: stop UI even if backend fails
            setIsTracking(false);
            setTripId(null);
        }
    };

    useEffect(() => {
        if (path.length > 0) {
            localStorage.setItem('current_trip_path', JSON.stringify(path));
        }
    }, [path]);

    useEffect(() => {
        if (tripId) {
            localStorage.setItem('current_trip_id', tripId);
        } else {
            localStorage.removeItem('current_trip_id');
            localStorage.removeItem('current_trip_path');
        }
    }, [tripId]);

    useEffect(() => {
        if (isTracking && tripId) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const newPoint: LocationPoint = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: new Date().toISOString()
                    };

                    setPath(prev => [...prev, newPoint]);

                    // Emit to socket
                    socket.emit('location-update', { tripId, ...newPoint });

                    // Add to pending for persistence
                    pendingLocationsRef.current.push(newPoint);

                    // Batch sync every 5 points or every 15 seconds (simplification)
                    if (pendingLocationsRef.current.length >= 5) {
                        syncLocations([...pendingLocationsRef.current]);
                    }
                },
                (error) => console.error('GPS Error:', error),
                { enableHighAccuracy: true }
            );
        }

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [isTracking, tripId]);

    return { isTracking, path, startTrip, stopTrip, tripId };
}
