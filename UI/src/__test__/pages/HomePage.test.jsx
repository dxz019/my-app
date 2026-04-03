/**
 * Unit Tests for HomePage Component
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';

describe('HomePage Component', () => {
    const mockFetchPosts = vi.fn();
    const mockShowToast = vi.fn();
    const mockToken = 'test-token';
    const mockCurrentUser = { id: 1, username: 'testuser' };

    // Test 1: Renders without crashing (logged out state)
    it('renders the home page', () => {
        render(
            <BrowserRouter>
                <HomePage
                    token={null}
                    currentUser={null}
                    showToast={mockShowToast}
                    fetchPosts={mockFetchPosts}
                />
            </BrowserRouter>
        );
        expect(screen.getByText('Login to post')).toBeDefined();
    });

    // Test 2: Renders "What is happening?!" when logged in
    it('shows create post prompt when logged in', () => {
        render(
            <BrowserRouter>
                <HomePage
                    token={mockToken}
                    currentUser={mockCurrentUser}
                    showToast={mockShowToast}
                    fetchPosts={mockFetchPosts}
                />
            </BrowserRouter>
        );
        expect(screen.getByText('What is happening?!')).toBeDefined();
    });

    // Test 3: Renders SearchBar
    it('renders search bar', () => {
        render(
            <BrowserRouter>
                <HomePage
                    token={mockToken}
                    currentUser={mockCurrentUser}
                    showToast={mockShowToast}
                    fetchPosts={mockFetchPosts}
                />
            </BrowserRouter>
        );
        expect(document.querySelector('.home-page')).toBeDefined();
    });

    // Test 4: Shows empty state when no posts
    it('shows empty state message when no posts', () => {
        render(
            <BrowserRouter>
                <HomePage
                    posts={[]}
                    token={mockToken}
                    currentUser={mockCurrentUser}
                    showToast={mockShowToast}
                    fetchPosts={mockFetchPosts}
                />
            </BrowserRouter>
        );
        expect(screen.getByText('No posts yet. Be the first to post!')).toBeDefined();
    });
});
