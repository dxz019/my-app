import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import usePosts from '../hooks/usePosts';           // Custom hook for post operations
import useComments from '../hooks/useComments';      // Custom hook for comment operations
import CreatePost from '../components/CreatePost';   // Create post modal component
import PostCard from '../components/PostCard';      // Individual post component
import { commentsAPI } from '../services/api';       // Comments API service
import SearchBar from '../components/SearchBar';     // User search component
import { Avatar } from 'primereact/avatar';         // PrimeReact avatar

const HomePage = ({ posts: propPosts, token, currentUser, showToast, fetchPosts, bgColor }) => {
    const navigate = useNavigate();
    const { createPost } = usePosts(token, currentUser);
    const { comments, fetchCommentsForPosts } = useComments(token, currentUser);
    const [showComments, setShowComments] = useState({});
    const createPostRef = useRef(null);

    // Fetch comments for posts when they load
    useEffect(() => {
        if (propPosts && propPosts.length > 0) {
            fetchCommentsForPosts(propPosts.map(p => p.id));
        }
    }, [propPosts, fetchCommentsForPosts]);

    // Handle create post
    const handleCreatePost = useCallback(async (content) => {
        if (!token || !currentUser) {
            showToast('Please login first');
            return;
        }

        try {
            await createPost(content);
            fetchPosts();
            showToast('Posted!');
            navigate('/');
        } catch (error) {
            console.error('Error creating post:', error);
            showToast('Failed to post');
        }
    }, [token, currentUser, createPost, fetchPosts, showToast, navigate]);

    // Function to open create post modal
    const openCreatePost = () => {
        if (createPostRef.current) {
            createPostRef.current.open();
        }
    };

    const handleToggleComments = (postId) => {
        if (!showComments[postId]) {
            fetchCommentsForPosts([postId]);
        }
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleAddCommentText = async (postId, commentText) => {
        if (!token) {
            showToast('Please login to comment');
            return;
        }
        if (!commentText || !commentText.trim()) return;

        try {
            await commentsAPI.createComment({
                post_id: postId,
                content: commentText
            });
            await fetchCommentsForPosts([postId], true);  // Force refresh
            showToast('Comment added!');
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast('Failed to add comment');
        }
    };

    const handleDeleteComment = (commentId) => {
        // Refresh comments for all posts to update the list
        if (propPosts && propPosts.length > 0) {
            fetchCommentsForPosts(propPosts.map(p => p.id), true);
        }
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
        <div className="home-page" style={{ width: '100%' }}>
            {/* Search Bar */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #eff3f4' }}>
                <SearchBar
                    token={token}
                    onSelectUser={handleSearchUser}
                />
            </div>

            {/* What's Happening / Create Post Section */}
            {token && currentUser ? (
                <div
                    style={{ padding: '16px', borderBottom: '1px solid #d4c4a8', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={openCreatePost}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div className="flex gap-3">
                        <Avatar
                            label={currentUser.username?.charAt(0).toUpperCase() || 'U'}
                            size="large"
                            shape="circle"
                            style={{ backgroundColor: '#FFB347', cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#999', fontSize: '20px', fontWeight: '300' }}>
                                What is happening?!
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #d4c4a8' }}>
                    <p style={{ color: '#666' }}>Login to post</p>
                </div>
            )}

            {/* Create Post Modal */}
            <CreatePost
                ref={createPostRef}
                currentUser={currentUser}
                onCreatePost={handleCreatePost}
                showToast={showToast}
            />

            {/* Posts Feed */}
            <div className="posts-feed" style={{ padding: '16px' }}>
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
                    />
                ))}
            </div>

            {(!propPosts || propPosts.length === 0) && (
                <div className="text-center p-5">
                    <p style={{ color: '#536471', fontSize: '18px' }}>No posts yet. Be the first to post!</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;
