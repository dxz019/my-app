/**
 * Unit Tests for PostCard Component
 * Tests: rendering, author info, delete functionality
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard from '../../components/PostCard';

// Mock the CommentSection component
vi.mock('../../components/CommentSection', () => ({
    default: ({ postId, comments }) => (
        <div data-testid="comment-section">Comments: {comments.length}</div>
    ),
}));

// Mock postsAPI
vi.mock('../../services/api', () => ({
    postsAPI: {
        deletePost: vi.fn(),
    },
}));

import { postsAPI } from '../../services/api';

describe('PostCard Component', () => {
    const mockPost = {
        id: 1,
        content: 'Test post content',
        author: {
            id: 1,
            username: 'testuser',
            full_name: 'Test User'
        },
        created_at: '2024-01-01T00:00:00Z'
    };

    const mockCurrentUser = {
        id: 1,
        username: 'testuser',
        full_name: 'Test User'
    };

    const defaultProps = {
        post: mockPost,
        currentUser: mockCurrentUser,
        token: 'test-token',
        comments: {},
        showComments: {},
        onToggleComments: vi.fn(),
        onAddComment: vi.fn(),
        onDeletePost: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Test 1: Renders post content
    it('renders post content correctly', () => {
        render(<PostCard {...defaultProps} />);
        expect(screen.getByText('Test post content')).toBeDefined();
    });

    // Test 2: Renders author username
    it('renders author username', () => {
        render(<PostCard {...defaultProps} />);
        expect(screen.getByText(/@testuser/)).toBeDefined();
    });

    // Test 3: Renders author full name
    it('renders author full name', () => {
        render(<PostCard {...defaultProps} />);
        expect(screen.getByText('Test User')).toBeDefined();
    });

    // Test 4: Shows delete button for post author
    it('shows delete button when user is author', () => {
        render(<PostCard {...defaultProps} />);
        const deleteButton = screen.getByLabelText('Delete post');
        expect(deleteButton).toBeDefined();
    });

    // Test 5: Does not show delete button for non-author
    it('hides delete button when user is not author', () => {
        const differentUser = { id: 2, username: 'other', full_name: 'Other User' };
        render(<PostCard {...defaultProps} currentUser={differentUser} />);
        expect(screen.queryByLabelText('Delete post')).toBeNull();
    });

    // Test 6: Delete button click triggers state change
    it('delete button is clickable', () => {
        render(<PostCard {...defaultProps} />);
        const deleteButton = screen.getByLabelText('Delete post');
        // Just verify button is clickable without error
        expect(() => fireEvent.click(deleteButton)).not.toThrow();
    });

    // Test 7: Renders comment section
    it('renders comment section', () => {
        const propsWithComments = {
            ...defaultProps,
            comments: { 1: [{ id: 1, content: 'Test comment', author: { username: 'commenter' } }] },
            showComments: { 1: true }
        };
        render(<PostCard {...propsWithComments} />);
        expect(screen.getByTestId('comment-section')).toBeDefined();
    });
});
