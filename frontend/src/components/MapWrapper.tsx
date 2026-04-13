'use client';

import dynamic from 'next/dynamic';
import { useSettings } from '@/context/SettingsContext';
import { LocationPoint } from '@/hooks/useTracker';

const GoogleMap = dynamic(() => import('./GoogleMap'), { ssr: false });
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

interface MapWrapperProps {
    path: LocationPoint[];
    currentLocation?: LocationPoint | null;
    destination?: LocationPoint | null;
    origin?: LocationPoint | null;
    autoCenter?: boolean;
    onRouteFound?: (data: { distance: number, time: number }) => void;
}

export default function MapWrapper({ path, currentLocation, destination, origin, autoCenter = true, onRouteFound }: MapWrapperProps) {
    const { mapProvider, googleMapsKey, mapTheme } = useSettings();

    return (
        <div style={{ height: '100%', width: '100%' }}>
            {mapProvider === 'google' ? (
                <GoogleMap path={path} apiKey={googleMapsKey} currentLocation={currentLocation} destination={destination} origin={origin} theme={mapTheme} autoCenter={autoCenter} onRouteFound={onRouteFound} />
            ) : (
                <LeafletMap path={path} currentLocation={currentLocation} destination={destination} origin={origin} theme={mapTheme} autoCenter={autoCenter} onRouteFound={onRouteFound} />
            )}
        </div>
    );
}
