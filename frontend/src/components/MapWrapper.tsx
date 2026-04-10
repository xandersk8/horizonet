'use client';

import dynamic from 'next/dynamic';
import { useSettings } from '@/context/SettingsContext';
import { LocationPoint } from '@/hooks/useTracker';

const GoogleMap = dynamic(() => import('./GoogleMap'), { ssr: false });
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

interface MapWrapperProps {
    path: LocationPoint[];
}

export default function MapWrapper({ path }: MapWrapperProps) {
    const { mapProvider, googleMapsKey } = useSettings();

    return (
        <div style={{ height: '100%', width: '100%' }}>
            {mapProvider === 'google' ? (
                <GoogleMap path={path} apiKey={googleMapsKey} />
            ) : (
                <LeafletMap path={path} />
            )}
        </div>
    );
}
