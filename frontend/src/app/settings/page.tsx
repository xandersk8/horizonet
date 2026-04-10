'use client';

import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Map, Database } from 'lucide-react';

export default function SettingsPage() {
    const { mapProvider, setMapProvider } = useSettings();
    const router = useRouter();

    return (
        <div style={{ padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Escolha qual serviço de mapas você deseja utilizar para visualizar suas rotas.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => setMapProvider('google')}
                        className={`input-field ${mapProvider === 'google' ? 'active-provider' : ''}`}
                        style={{
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: mapProvider === 'google' ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
                        }}
                    >
                        <span>Google Maps</span>
                        {mapProvider === 'google' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
                    </button>

                    <button
                        onClick={() => setMapProvider('leaflet')}
                        className={`input-field ${mapProvider === 'leaflet' ? 'active-provider' : ''}`}
                        style={{
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: mapProvider === 'leaflet' ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
                        }}
                    >
                        <span>Leaflet (Open Source)</span>
                        {mapProvider === 'leaflet' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
                    </button>
                </div>
            </section>

            <section className="glass-morphism" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Database size={24} color="var(--secondary)" />
                    <h2 style={{ fontSize: '1.2rem' }}>Dados</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Suas rotas são sincronizadas em tempo real com o Supabase.
                </p>
            </section>

            <style jsx>{`
        .active-provider {
          background: rgba(99, 102, 241, 0.1) !important;
        }
      `}</style>
        </div>
    );
}
