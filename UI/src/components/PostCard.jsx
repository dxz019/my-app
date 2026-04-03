import React, { useState } from 'react';
import { Button } from 'primereact/button';      // PrimeReact button component
import { Avatar } from 'primereact/avatar';       // PrimeReact avatar component
import { Dialog } from 'primereact/dialog';       // PrimeReact dialog component
import { postsAPI } from '../services/api';        // Posts API service
import CommentSection from './CommentSection';     // Comment section component

// PostCard component - displays individual post with comments
const PostCard = ({
    post,
    currentUser,
    token,
    comments,
    showComments,
    newComments,
    onToggleComments,
    onAddComment,
    onDeleteComment,
    onNavigateToProfile,
    onDeletePost
}) => {
    // Format date to relative time (e.g., "2h", "3d")
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '· just now';
        if (minutes < 60) return `· ${minutes}m`;
        if (hours < 24) return `· ${hours}h`;
        if (days < 7) return `· ${days}d`;
        return `· ${date.toLocaleDateString()}`;
    };

    // Get comments for this specific post
    const postComments = comments[post.id] || [];
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Navigate to author profile on click
    const handleAuthorClick = (e) => {
        e.stopPropagation();
        if (onNavigateToProfile) {
            onNavigateToProfile(post.author);
        }
    };

    // Delete post handler with confirmation dialog
    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!token || !currentUser) return;
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await postsAPI.deletePost(post.id);
            if (onDeletePost) {
                onDeletePost(post.id);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        } finally {
            setShowDeleteDialog(false);
        }
    };

    // Check if current user is the post author
    const isAuthor = currentUser && post.author && currentUser.id === post.author.id;

    return (
        // Post container - styled as individual card for each post
        <div
            className="p-4 surface-card"
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e8e4dc'
            }}
        >
            <div className="flex gap-3">
                {/* Author Avatar - PrimeReact */}
                <div className="flex-shrink-0">
                    <Avatar
                        label={post.author?.username?.charAt(0).toUpperCase() || 'U'}
                        size="large"
                        shape="circle"
                        style={{ backgroundColor: '#1d9bf0' }}
                    />
                </div>

                {/* Post Content */}
                <div className="flex-1">
                    {/* Post Header - Author info + timestamp */}
                    <div className="flex align-items-center flex-wrap gap-1 mb-2">
                        <span className="font-bold text-gray-800 text-base cursor-pointer hover:underline" onClick={handleAuthorClick}>
                            {post.author?.full_name || post.author?.username || 'User'}
                        </span>
                        <span className="text-gray-500 text-base">@{post.author?.username || 'user'}</span>
                        <span className="text-gray-500 text-base">{formatDate(post.created_at)}</span>

                        {/* Delete button - only for post author */}
                        {isAuthor && (
                            <Button
                                icon="pi pi-trash"
                                className="p-button-text p-button-rounded p-button-sm p-button-danger ml-auto"
                                onClick={handleDelete}
                                aria-label="Delete post"
                                title="Delete post"
                            />
                        )}
                    </div>

                    {/* Post Text Content */}
                    <div className="mb-3 text-gray-800 text-base" style={{ lineHeight: '1.5' }}>
                        <p className="m-0" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
                    </div>

                    {/* Comment Action Button */}
                    <div className="flex align-items-center" style={{ maxWidth: '100px' }}>
                        <Button
                            icon="pi pi-comment"
                            className="p-button-text p-button-rounded p-button-sm"
                            style={{ color: '#536471' }}
                            onClick={(e) => { e.stopPropagation(); onToggleComments(post.id) }}
                            aria-label="Comments"
                        />
                        <span className="text-gray-500 text-sm">{postComments.length}</span>
                    </div>

                    {/* Comments Section - nested component */}
                    <CommentSection
                        postId={post.id}
                        comments={postComments}
                        currentUser={currentUser}
                        token={token}
                        onAddComment={(postId, commentText) => {
                            if (onAddComment) {
                                onAddComment(postId, commentText);
                            }
                        }}
                        onDeleteComment={onDeleteComment}
                    />

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        visible={showDeleteDialog}
                        onHide={() => setShowDeleteDialog(false)}
                        header="Delete Post"
                        modal
                        style={{ width: '350px' }}
                        footer={
                            <div className="flex gap-2 justify-content-end">
                                <Button
                                    label="Cancel"
                                    icon="pi pi-times"
                                    onClick={() => setShowDeleteDialog(false)}
                                    className="p-button-text"
                                />
                                <Button
                                    label="Delete"
                                    icon="pi pi-trash"
                                    onClick={confirmDelete}
                                    className="p-button-danger"
                                    autoFocus
                                />
                            </div>
                        }
                    >
                        <p>Are you sure you want to delete this post?</p>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
