import axios from 'axios';

const API_URL = '/api'; // Relative path for Nginx proxy

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
});

export const getFiles = async () => {
    try {
        const response = await api.get('/files');
        return response.data;
    } catch (error) {
        console.error('Error fetching files:', error);
        throw error;
    }
};

export const uploadFile = async (formData, onUploadProgress) => {
    try {
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const deleteFile = async (uuid) => {
    try {
        const response = await api.delete(`/files/${uuid}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

export const getDownloadUrl = (uuid) => {
    return `${API_URL}/files/${uuid}/download`;
};

export const getStreamUrl = (uuid) => {
    return `${API_URL}/files/${uuid}/stream`;
};
