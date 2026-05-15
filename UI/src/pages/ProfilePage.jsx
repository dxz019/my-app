import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { usersAPI, uploadAPI, getPublicUrl, getErrorMessage } from '../services/api';
import useComments from '../hooks/useComments';
import PostCard from '../components/PostCard';
import AvatarBuilder from '../components/AvatarBuilder';

const ProfilePage = ({
    posts: propPosts,
    token,
    currentUser,
    showToast,
    fetchPosts,
    requireAuth,
    refreshCurrentUser
}) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEditModeParam = searchParams.get('edit') === 'true' || searchParams.get('setup') === 'true';

    const [searchedUser, setSearchedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '',
        username: '',
        email: '',
        biography: '',
        avatar_url: ''
    });
    const [uploading, setUploading] = useState(false);
    const [activity, setActivity] = useState([]);
    const fileInputRef = useRef(null);
    const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);

    const { comments, fetchCommentsForPosts } = useComments(token, currentUser);
    const [showComments, setShowComments] = useState({});

    // Fetch user profile
    useEffect(() => {
        const fetchUserData = async () => {
            if (userId) {
                setLoading(true);
                try {
                    const user = await usersAPI.getUserById(parseInt(userId));
                    setSearchedUser(user);
                } catch (error) {
                    showToast(getErrorMessage(error, 'User not found'));
                    navigate('/');
                } finally {
                    setLoading(false);
                }
            } else {
                setSearchedUser(null);
            }
        };
        fetchUserData();
    }, [userId, navigate, showToast]);

    useEffect(() => {
        const targetUserId = userId ? parseInt(userId, 10) : currentUser?.id;
        if (!targetUserId) {
            setActivity([]);
            return;
        }

        const fetchActivity = async () => {
            try {
                const recentActivity = await usersAPI.getUserActivity(targetUserId);
                setActivity(recentActivity);
            } catch (error) {
                console.error('Failed to load activity:', error);
                setActivity([]);
            }
        };

        fetchActivity();
    }, [userId, currentUser?.id]);

    // Handle initial edit mode from URL
    useEffect(() => {
        if (isEditModeParam && currentUser && (!userId || parseInt(userId) === currentUser.id)) {
            setIsEditing(true);
            setEditForm({
                full_name: currentUser.full_name || '',
                username: currentUser.username || '',
                email: currentUser.email || '',
                biography: currentUser.biography || '',
                avatar_url: currentUser.avatar_url || ''
            });
        }
    }, [isEditModeParam, currentUser, userId]);

    const displayUser = searchedUser || currentUser;
    const isOwnProfile = !searchedUser || searchedUser.id === currentUser?.id;

    // Filter posts
    const userPosts = useMemo(() => {
        if (!displayUser || !propPosts) return [];
        return propPosts.filter(post => post.author_id === displayUser.id);
    }, [propPosts, displayUser]);

    useEffect(() => {
        if (userPosts.length > 0) {
            fetchCommentsForPosts(userPosts.map(p => p.id));
        }
    }, [userPosts, fetchCommentsForPosts]);

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please choose an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be 10MB or smaller');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const result = await uploadAPI.uploadImage(formData);
            setEditForm(prev => ({ ...prev, avatar_url: result.url }));
            showToast('Avatar uploaded! Save profile to finish.');
        } catch (error) {
            showToast(getErrorMessage(error, 'Upload failed'));
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleSaveProfile = async () => {
        if (!editForm.full_name?.trim()) {
            showToast('Full name is required');
            return;
        }
        if (!editForm.username?.trim()) {
            showToast('Username is required');
            return;
        }
        if (editForm.username.length < 3) {
            showToast('Username must be at least 3 characters');
            return;
        }
        if (!editForm.email?.trim()) {
            showToast('Email is required');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editForm.email)) {
            showToast('Please enter a valid email address');
            return;
        }

        const payload = Object.fromEntries(
            Object.entries(editForm).filter(([, value]) => typeof value === 'string' || value !== undefined)
        );

        setLoading(true);
        try {
            const updatedUser = await usersAPI.updateUser(payload);
            setSearchedUser(userId ? updatedUser : null);
            if (refreshCurrentUser) {
                await refreshCurrentUser();
            }
            showToast('Profile updated!');
            setIsEditing(false);
        } catch (error) {
            showToast(getErrorMessage(error, 'Update failed'));
        } finally {
            setLoading(false);
        }
    };

    const formatActivityTitle = (item) => {
        if (item.type === 'post') return `Shared a thought: ${item.title || 'Untitled'}`;
        if (item.type === 'comment') return `Commented on: ${item.title || 'a thought'}`;
        if (item.type === 'like') return `Liked a thought: ${item.title || 'Untitled'}`;
        return 'Recent activity';
    };

    if (loading && !displayUser) {
        return (
            <div className="flex justify-content-center p-8">
                <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
            </div>
        );
    }

    if (!displayUser && !loading) {
        return (
            <div className="surface-card p-6 border-round-xl text-center shadow-md">
                <i className="pi pi-user-minus text-4xl text-400 mb-4"></i>
                <h2 className="text-xl font-bold mb-2">Profile not found</h2>
                <Button label="Go Home" className="p-button-text" onClick={() => navigate('/')} />
            </div>
        );
    }

    return (
        <div className="profile-wrapper w-full" style={{ padding: '0 2rem 3rem' }}>
             {/* Header Section */}
             <div
                 className="p-4 mb-4 mx-3"
                 style={{
                     backgroundColor: 'var(--color-bg-card)',
                     border: '2px solid var(--color-border)',
                     borderRadius: '20px',
                     boxShadow: 'var(--elevation-1)'
                 }}
             >
                <div className="flex flex-column md:flex-row align-items-center md:align-items-start gap-5">
                    {/* Avatar with Upload logic */}
                    <div className="flex flex-column align-items-center gap-3">
                        <Avatar
                            image={isEditing ? getPublicUrl(editForm.avatar_url) : getPublicUrl(displayUser.avatar_url)}
                            label={!isEditing && !displayUser.avatar_url ? displayUser.username?.charAt(0).toUpperCase() : null}
                            size="xlarge"
                            shape="circle"
                            style={{
                                width: '110px',
                                height: '110px',
                                backgroundColor: 'var(--color-primary)',
                                color: '#fff',
                                fontSize: '4rem',
                                border: '4px solid var(--color-border)'
                            }}
                        />
                        {isEditing && (
                            <div className="flex flex-column align-items-center gap-3">
                                <Button
                                    type="button"
                                    label={uploading ? "Uploading..." : "Change Avatar"}
                                    icon={`pi ${uploading ? 'pi-spin pi-spinner' : 'pi-camera'}`}
                                    className="p-button-outlined p-button-sm p-button-rounded"
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={uploading}
                                />
                                <Button
                                    type="button"
                                    label="Create Avatar"
                                    icon="pi pi-palette"
                                    className="p-button-outlined p-button-sm p-button-rounded"
                                    onClick={() => setShowAvatarBuilder(true)}
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left pt-2">
                        {isEditing ? (
                            <div className="flex flex-column gap-4 max-w-25rem mx-auto md:mx-0">
                                <div className="flex flex-column gap-2 mb-2">
                                    <label className="text-sm font-bold text-500">Full Name</label>
                         <InputText
                                             value={editForm.full_name}
                                             onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                                             placeholder="Full Name"
                                             className="profile-edit-input"
                                             style={{
                                                 background: 'var(--color-input-bg)',
                                                 border: '1px solid var(--color-border)',
                                                 borderRadius: '12px',
                                                 color: 'var(--color-input-text)'
                                             }}
                                         />
                                </div>
                                <div className="flex flex-row gap-3">
                                     <div className="flex-1 flex flex-column gap-2">
                                         <label className="text-sm font-bold text-500">Username</label>
                                         <InputText
                                             value={editForm.username}
                                             onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                             placeholder="username"
                                             className="profile-edit-input"
                                             style={{
                                                 background: 'var(--color-input-bg)',
                                                 border: '1px solid var(--color-border)',
                                                 borderRadius: '12px',
                                                 color: 'var(--color-input-text)'
                                             }}
                                         />
                                     </div>
                                     <div className="flex-1 flex flex-column gap-2">
                                         <label className="text-sm font-bold text-500">Email Address</label>
                                         <InputText
                                             value={editForm.email}
                                             onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                             placeholder="email@example.com"
                                             className="profile-edit-input"
                                             style={{
                                                 background: 'var(--color-input-bg)',
                                                 border: '1px solid var(--color-border)',
                                                 borderRadius: '12px',
                                                 color: 'var(--color-input-text)'
                                             }}
                                         />
                                     </div>
                                </div>
                                <div className="flex flex-column gap-2">
                                    <label className="text-sm font-bold text-500">Bio</label>
                                 <InputTextarea
                                         value={editForm.biography}
                                         onChange={(e) => setEditForm(prev => ({ ...prev, biography: e.target.value }))}
                                         placeholder="Tell the world about yourself..."
                                         rows={4}
                                         autoResize
                                         className="profile-edit-input"
                                         style={{
                                             background: 'var(--color-input-bg)',
                                             border: '1px solid var(--color-border)',
                                             borderRadius: '12px',
                                             color: 'var(--color-input-text)'
                                         }}
                                     />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button label="Save Profile" className="border-round-2xl px-5 py-3 font-bold" style={{ backgroundColor: 'var(--color-primary)', border: 'none' }} onClick={handleSaveProfile} />
                                    <Button label="Cancel" className="p-button-text p-button-secondary font-bold" onClick={() => setIsEditing(false)} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex align-items-center justify-content-center md:justify-content-start gap-4 mb-3">
                                    <h1 className="text-5xl font-bold m-0" style={{ letterSpacing: '-2px', color: 'var(--color-text-main)' }}>{displayUser.full_name || displayUser.username}</h1>
                                    {isOwnProfile && currentUser && (
                                        <Button
                                            icon="pi pi-user-edit"
                                            className="p-button-rounded p-button-text p-button-lg"
                                            style={{ color: 'var(--color-primary)' }}
                                            onClick={() => {
                                                setIsEditing(true);
                                                setEditForm({
                                                    full_name: displayUser.full_name || '',
                                                    username: displayUser.username || '',
                                                    email: displayUser.email || '',
                                                    biography: displayUser.biography || '',
                                                    avatar_url: displayUser.avatar_url || ''
                                                });
                                            }}
                                        />
                                    )}
                                </div>
                                <span className="text-2xl mb-4 block font-medium" style={{ color: 'var(--color-text-sub)' }}>@{displayUser.username}</span>
                                <p className="text-xl line-height-4 max-w-35rem mx-auto md:mx-0" style={{ color: 'var(--color-text-sub)' }}>
                                    {displayUser.biography || "No biography added yet. Update your profile to tell people more about yourself."}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>


             <div className="p-4 mb-4" style={{ backgroundColor: 'var(--color-bg-elevated)', border: '2px solid var(--color-border)', borderRadius: '16px', boxShadow: 'var(--elevation-1)' }}>
                <div className="flex align-items-center justify-content-between mb-4">
                    <h3 className="text-2xl font-bold m-0" style={{ color: 'var(--color-text-main)' }}>Recent Activity</h3>
                    <span className="font-bold" style={{ color: 'var(--color-text-sub)' }}>{activity.length} items</span>
                </div>

                {activity.length > 0 ? (
                    <div className="flex flex-column gap-3">
                        {activity.map((item) => (
                                 <div
                                    key={`${item.type}-${item.entity_id}`}
                                    className="p-3 border-round-xl"
                                    style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                                >
                                <div className="flex align-items-center justify-content-between gap-3 mb-2">
                                    <span className="font-bold" style={{ color: 'var(--color-text-main)' }}>{formatActivityTitle(item)}</span>
                                    <span className="text-sm" style={{ color: 'var(--color-text-sub)' }}>{new Date(item.created_at).toLocaleString()}</span>
                                </div>
                                <p className="m-0" style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-sub)' }}>{item.summary}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="m-0" style={{ color: 'var(--color-text-muted)' }}>No activity yet.</p>
                )}
            </div>

            {/* Posts Grid */}
             {/* Posts Grid */}
             <div className="px-3">
                 <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-main)' }}>
                     {isOwnProfile ? 'Your Thoughts' : `Posts from @${displayUser.username}`}
                 </h3>
                 <span className="font-bold text-lg mb-5 block" style={{ color: 'var(--color-text-sub)' }}>{userPosts.length} posts</span>

                 {userPosts.length > 0 ? (
                     <div className="flex flex-column gap-4">
                         {userPosts.map((post) => (
                             <div key={post.id} className="col-12">
                             <PostCard
                                key={post.id}
                                post={post}
                                currentUser={currentUser}
                                token={token}
                                comments={comments}
                                showComments={showComments}
                                onToggleComments={(postId) => setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))}
                                onAddComment={() => { }}
                                onDeletePost={fetchPosts}
                                onDeleteComment={async (postId) => {
                                    await fetchCommentsForPosts([postId], true);
                                    await fetchPosts();
                                }}
                                requireAuth={requireAuth}
                            />
                            </div>
                        ))}
                    </div>
                 ) : (
                     <div className="text-center p-8 mt-6 surface-card border-round-2xl border-1 border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                         <i className="pi pi-cloud-upload" style={{ fontSize: '4rem', marginBottom: '2rem', color: 'var(--color-text-muted)' }}></i>
                         <p className="m-0 text-xl" style={{ color: 'var(--color-text-sub)' }}>{isOwnProfile ? "You haven't shared your thoughts yet." : "This user is still gathering their thoughts."}</p>
                         {isOwnProfile && !currentUser && (
                             <Button
                                 label="Start Sharing"
                                 className="mt-5 p-button-text font-bold text-xl"
                                 style={{ color: 'var(--color-primary)' }}
                                 onClick={() => requireAuth()}
                             />
                         )}
                     </div>
                 )}
            </div>

            {/* Avatar Builder Dialog */}
            <Dialog
                header="Create Your Avatar"
                visible={showAvatarBuilder}
                style={{ width: '60vw', maxHeight: '85vh' }}
                modal
                draggable={false}
                onHide={() => setShowAvatarBuilder(false)}
                closeOnEscape
                dismissableMask
                contentStyle={{ maxHeight: '60vh', overflow: 'auto' }}
            >
                <AvatarBuilder
                    onSave={(avatarUrl) => {
                        if (avatarUrl) {
                            setEditForm(prev => ({ ...prev, avatar_url: avatarUrl }));
                            showToast('Avatar created! Save profile to apply.');
                        }
                        setShowAvatarBuilder(false);
                    }}
                />
            </Dialog>
        </div>
    );
};

export default ProfilePage;
