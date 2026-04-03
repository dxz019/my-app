import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    login: async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post('/users/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/users/register', userData);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },
};

// Users API
export const usersAPI = {
    getUserById: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },

    searchUsers: async (query) => {
        const response = await api.get(`/users/search/${query}`);
        return response.data;
    },
};

// Posts API
export const postsAPI = {
    getAllPosts: async () => {
        const response = await api.get('/posts/');
        return response.data;
    },

    createPost: async (postData) => {
        const response = await api.post('/posts/', postData);
        return response.data;
    },

    getUserPosts: async (userId) => {
        const response = await api.get(`/posts/user/${userId}`);
        return response.data;
    },

    deletePost: async (postId) => {
        const response = await api.delete(`/posts/${postId}`);
        return response.data;
    },
};

// Comments API
export const commentsAPI = {
    getPostComments: async (postId) => {
        const response = await api.get(`/comments/post/${postId}`);
        return response.data;
    },

    createComment: async (commentData) => {
        const response = await api.post('/comments/', commentData);
        return response.data;
    },

    deleteComment: async (commentId) => {
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    },
};

export default api;
