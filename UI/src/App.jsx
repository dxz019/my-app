import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import usePosts from './hooks/usePosts';
import useToast from './hooks/useToast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';

function App() {
    const { token, currentUser, login, register, logout, isAuthenticated, loading } = useAuth();
    const { posts, fetchPosts } = usePosts(token, currentUser);
    const { showToast } = useToast();

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Show loading
    if (loading) {
        return (
            <div
                className="flex align-items-center justify-content-center"
                style={{
                    height: '100vh',
                    backgroundColor: '#f5f0e6'
                }}
            >
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: '#8b7355' }}></i>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!token) {
        return (
            <div style={{ backgroundColor: '#f5f0e6', minHeight: '100vh' }}>
                <Routes>
                    <Route
                        path="/register"
                        element={<RegisterPage onRegister={register} showToast={showToast} />}
                    />
                    <Route
                        path="*"
                        element={<LoginPage onLogin={login} showToast={showToast} />}
                    />
                </Routes>
            </div>
        );
    }

    // Authenticated - showing main app with centered layout like Twitter
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            {/* Full width sticky header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e1e8ed'
            }}>
                <Header
                    currentUser={currentUser}
                    onLogout={logout}
                    showToast={showToast}
                    token={token}
                    fetchPosts={fetchPosts}
                />
            </div>

            {/* Centered main content */}
            <main
                style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    minHeight: 'calc(100vh - 64px)',
                    backgroundColor: '#ffffff'
                }}
            >
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
                                bgColor="#f5f0e6"
                            />
                        }
                    />
                    <Route
                        path="/home"
                        element={
                            <HomePage
                                posts={posts}
                                token={token}
                                currentUser={currentUser}
                                showToast={showToast}
                                fetchPosts={fetchPosts}
                                bgColor="#f5f0e6"
                            />
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProfilePage
                                posts={posts}
                                token={token}
                                currentUser={currentUser}
                                searchedUser={null}
                                showToast={showToast}
                                fetchPosts={fetchPosts}
                                bgColor="#f5f0e6"
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
                                bgColor="#f5f0e6"
                            />
                        }
                    />
                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;
