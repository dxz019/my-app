/**
 * Unit Tests for CommentSection Component
 * Tests: rendering, add comment, delete comment
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CommentSection from '../../components/CommentSection';
describe('CommentSection Component', () => {
    const mockComments = [
        {
            id: 1,
            content: 'First comment',
            author: { id: 1, username: 'user1' }
        },
        {
            id: 2,
            content: 'Second comment',
            author: { id: 2, username: 'user2' }
        }
    ];
    const mockCurrentUser = {
        id: 1,
        username: 'user1',
        full_name: 'User One'
    };
    const defaultProps = {
        postId: 1,
        comments: mockComments,
        currentUser: mockCurrentUser,
        token: 'test-token',
        onAddComment: vi.fn(),
        onDeleteComment: vi.fn(),
    };
    const renderWithRouter = (ui) => {
        return render(<MemoryRouter initialEntries={['/']}>{ui}</MemoryRouter>);
    };
    // Test 1: Renders comment input
    it('renders comment input field', () => {
        renderWithRouter(<CommentSection {...defaultProps}/>);
        expect(screen.getByPlaceholderText('Post your reply...')).toBeDefined();
    });
    // Test 2: Renders comments
    it('renders all comments', () => {
        renderWithRouter(<CommentSection {...defaultProps}/>);
        expect(screen.getByText('First comment')).toBeDefined();
        expect(screen.getByText('Second comment')).toBeDefined();
    });
    // Test 3: Renders author usernames
    it('renders comment author usernames', () => {
        renderWithRouter(<CommentSection {...defaultProps}/>);
        expect(screen.getByText('user1')).toBeDefined();
        expect(screen.getByText('user2')).toBeDefined();
    });
    // Test 4: Shows delete button for own comments
    it('shows delete button for own comments', () => {
        renderWithRouter(<CommentSection {...defaultProps}/>);
        const deleteButtons = screen.getAllByTitle('Delete comment');
        expect(deleteButtons.length).toBe(1);
    });
    // Test 5: Does not show delete button for other users' comments
    it('hides delete button for other users comments', () => {
        const differentUser = { id: 3, username: 'user3', full_name: 'User Three' };
        renderWithRouter(<CommentSection {...defaultProps} currentUser={differentUser}/>);
        expect(screen.queryByTitle('Delete comment')).toBeNull();
    });
    // Test 6: Returns null when no token
    it('returns null when no token', () => {
        const { container } = renderWithRouter(<CommentSection {...defaultProps} token={null}/>);
        expect(container.firstChild).toBeNull();
    });
});
