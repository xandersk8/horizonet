'use client';

import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Map, Database, Key, Save, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const { mapProvider, googleMapsKey, mapboxKey, mapTheme, setSettings, loading } = useSettings();
    const [localKey, setLocalKey] = useState(googleMapsKey);
    const [localMbKey, setLocalMbKey] = useState(mapboxKey);
    const [localProvider, setLocalProvider] = useState(mapProvider);
    const [localTheme, setLocalTheme] = useState(mapTheme);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setLocalKey(googleMapsKey);
        setLocalMbKey(mapboxKey);
        setLocalProvider(mapProvider);
        setLocalTheme(mapTheme);
    }, [googleMapsKey, mapboxKey, mapProvider, mapTheme]);

    const handleSave = async () => {
        setSaving(true);
        await setSettings(localProvider, localKey, localMbKey, localTheme);
        setSaving(false);
        router.back();
    };

    if (loading) return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Carregando...</div>;

    return (
        <div style={{ padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.5rem' }}>Configurações</h1>
            </header>

            <section className="glass-morphism" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Map size={24} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.2rem' }}>Provedor de Mapa</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => setLocalProvider('google')}
                        className={`input-field ${localProvider === 'google' ? 'active-provider' : ''}`}
                        style={{
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: localProvider === 'google' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            border: localProvider === 'google' ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
                        }}
                    >
                        <span>Google Maps</span>
                        {localProvider === 'google' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
                    </button>

                    <button
                        onClick={() => setLocalProvider('mapbox')}
                        className={`input-field ${localProvider === 'mapbox' ? 'active-provider' : ''}`}
                        style={{
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: localProvider === 'mapbox' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            border: localProvider === 'mapbox' ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
                        }}
                    >
                        <span>Mapbox</span>
                        {localProvider === 'mapbox' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
                    </button>

                    <button
                        onClick={() => setLocalProvider('leaflet')}
                        className={`input-field ${localProvider === 'leaflet' ? 'active-provider' : ''}`}
                        style={{
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: localProvider === 'leaflet' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            border: localProvider === 'leaflet' ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
                        }}
                    >
                        <span>Leaflet (Open Source)</span>
                        {localProvider === 'leaflet' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
                    </button>
                </div>
            </section>

            <section className="glass-morphism" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sun size={24} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.2rem' }}>Tema do Mapa</h2>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setLocalTheme('light')}
                        className={`input-field`}
                        style={{
                            flex: 1,
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: localTheme === 'light' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            border: localTheme === 'light' ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
                        }}
                    >
                        <Sun size={18} /> Claro
                    </button>
                    <button
                        onClick={() => setLocalTheme('dark')}
                        className={`input-field`}
                        style={{
                            flex: 1,
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: localTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            border: localTheme === 'dark' ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
                        }}
                    >
                        <Moon size={18} /> Escuro
                    </button>
                </div>
            </section>

            <section className="glass-morphism" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Key size={24} color="var(--secondary)" />
                    <h2 style={{ fontSize: '1.2rem' }}>Chaves de API</h2>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Suas chaves pessoais. Elas não serão compartilhadas.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        type="password"
                        placeholder="Google Maps API Key"
                        value={localKey}
                        onChange={(e) => setLocalKey(e.target.value)}
                        className="input-field"
                        style={{ width: '100%' }}
                    />

                    <input
                        type="password"
                        placeholder="Mapbox API Key"
                        value={localMbKey}
                        onChange={(e) => setLocalMbKey(e.target.value)}
                        className="input-field"
                        style={{ width: '100%' }}
                    />
                </div>
            </section>

            <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
                style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}
            >
                <Save size={20} /> {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
        </div>
    );
}
