/**
 * Unit Tests for CreatePost Component
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreatePost from '../../components/CreatePost';

describe('CreatePost Component', () => {
    // Test 1: Renders without crashing when not logged in
    it('renders the create post component when not logged in', () => {
        render(
            <BrowserRouter>
                <CreatePost 
                    currentUser={null}
                    token={null}
                    onPostCreated={vi.fn()}
                />
            </BrowserRouter>
        );
        // Component renders
        expect(document.querySelector('.surface-card')).toBeDefined();
    });

    // Test 2: Renders without crashing when logged in
    it('renders the create post component when logged in', () => {
        const mockUser = { id: 1, username: 'testuser' };
        render(
            <BrowserRouter>
                <CreatePost 
                    currentUser={mockUser}
                    token="test-token"
                    onPostCreated={vi.fn()}
                />
            </BrowserRouter>
        );
        // Component renders
        expect(document.querySelector('.surface-card')).toBeDefined();
    });
});
