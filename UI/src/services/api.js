import axios from 'axios';

// Use relative URL for development (goes through vite proxy)
// In production, this would be the actual backend URL
export const API_BASE_URL = '';

export const getErrorMessage = (error, fallback = 'Something went wrong') =>
    error?.response?.data?.detail ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback;

export const getPublicUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    // For static files, use the backend URL
    return `http://localhost:3001${path}`;
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: async (identifier, password) => {
        const formData = new URLSearchParams();
        formData.append('password', password);

        // Send as email if contains '@', else as username
        if (identifier.includes('@')) {
            formData.append('email', identifier);
        } else {
            formData.append('username', identifier);
        }

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

export const usersAPI = {
    getUserById: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },

    searchUsers: async (query) => {
        const response = await api.get(`/users/search/${query}`);
        return response.data;
    },

    updateUser: async (userData) => {
        const response = await api.put('/users/', userData);
        return response.data;
    },

    getUserActivity: async (userId) => {
        const response = await api.get(`/users/${userId}/activity`);
        return response.data;
    },

    getSuggestedUsers: async (limit = 5) => {
        const response = await api.get('/users/suggested/all', {
            params: { limit }
        });
        return response.data;
    },

    // Toggle follow status - follows user if not following, endpoint returns updated user data
    toggleFollow: async (userId) => {
        const response = await api.post(`/users/${userId}/follow`);
        return response.data;
    },

    // Unfollow a user - removes follow relationship, endpoint returns updated user data
    unfollow: async (userId) => {
        const response = await api.post(`/users/${userId}/unfollow`);
        return response.data;
    },

    // Check follow status for a user - returns { isFollowing: boolean }
    getFollowStatus: async (userId) => {
        const response = await api.get(`/users/${userId}/follow-status`);
        return response.data;
    },
};

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

    likePost: async (postId) => {
        const response = await api.post(`/posts/${postId}/like`);
        return response.data;
    },

    unlikePost: async (postId) => {
        const response = await api.delete(`/posts/${postId}/like`);
        return response.data;
    },

    searchPosts: async (query) => {
        const response = await api.get('/posts/search/all', {
            params: { query }
        });
        return response.data;
    },
};

export const uploadAPI = {
    uploadImage: async (formData) => {
        const response = await api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

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
