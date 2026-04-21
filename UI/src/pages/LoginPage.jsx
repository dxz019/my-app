import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import CursorTracingEffect from '../components/CursorTracingEffect';

const LoginPage = ({ onLogin, showToast }) => {
    const navigate = useNavigate();
    const [authForm, setAuthForm] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

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
        <div className="flex align-items-center justify-content-center h-screen overflow-hidden" style={{ backgroundColor: '#E0F7FA', padding: '1rem', position: 'relative' }}>
            <CursorTracingEffect />
            
            <div
                className="p-6 animate-scalein"
                style={{
                    width: '100%',
                    maxWidth: '520px',
                    backgroundColor: '#000000',
                    border: '3px solid #111111',
                    borderRadius: '28px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <div className="text-center mb-5">
                    <div
                        className="inline-flex align-items-center justify-content-center mb-3"
                        style={{ width: '56px', height: '56px', backgroundColor: '#1a1a1a', borderRadius: '16px', border: '1px solid #333' }}
                    >
                        <i className="pi pi-shield text-2xl" style={{ color: '#0066FF' }}></i>
                    </div>
                    <h1 className="text-3xl font-bold m-0 mb-1" style={{ color: '#ffffff', letterSpacing: '-1px' }}>Thoughts</h1>
                    <p className="text-sm m-0" style={{ color: '#888888' }}>Enter your details to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-column gap-4 mt-4">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="loginEmail" className="text-sm font-bold ml-1" style={{ color: '#aaaaaa' }}>Email or Username</label>
                        <InputText
                            id="loginEmail"
                            value={authForm.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            placeholder="Email or Username"
                            className="p-inputtext-lg w-full"
                            style={{
                                background: '#ffffff',
                                border: '1px solid #dddddd',
                                borderRadius: '12px',
                                color: '#000000',
                                padding: '12px 16px',
                                caretColor: '#000000'
                            }}
                        />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="loginPassword" className="text-sm font-bold ml-1" style={{ color: '#aaaaaa' }}>Password</label>
                        <Password
                            id="loginPassword"
                            value={authForm.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                            toggleMask
                            feedback={false}
                            placeholder="········"
                            className="w-full"
                            style={{ 
                                borderRadius: '12px',
                            }}
                            inputClassName="p-inputtext-lg w-full"
                            inputStyle={{
                                background: '#ffffff',
                                border: '1px solid #dddddd',
                                borderRadius: '12px',
                                color: '#000000',
                                padding: '12px 16px',
                                width: '100%',
                                caretColor: '#000000'
                            }}
                        />
                    </div>

                    <Button
                        type="submit"
                        label="Sign In"
                        className="w-full p-3 text-lg font-bold border-round-xl mt-1"
                        style={{ backgroundColor: '#0066FF', border: 'none', color: '#ffffff', height: '48px' }}
                    />
                </form>

                <div className="mt-4 text-center">
                    <span style={{ color: '#888888' }}>New to Thoughts? </span>
                    <Button
                        label="Create Account"
                        link
                        className="p-0 font-bold ml-1"
                        style={{ color: '#0066FF' }}
                        onClick={() => navigate('/register')}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
