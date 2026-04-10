'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, X, Navigation } from 'lucide-react';
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
    };

    const clear = () => {
        onSelect(null);
        setSelectedName('');
        setQuery('');
        setResults([]);
    };

    return (
        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="search-container" style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                background: '#ffffff',
                borderRadius: '24px',
                padding: '0 16px',
                height: '48px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                color: '#202124'
            }}>
                {selectedName ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        overflow: 'hidden'
                    }}>
                        <MapPin size={20} color="#6366f1" style={{ flexShrink: 0 }} />
                        <span style={{
                            fontSize: '0.95rem',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            flex: 1,
                            color: '#202124',
                            fontWeight: 500
                        }}>
                            {selectedName}
                        </span>
                        <button onClick={clear} style={{ background: 'none', border: 'none', color: '#70757a', cursor: 'pointer', padding: '4px' }}>
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="Pesquise no Horizonet"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#202124',
                                outline: 'none',
                                width: '100%',
                                fontSize: '1rem',
                                paddingLeft: '4px'
                            }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #e8eaed', paddingLeft: '12px', marginLeft: '8px' }}>
                            <Search size={20} style={{ color: '#70757a', cursor: 'pointer' }} />
                            <Navigation size={20} style={{ color: '#1a73e8', cursor: 'pointer' }} />
                        </div>
                    </>
                )}
            </div>

            {results.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '56px',
                    left: 0,
                    right: 0,
                    zIndex: 2000,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: '8px',
                    animation: 'slideDown 0.2s ease-out'
                }}>
                    {results.map((r: SearchResult, i: number) => (
                        <div
                            key={i}
                            onClick={() => handleSelect(r)}
                            style={{
                                padding: '14px 16px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                borderBottom: i < results.length - 1 ? '1px solid #f1f3f4' : 'none',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                transition: 'background 0.2s',
                                color: '#3c4043'
                            }}
                            className="search-result-item"
                        >
                            <MapPin size={18} color="#dadce0" />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.display_name}</span>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .search-result-item:hover {
                    background: #f1f3f4;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
