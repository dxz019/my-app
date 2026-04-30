/**
 * Unit Tests for LoginPage Component
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

describe('LoginPage Component', () => {
    const mockOnLogin = vi.fn();
    const mockShowToast = vi.fn();

    // Test 1: Renders without crashing
    it('renders the login page', () => {
        render(
            <BrowserRouter>
                <LoginPage onLogin={mockOnLogin} showToast={mockShowToast} />
            </BrowserRouter>
        );
        expect(screen.getByText('Thoughts')).toBeDefined();
    });

    // Test 2: Has password input field
    it('has password input', () => {
        render(
            <BrowserRouter>
                <LoginPage onLogin={mockOnLogin} showToast={mockShowToast} />
            </BrowserRouter>
        );
        expect(screen.getByPlaceholderText('Enter your password')).toBeDefined();
    });

    // Test 3: Has submit button
    it('has submit button', () => {
        render(
            <BrowserRouter>
                <LoginPage onLogin={mockOnLogin} showToast={mockShowToast} />
            </BrowserRouter>
        );
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});
