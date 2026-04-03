import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const useAuth = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user on mount if token exists
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const user = await authAPI.getCurrentUser();
                    setCurrentUser(user);
                } catch (error) {
                    console.error('Error fetching current user:', error);
                    // Token might be invalid, clear it
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]);

    const login = useCallback(async (username, password) => {
        const response = await authAPI.login(username, password);
        localStorage.setItem('token', response.access_token);
        setToken(response.access_token);

        // Fetch user after login
        const user = await authAPI.getCurrentUser();
        setCurrentUser(user);

        return response;
    }, []);

    const register = useCallback(async (userData) => {
        const response = await authAPI.register(userData);
        return response;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
    }, []);

    return {
        token,
        currentUser,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
    };
};

export default useAuth;
