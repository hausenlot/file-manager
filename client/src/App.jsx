import React, { useState, useEffect } from 'react';
import Upload from './components/Upload';
import FileList from './components/FileList';
import { getFiles } from './services/api';
import './App.css';

function App() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

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
        fetchFiles();
    }, []);

    return (
        <div className="app-container">
            <header className="app-header">
                <span className="logo">File Manager</span>
            </header>

            <main className="main-grid">
                <section className="upload-section">
                    <Upload onUploadSuccess={fetchFiles} />
                </section>

                <section className="list-section">
                    {loading ? (
                        <p className="loading">Loading...</p>
                    ) : (
                        <FileList files={files} refreshFiles={fetchFiles} />
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;
