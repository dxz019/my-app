/**
 * Unit Tests for Header Component
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../components/Header';

describe('Header Component', () => {
    // Test 1: Renders without crashing
    it('renders the header', () => {
        const { container } = render(
            <BrowserRouter>
                <Header 
                    currentUser={null} 
                    token={null}
                    onLogout={vi.fn()}
                    showToast={vi.fn()}
                />
            </BrowserRouter>
        );
        expect(container).toBeDefined();
    });

    // Test 2: Renders without crashing when logged in
    it('renders when logged in', () => {
        const mockUser = { id: 1, username: 'testuser' };
        const { container } = render(
            <BrowserRouter>
                <Header 
                    currentUser={mockUser} 
                    token="test-token"
                    onLogout={vi.fn()}
                    showToast={vi.fn()}
                />
            </BrowserRouter>
        );
        expect(container).toBeDefined();
    });
});
