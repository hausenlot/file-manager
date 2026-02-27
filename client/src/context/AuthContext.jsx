import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser, getMe } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await getMe();
                if (data.success) {
                    setUser(data.user);
                } else {
                    // Token invalid
                    handleLogout();
                }
            } catch (err) {
                handleLogout();
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, []);

    const handleLogin = async (username, password) => {
        const data = await loginUser(username, password);
        if (data.success) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
        }
        return data;
    };

    const handleRegister = async (username, password) => {
        const data = await registerUser(username, password);
        if (data.success) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
        }
        return data;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login: handleLogin,
            register: handleRegister,
            logout: handleLogout,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
