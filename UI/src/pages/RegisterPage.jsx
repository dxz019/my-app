import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

const RegisterPage = ({ onRegister, showToast }) => {
    const navigate = useNavigate();
    const [authForm, setAuthForm] = useState({
        email: '',
        password: '',
        username: '',
        fullName: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field, value) => {
        setAuthForm(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        const { email, username, password, fullName } = authForm;

        if (!email || !username || !password || !fullName) {
            showToast('Please fill in all fields');
            return false;
        }

        if (username.length < 3 || username.length > 30) {
            showToast('Username must be 3-30 characters');
            return false;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showToast('Username can only contain letters, numbers, and underscores');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address');
            return false;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters');
            return false;
        }

        if (fullName.trim().length < 1) {
            showToast('Please enter your full name');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onRegister({
                email: authForm.email,
                username: authForm.username,
                password: authForm.password,
                full_name: authForm.fullName
            });
            showToast('Account created! Please login.');
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            let errorMsg = 'Registration failed';

            const errors = error.response?.data?.errors;
            if (errors && Array.isArray(errors) && errors.length > 0) {
                errorMsg = errors[0].message;
            } else if (error.response?.data?.detail) {
                errorMsg = error.response.data.detail;
            } else if (error.message) {
                errorMsg = error.message;
            }

            showToast(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-column align-items-center justify-content-center min-h-screen py-8 px-3" style={{ position: 'relative' }}>
            <div 
                className="w-full"
                style={{ 
                    maxWidth: '600px',
                    backgroundColor: 'var(--color-bg-card)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '28px',
                    padding: '2.5rem'
                }}
            >
                <div className="text-center mb-5">
                    <div 
                        className="inline-flex align-items-center justify-content-center mb-3"
                        style={{ 
                            width: '64px', 
                            height: '64px', 
                            backgroundColor: 'var(--color-primary-light)', 
                            borderRadius: '20px' 
                        }}
                    >
                        <i className="pi pi-user-plus text-3xl" style={{ color: 'var(--color-primary)' }}></i>
                    </div>
                    <h1 className="text-display-sm font-bold m-0 mb-2" style={{ color: 'var(--color-text-main)' }}>Join Thoughts</h1>
                    <p className="text-body-base text-500 m-0 mt-1">Create your account to start sharing</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-column gap-4">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="fullName" className="text-sm font-bold" style={{ color: 'var(--color-text-sub)' }}>Full Name</label>
                        <InputText
                            id="fullName"
                            value={authForm.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            required
                            placeholder="John Doe"
                            className="w-full"
                            style={{ 
                                background: 'var(--color-input-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                color: 'var(--color-input-text)',
                                padding: '14px 16px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="email" className="text-sm font-bold" style={{ color: 'var(--color-text-sub)' }}>Email Address</label>
                        <InputText
                            id="email"
                            type="email"
                            value={authForm.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            placeholder="john@example.com"
                            className="w-full"
                            style={{ 
                                background: 'var(--color-input-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                color: 'var(--color-input-text)',
                                padding: '14px 16px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="username" className="text-sm font-bold" style={{ color: 'var(--color-text-sub)' }}>Username</label>
                        <InputText
                            id="username"
                            value={authForm.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            required
                            placeholder="johndoe123"
                            className="w-full"
                            style={{ 
                                background: 'var(--color-input-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                color: 'var(--color-input-text)',
                                padding: '14px 16px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div className="flex flex-column gap-2" style={{ width: '100%' }}>
                        <label htmlFor="password" className="text-sm font-bold" style={{ color: 'var(--color-text-sub)' }}>Password</label>
                        <div className="w-100" style={{ position: 'relative' }}>
                            <Password
                                id="password"
                                value={authForm.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                required
                                toggleMask
                                feedback={false}
                                placeholder="Enter your password"
                                className="w-full"
                                inputClassName="w-full"
                                style={{ width: '100%' }}
                                inputStyle={{
                                    width: '100%',
                                    background: 'var(--color-input-bg)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '12px',
                                    color: 'var(--color-input-text)',
                                    padding: '14px 16px',
                                    fontSize: '16px',
                                    fontWeight: 500
                                }}
                                panelStyle={{
                                    background: 'var(--color-bg-elevated)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '12px',
                                    color: 'var(--color-input-text)'
                                }}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        label={loading ? 'Creating account...' : 'Create Account'}
                        className="w-full p-3 text-lg font-bold border-round-xl mt-2"
                        style={{ 
                            backgroundColor: 'var(--color-primary)', 
                            border: 'none', 
                            color: '#ffffff', 
                            height: '52px',
                            fontSize: '16px',
                            fontWeight: 700,
                            letterSpacing: '0.5px'
                        }}
                        disabled={loading}
                        icon={loading ? 'pi pi-spin pi-spinner' : null}
                    />
                </form>

                <div className="mt-4 text-center">
                    <span style={{ color: 'var(--color-text-muted)' }}>Already have an account? </span>
                    <Button 
                        label="Sign In" 
                        link 
                        className="p-0 font-bold" 
                        style={{ color: 'var(--color-primary)' }}
                        onClick={() => navigate('/login')} 
                    />
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
