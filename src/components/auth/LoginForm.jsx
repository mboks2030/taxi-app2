import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../supabase';

const LoginForm = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!isSupabaseConfigured()) {
            setError('Supabase credentials are not configured. Please contact system administrator.');
            return;
        }

        setLoading(true);

        try {
            if (isResetting) {
                const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim());
                if (resetErr) {
                    setError(resetErr.message);
                } else {
                    setSuccessMessage('Password reset instructions sent. Please check your inbox.');
                }
            } else if (isRegistering) {
                const { data, error: signUpErr } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                        data: {
                            full_name: fullName.trim() || email.split('@')[0],
                            business_name: 'Taxi Business Management'
                        }
                    }
                });

                if (signUpErr) {
                    setError(signUpErr.message);
                } else if (data?.user && !data?.session) {
                    setSuccessMessage('Registration successful! Please check your email to confirm your account before signing in.');
                } else {
                    setSuccessMessage('Registration successful! Signing you in...');
                }
            } else {
                const { error: signInErr } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password
                });

                if (signInErr) {
                    setError(signInErr.message);
                }
            }
        } catch (err) {
            setError(err.message || 'An unexpected authentication error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '85vh',
            padding: '1.5rem'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                borderRadius: '16px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'linear-gradient(135deg, var(--primary, #2563eb), #1d4ed8)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto',
                        color: '#ffffff',
                        fontSize: '1.75rem',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                            <circle cx="7" cy="17" r="2" />
                            <path d="M9 17h6" />
                            <circle cx="17" cy="17" r="2" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: 'var(--text)' }}>
                        Taxi Business Manager
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>
                        {isResetting
                            ? 'Enter your email to receive a password reset link'
                            : (isRegistering ? 'Create your business account to get started' : 'Sign in to access your taxi fleet dashboard')}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {isRegistering && (
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: '500' }}>Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g. John Doe"
                                required={isRegistering}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@taxibusiness.com"
                            required
                            autoComplete="email"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    {!isResetting && (
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                <label style={{ marginBottom: 0, fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
                                {!isRegistering && (
                                    <button
                                        type="button"
                                        onClick={() => { setIsResetting(true); setError(''); setSuccessMessage(''); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary, #2563eb)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required={!isResetting}
                                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                                    style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--muted)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            fontSize: '0.85rem',
                            marginBottom: '1.25rem',
                            padding: '0.85rem 1rem',
                            background: '#fef2f2',
                            color: '#991b1b',
                            borderRadius: '8px',
                            border: '1px solid #fee2e2',
                            lineHeight: '1.4'
                        }}>
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div style={{
                            fontSize: '0.85rem',
                            marginBottom: '1.25rem',
                            padding: '0.85rem 1rem',
                            background: '#f0fdf4',
                            color: '#15803d',
                            borderRadius: '8px',
                            border: '1px solid #bbf7d0',
                            lineHeight: '1.4'
                        }}>
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            marginBottom: '1rem',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                        disabled={loading}
                    >
                        {loading
                            ? 'Please wait...'
                            : (isResetting
                                ? 'Send Reset Instructions'
                                : (isRegistering ? 'Create Account' : 'Sign In'))}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                        {isResetting ? (
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: 'var(--primary, #2563eb)', fontSize: '0.875rem', cursor: 'pointer' }}
                                onClick={() => { setIsResetting(false); setError(''); setSuccessMessage(''); }}
                            >
                                Back to Sign In
                            </button>
                        ) : (
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: 'var(--primary, #2563eb)', fontSize: '0.875rem', cursor: 'pointer' }}
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccessMessage(''); }}
                            >
                                {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
