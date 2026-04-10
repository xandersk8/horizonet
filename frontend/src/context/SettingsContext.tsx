'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type MapProvider = 'google' | 'leaflet';
type MapTheme = 'light' | 'dark';

interface SettingsContextType {
    mapProvider: MapProvider;
    googleMapsKey: string;
    mapTheme: MapTheme;
    setSettings: (provider: MapProvider, key: string, theme: MapTheme) => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [mapProvider, setMapProvider] = useState<MapProvider>('leaflet');
    const [googleMapsKey, setGoogleMapsKey] = useState<string>('');
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
                        .single();

                    if (data) {
                        const key = data.google_maps_key || '';
                        const savedProvider = data.map_provider as MapProvider;
                        const savedTheme = data.map_theme as MapTheme;

                        setGoogleMapsKey(key);
                        if (savedTheme) setMapTheme(savedTheme);

                        // If user has key, use their saved provider. 
                        // If no key, always force leaflet.
                        if (!key) {
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

    const updateSettings = async (provider: MapProvider, key: string, theme: MapTheme) => {
        try {
            setMapProvider(provider);
            setGoogleMapsKey(key);
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
                        google_maps_key: key,
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
        <SettingsContext.Provider value={{ mapProvider, googleMapsKey, mapTheme, setSettings: updateSettings, loading }}>
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
