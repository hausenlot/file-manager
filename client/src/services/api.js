import axios from 'axios';

// const API_URL = '/api'; // Relative path for Nginx proxy
const API_URL = 'http://localhost:3000';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- Auth ---

export const registerUser = async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
};

export const loginUser = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// --- Files ---

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
    const token = localStorage.getItem('token');
    const base = `${API_URL}/files/${uuid}/download`;
    return token ? `${base}?token=${token}` : base;
};

export const getStreamUrl = (uuid) => {
    const token = localStorage.getItem('token');
    const base = `${API_URL}/files/${uuid}/stream`;
    return token ? `${base}?token=${token}` : base;
};
