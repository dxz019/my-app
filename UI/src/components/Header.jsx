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

    const headerStyle = {
        background: 'var(--color-bg-header)',
        borderBottom: '2px solid var(--color-border)',
        borderRadius: '0',
        height: '70px',
        minHeight: '70px',
        padding: '1rem 2rem',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: 'var(--elevation-2)'
    };

    const headerButtonStyle = {
        color: 'var(--color-text-main)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '15px',
        padding: '0.6rem 1.4rem',
        textDecoration: 'none',
        background: 'var(--color-bg-card)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease'
    };

    const headerButtonHoverStyle = {
        background: 'var(--color-bg-hover)',
        borderColor: 'var(--color-primary)',
        color: 'var(--color-primary)',
        boxShadow: 'var(--elevation-1)'
    };

    const logoStyle = {
        color: 'var(--color-primary)',
        letterSpacing: '2px',
        fontFamily: 'Fredoka, sans-serif',
        display: 'inline-block'
    };

    const primaryButtonStyle = {
        background: 'var(--color-primary)',
        color: '#ffffff',
        border: '1px solid var(--color-primary)',
        borderRadius: '8px',
        fontWeight: 700,
        fontSize: '15px',
        padding: '0.6rem 1.4rem',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease'
    };

    const leftContent = (
        <div className="flex align-items-center gap-3">
            <span 
                className="brand-logo text-3xl font-bold cursor-pointer" 
                onClick={() => navigate('/home')}
                style={logoStyle}
                onMouseEnter={(e) => e.currentTarget.style.animation = 'jiggle 0.5s ease'}
                onMouseLeave={(e) => e.currentTarget.style.animation = 'none'}
            >
                THOUGHTS
            </span>
            <nav className="hidden xl:flex align-items-center gap-2 ml-4">
                <Link to="/home" 
                      className="no-underline" 
                      style={headerButtonStyle}
                      onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--color-bg-card)';
                      }}
                >
                    <i className="pi pi-home"></i>
                    <span className="ml-2">Home</span>
                </Link>
                <Link to="/explore" 
                      className="no-underline" 
                      style={headerButtonStyle}
                      onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--color-bg-card)';
                      }}
                >
                    <i className="pi pi-compass"></i>
                    <span className="ml-2">Explore</span>
                </Link>
            </nav>
        </div>
    );

    const centerContent = (
        <div className="flex justify-content-center w-full px-3" style={{ maxWidth: '700px', margin: '0 auto' }}>
            {!isAuthPage && (
                <div className="w-full">
                    <SearchBar 
                        token={token} 
                        onSelectUser={handleSearchUser} 
                    />
                </div>
            )}
        </div>
    );

    const rightContent = (
        <div className="flex align-items-center gap-2">
            <Button 
                icon={theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'} 
                className="p-button-rounded p-button-text p-button-plain"
                style={{ 
                    color: 'var(--color-text-main)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    width: '42px',
                    height: '40px',
                    justifyContent: 'center',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                }}
                onClick={onToggleTheme}
            />
            {currentUser ? (
                <div className="flex align-items-center gap-2">
                    <Avatar
                        image={getPublicUrl(currentUser.avatar_url)}
                        label={!currentUser.avatar_url ? (currentUser.username?.charAt(0).toUpperCase() || 'U') : null}
                        size="large"
                        shape="circle"
                        className="cursor-pointer border-circle"
                        style={{ 
                            backgroundColor: 'var(--color-primary)', 
                            color: '#fff',
                            width: '40px',
                            height: '40px',
                            border: '2px solid var(--color-border)',
                            fontWeight: 700
                        }}
                        onClick={(e) => menuRef.current.toggle(e)}
                    />
                    <Menu model={menuItems} popup ref={menuRef} />
                </div>
            ) : (
                <div className="flex gap-2">
                    <Link to="/login" 
                       className="no-underline" 
                       style={headerButtonStyle}
                       onMouseEnter={(e) => { 
                           e.currentTarget.style.background = 'var(--color-bg-hover)';
                           e.currentTarget.style.borderColor = 'var(--color-primary)';
                       }}
                       onMouseLeave={(e) => { 
                           e.currentTarget.style.background = 'var(--color-bg-card)';
                           e.currentTarget.style.borderColor = 'var(--color-border)';
                       }}
                    >
                        <i className="pi pi-sign-in"></i>
                        <span className="ml-2">Login</span>
                    </Link>
                    <Link to="/register" 
                       className="no-underline"
                       style={primaryButtonStyle}
                       onMouseEnter={(e) => { 
                           e.currentTarget.style.background = 'var(--color-primary-hover)';
                           e.currentTarget.style.transform = 'translateY(-1px)';
                           e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 255, 0.3)';
                       }}
                       onMouseLeave={(e) => { 
                           e.currentTarget.style.background = 'var(--color-primary)';
                           e.currentTarget.style.transform = 'translateY(0)';
                           e.currentTarget.style.boxShadow = 'none';
                       }}
                    >
                        <i className="pi pi-plus"></i>
                        <span className="ml-2">Join</span>
                    </Link>
                </div>
            )}
        </div>
    );

    return (
        <Toolbar 
            left={leftContent} 
            center={centerContent} 
            right={rightContent} 
            className="border-none shadow-3"
            style={headerStyle}
        />
    );
};

export default Header;
