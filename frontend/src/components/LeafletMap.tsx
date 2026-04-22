'use client';

import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { LocationPoint } from '@/hooks/useTracker';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useEffect, useRef, useState } from 'react';

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
    provider?: string;
    mapboxKey?: string;
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

function RoutingMachine({ origin, destination, travelMode, onRouteFound }: { origin: [number, number], destination: [number, number], travelMode?: string, onRouteFound?: (data: { distance: number, time: number }) => void }) {
    const map = useMap();
    const routingControlRef = useRef<any>(null);
    const [routePath, setRoutePath] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(false);

    const GOOGLE_BLUE = '#1a73e8';

    // Manual fetch fallback for OSRM
    const fetchManualRoute = async (start: [number, number], end: [number, number]) => {
        try {
            setLoading(true);
            const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
            const data = await response.json();

            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                setRoutePath(coords);

                if (onRouteFound) {
                    onRouteFound({
                        distance: data.routes[0].distance / 1000,
                        time: data.routes[0].duration
                    });
                }
                console.log('Manual OSRM Route fallback successful');
            }
        } catch (err) {
            console.error('Manual OSRM Fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!map) return;
        setRoutePath([]);
        setLoading(true);

        // @ts-ignore
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(origin[0], origin[1]),
                L.latLng(destination[0], destination[1])
            ],
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1'
            }),
            lineOptions: {
                styles: [
                    { color: GOOGLE_BLUE, weight: 8, opacity: 0.9 },
                    { color: '#ffffff', weight: 2, opacity: 1 }
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

        routingControl.on('routesfound', (e: any) => {
            setLoading(false);
            const routes = e.routes;
            const summary = routes[0].summary;
            if (routes[0].coordinates) {
                setRoutePath(routes[0].coordinates.map((c: any) => [c.lat, c.lng]));
            }
            if (onRouteFound) {
                onRouteFound({
                    distance: summary.totalDistance / 1000,
                    time: summary.totalTime
                });
            }
        });

        routingControl.on('routingerror', (e: any) => {
            console.warn('Leaflet Routing Machine failed, attempting manual fetch...', e.error);
            setLoading(false);
            fetchManualRoute(origin, destination);
        });

        const container = routingControl.getContainer();
        if (container) container.style.display = 'none';

        routingControlRef.current = routingControl;

        return () => {
            if (map && routingControlRef.current) {
                try {
                    map.removeControl(routingControlRef.current);
                } catch (e) {
                    console.log('Error removing control', e);
                }
            }
        };
    }, [map, origin, destination]);

    return (
        <>
            {routePath.length > 0 && (
                <>
                    <Polyline
                        positions={routePath}
                        pathOptions={{ color: GOOGLE_BLUE, weight: 8, opacity: 0.9 }}
                    />
                    <Polyline
                        positions={routePath}
                        pathOptions={{ color: '#ffffff', weight: 2, opacity: 1 }}
                    />
                </>
            )}
            {loading && routePath.length === 0 && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '10px 20px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontWeight: 'bold', color: '#1a73e8' }}>
                    Traçando Rota...
                </div>
            )}
        </>
    );
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

export default function LeafletMap({ path, provider, mapboxKey, currentLocation, destination, origin, theme = 'light', autoCenter = true, travelMode, onRouteFound }: MapProps) {
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
                    attribution={provider === 'mapbox' && mapboxKey ? '© Mapbox © OpenStreetMap' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'}
                    url={provider === 'mapbox' && mapboxKey
                        ? `https://api.mapbox.com/styles/v1/mapbox/${theme === 'dark' ? 'dark-v11' : 'streets-v12'}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxKey}`
                        : theme === 'dark'
                            ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    }
                />

                {originPoint && destPoint && (
                    <RoutingMachine origin={originPoint} destination={destPoint} travelMode={travelMode} onRouteFound={onRouteFound} />
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
