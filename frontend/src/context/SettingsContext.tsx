'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type MapProvider = 'google' | 'leaflet';

interface SettingsContextType {
    mapProvider: MapProvider;
    setMapProvider: (provider: MapProvider) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [mapProvider, setMapProvider] = useState<MapProvider>('google');

    useEffect(() => {
        const saved = localStorage.getItem('map_provider') as MapProvider;
        if (saved) setMapProvider(saved);
    }, []);

    const updateProvider = (provider: MapProvider) => {
        setMapProvider(provider);
        localStorage.setItem('map_provider', provider);
    };

    return (
        <SettingsContext.Provider value={{ mapProvider, setMapProvider: updateProvider }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
