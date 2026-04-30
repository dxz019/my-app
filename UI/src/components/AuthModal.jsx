import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ visible, onHide }) => {
    const navigate = useNavigate();

    const handleAction = (path) => {
        onHide();
        navigate(path);
    };

    const footer = (
        <div className="flex justify-content-center gap-3 pt-3">
            <Button 
                label="Login" 
                className="p-button-outlined" 
                style={{ 
                    borderRadius: '24px', 
                    borderColor: 'var(--color-primary)', 
                    color: 'var(--color-primary)', 
                    flex: 1,
                    backgroundColor: 'transparent'
                }}
                onClick={() => handleAction('/login')} 
            />
            <Button 
                label="Sign up" 
                style={{ 
                    borderRadius: '24px', 
                    backgroundColor: 'var(--color-primary)', 
                    border: 'none', 
                    flex: 1,
                    color: '#fff'
                }}
                onClick={() => handleAction('/register')} 
            />
        </div>
    );

    return (
        <Dialog 
            visible={visible} 
            onHide={onHide}
            header={null}
            footer={footer}
            style={{ width: '400px' }}
            closable
            className="auth-prompt-modal"
            contentStyle={{ 
                paddingTop: '2.5rem', 
                textAlign: 'center', 
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
            }}
        >
            <div className="flex flex-column align-items-center">
                <div 
                    className="flex align-items-center justify-content-center"
                    style={{ 
                        width: '72px', 
                        height: '72px', 
                        borderRadius: '20px', 
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        marginBottom: '1.5rem'
                    }}
                >
                    <i className="pi pi-lock" style={{ fontSize: '2rem' }}></i>
                </div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Join Thoughts</h2>
                <p className="text-500 line-height-3 px-3">
                    Experience more of Thoughts. Log in or create an account to start sharing and interacting.
                </p>
            </div>
        </Dialog>
    );
};

export default AuthModal;