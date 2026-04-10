'use client';

import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Map, Database, Key, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const { mapProvider, googleMapsKey, setSettings, loading } = useSettings();
    const [localKey, setLocalKey] = useState(googleMapsKey);
    const [localProvider, setLocalProvider] = useState(mapProvider);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setLocalKey(googleMapsKey);
        setLocalProvider(mapProvider);
    }, [googleMapsKey, mapProvider]);

    const handleSave = async () => {
        setSaving(true);
        await setSettings(localProvider, localKey, localTheme);
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
                    <Key size={24} color="var(--secondary)" />
                    <h2 style={{ fontSize: '1.2rem' }}>Chave de API</h2>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Sua chave pessoal para o Google Maps. Ela não será compartilhada com ninguém.
                </p>

                <input
                    type="password"
                    placeholder="Sua Google Maps API Key"
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                />
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
