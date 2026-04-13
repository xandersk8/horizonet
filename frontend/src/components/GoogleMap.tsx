'use client';

import { GoogleMap, useJsApiLoader, Polyline, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { LocationPoint } from '@/hooks/useTracker';
import { useState, useEffect, useRef } from 'react';

interface MapProps {
    path: LocationPoint[];
    apiKey: string;
    currentLocation?: LocationPoint | null;
    destination?: LocationPoint | null;
    origin?: LocationPoint | null;
    theme?: 'light' | 'dark';
    autoCenter?: boolean;
    travelMode?: string;
    onRouteFound?: (data: { distance: number, time: number }) => void;
}

const containerStyle = {
    width: '100%',
    height: '100%'
};

export default function Map({ path, apiKey, currentLocation, destination, origin, theme, autoCenter = true, travelMode, onRouteFound }: MapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    const center = path.length > 0
        ? { lat: path[path.length - 1].latitude, lng: path[path.length - 1].longitude }
        : currentLocation
            ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
            : { lat: -23.55052, lng: -46.633308 }; // Default to São Paulo

    const lastPannedDestRef = useRef<string | null>(null);

    useEffect(() => {
        if (map && center && autoCenter) {
            map.panTo(center);
        }
    }, [map, center, autoCenter]);

    // Google Maps Directions logic
    useEffect(() => {
        if (isLoaded && destination) {
            const org = origin
                ? { lat: origin.latitude, lng: origin.longitude }
                : (currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : null);

            if (org) {
                const service = new google.maps.DirectionsService();
                const modeMap: Record<string, google.maps.TravelMode> = {
                    'DRIVING': google.maps.TravelMode.DRIVING,
                    'BICYCLING': google.maps.TravelMode.BICYCLING,
                    'WALKING': google.maps.TravelMode.WALKING,
                    'TRANSIT': google.maps.TravelMode.TRANSIT,
                    'MOTORCYCLE': google.maps.TravelMode.DRIVING // Base driving for moto
                };

                service.route({
                    origin: org,
                    destination: { lat: destination.latitude, lng: destination.longitude },
                    travelMode: modeMap[travelMode || 'DRIVING']
                }, (result, status) => {
                    if (status === 'OK' && result) {
                        setDirections(result);
                        const leg = result.routes[0].legs[0];
                        if (onRouteFound && leg.distance?.value && leg.duration?.value) {
                            onRouteFound({
                                distance: leg.distance.value / 1000,
                                time: leg.duration.value
                            });
                        }
                    }
                });
            }
        } else {
            setDirections(null);
        }
    }, [isLoaded, origin, destination, currentLocation]);

    // Pan to destination when it's selected (one-time per selection)
    useEffect(() => {
        if (map && destination) {
            const destKey = `${destination.latitude},${destination.longitude}`;
            if (lastPannedDestRef.current !== destKey) {
                map.panTo({ lat: destination.latitude, lng: destination.longitude });
                map.setZoom(16);
                lastPannedDestRef.current = destKey;
            }
        } else {
            lastPannedDestRef.current = null;
        }
    }, [map, destination]);

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            onLoad={(map) => setMap(map)}
            options={{
                styles: theme === 'dark' ? [
                    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
                    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
                    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
                    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
                    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
                ] : [],
                disableDefaultUI: true,
                zoomControl: false,
            }}
        >
            {path.length > 0 && (
                <Polyline
                    path={path.map(p => ({ lat: p.latitude, lng: p.longitude }))}
                    options={{
                        strokeColor: '#6366f1',
                        strokeOpacity: 1.0,
                        strokeWeight: 4,
                    }}
                />
            )}

            {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}

            {currentLocation && (
                <Marker
                    position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                    label="Eu"
                />
            )}

            {destination && (
                <Marker
                    position={{ lat: destination.latitude, lng: destination.longitude }}
                    icon={{
                        url: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
                        scaledSize: new google.maps.Size(32, 32),
                        anchor: new google.maps.Point(16, 32)
                    }}
                />
            )}
        </GoogleMap>
    ) : <div style={{ background: '#0f172a', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando Mapa...</div>;
}
