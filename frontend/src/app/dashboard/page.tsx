'use client';

import MapWrapper from '@/components/MapWrapper';
import { useTracker } from '@/hooks/useTracker';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Play, Square, Navigation, Settings, Clock, Fuel } from 'lucide-react';
import { formatDuration, estimateFuel } from '@/lib/tripUtils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
    const { isTracking, path, distance, startTime, startTrip, stopTrip, tripId } = useTracker();
    const [user, setUser] = useState<any>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (!data.user) router.push('/login');
            else setUser(data.user);
        };
        checkUser();
    }, [router]);

    useEffect(() => {
        let timer: any;
        if (isTracking && startTime) {
            timer = setInterval(() => {
                setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            setElapsedSeconds(0);
        }
        return () => clearInterval(timer);
    }, [isTracking, startTime]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (!user) return <div className="loading">Carregando...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
            {/* Header */}
            <header className="glass-morphism" style={{
                margin: '16px',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Navigation size={24} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Dashboard</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{user.email}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Link href="/settings" style={{ color: 'var(--text-muted)' }}>
                        <Settings size={20} />
                    </Link>
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Map */}
            <main style={{ flex: 1, position: 'relative' }}>
                <MapWrapper path={path} />
            </main>

            {/* Controls */}
            <footer className="glass-morphism" style={{
                margin: '16px',
                padding: '20px 24px',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    textAlign: 'center'
                }}>
                    <div className="stat-card">
                        <Navigation size={18} color="var(--primary)" style={{ marginBottom: '4px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Distância</p>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>{distance.toFixed(2)} km</h4>
                    </div>
                    <div className="stat-card">
                        <Clock size={18} color="var(--secondary)" style={{ marginBottom: '4px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Tempo</p>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>{formatDuration(elapsedSeconds)}</h4>
                    </div>
                    <div className="stat-card">
                        <Fuel size={18} color="#22c55e" style={{ marginBottom: '4px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Consumo</p>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>{estimateFuel(distance).toFixed(2)} L</h4>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: isTracking ? '#22c55e' : 'var(--text-muted)',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: isTracking ? '#22c55e' : '#64748b',
                            display: 'inline-block'
                        }}></span>
                        {isTracking ? 'Rastreamento Ativo' : 'Pronto para iniciar'}
                    </p>
                </div>

                {!isTracking ? (
                    <button className="btn-primary" onClick={startTrip} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Play size={20} fill="white" /> Iniciar Viagem
                    </button>
                ) : (
                    <button className="btn-primary" onClick={stopTrip} style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        color: '#ef4444',
                        boxShadow: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}>
                        <Square size={20} fill="#ef4444" /> Parar Viagem
                    </button>
                )}
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
        .loading {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background);
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
      `}} />
        </div>
    );
}
