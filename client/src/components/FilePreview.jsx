import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { getStreamUrl, getDownloadUrl } from '../services/api';

const FilePreview = ({ file, onClose }) => {
    if (!file) return null;

    const streamUrl = getStreamUrl(file.uuid);
    const downloadUrl = getDownloadUrl(file.uuid);

    // Determine file type category
    const getFileType = (mimetype) => {
        if (mimetype.startsWith('image/')) return 'image';
        if (mimetype.startsWith('video/')) return 'video';
        if (mimetype.startsWith('audio/')) return 'audio';
        if (mimetype === 'application/pdf') return 'pdf';
        return 'other';
    };

    const fileType = getFileType(file.mimetype);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', file.originalName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const renderPreview = () => {
        switch (fileType) {
            case 'image':
                return (
                    <img
                        src={streamUrl}
                        alt={file.originalName}
                        className="preview-image"
                    />
                );
            case 'video':
                return (
                    <video
                        src={streamUrl}
                        controls
                        autoPlay
                        className="preview-video"
                    >
                        Your browser does not support the video tag.
                    </video>
                );
            case 'audio':
                return (
                    <div className="preview-audio-container">
                        <div className="audio-icon">🎵</div>
                        <p className="audio-filename">{file.originalName}</p>
                        <audio
                            src={streamUrl}
                            controls
                            autoPlay
                            className="preview-audio"
                        >
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                );
            case 'pdf':
                return (
                    <iframe
                        src={streamUrl}
                        title={file.originalName}
                        className="preview-pdf"
                    />
                );
            default:
                return (
                    <div className="preview-unsupported">
                        <FileText size={64} />
                        <h3>{file.originalName}</h3>
                        <p className="file-type">{file.mimetype}</p>
                        <p className="unsupported-msg">Preview not available for this file type</p>
                        <button className="download-btn" onClick={handleDownload}>
                            <Download size={18} />
                            Download File
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="preview-overlay" onClick={handleOverlayClick}>
            <div className="preview-modal">
                <div className="preview-header">
                    <span className="preview-title">{file.originalName}</span>
                    <div className="preview-actions">
                        <button
                            className="preview-action-btn"
                            onClick={handleDownload}
                            title="Download"
                        >
                            <Download size={18} />
                        </button>
                        <button
                            className="preview-action-btn close"
                            onClick={onClose}
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <div className="preview-content">
                    {renderPreview()}
                </div>
            </div>
        </div>
    );
};

export default FilePreview;
