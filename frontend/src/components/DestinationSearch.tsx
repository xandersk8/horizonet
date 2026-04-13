'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, X, Briefcase, Clock, Home as HomeIcon, Navigation } from 'lucide-react';
import { LocationPoint } from '@/hooks/useTracker';

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

    const savedPlaces: SearchResult[] = [
        { name: 'Seu local', address: 'Localização atual', icon: <Navigation size={18} />, lat: '-23.55052', lon: '-46.633308', display_name: 'Seu local' },
        { name: 'Trabalho', address: 'R. Antônio Aparecido Ferrz, 86...', icon: <Briefcase size={18} />, lat: '-23.55', lon: '-46.64', display_name: 'Trabalho' },
        { name: 'Casa', address: 'Rua Ernesto Albino Moeckel...', icon: <HomeIcon size={18} />, lat: '-23.56', lon: '-46.65', display_name: 'Casa' },
        { name: 'Peruíbe', address: 'Peruíbe - SP', icon: <Clock size={18} />, lat: '-24.32', lon: '-46.99', display_name: 'Peruíbe' }
    ];

    // Autocomplete effect with debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2) {
                setLoading(true);
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
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
                            onClick={() => handleSelect(r)}
                            className="search-result-item"
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                borderRadius: '12px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: query.length === 0 ? 'rgba(99, 102, 241, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: query.length === 0 ? 'var(--primary)' : '#64748b'
                            }}>
                                {query.length === 0 ? r.icon : <MapPin size={18} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {query.length === 0 ? r.name : r.display_name.split(',')[0]}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {query.length === 0 ? r.address : r.display_name}
                                </div>
                            </div>
                        </div>
                    ))}
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
            `}</style>
        </div>
    );
}
