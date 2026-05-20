import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import CommentSection from './CommentSection';
import { getPublicUrl } from '../services/api';
const PostCard = ({ post, currentUser, token, comments, showComments, onToggleComments, onAddComment, onDeleteComment, onDeletePost, onUpdatePostLikes, requireAuth }) => {
    const navigate = useNavigate();
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return '· just now';
        if (minutes < 60)
            return `· ${minutes}m`;
        if (hours < 24)
            return `· ${hours}h`;
        if (days < 7)
            return `· ${days}d`;
        return `· ${date.toLocaleDateString()}`;
    };
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isLiked, setIsLiked] = useState(post.is_liked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [likeLoading, setLikeLoading] = useState(false);
    const [reaction, setReaction] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const handleAuthorClick = (e) => {
        e.stopPropagation();
        navigate(`/profile/${post.author?.id}`);
    };
    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!token || !currentUser)
            return;
        setShowDeleteDialog(true);
    };
    const confirmDelete = async () => {
        try {
            await onDeletePost(post.id);
            if (onDeletePost) {
                onDeletePost(post.id);
            }
        }
        catch (error) {
            console.error('Error deleting post:', error);
        }
        finally {
            setShowDeleteDialog(false);
        }
    };
    const handleLike = async () => {
        if (!requireAuth())
            return;
        if (likeLoading)
            return;
        setLikeLoading(true);
        try {
            if (isLiked) {
                const result = await onUpdatePostLikes(post.id, true);
                setLikesCount(result.likes_count);
                setIsLiked(false);
            }
            else {
                const result = await onUpdatePostLikes(post.id, false);
                setLikesCount(result.likes_count);
                setIsLiked(true);
            }
        }
        catch (error) {
            console.error('Error toggling like:', error);
        }
        finally {
            setLikeLoading(false);
        }
    };
    const isAuthor = currentUser && post.author && currentUser.id === post.author.id;
    const header = (<div className="flex gap-3 p-3 pb-0">
            <div className="flex-shrink-0">
                <Avatar image={getPublicUrl(post.author?.avatar_url)} label={!post.author?.avatar_url ? (post.author?.username?.charAt(0).toUpperCase() || 'U') : null} size="large" shape="circle" className="cursor-pointer border-2 border-white-alpha-10" style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }} onClick={handleAuthorClick}/>
            </div>
            <div className="flex-1">
                <div className="flex align-items-center flex-wrap gap-2">
                    <span className="text-heading font-bold cursor-pointer hover:text-primary transition-colors" style={{ color: 'var(--color-text-main)' }} onClick={handleAuthorClick}>
                        {post.author?.full_name || post.author?.username || 'User'}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--color-text-sub)' }}>@{post.author?.username || 'user'}</span>
                    <span style={{ color: 'var(--color-text-sub)' }}>·</span>
                    <span className="text-sm" style={{ color: 'var(--color-text-sub)' }}>{formatDate(post.created_at)}</span>

                    {isAuthor && (<Button icon="pi pi-trash" className="p-button-text p-button-rounded p-button-sm p-button-plain ml-auto" onClick={handleDelete} tooltip="Delete this thought"/>)}
                </div>
            </div>
        </div>);
    return (<Card header={header} className="mb-5 border-1 hover:shadow-3 transition-all transition-duration-300 cursor-pointer" style={{
            overflow: 'hidden',
            backgroundColor: 'var(--color-bg-card)',
            border: '2px solid var(--color-border-bright)',
            borderRadius: 'var(--radius-lg)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = 'var(--elevation-4), 0 0 20px var(--color-primary-light), 0 0 0 2px var(--color-primary-light)';
        }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'var(--elevation-1)';
        }}>
            <div className="flex flex-column p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="mb-3 text-body-lg font-normal line-height-6 text-color" style={{ flex: 1 }}>
                    <p className="m-0 white-space-pre-wrap" style={{ color: 'var(--color-text-main)' }}>{post.content}</p>
                </div>

                {post.media && post.media.length > 0 ? (<div className="mb-3">
                        <div className="grid grid-nogutter gap-2" style={{ maxHeight: '400px' }}>
                            {post.media.map((url, idx) => (<div key={idx} className={`${post.media.length === 1 ? 'col-12' : 'col-5'} border-round-lg overflow-hidden flex-grow-1`}>
                                    <img src={getPublicUrl(url)} alt={`Post attachment ${idx + 1}`} className="w-full h-full" style={{ minHeight: post.media.length === 1 ? '300px' : '200px', objectFit: 'cover' }}/>
                                </div>))}
                        </div>
                    </div>) : post.image_url ? (<div className="mb-3">
                        <div className="border-round-lg overflow-hidden">
                            <img src={getPublicUrl(post.image_url)} alt="Post attachment" className="w-full" style={{ height: '300px', objectFit: 'cover' }}/>
                        </div>
                    </div>) : null}

                <div className="flex align-items-center gap-3 mt-3 pb-2">
                    <div className="flex align-items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-primary-light transition-all transition-duration-200" onClick={(e) => { e.stopPropagation(); handleLike(); }} style={{ transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                        <i className={`${isLiked ? 'pi pi-heart-fill text-primary' : 'pi pi-heart text-500 hover:text-primary'} text-xl transition-colors`}></i>
                        <span className={`text-sm font-semibold ${isLiked ? 'text-primary' : 'text-500'}`}>{likesCount}</span>
                    </div>

                    <div className="flex align-items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-primary-light transition-all transition-duration-200" onClick={(e) => { e.stopPropagation(); requireAuth(() => onToggleComments(post.id)); }} style={{ transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                        <i className="pi pi-comment text-500 hover:text-primary text-xl transition-colors"></i>
                        <span className="text-500 text-sm font-semibold">{post.comments_count || 0}</span>
                    </div>

                    <div className="flex align-items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-primary-light transition-all transition-duration-200" style={{ transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                        <span className="text-500 hover:text-primary text-xl transition-colors cursor-pointer" onClick={(e) => {
            e.stopPropagation();
            setShowEmojiPicker(!showEmojiPicker);
        }}>
                            <i className="pi pi-face-smile"></i>
                        </span>
                    </div>
                </div>

        {showEmojiPicker && (<div className="absolute bottom-100 left-0 surface-card p-2 flex gap-3 mb-2 border-round-xl shadow-6 z-5 border-1 surface-border">
                        {['🔥', '😂', '😮', '😢', '💯'].map(emoji => (<span key={emoji} className="cursor-pointer p-1 text-2xl" onClick={(e) => {
                    e.stopPropagation();
                    requireAuth(() => {
                        setReaction(emoji);
                        setShowEmojiPicker(false);
                    });
                }}>
                                {emoji}
                            </span>))}
                    </div>)}

                {reaction && (<span className="text-sm font-bold surface-hover p-1 px-2 border-round-lg cursor-pointer border-1 border-primary-light" onClick={(e) => { e.stopPropagation(); requireAuth(() => setReaction(null)); }}>
                        {reaction} 1
                    </span>)}

                <CommentSection postId={post.id} comments={comments} currentUser={currentUser} token={token} onAddComment={onAddComment} onDeleteComment={(commentId) => {
            if (onDeleteComment)
                onDeleteComment(post.id, commentId);
        }} requireAuth={requireAuth}/>
            </div>

            <Dialog visible={showDeleteDialog} onHide={() => setShowDeleteDialog(false)} header="Delete Thought" modal style={{ width: '400px' }} footer={<div className="flex gap-3 justify-content-end pt-3">
                        <Button label="Keep it" className="p-button-text p-button-secondary" onClick={() => setShowDeleteDialog(false)}/>
                        <Button label="Yes, Delete" className="p-button-danger px-4" onClick={confirmDelete}/>
                    </div>}>
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-4xl text-red-500"></i>
                    <p className="m-0 text-color-secondary">Are you sure you want to permanently remove this thought? This action cannot be undone.</p>
                </div>
            </Dialog>
        </Card>);
};
export default PostCard;
