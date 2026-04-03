import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';

// CreatePost component - Modal dialog for creating new posts
const CreatePost = forwardRef(({ currentUser, onCreatePost, showToast }, ref) => {
    const [visible, setVisible] = useState(false);
    const [content, setContent] = useState('');


    useImperativeHandle(ref, () => ({
        open: () => setVisible(true)
    }));
    const handleCreate = async () => {
        if (!content.trim()) {
            showToast?.('Write something!');
            return;
        }

        try {
            await onCreatePost(content);
            setContent('');
            setVisible(false);
            showToast?.('Posted!');
        } catch (error) {
            showToast?.('Failed to post');
        }
    };

    return (
        <>
            <Dialog
                header="Create Post"
                visible={visible}
                onHide={() => setVisible(false)}
                style={{ width: '500px', maxWidth: '90vw', borderRadius: '16px', marginTop: '10vh' }}
                modal
                draggable={false}
            >
                <div className="flex flex-column gap-2">

                    {/* Avatar and textarea - centered */}
                    <div className="flex flex-column align-items-center gap-2">
                        {/* User Avatar */}
                        <Avatar
                            label={currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                            shape="circle"
                            size="large"
                            className="bg-orange-400 text-white flex-shrink-0"
                        />

                        {/* Post Input - fills container */}
                        <InputTextarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            rows={8}
                            autoResize
                            className="w-full border-none surface-transparent text-center"
                            style={{
                                fontSize: '18px',
                                outline: 'none',
                                resize: 'none',
                                borderRadius: '12px',
                                backgroundColor: '#f5f5f5',
                                padding: '20px',
                                minHeight: '200px'
                            }}
                            autoFocus
                        />
                    </div>

                    {/* Post button - styled nicely */}
                    <div className="flex justify-content-center pt-2">
                        <Button
                            label="Post"
                            icon="pi pi-send"
                            className="p-button-rounded"
                            style={{
                                backgroundColor: content.trim() ? '#FF8C00' : '#cccccc',
                                border: 'none',
                                padding: '12px 40px',
                                fontWeight: 'bold'
                            }}
                            onClick={handleCreate}
                            disabled={!content.trim()}
                        />
                    </div>
                </div>
            </Dialog>
        </>
    );
});

export default CreatePost;
