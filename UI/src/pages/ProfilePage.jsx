import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import useComments from '../hooks/useComments';
import useAuth from '../hooks/useAuth';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { usersAPI, commentsAPI } from '../services/api';

const ProfilePage = ({
    posts: propPosts,
    token,
    currentUser,
    showToast,
    fetchPosts
}) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { createPost } = usePosts(token, currentUser);
    const { comments, fetchCommentsForPosts } = useComments(token, currentUser);
    const [showComments, setShowComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [searchedUser, setSearchedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const createPostRef = useRef(null);
    const [createPostVisible, setCreatePostVisible] = useState(false);

    // Fetch searched user if userId is present
    useEffect(() => {
        const fetchSearchedUser = async () => {
            if (userId && token) {
                setLoading(true);
                try {
                    const user = await usersAPI.getUserById(parseInt(userId));
                    setSearchedUser(user);
                } catch (error) {
                    console.error('Error fetching user:', error);
                    showToast('User not found');
                    navigate('/profile');
                } finally {
                    setLoading(false);
                }
            } else {
                setSearchedUser(null);
            }
        };

        fetchSearchedUser();
    }, [userId, token, navigate, showToast]);

    // Determine which user to show
    const displayUser = searchedUser || currentUser;

    // Filter posts for this user
    const userPosts = useMemo(() => {
        if (!displayUser || !propPosts) return [];
        return propPosts.filter(post => post.author_id === displayUser.id);
    }, [propPosts, displayUser]);

    // Fetch comments for user's posts
    useEffect(() => {
        if (userPosts.length > 0) {
            fetchCommentsForPosts(userPosts.map(p => p.id));
        }
    }, [userPosts, fetchCommentsForPosts]);

    // Handle create post
    const handleCreatePost = async (content) => {
        if (!token || !currentUser) {
            showToast('Please login first');
            return;
        }

        try {
            await createPost(content);
            fetchPosts();
            showToast('Posted!');
        } catch (error) {
            console.error('Error creating post:', error);
            showToast('Failed to post');
        }
    };

    const handleToggleComments = (postId) => {
        if (!showComments[postId]) {
            fetchCommentsForPosts([postId]);
        }
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleAddComment = async (postId) => {
        if (!token) {
            showToast('Please login to comment');
            return;
        }
        const commentText = newComments[postId] || '';
        if (!commentText.trim()) {
            showToast('Write a comment');
            return;
        }

        try {
            await commentsAPI.createComment({
                post_id: postId,
                content: commentText
            });
            await fetchCommentsForPosts([postId], true);  // Force refresh
            setNewComments(prev => ({ ...prev, [postId]: '' }));
            showToast('Comment added!');
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast('Failed to add comment');
        }
    };

    const handleNewCommentChange = (postId, value) => {
        setNewComments(prev => ({ ...prev, [postId]: value }));
    };

    const handleDeletePost = (postId) => {
        fetchPosts();
        showToast('Post deleted');
    };

    const handleDeleteComment = (commentId) => {
        if (userPosts.length > 0) {
            fetchCommentsForPosts(userPosts.map(p => p.id), true);
        }
        showToast('Comment deleted');
    };

    const handleClearSearch = () => {
        navigate('/profile');
    };

    const openCreatePost = () => {
        if (createPostRef.current) {
            createPostRef.current.open();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center p-5">
                <i className="pi pi-spin pi-spinner text-4xl text-500"></i>
            </div>
        );
    }

    if (!displayUser) {
        return (
            <div className="surface-card border-1 border-300 p-5 text-center border-round">
                <p className="text-500">Please login to view your profile</p>
            </div>
        );
    }

    const isOwnProfile = !searchedUser || searchedUser.id === currentUser?.id;

    return (
        <div className="profile-page" style={{ width: '100%' }}>
            {/* Profile Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #d4c4a8' }}>
                <div className="flex align-items-center gap-4">
                    <Avatar
                        label={displayUser.username?.charAt(0).toUpperCase() || 'U'}
                        size='xlarge'
                        shape="circle"
                        style={{ backgroundColor: '#FFB347' }}
                    />
                    <div className="flex flex-column">
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a' }}>{displayUser.full_name || displayUser.username}</h2>
                        <span style={{ color: '#666' }}>@{displayUser.username}</span>
                    </div>
                </div>

                {/* Clear search button if viewing another user's profile */}
                {searchedUser && (
                    <Button
                        icon="pi pi-times"
                        className="p-button-rounded p-button-text"
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                        style={{ color: '#666' }}
                    />
                )}
            </div>

            {/* Create Post - only for current user */}
            {token && currentUser && isOwnProfile && (
                <>
                    <div
                        style={{ padding: '16px', borderBottom: '1px solid #d4c4a8', cursor: 'pointer' }}
                        onClick={() => createPostRef.current?.open()}
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
                                <div style={{ color: '#999', fontSize: '20px', fontWeight: '300', marginBottom: '12px' }}>
                                    What is happening?!
                                </div>
                            </div>
                        </div>
                    </div>
                    <CreatePost
                        ref={createPostRef}
                        currentUser={currentUser}
                        onCreatePost={handleCreatePost}
                        showToast={showToast}
                    />
                </>
            )}

            {/* Posts from this user */}
            <div style={{ padding: '16px', borderBottom: '1px solid #d4c4a8' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>
                    {isOwnProfile ? 'Your Posts' : `Posts from @${displayUser.username}`}
                </h3>
            </div>

            <div className="flex flex-column gap-2" style={{ padding: '8px 0' }}>
                {userPosts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        token={token}
                        comments={comments}
                        showComments={showComments}
                        newComments={newComments}
                        onToggleComments={handleToggleComments}
                        onAddComment={handleAddComment}
                        onNewCommentChange={handleNewCommentChange}
                        onDeletePost={handleDeletePost}
                        onDeleteComment={handleDeleteComment}
                    />
                ))}
            </div>

            {userPosts.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                    <p style={{ color: '#666' }}>No posts yet</p>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
