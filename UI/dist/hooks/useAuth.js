import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
export const useAuth = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshCurrentUser = useCallback(async () => {
        if (!token) {
            setCurrentUser(null);
            setLoading(false);
            return null;
        }
        try {
            const user = await authAPI.getCurrentUser();
            setCurrentUser(user);
            return user;
        }
        catch (error) {
            console.error('Error fetching current user:', error);
            localStorage.removeItem('token');
            setToken(null);
            setCurrentUser(null);
            return null;
        }
        finally {
            setLoading(false);
        }
    }, [token]);
    // Fetch current user on mount if token exists
    useEffect(() => {
        refreshCurrentUser();
    }, [refreshCurrentUser]);
    const login = useCallback(async (username, password) => {
        const response = await authAPI.login(username, password);
        const userToken = response.token || response.access_token; // Backward compatibility check
        localStorage.setItem('token', userToken);
        setToken(userToken);
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
        refreshCurrentUser,
        isAuthenticated: !!token,
    };
};
export default useAuth;
