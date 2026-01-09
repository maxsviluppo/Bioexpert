import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from './supabaseClient';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'signup') {
                if (!displayName.trim()) {
                    setError('Il nome avatar è obbligatorio');
                    setLoading(false);
                    return;
                }
                const result = await signUpWithEmail(email, password, displayName);
                if (result.success) {
                    alert('✅ Registrazione completata! Controlla la tua email per confermare.');
                    onSuccess();
                    onClose();
                } else {
                    setError(result.error?.message || 'Errore durante la registrazione');
                }
            } else {
                const result = await signInWithEmail(email, password);
                if (result.success) {
                    onSuccess();
                    onClose();
                } else {
                    setError(result.error?.message || 'Email o password errati');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Errore imprevisto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
        }}>
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                    }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '700' }}>
                    {mode === 'login' ? 'Accedi' : 'Registrati'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                    {mode === 'login'
                        ? 'Accedi per partecipare alle sfide!'
                        : 'Crea un account per sbloccare tutte le funzionalità'}
                </p>

                <form onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                <UserIcon size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                Nome Avatar
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Es: GiardinierePro"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '2px solid var(--border)',
                                    background: 'var(--bg)',
                                    fontSize: '16px',
                                    color: 'var(--text)',
                                }}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            <Mail size={16} style={{ display: 'inline', marginRight: '8px' }} />
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tua@email.com"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid var(--border)',
                                background: 'var(--bg)',
                                fontSize: '16px',
                                color: 'var(--text)',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            <Lock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid var(--border)',
                                background: 'var(--bg)',
                                fontSize: '16px',
                                color: 'var(--text)',
                            }}
                        />
                        {mode === 'signup' && (
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Minimo 6 caratteri
                            </p>
                        )}
                    </div>

                    {error && (
                        <div style={{
                            background: '#fee',
                            color: '#c00',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '14px',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? 'Caricamento...' : mode === 'login' ? 'Accedi' : 'Registrati'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login');
                            setError('');
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textDecoration: 'underline',
                        }}
                    >
                        {mode === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
                    </button>
                </div>
            </div>
        </div>
    );
}
