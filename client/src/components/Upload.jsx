import React, { useState } from 'react';
import { Upload as UploadIcon, X } from 'lucide-react';
import { uploadFile } from '../services/api';

const Upload = ({ onUploadSuccess }) => {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            await uploadFile(formData, (event) => {
                const percent = Math.round((event.loaded * 100) / event.total);
                setProgress(percent);
            });
            onUploadSuccess();
            setUploading(false);
        } catch (err) {
            const msg = err.response?.data?.message || 'Upload failed. Please try again.';
            setError(msg);
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <div
                className={`drop-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="icon-container">
                    <UploadIcon size={48} />
                </div>
                <h3>Drag & Drop files here</h3>
                <p>or</p>
                <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <button
                    className="browse-btn"
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    Browse Files
                </button>
            </div>

            <div className="upload-info">
                <h4>Allowed Files</h4>
                <div className="info-grid">
                    <span className="info-label">Images</span>
                    <span className="info-value">JPG, PNG, GIF, WebP, SVG</span>
                    <span className="info-label">Video</span>
                    <span className="info-value">MP4, WebM, MKV, MOV, AVI</span>
                    <span className="info-label">Audio</span>
                    <span className="info-value">MP3, WAV, OGG, FLAC, AAC</span>
                    <span className="info-label">Docs</span>
                    <span className="info-value">PDF only</span>
                    <span className="info-label">Max Size</span>
                    <span className="info-value">150 MB per file</span>
                </div>
            </div>

            {uploading && (
                <div className="progress-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="progress-text">{progress}%</span>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <X size={16} /> {error}
                </div>
            )}
        </div>
    );
};

export default Upload;
