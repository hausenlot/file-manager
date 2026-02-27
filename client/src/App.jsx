import React, { useState, useEffect } from 'react';
import Upload from './components/Upload';
import FileList from './components/FileList';
import AuthModal from './components/AuthModal';
import { getFiles } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { User, LogOut } from 'lucide-react';
import './App.css';

function AppContent() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const { user, isAuthenticated, logout, loading: authLoading } = useAuth();

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const data = await getFiles();
            if (data.success) {
                setFiles(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch files', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchFiles();
        }
    }, [authLoading, isAuthenticated]);

    const handleLogout = () => {
        logout();
    };

    const handleAuthClose = () => {
        setShowAuthModal(false);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <span className="logo">File Manager</span>
                <div className="header-auth">
                    {isAuthenticated ? (
                        <div className="user-info">
                            <User size={14} />
                            <span className="username">{user.username}</span>
                            <button className="logout-btn" onClick={handleLogout} title="Sign Out">
                                <LogOut size={14} />
                            </button>
                        </div>
                    ) : (
                        <button className="signin-btn" onClick={() => setShowAuthModal(true)}>
                            <User size={14} />
                            Sign In
                        </button>
                    )}
                </div>
            </header>

            <main className="main-grid">
                <section className="upload-section">
                    <Upload onUploadSuccess={fetchFiles} />
                </section>

                <section className="list-section">
                    {loading || authLoading ? (
                        <p className="loading">Loading...</p>
                    ) : (
                        <FileList files={files} refreshFiles={fetchFiles} />
                    )}
                </section>
            </main>

            {showAuthModal && (
                <AuthModal onClose={handleAuthClose} />
            )}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
