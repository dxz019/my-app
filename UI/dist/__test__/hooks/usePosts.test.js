/**
 * Unit Tests for usePosts Hook
 * Tests: fetchPosts, createPost (auth required), getFilteredPosts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePosts } from '../../hooks/usePosts';
// Mock API
vi.mock('../../services/api', () => ({
    postsAPI: {
        getAllPosts: vi.fn(),
        createPost: vi.fn(),
        getUserPosts: vi.fn(),
    },
}));
import { postsAPI } from '../../services/api';
describe('usePosts Hook', () => {
    const mockUser = { id: 1, username: 'testuser' };
    const mockToken = 'test-token';
    const mockPosts = [
        { id: 1, content: 'First post', author_id: 1 },
        { id: 2, content: 'Second post', author_id: 2 },
        { id: 3, content: 'Third post', author_id: 1 },
    ];
    beforeEach(() => {
        vi.clearAllMocks();
        postsAPI.getAllPosts.mockResolvedValue(mockPosts);
    });
    // Test 1: fetchPosts populates posts
    it('fetches posts and populates array', async () => {
        const { result } = renderHook(() => usePosts(mockToken, mockUser));
        await waitFor(() => expect(result.current.posts.length).toBe(3));
        expect(postsAPI.getAllPosts).toHaveBeenCalled();
    });
    // Test 2: createPost throws without token
    it('throws when creating post without token', async () => {
        const { result } = renderHook(() => usePosts(null, null));
        await expect(act(async () => { await result.current.createPost('Hello'); })).rejects.toThrow('Must be logged in');
    });
    // Test 3: createPost throws without user
    it('throws when creating post without user', async () => {
        const { result } = renderHook(() => usePosts(mockToken, null));
        await expect(act(async () => { await result.current.createPost('Hello'); })).rejects.toThrow('Must be logged in');
    });
    // Test 4: getFilteredPosts returns all on home
    it('returns all posts on home page', async () => {
        const { result } = renderHook(() => usePosts(mockToken, mockUser));
        await waitFor(() => expect(result.current.posts.length).toBe(3));
        const filtered = result.current.getFilteredPosts('home');
        expect(filtered).toHaveLength(3);
    });
    // Test 5: getFilteredPosts returns user posts on profile
    it('returns only user posts on profile', async () => {
        const { result } = renderHook(() => usePosts(mockToken, mockUser));
        await waitFor(() => expect(result.current.posts.length).toBe(3));
        const filtered = result.current.getFilteredPosts('profile');
        expect(filtered).toHaveLength(2); // author_id: 1 has 2 posts
    });
});
