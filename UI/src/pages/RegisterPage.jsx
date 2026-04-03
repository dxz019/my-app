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
                            fontSize: '36px',
                            fontWeight: 'bold',
                            color: '#8b7355'
                        }}
                    >
                        Join Thoughts
                    </h1>
                    <p style={{ color: '#666', marginTop: '12px', fontSize: '18px' }}>Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-column gap-3">
                    <div className="flex flex-column gap-2" style={{ width: '100%' }}>
                        <InputText
                            id="fullName"
                            type="text"
                            placeholder="Full Name"
                            value={authForm.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            required
                            style={{
                                borderRadius: '24px',
                                backgroundColor: '#f5f0e6',
                                border: '1px solid #d4c4a8',
                                padding: '14px 18px',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div className="flex flex-column gap-2" style={{ width: '100%' }}>
                        <InputText
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={authForm.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            style={{
                                borderRadius: '24px',
                                backgroundColor: '#f5f0e6',
                                border: '1px solid #d4c4a8',
                                padding: '14px 18px',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div className="flex flex-column gap-2" style={{ width: '100%' }}>
                        <InputText
                            id="username"
                            type="text"
                            placeholder="Username"
                            value={authForm.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            required
                            style={{
                                borderRadius: '24px',
                                backgroundColor: '#f5f0e6',
                                border: '1px solid #d4c4a8',
                                padding: '14px 18px',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div className="flex flex-column gap-2" style={{ width: '100%' }}>
                        <Password
                            id="password"
                            placeholder="Password"
                            value={authForm.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                            toggleMask
                            feedback={false}
                            pt={{
                                input: {
                                    style: {
                                        borderRadius: '30px',
                                        backgroundColor: '#f5f0e6',
                                        border: '1px solid #d4c4a8',
                                        padding: '14px 18px',
                                        width: '100%'
                                    }
                                }
                            }}
                            style={{
                                width: '100%',
                                borderRadius: '30px'
                            }}
                        />
                    </div>

                    <Button
                        type="submit"
                        label={loading ? 'Creating account...' : 'Create account'}
                        icon={loading ? 'pi pi-spin pi-spinner' : null}
                        disabled={loading}
                        style={{
                            borderRadius: '24px',
                            backgroundColor: '#8b7355',
                            borderColor: '#8b7355',
                            padding: '16px',
                            fontWeight: 'bold',
                            width: '100%',
                            fontSize: '18px'
                        }}
                    />

                    <div className="text-center">
                        <p style={{ color: '#666', fontSize: '16px' }}>
                            Already have an account?
                            <a
                                href="#"
                                style={{ color: '#8b7355', fontWeight: 'bold', marginLeft: '4px' }}
                                onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                            >
                                Sign in
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
