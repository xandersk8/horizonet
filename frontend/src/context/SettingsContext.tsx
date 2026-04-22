'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type MapProvider = 'google' | 'leaflet' | 'mapbox';
type MapTheme = 'light' | 'dark';

interface SettingsContextType {
    mapProvider: MapProvider;
    googleMapsKey: string;
    mapboxKey: string;
    mapTheme: MapTheme;
    setSettings: (provider: MapProvider, googleKey: string, mbKey: string, theme: MapTheme) => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [mapProvider, setMapProvider] = useState<MapProvider>('leaflet');
    const [googleMapsKey, setGoogleMapsKey] = useState<string>('');
    const [mapboxKey, setMapboxKey] = useState<string>('');
    const [mapTheme, setMapTheme] = useState<MapTheme>('light');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSettings() {
            setLoading(true);

            // Quick load from localStorage for better UX
            const localProvider = localStorage.getItem('map_provider') as MapProvider;
            const localTheme = localStorage.getItem('map_theme') as MapTheme;
            if (localProvider) setMapProvider(localProvider);
            if (localTheme) setMapTheme(localTheme);

            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data, error } = await supabase
                        .from('user_settings')
                        .select('*')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (data) {
                        const gKey = data.google_maps_key || '';
                        const mbKey = data.mapbox_key || '';
                        const savedProvider = data.map_provider as MapProvider;
                        const savedTheme = data.map_theme as MapTheme;

                        setGoogleMapsKey(gKey);
                        setMapboxKey(mbKey);
                        if (savedTheme) setMapTheme(savedTheme);

                        // If user has key, use their saved provider. 
                        // If no key, always force leaflet.
                        if (!gKey && !mbKey && savedProvider !== 'leaflet') {
                            setMapProvider('leaflet');
                        } else if (savedProvider) {
                            setMapProvider(savedProvider);
                        }
                    }
                }
            } catch (err) {
                console.error("Error loading settings:", err);
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, []);

    const updateSettings = async (provider: MapProvider, gKey: string, mbKey: string, theme: MapTheme) => {
        try {
            setMapProvider(provider);
            setGoogleMapsKey(gKey);
            setMapboxKey(mbKey);
            setMapTheme(theme);

            localStorage.setItem('map_provider', provider);
            localStorage.setItem('map_theme', theme);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('user_settings')
                    .upsert({
                        user_id: user.id,
                        map_provider: provider,
                        google_maps_key: gKey,
                        mapbox_key: mbKey,
                        map_theme: theme,
                        updated_at: new Date().toISOString()
                    });

                if (error) {
                    console.error('Supabase Save Error:', error);
                    alert('Erro ao salvar no banco de dados: ' + error.message);
                } else {
                    console.log('Settings saved successfully');
                }
            } else {
                alert('Usuário não autenticado');
            }
        } catch (err: any) {
            console.error('Unexpected Save Error:', err);
            alert('Erro inesperado: ' + err.message);
        }
    };

    return (
        <SettingsContext.Provider value={{ mapProvider, googleMapsKey, mapboxKey, mapTheme, setSettings: updateSettings, loading }}>
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
