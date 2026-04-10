'use client';

import MapWrapper from '@/components/MapWrapper';
import { useTracker } from '@/hooks/useTracker';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Play, Square, Navigation, Settings, Clock, Fuel, Map, LocateFixed } from 'lucide-react';
import { formatDuration, estimateFuel, calculateDistance } from '@/lib/tripUtils';
import Link from 'next/link';
import DestinationSearch from '@/components/DestinationSearch';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
    const { isTracking, path, distance, startTime, currentLocation, destination, setDestination, startTrip, stopTrip, tripId } = useTracker();
    const [user, setUser] = useState<any>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [estimateToDest, setEstimateToDest] = useState<{ dist: number, time: number } | null>(null);
    const [autoCenter, setAutoCenter] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (currentLocation && destination) {
            const d = calculateDistance(
                currentLocation.latitude, currentLocation.longitude,
                destination.latitude, destination.longitude
            );
            const timeHours = d / 40; // Estimação simples 40km/h
            setEstimateToDest({ dist: d, time: Math.round(timeHours * 3600) });
        } else {
            setEstimateToDest(null);
        }
    }, [currentLocation, destination]);

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

    if (!user) return <div className="loading">Carregando...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userEmail={user.email}
            />

            {/* Clean Header */}
            <header style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
            }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="glass-morphism"
                        style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="glass-morphism" style={{
                        flex: 1,
                        padding: '0 12px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <DestinationSearch onSelect={setDestination} />
                    </div>
                </div>
            </header>

            {/* Main Map */}
            <main style={{ flex: 1, position: 'relative' }} onMouseDown={() => setAutoCenter(false)} onTouchStart={() => setAutoCenter(false)}>
                <MapWrapper path={path} currentLocation={currentLocation} destination={destination} autoCenter={autoCenter} />

                {/* AutoCenter Button */}
                <button
                    onClick={() => setAutoCenter(true)}
                    className="glass-morphism"
                    style={{
                        position: 'absolute',
                        right: '16px',
                        bottom: '100px',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: autoCenter ? 'var(--primary)' : 'var(--text-muted)',
                        border: autoCenter ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                        zIndex: 1000,
                        cursor: 'pointer'
                    }}
                >
                    <LocateFixed size={24} />
                </button>
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
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                            {estimateToDest ? 'Distância Rest' : 'Distância'}
                        </p>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
                            {estimateToDest ? estimateToDest.dist.toFixed(2) + ' km' : distance.toFixed(2) + ' km'}
                        </h4>
                    </div>
                    <div className="stat-card">
                        <Clock size={18} color="var(--secondary)" style={{ marginBottom: '4px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                            {estimateToDest ? 'Tempo Restant' : 'Tempo'}
                        </p>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
                            {estimateToDest ? formatDuration(estimateToDest.time) : formatDuration(elapsedSeconds)}
                        </h4>
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
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
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
