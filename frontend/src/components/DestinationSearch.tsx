'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { LocationPoint } from '@/hooks/useTracker';

interface SearchResult {
    display_name: string;
    lat: string;
    lon: string;
}

interface DestinationSearchProps {
    onSelect: (point: LocationPoint | null) => void;
}

export default function DestinationSearch({ onSelect }: DestinationSearchProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedName, setSelectedName] = useState('');

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
        setSelectedName(result.display_name);
        setResults([]);
        setQuery('');
        setIsExpanded(false);
    };

    const clear = () => {
        onSelect(null);
        setSelectedName('');
        setQuery('');
        setResults([]);
        setIsExpanded(false);
    };

    return (
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: isExpanded || selectedName ? '100%' : '44px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: isExpanded || selectedName ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '22px',
                padding: '4px',
                overflow: 'hidden',
                justifyContent: isExpanded || selectedName ? 'flex-start' : 'center',
                height: '44px',
                backdropFilter: 'blur(16px)'
            }}>
                {selectedName ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '0 12px'
                    }}>
                        <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', flex: 1, color: 'white' }}>
                            {selectedName}
                        </span>
                        <button onClick={clear} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}>
                            <X size={18} />
                        </button>
                    </div>
                ) : isExpanded ? (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 8px' }}>
                        <Search size={20} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Pesquisar destino..."
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                padding: '8px 12px',
                                outline: 'none',
                                width: '100%',
                                fontSize: '0.9rem'
                            }}
                        />
                        <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsExpanded(true)}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            background: 'transparent',
                            border: 'none',
                            padding: 0
                        }}
                    >
                        <Search size={20} color="white" />
                    </button>
                )}
            </div>

            {results.length > 0 && isExpanded && (
                <div className="glass-morphism" style={{
                    position: 'absolute',
                    top: '52px',
                    left: 0,
                    right: 0,
                    zIndex: 2000,
                    maxHeight: '260px',
                    overflowY: 'auto',
                    padding: '8px',
                    animation: 'slideDown 0.2s ease-out',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {results.map((r, i) => (
                        <div
                            key={i}
                            onClick={() => handleSelect(r)}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'background 0.2s',
                                color: 'white'
                            }}
                            className="search-result-item"
                        >
                            <MapPin size={16} color="rgba(255,255,255,0.4)" />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.display_name}</span>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                            Buscando...
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .search-result-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
