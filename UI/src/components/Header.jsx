import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';

// Header component - Navigation bar with logo and menu items
const Header = ({ currentUser, onLogout, showToast, token, fetchPosts }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if current path matches
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    // Handle user logout
    const handleLogout = () => {
        onLogout();
        showToast?.('Logged out successfully');
        navigate('/');
    };

    return (
        <div
            className="flex align-items-center justify-content-between p-3"
            style={{
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
            }}
        >
            {/* Left - Title "Thoughts" */}
            <div
                className="flex align-items-center cursor-pointer"
                onClick={() => navigate('/')}
                style={{ color: '#FFB347', marginRight: 'auto' }}
            >
                <span style={{ fontSize: '28px', fontWeight: 'bold' }}>Thoughts</span>
            </div>

            {/* Right - Navigation Items */}
            <div className="flex align-items-center gap-3">
                <Button
                    label="Home"
                    style={{
                        borderRadius: '20px',
                        backgroundColor: isActive('/') || isActive('/home') ? '#FFB347' : 'transparent',
                        border: isActive('/') || isActive('/home') ? 'none' : '1px solid #d4c4a8',
                        color: isActive('/') || isActive('/home') ? '#fff' : '#666',
                        fontWeight: '500',
                        padding: '8px 16px'
                    }}
                    onClick={() => navigate('/')}
                />
                <Button
                    label="Profile"
                    style={{
                        borderRadius: '20px',
                        backgroundColor: isActive('/profile') || isActive('/profile/') ? '#FFB347' : 'transparent',
                        border: isActive('/profile') || isActive('/profile/') ? 'none' : '1px solid #d4c4a8',
                        color: isActive('/profile') || isActive('/profile/') ? '#fff' : '#666',
                        fontWeight: '500',
                        padding: '8px 16px'
                    }}
                    onClick={() => navigate('/profile')}
                />
                <span style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: '500' }}>
                    @{currentUser?.username}
                </span>
                <Button
                    label="Logout"
                    style={{
                        borderRadius: '20px',
                        borderColor: '#d4c4a8',
                        color: '#666',
                        fontSize: '14px',
                        backgroundColor: 'transparent',
                        padding: '8px 16px'
                    }}
                    className="p-button-outlined p-button-sm"
                    onClick={handleLogout}
                />
            </div>
        </div>
    );
};

export default Header;
