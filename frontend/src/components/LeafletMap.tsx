'use client';

import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint } from '@/hooks/useTracker';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    path: LocationPoint[];
    currentLocation?: LocationPoint | null;
    destination?: LocationPoint | null;
    theme?: 'light' | 'dark';
    autoCenter?: boolean;
}

const DestIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    className: 'destination-marker'
});

function ChangeView({ center, destination, autoCenter }: { center: [number, number], destination?: [number, number] | null, autoCenter: boolean }) {
    const map = useMap();
    const lastPannedDest = useRef<string | null>(null);

    useEffect(() => {
        if (autoCenter) {
            map.setView(center, map.getZoom());
        }
    }, [center, map, autoCenter]);

    useEffect(() => {
        if (destination) {
            const destKey = `${destination[0]},${destination[1]}`;
            if (lastPannedDest.current !== destKey) {
                map.flyTo(destination, 16);
                lastPannedDest.current = destKey;
            }
        } else {
            lastPannedDest.current = null;
        }
    }, [destination, map]);

    return null;
}

export default function LeafletMap({ path, currentLocation, destination, theme = 'light', autoCenter = true }: MapProps) {
    const center: [number, number] = path.length > 0
        ? [path[path.length - 1].latitude, path[path.length - 1].longitude]
        : currentLocation
            ? [currentLocation.latitude, currentLocation.longitude]
            : [-23.55052, -46.633308];

    const polylinePath: [number, number][] = path.map(p => [p.latitude, p.longitude]);

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapContainer
                center={center}
                zoom={15}
                style={{ height: '100%', width: '100%', background: '#0f172a' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={theme === 'dark'
                        ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    }
                />
                <Polyline
                    positions={polylinePath}
                    pathOptions={{ color: '#6366f1', weight: 4 }}
                />
                <ChangeView
                    center={center}
                    destination={destination ? [destination.latitude, destination.longitude] : null}
                    autoCenter={autoCenter}
                />

                {/* Marker da Posição Atual */}
                {(path.length > 0 || currentLocation) && (
                    <Marker position={currentLocation ? [currentLocation.latitude, currentLocation.longitude] : center} icon={DefaultIcon} />
                )}

                {/* Marker do Destino */}
                {destination && (
                    <Marker position={[destination.latitude, destination.longitude]} icon={DestIcon} />
                )}

                <style>{`
                    .destination-marker {
                        filter: hue-rotate(140deg) brightness(1.2);
                    }
                `}</style>
            </MapContainer>
        </div>
    );
}
