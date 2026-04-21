import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { postsAPI, getPublicUrl } from '../services/api';
import CommentSection from './CommentSection';

const PostCard = ({
    post,
    currentUser,
    token,
    comments,
    showComments,
    onToggleComments,
    onAddComment,
    onDeleteComment,
    onDeletePost,
    onUpdatePostLikes,
    requireAuth
}) => {
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

    const postComments = comments[post.id] || [];
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isLiked, setIsLiked] = useState(post.is_liked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [likeLoading, setLikeLoading] = useState(false);
    const [reaction, setReaction] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleAuthorClick = (e) => {
        e.stopPropagation();
        window.location.href = `/profile/${post.author?.id}`;
    };

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

    const handleLike = async () => {
        if (!requireAuth()) return;
        if (likeLoading) return;
        
        setLikeLoading(true);
        try {
            if (isLiked) {
                const result = await postsAPI.unlikePost(post.id);
                setLikesCount(result.likes_count);
                setIsLiked(false);
            } else {
                const result = await postsAPI.likePost(post.id);
                setLikesCount(result.likes_count);
                setIsLiked(true);
            }
            if (onUpdatePostLikes) {
                onUpdatePostLikes(post.id, !isLiked);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setLikeLoading(false);
        }
    };

    const isAuthor = currentUser && post.author && currentUser.id === post.author.id;

    const header = (
        <div className="flex gap-4 p-4 pb-0">
            <div className="flex-shrink-0">
                <Avatar
                    image={getPublicUrl(post.author?.avatar_url)}
                    label={!post.author?.avatar_url ? (post.author?.username?.charAt(0).toUpperCase() || 'U') : null}
                    size="large"
                    shape="circle"
                    className="cursor-pointer border-2 border-white-alpha-10"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }}
                    onClick={handleAuthorClick}
                />
            </div>
            <div className="flex-1">
                <div className="flex align-items-center flex-wrap gap-2">
                    <span className="font-bold text-lg cursor-pointer text-color" onClick={handleAuthorClick}>
                        {post.author?.full_name || post.author?.username || 'User'}
                    </span>
                    <span className="text-sm font-medium text-500">@{post.author?.username || 'user'}</span>
                    <span className="text-sm text-600">· {formatDate(post.created_at)}</span>

                    {isAuthor && (
                        <Button
                            icon="pi pi-trash"
                            className="p-button-text p-button-rounded p-button-sm p-button-danger ml-auto"
                            onClick={handleDelete}
                            tooltip="Delete this thought"
                        />
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <Card header={header} className="mb-4 border-round-2xl border-1 surface-border surface-card shadow-4" style={{ overflow: 'hidden', backgroundColor: '#ffffff' }}>
            <div className="flex flex-column p-3">
                <div className="mb-3 text-xl font-light line-height-3 text-color">
                    <p className="m-0 white-space-pre-wrap">{post.content}</p>
                </div>

                {post.image_url && (
                    <div className="mb-3">
                        <img 
                            src={getPublicUrl(post.image_url)}
                            alt="Post attachment"
                            className="w-full border-round-xl border-1 surface-border"
                            style={{ maxHeight: '600px', objectFit: 'cover' }}
                        />
                    </div>
                )}


                <div className="flex align-items-center gap-5 mt-2 pb-2">
                    <div className="flex align-items-center gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleLike(); }}>
                        <i className={`${isLiked ? 'pi pi-heart-fill text-primary' : 'pi pi-heart text-600'} text-2xl`}></i>
                        <span className={`text-sm font-bold ${isLiked ? 'text-primary' : 'text-500'}`}>{likesCount}</span>
                    </div>

                    <div className="flex align-items-center gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); requireAuth(() => onToggleComments(post.id)); }}>
                        <i className="pi pi-comment text-600 text-2xl"></i>
                        <span className="text-500 text-sm font-bold">{post.comments_count || 0}</span>
                    </div>

                    <div className="flex align-items-center gap-2 relative">
                        <span 
                            className="text-600 cursor-pointer text-2xl"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowEmojiPicker(!showEmojiPicker);
                            }}
                        >
                            <i className="pi pi-face-smile"></i>
                        </span>

                        {showEmojiPicker && (
                            <div 
                                className="absolute bottom-100 left-0 surface-card p-2 flex gap-3 mb-2 border-round-xl shadow-6 z-5 border-1 border-white-alpha-10"
                                style={{ backgroundColor: '#1a1a1a' }}
                            >
                                {['🔥', '😂', '😮', '😢', '💯'].map(emoji => (
                                    <span 
                                        key={emoji}
                                        className="cursor-pointer p-1 text-2xl"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            requireAuth(() => {
                                                setReaction(emoji);
                                                setShowEmojiPicker(false);
                                            });
                                        }}
                                    >
                                        {emoji}
                                    </span>
                                ))}
                            </div>
                        )}

                        {reaction && (
                            <span 
                                className="text-sm font-bold surface-hover p-1 px-2 border-round-lg cursor-pointer border-1 border-primary-light"
                                onClick={(e) => { e.stopPropagation(); requireAuth(() => setReaction(null)); }}
                            >
                                {reaction} 1
                            </span>
                        )}
                    </div>
                </div>

                <CommentSection
                    postId={post.id}
                    comments={postComments}
                    currentUser={currentUser}
                    token={token}
                    onAddComment={onAddComment ? (postId, commentText) => onAddComment(postId, commentText) : undefined}
                    onDeleteComment={(commentId) => {
                        if (onDeleteComment) onDeleteComment(post.id, commentId);
                    }}
                    requireAuth={requireAuth}
                />

                <Dialog
                    visible={showDeleteDialog}
                    onHide={() => setShowDeleteDialog(false)}
                    header="Delete Thought"
                    modal
                    style={{ width: '400px' }}
                    footer={
                        <div className="flex gap-3 justify-content-end pt-3">
                            <Button label="Keep it" className="p-button-text p-button-secondary" onClick={() => setShowDeleteDialog(false)} />
                            <Button label="Yes, Delete" className="p-button-danger px-4" onClick={confirmDelete} />
                        </div>
                    }
                >
                    <div className="flex align-items-center gap-3">
                        <i className="pi pi-exclamation-triangle text-4xl text-orange-500"></i>
                        <p className="m-0 text-color-secondary">Are you sure you want to permanently remove this thought? This action cannot be undone.</p>
                    </div>
                </Dialog>
            </div>
        </Card>
    );
};

export default PostCard;

