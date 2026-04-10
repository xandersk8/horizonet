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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', overflow: 'hidden' }}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userEmail={user.email}
            />

            {/* Floating Top Header */}
            <header style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                right: '12px',
                zIndex: 1000,
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
            }}>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="glass-morphism"
                    style={{
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'white',
                        flexShrink: 0
                    }}
                >
                    <Menu size={24} />
                </button>

                <div className="glass-morphism" style={{
                    flex: 1,
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 4px'
                }}>
                    <DestinationSearch onSelect={setDestination} />
                </div>
            </header>

            {/* Main Map Area */}
            <main style={{ flex: 1, position: 'relative' }} onMouseDown={() => setAutoCenter(false)} onTouchStart={() => setAutoCenter(false)}>
                <MapWrapper path={path} currentLocation={currentLocation} destination={destination} autoCenter={autoCenter} />
            </main>

            {/* Bottom Floating UI */}
            <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '16px',
                right: '16px',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                pointerEvents: 'none'
            }}>
                {/* Stats Bubble (Left) */}
                <div className="glass-morphism" style={{
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: '120px',
                    pointerEvents: 'auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Navigation size={14} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                            {estimateToDest ? estimateToDest.dist.toFixed(1) + ' km' : distance.toFixed(1) + ' km'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} color="var(--secondary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                            {estimateToDest ? formatDuration(estimateToDest.time) : formatDuration(elapsedSeconds)}
                        </span>
                    </div>
                </div>

                {/* Tracking Controls (Right) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', pointerEvents: 'auto' }}>
                    {/* AutoCenter Button */}
                    <button
                        onClick={() => setAutoCenter(true)}
                        className="glass-morphism"
                        style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: autoCenter ? 'var(--primary)' : 'var(--text-muted)',
                            border: autoCenter ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer'
                        }}
                    >
                        <LocateFixed size={22} />
                    </button>

                    {/* Start/Stop FAB */}
                    {!isTracking ? (
                        <button
                            className="btn-primary"
                            onClick={startTrip}
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
                            }}
                        >
                            <Play size={28} fill="white" />
                        </button>
                    ) : (
                        <button
                            className="btn-primary"
                            onClick={stopTrip}
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(239, 68, 68, 0.8)',
                                border: '2px solid #ef4444',
                                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)'
                            }}
                        >
                            <Square size={24} fill="white" />
                        </button>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .loading {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background);
        }
      `}} />
        </div>
    );
}
}
