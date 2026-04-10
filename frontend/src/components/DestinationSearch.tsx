'use client';

import { useState } from 'react';
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
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedName, setSelectedName] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

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
    };

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
        <div style={{ position: 'relative', width: '100%' }}>
            {selectedName ? (
                <div className="input-field" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'space-between',
                    borderColor: 'var(--primary)',
                    background: 'rgba(99, 102, 241, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {selectedName}
                        </span>
                    </div>
                    <button onClick={clear} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Para onde você vai?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', paddingLeft: '40px' }}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0 16px', borderRadius: '12px' }}>
                        {loading ? '...' : 'Ir'}
                    </button>
                </form>
            )}

            {results.length > 0 && (
                <div className="glass-morphism" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '8px',
                    zIndex: 2000,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '8px'
                }}>
                    {results.map((r, i) => (
                        <div
                            key={i}
                            onClick={() => handleSelect(r)}
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                borderRadius: '6px'
                            }}
                            className="search-result-item"
                        >
                            {r.display_name}
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .search-result-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </div>
    );
}
