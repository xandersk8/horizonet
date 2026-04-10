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
                    const key = data.google_maps_key || '';
                    setGoogleMapsKey(key);
                    // If no key, force Leaflet even if saved as google
                    setMapProvider(!key ? 'leaflet' : (data.map_provider as MapProvider || 'google'));
                } else {
                    setMapProvider('leaflet'); // Default for new users
                }
            } else {
                setLoading(false);
            }
            setLoading(false);
        }
        loadSettings();
    }, []);

    const updateSettings = async (provider: MapProvider, key: string) => {
        try {
            setMapProvider(provider);
            setGoogleMapsKey(key);
            localStorage.setItem('map_provider', provider);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('user_settings')
                    .upsert({
                        user_id: user.id,
                        map_provider: provider,
                        google_maps_key: key,
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
