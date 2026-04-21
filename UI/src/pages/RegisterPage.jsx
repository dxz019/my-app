import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import CursorTracingEffect from '../components/CursorTracingEffect';

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!authForm.email || !authForm.username || !authForm.password || !authForm.fullName) {
            showToast('Please fill in all fields');
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
            showToast('Registration failed: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

return (
        <div className="flex align-items-center justify-content-center h-screen overflow-hidden" style={{ backgroundColor: '#E0F7FA', padding: '1rem', position: 'relative' }}>
            <CursorTracingEffect />
            
            <div 
                className="p-6 animate-scalein" 
                style={{ 
                    width: '100%', 
                    maxWidth: '600px', 
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
                        <i className="pi pi-user-plus text-2xl" style={{ color: '#0066FF' }}></i>
                    </div>
                    <h1 className="text-3xl font-bold m-0 mb-1" style={{ color: '#ffffff', letterSpacing: '-1px' }}>Join Thoughts</h1>
                    <p className="text-sm m-0" style={{ color: '#ffffff' }}>Create your account to start sharing</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-column gap-4 mt-4">
                    <div className="flex flex-column gap-1">
                        <label htmlFor="fullName" className="text-sm font-bold ml-1" style={{ color: '#aaaaaa' }}>Full Name</label>
                        <InputText
                            id="fullName"
                            value={authForm.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            required
                            placeholder="John Doe"
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

                    <div className="flex flex-column gap-1">
                        <label htmlFor="email" className="text-sm font-bold ml-1" style={{ color: '#aaaaaa' }}>Email Address</label>
                        <InputText
                            id="email"
                            type="email"
                            value={authForm.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
placeholder="john@example.com"
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

                    <div className="flex flex-column gap-1">
                        <label htmlFor="username" className="text-sm font-bold ml-1" style={{ color: '#aaaaaa' }}>Username</label>
                        <InputText
                            id="username"
                            value={authForm.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            required
                            placeholder="johndoe123"
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

                    <div className="flex flex-column gap-1">
                        <label htmlFor="password" className="text-sm font-bold ml-1" style={{ color: '#aaaaaa' }}>Password</label>
                        <Password
                            id="password"
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
                        label={loading ? 'Creating account...' : 'Create Account'}
                        className="w-full p-3 text-lg font-bold border-round-xl mt-1"
                        style={{ backgroundColor: '#0066FF', border: 'none', color: '#ffffff', height: '48px' }}
                        disabled={loading}
                        icon={loading ? 'pi pi-spin pi-spinner' : null}
                    />
                </form>

                <div className="mt-4 text-center">
                    <span style={{ color: '#888888' }}>Already have an account? </span>
                    <Button 
                        label="Sign In" 
                        link 
                        className="p-0 font-bold ml-1" 
                        style={{ color: '#0066FF' }}
                        onClick={() => navigate('/login')} 
                    />
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
