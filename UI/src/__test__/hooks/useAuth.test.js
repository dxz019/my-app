
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';

// Mock the API module
vi.mock('../../services/api', () => ({
    authAPI: {
        login: vi.fn(),
        register: vi.fn(),
        getCurrentUser: vi.fn(),
    },
}));

import { authAPI } from '../../services/api';

describe('useAuth Hook', () => {
    // Reset localStorage and mocks before each test
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        authAPI.getCurrentUser.mockResolvedValue(null);
    });

    // Clean up after each test
    afterEach(() => {
        vi.resetAllMocks();
    });

    /**
     * Test: Initialize with null token when localStorage is empty
     * Expected: token and currentUser should be null, isAuthenticated should be false
     */
    it('should initialize with null token when localStorage is empty', () => {
        localStorage.getItem.mockReturnValue(null);

        const { result } = renderHook(() => useAuth());

        expect(result.current.token).toBeNull();
        expect(result.current.currentUser).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    /**
     * Test: Initialize with token from localStorage
     * Expected: token should match the value from localStorage
     */
    it('should initialize with token from localStorage', () => {
        localStorage.getItem.mockReturnValue('test-token-123');

        const { result } = renderHook(() => useAuth());

        expect(result.current.token).toBe('test-token-123');
    });

    /**
     * Test: isAuthenticated should be true when token exists
     * Expected: isAuthenticated should be true
     */
    it('should set isAuthenticated to true when token exists', () => {
        localStorage.getItem.mockReturnValue('valid-token');

        const { result } = renderHook(() => useAuth());

        expect(result.current.isAuthenticated).toBe(true);
    });

    /**
     * Test: Login should call API and set token on success
     * Expected: authAPI.login should be called with correct credentials,
     * localStorage should have token set, currentUser should be updated
     */
    it('should call login API and set token on successful login', async () => {
        const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
        const mockResponse = { access_token: 'new-token-456', token_type: 'Bearer' };

        authAPI.login.mockResolvedValue(mockResponse);
        authAPI.getCurrentUser.mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.login('testuser', 'password123');
        });

        expect(authAPI.login).toHaveBeenCalledWith('testuser', 'password123');
        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token-456');
        expect(result.current.token).toBe('new-token-456');
        expect(result.current.currentUser).toEqual(mockUser);
    });

    /**
     * Test: Register should call API
     * Expected: authAPI.register should be called with user data
     */
    it('should call register API on registration', async () => {
        const mockResponse = { message: 'User registered successfully' };
        const userData = { username: 'newuser', email: 'new@example.com', password: 'password123' };

        authAPI.register.mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.register(userData);
        });

        expect(authAPI.register).toHaveBeenCalledWith(userData);
    });

    /**
     * Test: Logout should clear token and user
     * Expected: localStorage should have token removed, 
     * token and currentUser should be null, isAuthenticated should be false
     */
    it('should clear token and user on logout', () => {
        localStorage.getItem.mockReturnValue('test-token');

        const { result } = renderHook(() => useAuth());

        // Initially authenticated
        expect(result.current.token).toBe('test-token');

        // Perform logout
        act(() => {
            result.current.logout();
        });

        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(result.current.token).toBeNull();
        expect(result.current.currentUser).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    /**
     * Test: Login error should be handled gracefully
     * Expected: Error should be thrown, token should remain null
     */
    it('should handle login error gracefully', async () => {
        const error = new Error('Invalid credentials');
        authAPI.login.mockRejectedValue(error);

        const { result } = renderHook(() => useAuth());

        await expect(
            act(async () => {
                await result.current.login('wronguser', 'wrongpass');
            })
        ).rejects.toThrow('Invalid credentials');

        // Token should be falsy after login error
        expect(result.current.token ?? null).toBeNull();
    });
});
