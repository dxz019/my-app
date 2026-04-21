import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import EmojiPicker from 'emoji-picker-react';
import { uploadAPI } from '../services/api';

const CreatePost = forwardRef(({ currentUser, onCreatePost, showToast }, ref) => {
    const [visible, setVisible] = useState(false);
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true);
            setContent('');
            setImageUrl(null);
            setShowEmojiPicker(false);
        }
    }));

    const handleEmojiClick = (emojiObject) => {
        setContent((prev) => prev + emojiObject.emoji);
    };

    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast?.('Image must be under 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const result = await uploadAPI.uploadImage(formData);
            setImageUrl(result.url);
            showToast?.('Image attached!');
        } catch (error) {
            showToast?.('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async () => {
        if (!content.trim() && !imageUrl) {
            showToast?.('Write something or attach an image!');
            return;
        }

        try {
            await onCreatePost(content, imageUrl);
            setContent('');
            setImageUrl(null);
            setVisible(false);
            setShowEmojiPicker(false);
        } catch (error) {
            showToast?.('Failed to post');
        }
    };

    const removeImage = () => {
        setImageUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Dialog
            visible={visible}
            onHide={() => { setVisible(false); setShowEmojiPicker(false); }}
            style={{ width: '540px', maxWidth: '92vw' }}
            modal
            draggable={false}
            dismissableMask
            header={
                <div className="flex align-items-center gap-3">
                    <Avatar
                        image={currentUser?.avatar_url}
                        label={!currentUser?.avatar_url ? (currentUser?.username?.charAt(0).toUpperCase() || 'U') : null}
                        shape="circle"
                        size="large"
                        className="shadow-2"
                        style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                    />
                    <div>
                        <div className="font-bold text-lg text-color">
                            {currentUser?.full_name || currentUser?.username || 'You'}
                        </div>
                        <div className="text-sm text-500">
                            @{currentUser?.username || 'user'}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex flex-column gap-3 relative">
                {/* Text Area */}
                <InputTextarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind? ✨"
                    rows={5}
                    autoResize
                    className="w-full border-1 border-gray-300 p-3 text-xl font-light line-height-3 outline-none focus:border-primary transition-all transition-duration-200"
                    style={{ minHeight: '120px', resize: 'none' }}
                    autoFocus
                />

                {/* Image Preview */}
                {imageUrl && (
                    <div className="relative border-round-xl overflow-hidden border-1 border-white-alpha-10 shadow-4">
                        <img 
                            src={imageUrl.startsWith('http') ? imageUrl : `${imageUrl}`} 
                            alt="Preview" 
                            className="w-full block"
                            style={{ maxHeight: '240px', objectFit: 'cover' }}
                        />
                        <Button
                            icon="pi pi-times"
                            className="p-button-rounded p-button-sm absolute top-0 right-0 m-2 surface-900 border-none text-white w-2rem h-2rem"
                            onClick={removeImage}
                        />
                    </div>
                )}

                {/* Uploading indicator */}
                {uploading && (
                    <div className="flex align-items-center gap-2 p-2 text-primary">
                        <i className="pi pi-spin pi-spinner"></i>
                        <span className="text-sm">Uploading image...</span>
                    </div>
                )}

                {/* --- Toolbar: Emoji, Image, GIF, Post --- */}
                <div className="flex align-items-center justify-content-between pt-3 border-top-1 border-white-alpha-10">
                    {/* Left: Action Icons */}
                    <div className="flex align-items-center gap-1">
                        <Button
                            icon="pi pi-face-smile"
                            className={`p-button-text p-button-rounded w-3rem h-3rem ${showEmojiPicker ? 'text-primary' : 'text-500'}`}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            tooltip="Emoji"
                        />
                        <Button
                            icon="pi pi-image"
                            className={`p-button-text p-button-rounded w-3rem h-3rem ${imageUrl ? 'text-primary' : 'text-500'}`}
                            onClick={() => fileInputRef.current?.click()}
                            tooltip="Attach Image"
                            disabled={uploading}
                        />
                        <Button
                            icon="pi pi-video"
                            className="p-button-text p-button-rounded w-3rem h-3rem text-700"
                            tooltip="GIF (coming soon)"
                            disabled
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Character count + Post button */}
                    <div className="flex align-items-center gap-3">
                        {content.length > 0 && (
                            <span className={`text-xs ${content.length > 900 ? 'text-red-500' : 'text-500'}`}>
                                {content.length}/1000
                            </span>
                        )}
                        <Button
                            label="Post"
                            icon="pi pi-send"
                            className={`p-button-rounded px-4 py-2 font-bold shadow-3 ${(content.trim() || imageUrl) ? 'p-button-primary' : 'p-button-secondary opacity-50'}`}
                            onClick={handleCreate}
                            disabled={(!content.trim() && !imageUrl) || uploading}
                        />
                    </div>
                </div>

                {/* Emoji Picker - positioned below toolbar */}
                {showEmojiPicker && (
                    <div className="relative z-5 border-round-xl overflow-hidden border-1 border-white-alpha-10 shadow-8">
                        <EmojiPicker 
                            onEmojiClick={handleEmojiClick} 
                            width="100%" 
                            height={350}
                            theme="dark"
                            searchPlaceholder="Search emojis..."
                            skinTonesDisabled
                            previewConfig={{ showPreview: false }}
                        />
                    </div>
                )}
            </div>
        </Dialog>
    );

});

export default CreatePost;
