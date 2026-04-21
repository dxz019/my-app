import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import usePosts from './hooks/usePosts';
import useToast from './hooks/useToast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import AuthModal from './components/AuthModal';

function App() {
    const { token, currentUser, login, register, logout, loading, refreshCurrentUser } = useAuth();
    const { posts, fetchPosts } = usePosts(token, currentUser);
    const { showToast } = useToast();
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved || 'dark';
    });
    const location = useLocation();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const requireAuth = useCallback((action) => {
        if (!token) {
            setAuthModalVisible(true);
            return false;
        }
        if (typeof action === 'function') action();
        return true;
    }, [token]);

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    if (loading) {
        return (
            <div className="flex align-items-center justify-content-center" style={{ height: '100vh', backgroundColor: 'var(--color-bg-page)' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}></i>
            </div>
        );
    }

    return (
        <div className="flex flex-column min-h-screen surface-ground">
            {/* Hide header on Login/Register pages */}
            {!isAuthPage && (
                <Header
                    currentUser={currentUser}
                    onLogout={logout}
                    showToast={showToast}
                    token={token}
                    fetchPosts={fetchPosts}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                />
            )}

            {/* Main content area using PrimeFlex for layout */}
            <main className={`flex-grow-1 w-full flex flex-column align-items-center ${!isAuthPage ? "py-4 px-3" : ""}`}>
                <div className={`w-full ${!isAuthPage ? "max-w-screen-xl flex flex-column gap-4" : "h-full"}`}>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <HomePage
                                    posts={posts}
                                    token={token}
                                    currentUser={currentUser}
                                    showToast={showToast}
                                    fetchPosts={fetchPosts}
                                    requireAuth={requireAuth}
                                />
                            }
                        />
                        <Route
                            path="/home"
                            element={<Navigate to="/" replace />}
                        />
                        <Route
                            path="/explore"
                            element={
                                <ExplorePage
                                    posts={posts}
                                    token={token}
                                    currentUser={currentUser}
                                    showToast={showToast}
                                    fetchPosts={fetchPosts}
                                    requireAuth={requireAuth}
                                />
                            }
                        />

                        {/* Authentication Routes */}
                        <Route
                            path="/login"
                            element={!token ? (
                                <LoginPage onLogin={login} showToast={showToast} />
                            ) : (
                                <Navigate to="/" replace />
                            )}
                        />
                        <Route
                            path="/register"
                            element={!token ? (
                                <RegisterPage onRegister={register} showToast={showToast} />
                            ) : (
                                <Navigate to="/" replace />
                            )}
                        />

                        {/* Profile Routes */}
                        <Route
                            path="/profile"
                            element={
                                <ProfilePage
                                    posts={posts}
                                    token={token}
                                    currentUser={currentUser}
                                    showToast={showToast}
                                    fetchPosts={fetchPosts}
                                    requireAuth={requireAuth}
                                    refreshCurrentUser={refreshCurrentUser}
                                />
                            }
                        />
                        <Route
                            path="/profile/:userId"
                            element={
                                <ProfilePage
                                    posts={posts}
                                    token={token}
                                    currentUser={currentUser}
                                    showToast={showToast}
                                    fetchPosts={fetchPosts}
                                    requireAuth={requireAuth}
                                    refreshCurrentUser={refreshCurrentUser}
                                />
                            }
                        />

                        <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                        />
                    </Routes>
                </div>
            </main>

            <AuthModal 
                visible={authModalVisible} 
                onHide={() => setAuthModalVisible(false)} 
            />
        </div>
    );

}

export default App;
