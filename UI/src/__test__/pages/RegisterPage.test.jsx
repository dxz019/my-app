/**
 * Unit Tests for RegisterPage Component
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../pages/RegisterPage';

describe('RegisterPage Component', () => {
    const mockOnRegister = vi.fn();
    const mockShowToast = vi.fn();

    // Test 1: Renders without crashing
    it('renders the register page', () => {
        render(
            <BrowserRouter>
                <RegisterPage onRegister={mockOnRegister} showToast={mockShowToast} />
            </BrowserRouter>
        );
        expect(screen.getByText('Join Thoughts')).toBeDefined();
    });

    // Test 2: Has password input field
    it('has password input', () => {
        render(
            <BrowserRouter>
                <RegisterPage onRegister={mockOnRegister} showToast={mockShowToast} />
            </BrowserRouter>
        );
        expect(screen.getByPlaceholderText('Password')).toBeDefined();
    });

    // Test 3: Has submit button
    it('has submit button', () => {
        render(
            <BrowserRouter>
                <RegisterPage onRegister={mockOnRegister} showToast={mockShowToast} />
            </BrowserRouter>
        );
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});
