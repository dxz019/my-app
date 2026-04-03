import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

const LoginPage = ({ onLogin, showToast }) => {
    const navigate = useNavigate();
    const [authForm, setAuthForm] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password length
        if (!authForm.password || authForm.password.length < 1) {
            showToast('Please enter a password');
            return;
        }

        try {
            await onLogin(authForm.email, authForm.password);
            showToast('Login successful!');
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.detail || 'Login failed. Check credentials.';
            showToast(errorMessage);
        }
    };

    const handleInputChange = (field, value) => {
        setAuthForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div
            className="flex align-items-center justify-content-center min-h-screen"
            style={{ backgroundColor: '#f5f0e6', padding: '20px' }}
        >
            <div
                className="w-full p-8"
                style={{
                    maxWidth: '600px',
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
            >
                <div className="text-center mb-5">
                    <h1
                        className="m-0"
                        style={{
                            fontSize: '42px',
                            fontWeight: 'bold',
                            color: '#8b7355'
                        }}
                    >
                        Thoughts
                    </h1>
                    <p style={{ color: '#666', marginTop: '12px', fontSize: '18px' }}>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-column gap-4">
                    <div className="flex flex-column gap-2" style={{ width: '100%' }}>
                        <InputText
                            id="loginEmail"
                            type="text"
                            placeholder="Phone, email, or username"
                            value={authForm.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            style={{
                                width: '100%',
                                borderRadius: '24px',
                                backgroundColor: '#f5f0e6',
                                border: '1px solid #d4c4a8',
                                padding: '12px 16px'
                            }}
                        />
                    </div>

                    <div className="flex flex-column gap-2" style={{ width: '100%' }}>
                        <Password
                            id="loginPassword"
                            placeholder="Password"
                            value={authForm.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                            toggleMask
                            feedback={false}
                            pt={{
                                input: {
                                    style: {
                                        borderRadius: '24px',
                                        backgroundColor: '#f5f0e6',
                                        border: '1px solid #d4c4a8',
                                        padding: '12px 16px',
                                        width: '100%'
                                    }
                                }
                            }}
                            style={{
                                width: '100%',
                                borderRadius: '24px'
                            }}
                        />
                    </div>

                    <Button
                        type="submit"
                        label="Sign in"
                        className="w-full"
                        style={{
                            borderRadius: '24px',
                            backgroundColor: '#8b7355',
                            borderColor: '#8b7355',
                            padding: '12px',
                            fontWeight: 'bold',
                            fontSize: '15px'
                        }}
                    />

                </form>

                <div className="mt-4 text-center">
                    <span style={{ color: '#666', fontSize: '14px' }}>Don't have an account? </span>
                    <a
                        href="#"
                        style={{ color: '#8b7355', fontWeight: 'bold', fontSize: '14px' }}
                        onClick={(e) => { e.preventDefault(); navigate('/register'); }}
                    >
                        Sign up
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
