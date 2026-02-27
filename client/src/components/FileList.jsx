import React, { useState } from 'react';
import { FileText, Download, Trash2, Image, Film, Music, FileType, Globe, Lock } from 'lucide-react';
import { deleteFile, getDownloadUrl, getStreamUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FilePreview from './FilePreview';

const FileList = ({ files, refreshFiles }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const { user } = useAuth();

    const handleDelete = async (uuid) => {
        if (confirm('Are you sure you want to delete this file?')) {
            try {
                await deleteFile(uuid);
                refreshFiles();
            } catch (error) {
                alert('Failed to delete file');
            }
        }
    };

    const handleDownload = (uuid, filename) => {
        const url = getDownloadUrl(uuid);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimetype) => {
        if (mimetype.startsWith('image/')) return <Image size={16} className="file-icon" />;
        if (mimetype.startsWith('video/')) return <Film size={16} className="file-icon" />;
        if (mimetype.startsWith('audio/')) return <Music size={16} className="file-icon" />;
        if (mimetype === 'application/pdf') return <FileType size={16} className="file-icon" />;
        return <FileText size={16} className="file-icon" />;
    };

    const isImageFile = (mimetype) => mimetype.startsWith('image/');

    const isOwnFile = (file) => user && file.uploader && file.uploader === user._id;
    const isPublicFile = (file) => !file.uploader;

    return (
        <>
            <div className="file-list-container">
                <h2>Uploaded Files</h2>
                {files.length === 0 ? (
                    <p className="empty-state">No files uploaded yet.</p>
                ) : (
                    <table className="file-table">
                        <thead>
                            <tr>
                                <th className="th-thumb">Preview</th>
                                <th>Name</th>
                                <th>Size</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file.uuid}>
                                    <td className="thumbnail-cell">
                                        {isImageFile(file.mimetype) && file.status === 'processed' ? (
                                            <img
                                                src={getStreamUrl(file.uuid)}
                                                alt={file.originalName}
                                                className="thumbnail"
                                                onClick={() => setSelectedFile(file)}
                                            />
                                        ) : (
                                            <div className="thumbnail-placeholder" onClick={() => setSelectedFile(file)}>
                                                {getFileIcon(file.mimetype)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="file-name">
                                        <span
                                            className="file-name-link"
                                            onClick={() => setSelectedFile(file)}
                                        >
                                            {file.originalName}
                                        </span>
                                        {isPublicFile(file) ? (
                                            <span className="ownership-badge public" title="Public file">
                                                <Globe size={12} />
                                            </span>
                                        ) : isOwnFile(file) ? (
                                            <span className="ownership-badge private" title="Your private file">
                                                <Lock size={12} />
                                            </span>
                                        ) : null}
                                    </td>
                                    <td>{formatSize(file.size)}</td>
                                    <td>{file.mimetype}</td>
                                    <td className="actions">
                                        <button
                                            className="action-btn download"
                                            onClick={() => handleDownload(file.uuid, file.originalName)}
                                            title="Download"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDelete(file.uuid)}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {selectedFile && (
                <FilePreview
                    file={selectedFile}
                    onClose={() => setSelectedFile(null)}
                />
            )}
        </>
    );
};

export default FileList;
