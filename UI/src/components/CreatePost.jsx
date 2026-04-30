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
    const [imageUrls, setImageUrls] = useState([]); // Array of URLs
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true);
            setContent('');
            setImageUrls([]);
            setShowEmojiPicker(false);
        }
    }));

    const handleEmojiClick = (emojiObject) => {
        setContent((prev) => prev + emojiObject.emoji);
    };

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Validate file sizes (5MB max each)
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                showToast?.('Each image must be under 5MB');
                return;
            }
        }

        setUploading(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                const result = await uploadAPI.uploadImage(formData);
                return result.url;
            });

            const urls = await Promise.all(uploadPromises);
            setImageUrls(prev => [...prev, ...urls]);
            showToast?.(`${files.length} image(s) attached!`);
        } catch (error) {
            showToast?.('Failed to upload images');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCreate = async () => {
        if (!content.trim() && imageUrls.length === 0) {
            showToast?.('Write something or attach an image!');
            return;
        }

        try {
            await onCreatePost(content, imageUrls);
            setContent('');
            setImageUrls([]);
            setVisible(false);
            setShowEmojiPicker(false);
        } catch (error) {
            showToast?.('Failed to post');
        }
    };

    const removeImage = (indexToRemove) => {
        setImageUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
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
                    className="w-full border-2 border-transparent focus:border-primary bg-transparent p-3 text-lg font-normal line-height-6 text-color outline-none transition-all"
                    style={{ minHeight: '120px', resize: 'none', backgroundColor: 'var(--color-input-bg)' }}
                    autoFocus
                />

                {/* Image Previews - Grid Layout */}
                {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2" style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {imageUrls.map((url, idx) => (
                            <div key={idx} className="relative border-round-xl overflow-hidden border-1 border-white-alpha-10 shadow-4">
                                <img
                                    src={url.startsWith('http') ? url : `${url}`}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full block"
                                    style={{ height: '150px', objectFit: 'cover' }}
                                />
                                <Button
                                    icon="pi pi-times"
                                    className="p-button-rounded p-button-sm absolute top-0 right-0 m-1 surface-900 border-none text-white w-2rem h-2rem"
                                    onClick={() => removeImage(idx)}
                                />
                            </div>
                        ))}
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
                            className={`p-button-text p-button-rounded w-3rem h-3rem ${imageUrls.length > 0 ? 'text-primary' : 'text-500'}`}
                            onClick={() => fileInputRef.current?.click()}
                            tooltip={`Attach Image${imageUrls.length > 0 ? ` (${imageUrls.length})` : ''}`}
                            disabled={uploading}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            multiple
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
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
                            className={`p-button-rounded px-4 py-2 font-bold shadow-3 ${(content.trim() || imageUrls.length > 0) ? 'p-button-primary' : 'p-button-secondary opacity-50'}`}
                            onClick={handleCreate}
                            disabled={(!content.trim() && imageUrls.length === 0) || uploading}
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
