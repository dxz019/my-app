import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { commentsAPI } from '../services/api';

// receives data and functions from the parent component
const CommentSection = ({
    postId,
    comments,
    currentUser,
    token,
    onAddComment,
    onDeleteComment,
    onShowLogin
}) => {

    // store the text typed in the comment input
    const [commentText, setCommentText] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    // when a key is pressed inside the input field
    const handleKeyPress = (e) => {
        // If the user presses Enter and the comment is not empty
        if (e.key === 'Enter' && commentText && commentText.trim()) {
            handleSubmitComment();
        }
    };

    // ends the comment to the parent component
    const handleSubmitComment = () => {
        // Prevent empty comments
        if (!commentText || !commentText.trim()) return;

        // Call the parent function to add the comment
        if (onAddComment) {
            onAddComment(postId, commentText);
        }

        // Clear the input box after submitting
        setCommentText('');
    };

    // Handle delete button click
    const handleDeleteClick = (comment, e) => {
        if (e) e.stopPropagation();
        setCommentToDelete(comment);
        setShowDeleteDialog(true);
    };

    // Confirm delete
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

    // If the user is not logged in
    if (!token) {
        return null;
    }

    // UI comment section 
    return (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e8e4dc' }}>
            <div className="flex align-items-center gap-2">
                <Avatar
                    label={currentUser?.username?.charAt(0).toUpperCase()}
                    shape="circle"
                    size="small"
                    className="bg-black text-white"
                />

                <InputText
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Post your reply..."
                    autoComplete="off"
                    className="flex-1 p-2 surface-0 border-1 border-gray-300 border-round-xl text-gray-800"
                    style={{
                        borderRadius: '20px',
                        outline: 'none',
                        fontSize: '15px',
                        width: '100%',
                        cursor: 'text'
                    }}
                />

                <Button
                    icon="pi pi-send"
                    className="p-button-text p-button-rounded"
                    style={{ color: (commentText && commentText.trim()) ? '#1d9bf0' : '#cfd9de' }}
                    onClick={handleSubmitComment}
                    disabled={!commentText || !commentText.trim()} // dont allow sending fake comments
                />
            </div>


            {comments && comments.length > 0 && (
                <div className="mt-2">
                    {comments.map((comment) => {
                        const isCommentAuthor = currentUser && comment.author && currentUser.id === comment.author.id;
                        return (
                            <div key={comment.id} className="flex gap-2 mb-3 align-items-start">
                                <Avatar
                                    label={comment.author?.username?.charAt(0).toUpperCase() || 'U'}
                                    shape="circle"
                                    size="small"
                                    className="bg-black text-white"
                                />
                                <div className="flex-1">
                                    <div className="flex align-items-center gap-2">
                                        <span className="font-bold text-gray-800 text-base">
                                            {comment.author?.username || 'User'}
                                        </span>
                                        {isCommentAuthor && (
                                            <Button
                                                icon="pi pi-trash"
                                                className="p-button-text p-button-rounded p-button-sm p-button-danger"
                                                style={{ padding: '2px', minWidth: 'auto', height: 'auto' }}
                                                onClick={(e) => handleDeleteClick(comment, e)}
                                                aria-label="Delete comment"
                                                title="Delete comment"
                                            />
                                        )}
                                    </div>
                                    <p className="m-0 mt-1 text-gray-800 text-base" style={{ lineHeight: '20px' }}>
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                visible={showDeleteDialog}
                onHide={() => {
                    setShowDeleteDialog(false);
                    setCommentToDelete(null);
                }}
                header="Delete Comment"
                modal
                style={{ width: '350px' }}
                footer={
                    <div className="flex gap-2 justify-content-end">
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            onClick={() => {
                                setShowDeleteDialog(false);
                                setCommentToDelete(null);
                            }}
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
                <p>Are you sure you want to delete this comment?</p>
                <p style={{ color: '#666', fontSize: '14px' }}>This action cannot be undone.</p>
            </Dialog>
        </div>
    );
};
export default CommentSection;
