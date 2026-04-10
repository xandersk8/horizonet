'use client';

import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import { LocationPoint } from '@/hooks/useTracker';
import { useState, useEffect } from 'react';

interface MapProps {
    path: LocationPoint[];
    apiKey?: string;
    currentLocation?: LocationPoint | null;
    destination?: LocationPoint | null;
    theme?: 'light' | 'dark';
    autoCenter?: boolean;
}

const containerStyle = {
    width: '100%',
    height: '100%'
};

export default function Map({ path, apiKey, currentLocation, destination, theme, autoCenter = true }: MapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const center = path.length > 0
        ? { lat: path[path.length - 1].latitude, lng: path[path.length - 1].longitude }
        : currentLocation
            ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
            : { lat: -23.55052, lng: -46.633308 }; // Default to São Paulo

    useEffect(() => {
        if (map && center && autoCenter) {
            map.panTo(center);
        }
    }, [map, center, autoCenter]);

    // Pan to destination when it's selected
    useEffect(() => {
        if (map && destination) {
            map.panTo({ lat: destination.latitude, lng: destination.longitude });
            map.setZoom(16);
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

            {(path.length > 0 || currentLocation) && (
                <Marker
                    position={path.length > 0
                        ? { lat: path[path.length - 1].latitude, lng: path[path.length - 1].longitude }
                        : { lat: currentLocation!.latitude, lng: currentLocation!.longitude }
                    }
                    icon={typeof google !== 'undefined' ? {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#6366f1",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "white",
                    } : undefined}
                />
            )}

            {destination && (
                <Marker
                    position={{ lat: destination.latitude, lng: destination.longitude }}
                    icon={typeof google !== 'undefined' ? {
                        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                        scale: 6,
                        fillColor: "#ef4444",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "white",
                    } : undefined}
                />
            )}
        </GoogleMap>
    ) : <div style={{ background: '#0f172a', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando Mapa...</div>;
}
