'use client';

import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint } from '@/hooks/useTracker';
import L from 'leaflet';
import { useEffect } from 'react';

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
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function LeafletMap({ path }: MapProps) {
    const center: [number, number] = path.length > 0
        ? [path[path.length - 1].latitude, path[path.length - 1].longitude]
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
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Polyline
                    positions={polylinePath}
                    pathOptions={{ color: '#6366f1', weight: 4 }}
                />
                <ChangeView center={center} />
                {path.length > 0 && (
                    <Marker position={center} icon={DefaultIcon} />
                )}
            </MapContainer>
        </div>
    );
}
