import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
const LoginPage = ({ onLogin, showToast }) => {
    const navigate = useNavigate();
    const [authForm, setAuthForm] = useState({
        identifier: '', // can be email OR username
        password: ''
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!authForm.password || authForm.password.length < 1) {
            showToast('Please enter a password');
            return;
        }
        try {
            // Pass identifier (email or username) to login
            await onLogin(authForm.identifier, authForm.password);
            showToast('Login successful!');
            navigate('/');
        }
        catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.detail || 'Login failed. Check credentials.';
            showToast(errorMessage);
        }
    };
    const handleInputChange = (field, value) => {
        setAuthForm(prev => ({ ...prev, [field]: value }));
    };
    return (<div className="auth-page-container">
            <div className="auth-card">
                <div className="text-center mb-6">
                    <div className="inline-flex align-items-center justify-content-center mb-4" style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'var(--color-primary-light)',
            borderRadius: '20px'
        }}>
                        <i className="pi pi-sign-in text-3xl" style={{ color: 'var(--color-primary)' }}></i>
                    </div>
                    <h1 className="text-3xl font-bold m-0 mb-2" style={{ color: 'var(--color-text-main)' }}>Welcome Back</h1>
                    <p className="text-lg m-0" style={{ color: 'var(--color-text-muted)' }}>Sign in to continue to Thoughts</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-column gap-4">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="loginIdentifier" className="text-sm font-bold" style={{ color: 'var(--color-text-sub)' }}>Email or Username</label>
                        <InputText id="loginIdentifier" value={authForm.identifier} onChange={(e) => handleInputChange('identifier', e.target.value)} required placeholder="Enter your email or username" className="p-inputtext-lg w-full" style={{
            background: 'var(--color-input-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            color: 'var(--color-input-text)',
            padding: '14px 16px',
            fontSize: '16px'
        }}/>
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="loginPassword" className="text-sm font-bold" style={{ color: 'var(--color-text-sub)' }}>Password</label>
                         <div className="w-full">
                            <Password id="loginPassword" value={authForm.password} onChange={(e) => handleInputChange('password', e.target.value)} required toggleMask feedback={false} placeholder="Enter your password" className="w-full" inputClassName="w-full" style={{ width: '100%' }} inputStyle={{
            width: '100%',
            background: 'var(--color-input-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            color: 'var(--color-input-text)',
            padding: '14px 16px',
            fontSize: '16px',
            fontWeight: 500
        }} panelStyle={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            color: 'var(--color-input-text)'
        }}/>
                        </div>
                    </div>

                    <Button type="submit" label="Sign In" className="w-full p-3 text-lg font-bold border-round-xl mt-2" style={{
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            color: '#ffffff',
            height: '52px',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.5px'
        }}/>
                </form>

                <div className="mt-4 text-center">
                    <span style={{ color: 'var(--color-text-muted)' }}>New to Thoughts? </span>
                    <Button label="Create Account" link className="p-0 font-bold" style={{ color: 'var(--color-primary)' }} onClick={() => navigate('/register')}/>
                </div>
            </div>
        </div>);
};
export default LoginPage;
