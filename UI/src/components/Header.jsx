import React, { useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { getPublicUrl } from '../services/api';
import SearchBar from './SearchBar';

const Header = ({ currentUser, onLogout, showToast, token, fetchPosts, theme, onToggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef(null);

    const handleSearchUser = (user) => {
        navigate(`/profile/${user.id}`);
    };

    const menuItems = [
        { 
            label: 'Profile', 
            icon: 'pi pi-user', 
            command: () => navigate('/profile') 
        },  
        { 
            label: 'Logout', 
            icon: 'pi pi-power-off', 
            command: () => {
                onLogout();
                navigate('/');
            } 
        }
    ];

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    const headerButtonStyle = {
        color: '#00008b',
        border: '1px solid #000000',
        borderRadius: '8px',
        fontWeight: 'bold',
        padding: '0.5rem 1rem',
        textDecoration: 'none',
        backgroundColor: '#ffffff',
        display: 'flex',
        'align-items': 'center',
        gap: '0.5rem'
    };

    const leftContent = (
        <div className="flex align-items-center gap-3">
            <span 
                className="brand-logo text-3xl font-bold cursor-pointer" 
                onClick={() => navigate('/')}
            >
                THOUGHTS
            </span>
            <nav className="hidden xl:flex align-items-center gap-3 ml-4">
                <Link to="/" className="p-button p-button-text" style={headerButtonStyle}>
                    <i className="pi pi-home"></i>
                    <span>Home</span>
                </Link>
                <Link to="/explore" className="p-button p-button-text" style={headerButtonStyle}>
                    <i className="pi pi-compass"></i>
                    <span>Explore</span>
                </Link>
            </nav>
        </div>
    );

    const centerContent = (
        <div className="flex justify-content-start w-full pl-2">
            {!isAuthPage && (
                <div className="w-full" style={{ maxWidth: '600px' }}>
                    <SearchBar 
                        token={token} 
                        onSelectUser={handleSearchUser} 
                    />
                </div>
            )}
        </div>
    );

    const rightContent = (
        <div className="flex align-items-center gap-3">
            <Button 
                icon={theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'} 
                className="p-button-rounded p-button-text" 
                style={{ ...headerButtonStyle, padding: '0.5rem', width: '40px', height: '40px', justifyContent: 'center' }}
                onClick={onToggleTheme}
            />
            {currentUser ? (
                <div className="flex align-items-center gap-3">
                    <Avatar
                        image={getPublicUrl(currentUser.avatar_url)}
                        label={!currentUser.avatar_url ? (currentUser.username?.charAt(0).toUpperCase() || 'U') : null}
                        size="large"
                        shape="circle"
                        className="cursor-pointer border-circle shadow-2"
                        style={{ 
                            backgroundColor: 'var(--color-primary)', 
                            color: '#fff',
                            width: '42px',
                            height: '42px',
                            border: '1px solid #000000'
                        }}
                        onClick={(e) => menuRef.current.toggle(e)}
                    />
                    <Menu model={menuItems} popup ref={menuRef} />
                </div>
            ) : (
                <div className="flex gap-2">
                    <Button label="Login" className="p-button-text" style={headerButtonStyle} onClick={() => navigate('/login')} />
                    <Button label="Join" style={{ ...headerButtonStyle, backgroundColor: '#0066FF', color: '#ffffff' }} onClick={() => navigate('/register')} />
                </div>
            )}
        </div>
    );

    return (
        <Toolbar 
            left={leftContent} 
            center={centerContent} 
            right={rightContent} 
            className="sticky top-0 z-5 px-4 py-2 border-none shadow-3"
            style={{ 
                background: '#ffffff',
                borderBottom: '2px solid #000000',
                borderRadius: '0',
                height: '80px'
            }}
        />
    );
};

export default Header;

