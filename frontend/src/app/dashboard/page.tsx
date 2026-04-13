'use client';

import MapWrapper from '@/components/MapWrapper';
import { useTracker, LocationPoint } from '@/hooks/useTracker';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    LogOut, Play, Square, Navigation, Settings, Clock, Fuel, Map,
    LocateFixed, Menu, Car, TrainFront, Footprints, Bike, ArrowUpDown, X
} from 'lucide-react';
import { formatDuration, estimateFuel, calculateDistance } from '@/lib/tripUtils';
import DestinationSearch from '@/components/DestinationSearch';
import Sidebar from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
    const {
        isTracking, path, distance, startTime, currentLocation,
        destination: trackerDest, setDestination: setTrackerDest,
        startTrip, stopTrip, tripId
    } = useTracker();

    const [user, setUser] = useState<any>(null);
    const [destination, setDestination] = useState<LocationPoint | null>(null);
    const [origin, setOrigin] = useState<LocationPoint | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [estimateToDest, setEstimateToDest] = useState<{ distance: number, time: number } | null>(null);
    const [autoCenter, setAutoCenter] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showRouteInputs, setShowRouteInputs] = useState(false);
    const [travelMode, setTravelMode] = useState<'DRIVING' | 'BICYCLING' | 'WALKING' | 'TRANSIT' | 'MOTORCYCLE'>('DRIVING');

    const router = useRouter();

    const swapPoints = () => {
        const temp = origin;
        setOrigin(destination);
        setDestination(temp);
    };

    useEffect(() => {
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', overflow: 'hidden', background: '#000' }}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userEmail={user.email}
            />

            {/* Floating Unified Header */}
            <header style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                right: '16px',
                zIndex: 1000,
                maxWidth: '500px',
                margin: '0 auto'
            }}>
                <div className="glass-morphism header-card" style={{ padding: '4px' }}>
                    {/* Mode Selector Bar */}
                    {showRouteInputs && (
                        <div className="search-row animate-slide-down" style={{
                            justifyContent: 'space-between',
                            padding: '4px 12px',
                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                            marginBottom: '4px'
                        }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <Navigation size={18} style={{ color: travelMode === 'DRIVING' ? 'var(--primary)' : '#64748b', cursor: 'pointer' }} onClick={() => setTravelMode('DRIVING')} />
                                <Car size={18} style={{ color: travelMode === 'DRIVING' ? 'var(--primary)' : '#64748b', cursor: 'pointer' }} onClick={() => setTravelMode('DRIVING')} />
                                <div onClick={() => setTravelMode('MOTORCYCLE')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: travelMode === 'MOTORCYCLE' ? 'rgba(99, 102, 241, 0.15)' : 'transparent' }}>
                                    <Bike size={18} color={travelMode === 'MOTORCYCLE' ? 'var(--primary)' : '#64748b'} />
                                </div>
                                <TrainFront size={18} style={{ color: travelMode === 'TRANSIT' ? 'var(--primary)' : '#64748b', cursor: 'pointer' }} onClick={() => setTravelMode('TRANSIT')} />
                                <Footprints size={18} style={{ color: travelMode === 'WALKING' ? 'var(--primary)' : '#64748b', cursor: 'pointer' }} onClick={() => setTravelMode('WALKING')} />
                                <Bike size={18} style={{ color: travelMode === 'BICYCLING' ? 'var(--primary)' : '#64748b', cursor: 'pointer' }} onClick={() => setTravelMode('BICYCLING')} />
                            </div>
                            <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowRouteInputs(false)} />
                        </div>
                    )}

                    <div className="search-row" style={{ position: 'relative' }}>
                        {!showRouteInputs && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="icon-button"
                            >
                                <Menu size={20} />
                            </button>
                        )}

                        <div style={{ flex: 1, minWidth: 0, paddingLeft: showRouteInputs ? '40px' : '0' }}>
                            {showRouteInputs && (
                                <div style={{ position: 'absolute', left: '16px', top: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', border: '2px solid #64748b', borderRadius: '50%' }} />
                                    <div style={{ width: '2px', height: '20px', borderLeft: '2px dotted #cbd5e1' }} />
                                    <div style={{ width: '8px', height: '8px', border: '2px solid var(--primary)', borderRadius: '50%' }} />
                                </div>
                            )}

                            {showRouteInputs && (
                                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <DestinationSearch
                                            onSelect={(point) => setOrigin(point)}
                                            placeholder="Escolher ponto de partida"
                                        />
                                    </div>
                                    <button onClick={swapPoints} className="icon-button" style={{ marginLeft: '4px' }}>
                                        <ArrowUpDown size={18} />
                                    </button>
                                </div>
                            )}

                            <DestinationSearch
                                onSelect={(point) => {
                                    setDestination(point);
                                    if (point) setAutoCenter(false);
                                }}
                                placeholder={showRouteInputs ? "Escolher destino" : "Pesquise no Horizonet"}
                            />
                        </div>

                        {!showRouteInputs && (
                            <button
                                onClick={() => setShowRouteInputs(true)}
                                className="icon-button"
                            >
                                <Navigation size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Map Area */}
            <main style={{ flex: 1, position: 'relative' }} onMouseDown={() => setAutoCenter(false)} onTouchStart={() => setAutoCenter(false)}>
                <MapWrapper
                    path={path}
                    currentLocation={currentLocation}
                    destination={destination}
                    origin={origin}
                    autoCenter={autoCenter}
                    travelMode={travelMode}
                    onRouteFound={setEstimateToDest}
                />
            </main>

            {/* Bottom Floating UI */}
            <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '16px',
                right: '16px',
                zIndex: 1000,
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end',
                pointerEvents: 'none'
            }}>
                {/* Stats Card */}
                {(isTracking || destination) && (
                    <div className="glass-morphism stats-card animate-slide-down" style={{ pointerEvents: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <LocateFixed size={14} color="var(--primary)" />
                            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>
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
                )}

                <div style={{ flex: 1 }} />

                {/* Tracking Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'auto' }}>
                    <button
                        onClick={() => setAutoCenter(true)}
                        className={`glass-morphism action-btn ${autoCenter ? 'active' : ''}`}
                    >
                        <LocateFixed size={20} />
                    </button>

                    <button
                        onClick={isTracking ? stopTrip : startTrip}
                        className={`glass-morphism start-btn ${isTracking ? 'tracking' : ''}`}
                    >
                        {isTracking ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                        <span>{isTracking ? 'Finalizar' : 'Iniciar'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
