import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import usePosts from './hooks/usePosts';
import useToast from './hooks/useToast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import AuthModal from './components/AuthModal';
import AntigravityCursor from './components/AntigravityCursor';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import PlayerPage from './pages/PlayerPage';

function App() {
    const { token, currentUser, login, register, logout, loading: authLoading, refreshCurrentUser } = useAuth();
    const { posts, fetchPosts, loading: postsLoading, error: postsError, updatePostLikes } = usePosts(token, currentUser);
    const { showToast } = useToast();
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved || 'light';
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

    if (authLoading) {
        return (
            <div className="flex align-items-center justify-content-center" style={{ height: '100vh', backgroundColor: 'var(--color-bg-page)' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}></i>
            </div>
        );
    }

    return (
        <div className="flex flex-column min-h-screen surface-ground" style={{ position: 'relative' }}>
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

            <AntigravityCursor />

            <main className={`flex-grow-1 w-full flex flex-column align-items-center ${!isAuthPage ? "py-5 px-3" : ""}`} style={!isAuthPage ? { paddingTop: '110px', position: 'relative', zIndex: 1 } : { position: 'relative', zIndex: 1 }}>
                <div className={`w-full ${!isAuthPage ? "max-w-screen-xl flex flex-column gap-4" : ""}`}>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route
                            path="/home"
                            element={
                                <HomePage
                                    posts={posts}
                                    token={token}
                                    currentUser={currentUser}
                                    showToast={showToast}
                                    fetchPosts={fetchPosts}
                                    requireAuth={requireAuth}
                                    loading={postsLoading}
                                    error={postsError}
                                    updatePostLikes={updatePostLikes}
                                />
                            }
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
                                    updatePostLikes={updatePostLikes}
                                />
                            }
                        />
                        <Route
                            path="/profile"
                            element={token ? (
                                <ProfilePage
                                    token={token}
                                    currentUser={currentUser}
                                    showToast={showToast}
                                    fetchPosts={fetchPosts}
                                    requireAuth={requireAuth}
                                    posts={posts}
                                    refreshCurrentUser={refreshCurrentUser}
                                />
                            ) : (
                                <Navigate to="/login" replace />
                            )}
                        />
                        <Route
                            path="/profile/:userId"
                            element={token ? (
                                <ProfilePage
                                    token={token}
                                    currentUser={currentUser}
                                    showToast={showToast}
                                    fetchPosts={fetchPosts}
                                    requireAuth={requireAuth}
                                    posts={posts}
                                    refreshCurrentUser={refreshCurrentUser}
                                />
                            ) : (
                                <Navigate to="/login" replace />
                            )}
                        />
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
                        <Route
                            path="/dashboard"
                            element={token ? (
                                <DashboardPage token={token} showToast={showToast} />
                            ) : (
                                <Navigate to="/login" replace />
                            )}
                        />
                        <Route
                            path="/editor/:id"
                            element={token ? (
                                <EditorPage token={token} />
                            ) : (
                                <Navigate to="/login" replace />
                            )}
                        />
                        <Route
                            path="/watch/:id"
                            element={<PlayerPage token={token} />}
                        />
                    </Routes>
                </div>
            </main>

            <AuthModal
                visible={authModalVisible}
                onHide={() => setAuthModalVisible(false)}
                onLogin={login}
                onRegister={register}
                showToast={showToast}
            />
        </div>
    );
}

export default App;
