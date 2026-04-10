'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type MapProvider = 'google' | 'leaflet';

interface SettingsContextType {
    mapProvider: MapProvider;
    googleMapsKey: string;
    setSettings: (provider: MapProvider, key: string) => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [mapProvider, setMapProvider] = useState<MapProvider>('google');
    const [googleMapsKey, setGoogleMapsKey] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSettings() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('user_settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setMapProvider(data.map_provider as MapProvider);
                    setGoogleMapsKey(data.google_maps_key || '');
                }
            } else {
                // Fallback to local if not logged in (mostly for initial load)
                const saved = localStorage.getItem('map_provider') as MapProvider;
                if (saved) setMapProvider(saved);
            }
            setLoading(false);
        }
        loadSettings();
    }, []);

    const updateSettings = async (provider: MapProvider, key: string) => {
        setMapProvider(provider);
        setGoogleMapsKey(key);
        localStorage.setItem('map_provider', provider);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    map_provider: provider,
                    google_maps_key: key,
                    updated_at: new Date().toISOString()
                });
        }
    };

    return (
        <SettingsContext.Provider value={{ mapProvider, googleMapsKey, setSettings: updateSettings, loading }}>
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
