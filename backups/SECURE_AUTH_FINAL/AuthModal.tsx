import React, { useState } from 'react';
import { X, User as UserIcon, Lock, Mail, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { registerUser, loginUser, requestPasswordReset, setLocalUsername } from './apiClient';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (username: string) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username || !password) {
            setError('Inserisci username e password');
            return;
        }

        setLoading(true);

        try {
            const result = await loginUser(username.trim(), password);

            if (result.success) {
                setLocalUsername(username.trim());
                onSuccess(username.trim());
                onClose();
            } else {
                setError(result.error || 'Credenziali non valide');
            }
        } catch (err) {
            setError('Errore di connessione');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const trimmedUsername = username.trim();

        // Validazione
        if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
            setError('Username: 3-20 caratteri');
            return;
        }

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
            setError('Username: solo lettere, numeri e _');
            return;
        }

        if (password.length < 6) {
            setError('Password: minimo 6 caratteri');
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Email non valida');
            return;
        }

        setLoading(true);

        try {
            const result = await registerUser(trimmedUsername, password, email || undefined);

            if (result.success) {
                setSuccess('✅ Registrazione completata! Accedi ora.');
                setTimeout(() => {
                    setMode('login');
                    setPassword('');
                    setSuccess('');
                }, 2000);
            } else {
                setError(result.error || 'Errore durante la registrazione');
            }
        } catch (err) {
            setError('Errore di connessione');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Inserisci la tua email');
            return;
        }

        setLoading(true);

        try {
            const result = await requestPasswordReset(email);

            if (result.success) {
                setSuccess('📧 Controlla la tua email per le istruzioni');
                if (result.debug_username) {
                    setSuccess(`📧 Il tuo username è: ${result.debug_username}`);
                }
            } else {
                setError(result.error || 'Errore durante il recupero');
            }
        } catch (err) {
            setError('Errore di connessione');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--white)',
                borderRadius: '24px',
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    padding: '24px',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{ textAlign: 'center', color: 'white' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            {mode === 'login' ? <LogIn size={32} /> :
                                mode === 'register' ? <UserPlus size={32} /> :
                                    <Mail size={32} />}
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                            {mode === 'login' ? 'Accedi' :
                                mode === 'register' ? 'Registrati' :
                                    'Recupera Password'}
                        </h2>
                        <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                            {mode === 'login' ? 'Bentornato su BioExpert!' :
                                mode === 'register' ? 'Crea il tuo account sicuro' :
                                    'Ti invieremo le istruzioni via email'}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                    {error && (
                        <div style={{
                            background: '#ffebee',
                            color: '#c62828',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            background: '#e8f5e9',
                            color: '#2e7d32',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            {success}
                        </div>
                    )}

                    {mode === 'login' && (
                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                    Username
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Il tuo username"
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 40px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="La tua password"
                                        style={{
                                            width: '100%',
                                            padding: '12px 40px 12px 40px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#999',
                                            padding: 0
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setMode('forgot')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    marginBottom: '16px',
                                    padding: 0,
                                    fontWeight: 600
                                }}
                            >
                                Password dimenticata?
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1,
                                    marginBottom: '16px'
                                }}
                            >
                                {loading ? 'Accesso...' : 'Accedi'}
                            </button>

                            <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                                Non hai un account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setMode('register')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary)',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    Registrati
                                </button>
                            </div>
                        </form>
                    )}

                    {mode === 'register' && (
                        <form onSubmit={handleRegister}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                    Username *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Scegli un username"
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 40px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    />
                                </div>
                                <small style={{ color: '#666', fontSize: '0.75rem' }}>3-20 caratteri, solo lettere, numeri e _</small>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                    Password *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Crea una password"
                                        style={{
                                            width: '100%',
                                            padding: '12px 40px 12px 40px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#999',
                                            padding: 0
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <small style={{ color: '#666', fontSize: '0.75rem' }}>Minimo 6 caratteri</small>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                    Email (opzionale)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Per recupero password"
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 40px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    />
                                </div>
                                <small style={{ color: '#666', fontSize: '0.75rem' }}>Consigliata per recuperare l'account</small>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1,
                                    marginBottom: '16px'
                                }}
                            >
                                {loading ? 'Registrazione...' : 'Crea Account'}
                            </button>

                            <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                                Hai già un account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary)',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    Accedi
                                </button>
                            </div>
                        </form>
                    )}

                    {mode === 'forgot' && (
                        <form onSubmit={handleForgotPassword}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                    Email
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="La tua email registrata"
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 40px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1,
                                    marginBottom: '16px'
                                }}
                            >
                                {loading ? 'Invio...' : 'Invia Istruzioni'}
                            </button>

                            <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary)',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    ← Torna al login
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
