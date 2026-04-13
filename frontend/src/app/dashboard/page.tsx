'use client';

import MapWrapper from '@/components/MapWrapper';
import { useTracker, LocationPoint } from '@/hooks/useTracker';
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
    const { isTracking, path, distance, startTime, currentLocation, destination: trackerDest, setDestination: setTrackerDest, startTrip, stopTrip, tripId } = useTracker();
    const [user, setUser] = useState<any>(null);
    const [destination, setDestination] = useState<LocationPoint | null>(null);
    const [origin, setOrigin] = useState<LocationPoint | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [estimateToDest, setEstimateToDest] = useState<{ distance: number, time: number } | null>(null);
    const [autoCenter, setAutoCenter] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showRouteInputs, setShowRouteInputs] = useState(false);
    const router = useRouter();

    // Remove manual calculation as it's now handled by the Map Plugin
    useEffect(() => {
        // ... (manual effect removed)
    }, [currentLocation, destination, origin]);

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
                flexDirection: 'column',
                gap: '8px',
            }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                        padding: '0 4px',
                        minWidth: 0
                    }}>
                        <DestinationSearch
                            onSelect={(point) => {
                                setDestination(point);
                                if (point) setAutoCenter(false);
                            }}
                            placeholder={showRouteInputs ? "Para onde?" : "Pesquise no Horizonet"}
                        />
                    </div>

                    <button
                        onClick={() => setShowRouteInputs(!showRouteInputs)}
                        className="glass-morphism"
                        style={{
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            color: showRouteInputs ? 'var(--primary)' : 'white',
                            flexShrink: 0
                        }}
                    >
                        <Navigation size={24} />
                    </button>
                </div>

                {showRouteInputs && (
                    <div className="glass-morphism" style={{
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 4px',
                        marginLeft: '58px', // Align with the main search bar
                        animation: 'slideDown 0.3s ease-out'
                    }}>
                        <DestinationSearch
                            onSelect={(point) => setOrigin(point)}
                            placeholder="De onde?"
                        />
                    </div>
                )}
            </header>

            {/* Main Map Area */}
            <main style={{ flex: 1, position: 'relative' }} onMouseDown={() => setAutoCenter(false)} onTouchStart={() => setAutoCenter(false)}>
                <MapWrapper
                    path={path}
                    currentLocation={currentLocation}
                    destination={destination}
                    origin={origin}
                    autoCenter={autoCenter}
                    onRouteFound={setEstimateToDest}
                />
            </main>

            {/* Bottom Floating UI */}
            <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '12px',
                right: '12px',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                pointerEvents: 'none',
                gap: '10px'
            }}>
                {/* Stats Bubble (Left) - More compact for mobile */}
                <div className="glass-morphism" style={{
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    maxWidth: '45%',
                    pointerEvents: 'auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Navigation size={14} color="var(--primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {estimateToDest ? estimateToDest.distance.toFixed(1) + ' km' : distance.toFixed(1) + ' km'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="var(--primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                            {estimateToDest
                                ? (estimateToDest.time > 3600
                                    ? `${Math.floor(estimateToDest.time / 3600)}h ${Math.floor((estimateToDest.time % 3600) / 60)}m`
                                    : `${Math.floor(estimateToDest.time / 60)} min`)
                                : (isTracking ? Math.floor(elapsedSeconds / 60) + ' min' : '--')}
                        </span>
                    </div>
                </div>

                {/* Tracking Controls (Right) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', pointerEvents: 'auto' }}>
                    {/* AutoCenter Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setAutoCenter(true);
                        }}
                        className="glass-morphism"
                        style={{
                            width: '42px',
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: autoCenter ? 'var(--primary)' : 'var(--text-muted)',
                            border: autoCenter ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                            cursor: 'pointer'
                        }}
                    >
                        <LocateFixed size={20} />
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
