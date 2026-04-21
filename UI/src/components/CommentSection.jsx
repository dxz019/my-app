import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import EmojiPicker from 'emoji-picker-react';
import { commentsAPI, getPublicUrl } from '../services/api';

const CommentSection = ({ postId, comments, currentUser, token, onAddComment, onDeleteComment, requireAuth }) => {
    const [newComment, setNewComment] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const emojiRef = useRef(null);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await onAddComment(postId, newComment);
            setNewComment('');
            setShowEmojiPicker(false);
        } catch (error) {
            console.error('Comment error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setNewComment((prev) => prev + emojiObject.emoji);
    };

    const handleDeleteClick = (comment, e) => {
        if (e) e.stopPropagation();
        setCommentToDelete(comment);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (commentToDelete) {
            try {
                await commentsAPI.deleteComment(commentToDelete.id);
                if (onDeleteComment) {
                    onDeleteComment(commentToDelete.id);
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
        setShowDeleteDialog(false);
        setCommentToDelete(null);
    };

    return (
        <div className="mt-4 pt-3 border-top-1 surface-border">
            {/* Comment Input Area */}
            <div className="flex gap-3 mb-4">
                <Avatar 
                    image={getPublicUrl(currentUser?.avatar_url)} 
                    label={!currentUser?.avatar_url ? (currentUser?.username?.charAt(0).toUpperCase() || '?') : null}
                    shape="circle" 
                    className="flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                />
                <div className="flex-1 flex flex-column gap-2 relative">
                    <div className="flex align-items-end gap-2 w-full p-2 surface-card border-1 surface-border border-round-2xl shadow-2 transition-all transition-duration-200">
                        <InputTextarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a thought..."
                            rows={1}
                            autoResize
                            className="flex-1 border-none p-2 surface-card text-color focus:shadow-none outline-none"
                            style={{ resize: 'none', minHeight: '32px' }}
                            onClick={(e) => {
                                if (!currentUser) {
                                    e.preventDefault();
                                    requireAuth();
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if(requireAuth(() => handleSubmit())) {}
                                }
                            }}
                            readOnly={!currentUser}
                        />
                        
                        <div className="flex align-items-center gap-1 flex-shrink-0">
                            <Button
                                icon="pi pi-face-smile"
                                className={`p-button-text p-button-rounded p-button-sm ${showEmojiPicker ? 'text-primary' : 'text-color-secondary'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(requireAuth()) {
                                        setShowEmojiPicker(!showEmojiPicker);
                                    }
                                }}
                            />
                            <Button
                                icon={loading ? "pi pi-spin pi-spinner" : "pi pi-send"}
                                className={`p-button-rounded p-button-sm ${newComment.trim() ? 'p-button-primary' : 'p-button-secondary opacity-50'}`}
                                onClick={() => requireAuth(() => handleSubmit())}
                                disabled={!newComment.trim() || loading}
                            />
                        </div>
                    </div>

                    {showEmojiPicker && (
                        <div ref={emojiRef} className="absolute bottom-100 right-0 mb-2 z-5 border-round-2xl overflow-hidden shadow-8 border-1 surface-border max-w-full">
                            <EmojiPicker 
                                onEmojiClick={handleEmojiClick}
                                width="100%" 
                                height={320}
                                theme={document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light'}
                                searchPlaceholder="Search emojis..."
                                skinTonesDisabled
                                previewConfig={{ showPreview: false }}
                                lazyLoadEmojis
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Comments List */}
            {comments && comments.length > 0 && (
                <div className="flex flex-column gap-4">
                    {comments.map((comment) => {
                        const isAuthor = currentUser && comment.author_id === currentUser.id;
                        return (
                            <div key={comment.id} className="flex gap-3 align-items-start">
                                <Avatar 
                                    image={getPublicUrl(comment.author?.avatar_url)} 
                                    label={!comment.author?.avatar_url ? comment.author?.username?.charAt(0).toUpperCase() : null}
                                    shape="circle" 
                                    className="border-1 surface-border flex-shrink-0"
                                    style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-main)', width: '32px', height: '32px', fontSize: '14px' }}
                                />
                                <div className="flex-1">
                                    <div className="flex align-items-center gap-2 mb-1">
                                        <span className="font-bold text-sm text-color">
                                            @{comment.author?.username || 'user'}
                                        </span>
                                        <span className="text-xs text-color-secondary">· just now</span>
                                        {isAuthor && (
                                            <i 
                                                className="pi pi-trash text-xs cursor-pointer ml-auto text-400"
                                                onClick={(e) => handleDeleteClick(comment, e)}
                                            ></i>
                                        )}
                                    </div>
                                    <p className="m-0 text-sm text-color-secondary line-height-3">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            <Dialog
                visible={showDeleteDialog}
                onHide={() => setShowDeleteDialog(false)}
                header="Delete Comment"
                modal
                style={{ width: '350px' }}
                footer={
                    <div className="flex gap-3 justify-content-end pt-3">
                        <Button label="Cancel" className="p-button-text p-button-secondary" onClick={() => setShowDeleteDialog(false)} />
                        <Button label="Delete" className="p-button-danger px-4 py-2" onClick={confirmDelete} />
                    </div>
                }
            >
                <p className="text-color-secondary">Are you sure you want to delete this reply?</p>
            </Dialog>
        </div>
    );
};

export default CommentSection;

