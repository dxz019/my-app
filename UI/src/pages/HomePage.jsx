import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import usePosts from '../hooks/usePosts';           
import useComments from '../hooks/useComments';      
import CreatePost from '../components/CreatePost';   
import PostCard from '../components/PostCard';      
import SearchBar from '../components/SearchBar';     
import TrendingSidebar from '../components/TrendingSidebar';
import { Avatar } from 'primereact/avatar';         
import { Button } from 'primereact/button';         
import { getErrorMessage, getPublicUrl } from '../services/api';

const HomePage = ({ posts: propPosts, token, currentUser, showToast, fetchPosts, requireAuth }) => {
    const navigate = useNavigate();
    const { createPost } = usePosts(token, currentUser);
    const { comments, fetchCommentsForPosts, addComment } = useComments(token, currentUser);
    const [showComments, setShowComments] = useState({});
    const createPostRef = useRef(null);

    // Fetch comments for posts when they load removed for performance optimization.
    // The UI now uses backend-provided counts instead of mass-fetching comments!

    // Handle create post
    const handleCreatePost = useCallback(async (content, imageUrl) => {
        if (!token || !currentUser) return;

        try {
            await createPost(content, imageUrl);
            fetchPosts();
            showToast('Posted!');
        } catch (error) {
            console.error('Error creating post:', error);
            showToast('Failed to post');
        }
    }, [token, currentUser, createPost, fetchPosts, showToast]);

    // Function to open create post modal
    const openCreatePost = () => {
        requireAuth(() => {
            if (createPostRef.current) {
                createPostRef.current.open();
            }
        });
    };

    const handleToggleComments = (postId) => {
        if (!showComments[postId]) {
            fetchCommentsForPosts([postId]);
        }
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleAddCommentText = useCallback(async (postId, commentText) => {
        if (!requireAuth()) return;
        if (!commentText || !commentText.trim()) return;

        try {
            await addComment(postId, commentText);
            await fetchPosts(); // Force feed to re-fetch so new comment counts populate on UI
            showToast('Comment added!');
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast(getErrorMessage(error, 'Failed to add comment'));
            throw error;
        }
    }, [addComment, fetchPosts, requireAuth, showToast]);

    const handleDeleteComment = async (postId, commentId) => {
        await fetchCommentsForPosts([postId], true);
        await fetchPosts();
        showToast('Comment deleted');
    };

    const handleSearchUser = (user) => {
        navigate(`/profile/${user.id}`);
    };

    const handleDeletePost = useCallback((postId) => {
        fetchPosts();
        showToast('Post deleted');
    }, [fetchPosts, showToast]);

    return (
        <div className="w-full pb-6" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
            <div className="grid">
                {/* Main Content Column */}
                <div className="col-12 lg:col-8">
                    {/* What's Happening Section */}
                    <div
                        className="surface-card p-4 mb-5 shadow-3 border-round-2xl border-1 surface-border cursor-pointer hover:shadow-6 transition-all transition-duration-300"
                        onClick={openCreatePost}
                    >
                        <div className="flex gap-4 align-items-center">
                            <Avatar
                                image={getPublicUrl(currentUser?.avatar_url)}
                                label={!currentUser?.avatar_url ? (currentUser?.username?.charAt(0).toUpperCase() || '?') : null}
                                size="large"
                                shape="circle"
                                className="shadow-2"
                                style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    requireAuth(() => navigate('/profile')); 
                                }}
                            />
                            <div className="flex-1">
                                <div className="text-xl font-light text-color-secondary">
                                    What is happening?!
                                </div>
                            </div>

                            <Button 
                                label="Post" 
                                className="p-button-rounded p-button-primary px-4 py-2 font-bold shadow-3"
                                onClick={(e) => { e.stopPropagation(); openCreatePost(); }}
                            />
                        </div>
                    </div>


                    {/* Posts Feed - Spacious with clear separation */}
                    <div className="flex flex-column gap-4">
                        {propPosts && propPosts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                currentUser={currentUser}
                                token={token}
                                comments={comments}
                                showComments={showComments}
                                onToggleComments={handleToggleComments}
                                onAddComment={handleAddCommentText}
                                onDeletePost={handleDeletePost}
                                onDeleteComment={handleDeleteComment}
                                requireAuth={requireAuth}
                            />
                        ))}
                    </div>

                    {(!propPosts || propPosts.length === 0) && (
                        <div className="text-center p-8 mt-4 surface-card border-round-2xl border-1 border-white-alpha-10 shadow-2">
                            <i className="pi pi-comments text-primary text-6xl mb-4"></i>
                            <p className="text-2xl font-medium text-color">No thoughts shared yet.</p>
                            <p className="text-600 mt-2">Be the first to spark a conversation!</p>
                        </div>
                    )}
                </div>

                {/* Trending Sidebar - Only visible on desktop */}
                <div className="hidden lg:block lg:col-4 pl-4">
                    <TrendingSidebar />
                </div>
            </div>

            <CreatePost
                ref={createPostRef}
                currentUser={currentUser}
                onCreatePost={handleCreatePost}
                showToast={showToast}
            />
        </div>
    );

};

export default HomePage;
