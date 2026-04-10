'use client';

import { X, Settings, LogOut, Navigation, Map } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail?: string;
}

export default function Sidebar({ isOpen, onClose, userEmail }: SidebarProps) {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 2000,
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    transition: 'all 0.3s ease'
                }}
            />

            {/* Sidebar Content */}
            <aside style={{
                position: 'fixed',
                top: 0,
                left: isOpen ? 0 : '-300px',
                width: '280px',
                height: '100%',
                background: 'var(--background)',
                borderRight: '1px solid var(--glass-border)',
                zIndex: 2001,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px'
            }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Navigation size={20} color="white" />
                        </div>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Horizonet</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </header>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link href="/dashboard" onClick={onClose} className="sidebar-link active">
                        <Map size={20} /> Mapa Principal
                    </Link>
                    <Link href="/settings" onClick={onClose} className="sidebar-link">
                        <Settings size={20} /> Configurações
                    </Link>
                </nav>

                <footer style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>AUTENTICADO COMO</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {userEmail || 'Usuário'}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        <LogOut size={20} /> Sair da Conta
                    </button>
                </footer>

                <style jsx>{`
                    .sidebar-link {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 16px;
                        border-radius: 12px;
                        color: var(--text-muted);
                        text-decoration: none;
                        transition: all 0.2s;
                    }
                    .sidebar-link:hover {
                        background: rgba(255, 255, 255, 0.03);
                        color: var(--text-main);
                    }
                    .sidebar-link.active {
                        background: rgba(99, 102, 241, 0.1);
                        color: var(--primary);
                        border: 1px solid rgba(99, 102, 241, 0.2);
                    }
                `}</style>
            </aside>
        </>
    );
}
