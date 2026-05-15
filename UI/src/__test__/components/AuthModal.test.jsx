/**
 * Unit Tests for AuthModal Component
 * Tests: rendering, form validation, login/register
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthModal from '../../components/AuthModal';

describe('AuthModal Component', () => {
     const mockOnHide = vi.fn();
     const mockOnLogin = vi.fn();
     const mockOnRegister = vi.fn();
     const mockShowToast = vi.fn();

     beforeEach(() => {
         vi.clearAllMocks();
         mockOnLogin.mockResolvedValue(undefined);
         mockOnRegister.mockResolvedValue(undefined);
     });

     const renderWithRouter = (ui) => {
         return render(
             <BrowserRouter>{ui}</BrowserRouter>
         );
     };

     // Test 1: Does not render when visible is false
     it('does not render when visible is false', () => {
         renderWithRouter(
             <AuthModal
                 visible={false}
                 onHide={mockOnHide}
                 onLogin={mockOnLogin}
                 onRegister={mockOnRegister}
                 showToast={mockShowToast}
             />
         );
         expect(screen.queryByText("Don't have an account?")).toBeNull();
     });

// Test 2: Shows login form when visible
     it('shows login form when visible', () => {
         renderWithRouter(
             <AuthModal
                 visible={true}
                 onHide={mockOnHide}
                 onLogin={mockOnLogin}
                 onRegister={mockOnRegister}
                 showToast={mockShowToast}
             />
         );
         expect(screen.getByText("Don't have an account?")).toBeDefined();
     });

     // Test 3: Shows register form when clicking Sign up link
     it('shows register form when clicking Sign up', async () => {
         renderWithRouter(
             <AuthModal
                 visible={true}
                 onHide={mockOnHide}
                 onLogin={mockOnLogin}
                 onRegister={mockOnRegister}
                 showToast={mockShowToast}
             />
         );

         // Click "Sign up" link to switch to register mode
         const signUpLink = screen.getByText('Sign up');
         fireEvent.click(signUpLink);

         await waitFor(() => {
             expect(screen.getByText('Already have an account?')).toBeDefined();
         });
     });

     // Test 4: Validates empty password on login
     it('shows error for empty password on submit', async () => {
         renderWithRouter(
             <AuthModal
                 visible={true}
                 onHide={mockOnHide}
                 onLogin={mockOnLogin}
                 onRegister={mockOnRegister}
                 showToast={mockShowToast}
             />
         );

         // Submit form without entering anything
         const buttons = screen.getAllByRole('button');
         const signInButton = buttons.find(b => b.getAttribute('label') === 'Sign in');
         fireEvent.click(signInButton);

         await waitFor(() => {
             expect(screen.getByText('Password is required')).toBeDefined();
         });
     });

     // Test 5: Calls onLogin with credentials
     it('calls onLogin with email and password', async () => {
         renderWithRouter(
             <AuthModal
                 visible={true}
                 onHide={mockOnHide}
                 onLogin={mockOnLogin}
                 onRegister={mockOnRegister}
                 showToast={mockShowToast}
             />
         );

         // Fill in email - using the correct placeholder from rendered output
         const emailInput = screen.getByPlaceholderText('Phone, email or username');
         fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

         // Fill in password
         const passwordInput = screen.getByPlaceholderText('Password');
         fireEvent.change(passwordInput, { target: { value: 'password123' } });

         // Submit form - find button with label "Sign in"
         const buttons = screen.getAllByRole('button');
         const signInButton = buttons.find(b => b.getAttribute('label') === 'Sign in');
         fireEvent.click(signInButton);

         await waitFor(() => {
             expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123');
         });
     });

     // Test 6: Shows validation errors for registration - only password required
     it('shows validation error for empty password on registration', async () => {
         renderWithRouter(
             <AuthModal
                 visible={true}
                 onHide={mockOnHide}
                 onLogin={mockOnLogin}
                 onRegister={mockOnRegister}
                 showToast={mockShowToast}
             />
         );

         // Switch to register mode
         const signUpLink = screen.getByText('Sign up');
         fireEvent.click(signUpLink);

         await waitFor(() => {
             expect(screen.getByText('Already have an account?')).toBeDefined();
         });

         // Submit without any data
         const buttons = screen.getAllByRole('button');
         const signUpButton = buttons.find(b => b.getAttribute('label') === 'Sign up');
         fireEvent.click(signUpButton);

         await waitFor(() => {
             expect(screen.getByText('Password is required')).toBeDefined();
         });
     });

     // Test 7: Registration validates password
     it('validates password on registration', async () => {
         renderWithRouter(
             <AuthModal
                 visible={true}
                 onHide={mockOnHide}
                 onLogin={mockOnLogin}
                 onRegister={mockOnRegister}
                 showToast={mockShowToast}
             />
         );

         // Switch to register mode
         const signUpLink = screen.getByText('Sign up');
         fireEvent.click(signUpLink);

         await waitFor(() => {
             expect(screen.getByText('Already have an account?')).toBeDefined();
         });

         // Submit without password
         const buttons = screen.getAllByRole('button');
         const signUpButton = buttons.find(b => b.getAttribute('label') === 'Sign up');
         fireEvent.click(signUpButton);

         await waitFor(() => {
             expect(screen.getByText('Password is required')).toBeDefined();
         });
     });

     // Test 8: Shows error toast on login failure
     it('shows error toast on login failure', async () => {
         mockOnLogin.mockRejectedValue({
             response: { data: { detail: 'Invalid credentials' } }
         });

         renderWithRouter(
             <AuthModal
                 visible={true}
                 onHide={mockOnHide}
                 onLogin={mockOnLogin}
                 onRegister={mockOnRegister}
                 showToast={mockShowToast}
             />
         );

         // Fill in credentials
         const emailInput = screen.getByPlaceholderText('Phone, email or username');
         fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

         const passwordInput = screen.getByPlaceholderText('Password');
         fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

         // Submit form
         const buttons = screen.getAllByRole('button');
         const signInButton = buttons.find(b => b.getAttribute('label') === 'Sign in');
         fireEvent.click(signInButton);

         await waitFor(() => {
             expect(mockShowToast).toHaveBeenCalledWith('Invalid credentials');
         });
     });

     // Test 9: Switches back to login from registration
     it('can switch back to login from registration', async () => {
         renderWithRouter(
             <AuthModal
                 visible={true}
                 onHide={mockOnHide}
                 onLogin={mockOnLogin}
                 onRegister={mockOnRegister}
                 showToast={mockShowToast}
             />
         );

         // Switch to register mode
         const signUpLink = screen.getByText('Sign up');
         fireEvent.click(signUpLink);

         await waitFor(() => {
             expect(screen.getByText('Already have an account?')).toBeDefined();
         });

         // Switch back to login
         const signInLink = screen.getByText('Sign in');
         fireEvent.click(signInLink);

         await waitFor(() => {
             expect(screen.getByText("Don't have an account?")).toBeDefined();
         });
     });

     // Test 10: Modal can be closed
     it('can close the modal', () => {
         renderWithRouter(
             <AuthModal
                 visible={true}
                 onHide={mockOnHide}
                 onLogin={mockOnLogin}
                 onRegister={mockOnRegister}
                 showToast={mockShowToast}
             />
         );

         // Click close button
         const closeButton = screen.getByText('Close');
         fireEvent.click(closeButton);

         expect(mockOnHide).toHaveBeenCalled();
     });
 });
