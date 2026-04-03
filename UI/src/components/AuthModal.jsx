import React, { useState } from 'react'; // Import React and useState hook to store changing data inside the component
import { Dialog } from 'primereact/dialog'; // PrimeReact popup modal component
import { InputText } from 'primereact/inputtext'; // Styled text input field from PrimeReact
import { Password } from 'primereact/password'; // Password input with show/hide toggle and strength feedback
import { Button } from 'primereact/button'; // Styled button component

// Toast message constants for maintainability
const TOAST_MESSAGES = {
    REGISTRATION_SUCCESS: 'Account created! Please log in.',
    REGISTRATION_ERROR: 'Registration failed. Please try again.',
    LOGIN_ERROR: 'Invalid credentials'
};

// AuthModal component receives props from parent component
const AuthModal = ({ visible, onHide, onLogin, onRegister, showToast }) => {

    // Loading state to disable form during submission
    const [isLoading, setIsLoading] = useState(false);

    // Boolean state to track if user is registering or logging in
    const [isRegistering, setIsRegistering] = useState(false);

    // State variables to store form input values
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');

    // Object to store validation error messages
    const [errors, setErrors] = useState({});

    // Function to validate form inputs before submitting
    const validateForm = () => {

        // Temporary object to collect validation errors
        const newErrors = {};

        // These checks only run when user is registering
        if (isRegistering) {

            // Check if full name is empty
            if (!fullName.trim()) { // trim removes leading and trailing spaces
                newErrors.fullName = 'Name is required';
            }

            // Check if email is empty
            if (!email.trim()) {
                newErrors.email = 'Email is required';

                // Check if email format is valid
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                newErrors.email = 'Email is invalid';
            }

            // Check if username is empty
            if (!username.trim()) {
                newErrors.username = 'Username is required';

                // Check if username has minimum length
            } else if (username.length < 3) {
                newErrors.username = 'Username must be at least 3 characters';
            }
        }

        // Password validation for both login and register
        if (!password.trim()) {
            newErrors.password = 'Password is required';

            // During registration password must be at least 6 characters
        } else if (isRegistering && password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Save errors into state so UI can show them
        setErrors(newErrors);

        // Return true if no errors exist
        return Object.keys(newErrors).length === 0;
    };

    // Function to clear the form inputs
    const resetForm = () => {
        setEmail('');
        setPassword('');
        setUsername('');
        setFullName('');
        setErrors({});
    };

    // Function to close modal with optional delay
    const handleClose = (delay = 0) => {
        if (delay > 0) {
            // Delay allows user to see success/error toast before modal closes
            setTimeout(() => {
                resetForm();
                onHide();
            }, delay);
        } else {
            resetForm();
            onHide();
        }
    };

    // Function handles submission
    const handleSubmit = async (e) => {

        e.preventDefault();

        // Stop submission 
        if (!validateForm()) {
            return;
        }

        try {
            // Show loading state to prevent duplicate submissions
            setIsLoading(true);

            //registering a new account
            if (isRegistering) {

                //  function passed from parent component
                await onRegister({
                    email,
                    username,
                    password,
                    full_name: fullName
                });

                // Show success notification before closing modal
                showToast?.(TOAST_MESSAGES.REGISTRATION_SUCCESS);

                // Close modal after delay to allow user to see success message
                handleClose(1500);

            } else {

                // Call login function with email and password
                await onLogin(email, password);

                // Close modal after successful login
                handleClose();
            }

        } catch (error) {

            // Print error in browser console for debugging
            console.error('Auth error:', error);

            const errorMessage = error?.response?.data?.detail ||

                // Fallback error messages
                (isRegistering ? TOAST_MESSAGES.REGISTRATION_ERROR : TOAST_MESSAGES.LOGIN_ERROR);

            // Show error message using toast notification
            showToast?.(errorMessage);

            // Keep modal open on error so user can try again
            setIsLoading(false);
        }
    };

    // Style object for input fields
    const inputStyle = {
        borderRadius: '4px',
        backgroundColor: '#f5f8fa',
        border: '1px solid #cfd9de',
        padding: '12px',
        width: '100%',
        fontSize: '14px'
    };

    // Style object for displaying error messages
    const errorStyle = {
        color: '#f4212e',
        fontSize: '12px',
        marginTop: '4px'
    };

    // JSX UI returned by the component
    return (
        <Dialog

            // Header text changes depending on login or signup mode
            header={isRegistering ? 'Create your account' : 'Sign in to Thoughts'}

            visible={visible} // Controls whether modal is visible
            onHide={handleClose} // Runs when modal is closed

            // Styling for modal window
            style={{ width: '380px', borderRadius: '16px', padding: '0px' }}

            modal // Prevent interaction with background
            showHeader={true}
        >

            {/* Form that triggers handleSubmit on submission */}
            <form onSubmit={handleSubmit} className="flex flex-column gap-3 p-4">

                {/* Show Name field only during registration */}
                {isRegistering && (
                    <div className="flex flex-column">
                        <InputText
                            value={fullName} // Input value bound to state
                            onChange={(e) => setFullName(e.target.value)} // Update state on typing
                            placeholder="Name"
                            style={inputStyle}
                            className={errors.fullName ? 'p-invalid' : ''} // Add red border if error exists
                        />
                        {/* Display error message */}
                        {errors.fullName && <span style={errorStyle}>{errors.fullName}</span>}
                    </div>
                )}

                {/* Email field for registration */}
                {isRegistering && (
                    <div className="flex flex-column">
                        <InputText
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            style={inputStyle}
                            className={errors.email ? 'p-invalid' : ''}
                        />
                        {errors.email && <span style={errorStyle}>{errors.email}</span>}
                    </div>
                )}

                {/* Username field for registration */}
                {isRegistering && (
                    <div className="flex flex-column">
                        <InputText
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            style={inputStyle}
                            className={errors.username ? 'p-invalid' : ''}
                        />
                        {errors.username && <span style={errorStyle}>{errors.username}</span>}
                    </div>
                )}

                {/* Login field when user is signing in */}
                {!isRegistering && (
                    <div className="flex flex-column">
                        <InputText
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Phone, email or username"
                            style={inputStyle}
                        />
                    </div>
                )}

                {/* Password input field */}
                <div className="flex flex-column">
                    <Password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        toggleMask // Allows user to show/hide password
                        feedback={isRegistering} // Password strength shown during signup
                        className="w-full"
                        inputStyle={{ ...inputStyle, padding: '12px' }}
                        style={{ width: '100%' }}
                    />

                    {/* Password error message */}
                    {errors.password && <span style={errorStyle}>{errors.password}</span>}
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    label={isLoading ? (isRegistering ? 'Creating account...' : 'Signing in...') : (isRegistering ? 'Sign up' : 'Sign in')}
                    className="w-full p-3"
                    loading={isLoading}
                    disabled={isLoading}
                    style={{
                        borderRadius: '9999px',
                        backgroundColor: isRegistering ? '#1d9bf0' : '#000',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        opacity: isLoading ? 0.7 : 1
                    }}
                />

                {/* Toggle between login and signup */}
                <div className="text-center" style={{ fontSize: '14px', color: '#536471' }}>

                    {isRegistering ? (
                        <span>Already have an account? <a
                            href="#"

                            // Prevent page jump and switch to login mode
                            onClick={(e) => { e.preventDefault(); setIsRegistering(false); setErrors({}); }}

                            style={{ color: '#1d9bf0', textDecoration: 'none' }}
                        >Sign in</a></span>

                    ) : (
                        <span>Don't have an account? <a
                            href="#"

                            // Prevent page jump and switch to signup mode
                            onClick={(e) => { e.preventDefault(); setIsRegistering(true); setErrors({}); }}

                            style={{ color: '#1d9bf0', textDecoration: 'none' }}
                        >Sign up</a></span>
                    )}
                </div>

            </form>
        </Dialog>
    );
};

// Export component so it can be used in other files
export default AuthModal;