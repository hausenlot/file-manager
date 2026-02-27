import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ onClose }) => {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (mode === 'login') {
                const result = await login(username, password);
                if (!result.success) {
                    setError(result.message || 'Login failed');
                    setSubmitting(false);
                    return;
                }
            } else {
                const result = await register(username, password);
                if (!result.success) {
                    setError(result.message || 'Registration failed');
                    setSubmitting(false);
                    return;
                }
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
            setSubmitting(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="auth-overlay" onClick={handleOverlayClick}>
            <div className="auth-modal">
                <div className="auth-header">
                    <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
                    <button className="auth-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            minLength={3}
                            maxLength={30}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            minLength={6}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={submitting}
                    >
                        {submitting
                            ? 'Please wait...'
                            : mode === 'login' ? 'Sign In' : 'Create Account'
                        }
                    </button>
                </form>

                <div className="auth-switch">
                    {mode === 'login' ? (
                        <p>
                            Don't have an account?{' '}
                            <button onClick={() => { setMode('register'); setError(null); }}>
                                Register
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{' '}
                            <button onClick={() => { setMode('login'); setError(null); }}>
                                Sign In
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
