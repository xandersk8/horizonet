'use client';

import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { LocationPoint } from '@/hooks/useTracker';
import L from 'leaflet';
import 'leaflet-routing-machine';
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
    origin?: LocationPoint | null;
    theme?: 'light' | 'dark';
    autoCenter?: boolean;
    travelMode?: string;
    onRouteFound?: (data: { distance: number, time: number }) => void;
}

const DestIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    className: 'destination-marker'
});

function RoutingMachine({ origin, destination, onRouteFound }: { origin: [number, number], destination: [number, number], onRouteFound?: (data: { distance: number, time: number }) => void }) {
    const map = useMap();
    const routingControlRef = useRef<any>(null);

    useEffect(() => {
        if (!map) return;

        // @ts-ignore
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(origin[0], origin[1]),
                L.latLng(destination[0], destination[1])
            ],
            lineOptions: {
                styles: [
                    { color: '#6366f1', weight: 6, opacity: 0.8 },
                    { color: '#ffffff', weight: 2, opacity: 1 } // Inner line for better visibility
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 10
            },
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            fitSelectedRoutes: true,
            autoRoute: true,
            // @ts-ignore
            createMarker: () => null
        }).addTo(map);

        // Hide the text instructions container effectively
        const container = routingControl.getContainer();
        if (container) {
            container.style.display = 'none';
        }


        routingControl.on('routesfound', (e: any) => {
            const routes = e.routes;
            const summary = routes[0].summary;
            if (onRouteFound) {
                // distance está em metros, converter para km. totalTime em segundos.
                onRouteFound({
                    distance: summary.totalDistance / 1000,
                    time: summary.totalTime
                });
            }
        });

        routingControlRef.current = routingControl;

        return () => {
            if (map && routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, origin, destination]);

    return null;
}

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

export default function LeafletMap({ path, currentLocation, destination, origin, theme = 'light', autoCenter = true, travelMode, onRouteFound }: MapProps) {
    const center: [number, number] = path.length > 0
        ? [path[path.length - 1].latitude, path[path.length - 1].longitude]
        : currentLocation
            ? [currentLocation.latitude, currentLocation.longitude]
            : [-23.55052, -46.633308];

    const polylinePath: [number, number][] = path.map(p => [p.latitude, p.longitude]);
    const destPoint: [number, number] | null = destination ? [destination.latitude, destination.longitude] : null;
    const originPoint: [number, number] | null = origin
        ? [origin.latitude, origin.longitude]
        : currentLocation ? [currentLocation.latitude, currentLocation.longitude] : null;

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

                {originPoint && destPoint && (
                    <RoutingMachine origin={originPoint} destination={destPoint} onRouteFound={onRouteFound} />
                )}

                <Polyline
                    positions={polylinePath}
                    pathOptions={{ color: '#6366f1', weight: 4 }}
                />
                <ChangeView
                    center={center}
                    destination={destPoint}
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
