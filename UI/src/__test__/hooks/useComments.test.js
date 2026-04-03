/**
 * Unit Tests for useComments Hook
 * Tests: fetchComments, addComment, getCommentsForPost, toggleComments
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useComments } from '../../hooks/useComments';

// Mock API
vi.mock('../../services/api', () => ({
    commentsAPI: {
        getPostComments: vi.fn(),
        createComment: vi.fn(),
    },
}));

import { commentsAPI } from '../../services/api';

describe('useComments Hook', () => {
    const mockToken = 'test-token';
    const mockUser = { id: 1, username: 'testuser' };
    const mockPostId = 1;
    const mockComments = [
        { id: 1, content: 'First comment', author: { username: 'user1' }, created_at: '2024-01-01' },
        { id: 2, content: 'Second comment', author: { username: 'user2' }, created_at: '2024-01-02' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Test 1: Returns empty comments without token
    it('returns empty comments object without token', () => {
        const { result } = renderHook(() => useComments(null, null));
        expect(result.current.comments).toEqual({});
        expect(result.current.loading).toBe(false);
    });

    // Test 2: Returns empty comments without user
    it('returns empty comments without user', () => {
        const { result } = renderHook(() => useComments(mockToken, null));
        expect(result.current.comments).toEqual({});
    });

    // Test 3: fetchComments fetches comments for a post
    it('fetches comments for a post', async () => {
        commentsAPI.getPostComments.mockResolvedValue(mockComments);

        const { result } = renderHook(() => useComments(mockToken, mockUser));

        await act(async () => {
            await result.current.fetchComments(mockPostId);
        });

        expect(commentsAPI.getPostComments).toHaveBeenCalledWith(mockPostId);
        expect(result.current.comments[mockPostId]).toEqual(mockComments);
    });

    // Test 4: addComment calls API
    it('calls API to add a comment', async () => {
        commentsAPI.createComment.mockResolvedValue({});
        commentsAPI.getPostComments.mockResolvedValue(mockComments);

        const { result } = renderHook(() => useComments(mockToken, mockUser));

        await act(async () => {
            await result.current.addComment(mockPostId, 'New comment');
        });

        expect(commentsAPI.createComment).toHaveBeenCalledWith({
            content: 'New comment',
            post_id: mockPostId,
            author_id: mockUser.id,
        });
    });

    // Test 5: getCommentsForPost returns comments for specific post
    it('returns comments for specific post', async () => {
        commentsAPI.getPostComments.mockResolvedValue(mockComments);

        const { result } = renderHook(() => useComments(mockToken, mockUser));

        await act(async () => {
            await result.current.fetchComments(mockPostId);
        });

        const postComments = result.current.getCommentsForPost(mockPostId);
        expect(postComments).toEqual(mockComments);
    });

    // Test 6: getCommentsForPost returns empty array for unknown post
    it('returns empty array for unknown post', () => {
        const { result } = renderHook(() => useComments(mockToken, mockUser));

        const postComments = result.current.getCommentsForPost(999);
        expect(postComments).toEqual([]);
    });
});
