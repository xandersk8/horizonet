'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
        else router.push('/dashboard');
        setLoading(false);
    };

    const handleSignUp = async () => {
        if (!email || !password) {
            alert('Por favor, preencha o email e a senha.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            if (error.message.includes('Anonymous')) {
                alert('Erro: O cadastro por email pode estar desativado no Supabase. Verifique as configurações de Authentication > Providers.');
            } else {
                alert(error.message);
            }
        } else {
            alert('Cadastro realizado! Verifique seu email para o link de confirmação (se habilitado no Supabase).');
        }
        setLoading(false);
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '20px'
        }}>
            <div className="glass-morphism" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Horizonet</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Sua jornada começa aqui</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        className="input-field"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleSignUp}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Não tem uma conta? Cadastre-se
                    </button>
                </div>
            </div>
        </div>
    );
}
