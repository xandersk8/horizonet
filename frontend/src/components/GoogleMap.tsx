'use client';

import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import { LocationPoint } from '@/hooks/useTracker';

interface MapProps {
    path: LocationPoint[];
    apiKey?: string;
    currentLocation?: LocationPoint | null;
}

const containerStyle = {
    width: '100%',
    height: '100%'
};

export default function Map({ path, apiKey, currentLocation }: MapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    });

    const center = path.length > 0
        ? { lat: path[path.length - 1].latitude, lng: path[path.length - 1].longitude }
        : currentLocation
            ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
            : { lat: -23.55052, lng: -46.633308 }; // Default to São Paulo

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            options={{
                styles: [
                    {
                        "elementType": "geometry",
                        "stylers": [{ "color": "#212121" }]
                    },
                    {
                        "elementType": "labels.icon",
                        "stylers": [{ "visibility": "off" }]
                    },
                    {
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#757575" }]
                    },
                    {
                        "elementType": "labels.text.stroke",
                        "stylers": [{ "color": "#212121" }]
                    },
                    {
                        "featureType": "administrative",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#757575" }]
                    },
                    {
                        "featureType": "road",
                        "elementType": "geometry.fill",
                        "stylers": [{ "color": "#2c2c2c" }]
                    },
                    {
                        "featureType": "water",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#000000" }]
                    }
                ],
                disableDefaultUI: true,
                zoomControl: true,
            }}
        >
            {path.length > 0 && (
                <>
                    <Polyline
                        path={path.map(p => ({ lat: p.latitude, lng: p.longitude }))}
                        options={{
                            strokeColor: '#6366f1',
                            strokeOpacity: 1.0,
                            strokeWeight: 4,
                        }}
                    />
                    <Marker
                        position={{ lat: path[path.length - 1].latitude, lng: path[path.length - 1].longitude }}
                        icon={typeof google !== 'undefined' ? {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#ec4899",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "white",
                        } : undefined}
                    />
                </>
            )}
        </GoogleMap>
    ) : <div style={{ background: '#0f172a', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando Mapa...</div>;
}
