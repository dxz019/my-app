import React, { useState, useRef } from 'react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import TrendingSidebar from '../components/TrendingSidebar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { getPublicUrl } from '../services/api';
import usePosts from '../hooks/usePosts';

const HomePage = ({ 
    posts: propPosts, 
    loading, 
    error, 
    token, 
    currentUser, 
    showToast, 
    fetchPosts, 
    requireAuth 
}) => {
    const [comments, setComments] = useState({});
    const [showComments, setShowComments] = useState({});
    const createPostRef = useRef(null);
    const { createPost } = usePosts(token, currentUser);

    // Debug what we're rendering
    console.log('HomePage render - propPosts:', propPosts, 'loading:', loading, 'error:', error);

    const onToggleComments = (postId) => {
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleCreatePost = async (content, media) => {
        try {
            await createPost(content, media);
            showToast('Thought shared successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            showToast('Failed to post. Please try again.');
        }
    };

    const openCreatePost = () => {
        if (!requireAuth()) return;
        createPostRef.current?.open();
    };

    if (loading && (!propPosts || propPosts.length === 0)) {
        return (
            <div className="flex flex-column align-items-center justify-content-center py-8 w-full">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
                <p className="mt-3 text-color-secondary font-medium">Fetching latest thoughts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-content-center p-4 w-full">
                <Message severity="error" text={`Failed to load thoughts: ${error}`} className="w-full max-w-2xl shadow-2" />
            </div>
        );
    }

    return (
        <div className="w-full grid grid-nogutter max-w-screen-xl mx-auto px-2">
             <div className="col-12 lg:col-8 pr-0 lg:pr-4">
                <div className="pt-8 pb-6 w-full">
                    {/* Inline Create Post Trigger */}
                    {token && currentUser && (
                        <div 
                            className="p-4 mb-5 shadow-1 cursor-pointer hover:shadow-2 transition-all transition-duration-300"
                            style={{ 
                                backgroundColor: 'var(--color-bg-elevated)',
                                border: '2px solid var(--color-border-bright)',
                                borderRadius: 'var(--radius-lg)'
                            }}
                            onClick={openCreatePost}
                        >
                            <div className="flex align-items-center gap-3">
                                <Avatar 
                                    image={getPublicUrl(currentUser?.avatar_url)} 
                                    label={!currentUser?.avatar_url ? currentUser?.username?.charAt(0).toUpperCase() : null}
                                    size="large" 
                                    shape="circle" 
                                    style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                                />
                                <div className="flex-1 surface-100 p-3 border-round-3xl text-600 font-medium surface-hover transition-colors transition-duration-200" style={{ backgroundColor: 'var(--color-input-bg)', border: '1px solid var(--color-input-border)' }}>
                                    What's on your mind, {currentUser?.full_name?.split(' ')[0] || currentUser?.username}? ✨
                                </div>
                                <Button 
                                    icon="pi pi-plus" 
                                    className="p-button-rounded p-button-primary shadow-2"
                                    style={{ boxShadow: '0 4px 12px rgba(255, 102, 0, 0.3)' }}
                                    onClick={(e) => { e.stopPropagation(); openCreatePost(); }}
                                />
                            </div>
                        </div>
                    )}

                    <CreatePost 
                        ref={createPostRef}
                        currentUser={currentUser} 
                        onCreatePost={handleCreatePost} 
                        showToast={showToast} 
                    />

                     {!loading && (!propPosts || propPosts.length === 0) ? (
                        <div className="surface-card p-8 border-round-2xl text-center border-1 surface-border shadow-1 mt-4">
                            <i className="pi pi-comments text-6xl text-primary-light mb-4 block"></i>
                            <h2 className="text-2xl font-bold mb-2">No thoughts shared yet.</h2>
                            <p className="text-lg text-500 mb-5">Be the first to spark a conversation!</p>
                            <Button label="Spark a Conversation" icon="pi pi-plus" onClick={openCreatePost} className="p-button-rounded px-4" />
                        </div>
                    ) : (
                        <div className="flex flex-column gap-4 mt-6">
                            {propPosts && propPosts.map((post) => (
                                <div key={post.id} className="col-12">
                                    <PostCard
                                        post={post}
                                        currentUser={currentUser}
                                        token={token}
                                        comments={comments}
                                        showComments={showComments[post.id]}
                                        onToggleComments={onToggleComments}
                                        onDeletePost={() => fetchPosts()}
                                        onUpdatePostLikes={() => {}} 
                                        requireAuth={requireAuth}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden lg:block lg:col-4">
                <TrendingSidebar />
            </div>
        </div>
    );
};

export default HomePage;