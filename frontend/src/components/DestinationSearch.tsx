'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, X, Briefcase, Clock, Home as HomeIcon, Navigation, BookmarkPlus, Star } from 'lucide-react';
import { LocationPoint } from '@/hooks/useTracker';
import { supabase } from '@/lib/supabase';

interface SearchResult {
    display_name: string;
    name?: string;
    lat: string;
    lon: string;
    address?: string;
    icon?: React.ReactNode;
}

interface DestinationSearchProps {
    onSelect: (point: LocationPoint | null) => void;
    placeholder?: string;
}

export default function DestinationSearch({ onSelect, placeholder = "Pesquise no Horizonet" }: DestinationSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedName, setSelectedName] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [savedPlaces, setSavedPlaces] = useState<SearchResult[]>([]);

    const fetchSavedPlaces = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('saved_places')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            const mapped = data.map(p => ({
                name: p.name,
                address: p.address,
                lat: p.latitude.toString(),
                lon: p.longitude.toString(),
                display_name: p.address,
                icon: p.name === 'Casa' ? <HomeIcon size={18} /> :
                    p.name === 'Trabalho' ? <Briefcase size={18} /> : <Star size={18} />
            }));
            setSavedPlaces(mapped);
        }
    };

    const savePlace = async (result: SearchResult, name: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('saved_places').insert({
            user_id: user.id,
            name,
            address: result.display_name,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
        });

        if (!error) {
            fetchSavedPlaces();
        } else {
            console.error('Save place error:', error);
        }
    };

    // Autocomplete effect with debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2) {
                setLoading(true);
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=br&namedetails=1`);
                    const data = await response.json();
                    setResults(data);
                } catch (err) {
                    console.error('Search error:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (isFocused) {
            fetchSavedPlaces();
        }
    }, [isFocused]);

    const handleSelect = (result: SearchResult) => {
        const point = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            timestamp: new Date().toISOString()
        };
        onSelect(point);
        setSelectedName(result.name || result.display_name.split(',')[0]);
        setResults([]);
        setQuery('');
        setIsFocused(false);
    };

    const clear = () => {
        onSelect(null);
        setSelectedName('');
        setQuery('');
        setResults([]);
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                background: 'transparent',
                height: '40px',
                color: '#1e293b'
            }}>
                {selectedName ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        overflow: 'hidden'
                    }}>
                        <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <span style={{
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            flex: 1,
                            fontWeight: 500
                        }}>
                            {selectedName}
                        </span>
                        <button onClick={clear} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#1e293b',
                            outline: 'none',
                            width: '100%',
                            fontSize: '0.95rem',
                            padding: '0 4px'
                        }}
                    />
                )}
            </div>

            {isFocused && (query.length === 0 || results.length > 0) && (
                <div
                    className="glass-morphism animate-slide-down"
                    style={{
                        position: 'absolute',
                        top: '48px',
                        left: '-8px',
                        right: '-8px',
                        zIndex: 2000,
                        maxHeight: '350px',
                        overflowY: 'auto',
                        background: 'rgba(255, 255, 255, 0.98)',
                        padding: '6px',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        borderRadius: '16px'
                    }}
                >
                    {loading ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>Buscando...</div>
                    ) : (query.length === 0 ? savedPlaces : results).map((r, i) => (
                        <div
                            key={i}
                            className="search-result-item"
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                borderRadius: '12px',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                            onClick={() => handleSelect(r)}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: (query.length === 0 || r.name) ? 'rgba(99, 102, 241, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: (query.length === 0 || r.name) ? 'var(--primary)' : '#64748b'
                            }}>
                                {(query.length === 0 || r.icon) ? r.icon : <MapPin size={18} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {query.length === 0 ? r.name : r.display_name.split(',')[0]}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {query.length === 0 ? r.address : r.display_name}
                                </div>
                            </div>

                            {query.length > 0 && (
                                <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => savePlace(r, 'Casa')}
                                        className="mini-btn"
                                        title="Salvar como Casa"
                                    >
                                        <HomeIcon size={14} />
                                    </button>
                                    <button
                                        onClick={() => savePlace(r, 'Trabalho')}
                                        className="mini-btn"
                                        title="Salvar como Trabalho"
                                    >
                                        <Briefcase size={14} />
                                    </button>
                                    <button
                                        onClick={() => savePlace(r, 'Favorito')}
                                        className="mini-btn"
                                        title="Salvar como Favorito"
                                    >
                                        <Star size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {query.length === 0 && savedPlaces.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                            Nenhum lugar salvo ainda. Pesquise e clique na estrela para salvar!
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                input::placeholder {
                    color: #64748b;
                }
                .search-result-item:hover {
                    background: rgba(99, 102, 241, 0.05);
                }
                .search-result-item:hover :global(svg) {
                    color: var(--primary);
                }
                .mini-btn {
                    background: rgba(0,0,0,0.03);
                    border: none;
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #64748b;
                }
                .mini-btn:hover {
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--primary);
                }
            `}</style>
        </div>
    );
}
