import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
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
    // Get the userId from URL params to fetch other user's profile
    const { userId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // Check if edit mode is enabled via query param (?edit=true or ?setup=true)
    const isEditModeParam = searchParams.get('edit') === 'true' || searchParams.get('setup') === 'true';

    // Store the fetched user profile data (null when viewing own profile or loading)
    const [searchedUser, setSearchedUser] = useState(null);
    // Loading state for profile fetch
    const [loading, setLoading] = useState(false);
    // Edit mode state for profile editing
    const [isEditing, setIsEditing] = useState(false);
    // Form data for profile editing fields
    const [editForm, setEditForm] = useState({
        full_name: '',
        username: '',
        email: '',
        biography: '',
        avatar_url: '',
        animated_avatar_url: ''
    });
    // Upload state for profile picture
    const [uploading, setUploading] = useState(false);
    // Recent activity data for the profile page
    const [activity, setActivity] = useState([]);
    const fileInputRef = useRef(null);
    const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);

    // Track if current user is following the profile user
    const [isFollowing, setIsFollowing] = useState(false);
    // Loading state for follow/unfollow button
    const [followLoading, setFollowLoading] = useState(false);

    const { comments, fetchCommentsForPosts } = useComments(token, currentUser);
    const [showComments, setShowComments] = useState({});

    // Fetch user profile data when userId changes
    useEffect(() => {
        const fetchUserData = async () => {
            if (userId) {
                setLoading(true);
                try {
                    // Fetch user by ID from database
                    const user = await usersAPI.getUserById(parseInt(userId));
                    setSearchedUser(user);
                    // Fetch follow status if viewing another user's profile
                    if (currentUser && user && parseInt(userId) !== currentUser.id) {
                        fetchFollowStatus(parseInt(userId));
                    }
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
    }, [userId, navigate, showToast, currentUser]);

    // Check if current user is following target user
    const fetchFollowStatus = async (targetUserId) => {
        try {
            // Call API to get follow status
            const result = await usersAPI.getFollowStatus(targetUserId);
            // Update local state with follow status
            setIsFollowing(result.isFollowing);
        } catch (e) {
            // Default to not following on error
            setIsFollowing(false);
        }
    };

    // Handle follow/unfollow toggle button click
    const handleFollowToggle = async () => {
        // Require authentication before allowing follow action
        if (!requireAuth()) return;
        // Prevent double-click
        if (followLoading) return;
        setFollowLoading(true);
        // Store previous state for rollback on error
        const previous = isFollowing;
        // Optimistically update UI
        setIsFollowing(!previous);
        try {
            if (!previous) {
                // Currently not following - follow the user
                const result = await usersAPI.toggleFollow(displayUser.id);
                showToast('Following!');
                // Update user data with returned follower/following counts
                if (result.user) {
                    // For other profiles, update searchedUser to refresh counts
                    if (userId) {
                        setSearchedUser(result.user);
                    }
                    // For own profile, refresh current user to update displayed counts in header
                    if (refreshCurrentUser) {
                        await refreshCurrentUser();
                    }
                }
            } else {
                // Currently following - unfollow the user
                const result = await usersAPI.unfollow(displayUser.id);
                showToast('Unfollowed');
                // Update user data with returned follower/following counts
                if (result.user) {
                    // For other profiles, update searchedUser to refresh counts
                    if (userId) {
                        setSearchedUser(result.user);
                    }
                    // For own profile, refresh current user to update displayed counts in header
                    if (refreshCurrentUser) {
                        await refreshCurrentUser();
                    }
                }
            }
        } catch (e) {
            // Rollback optimistic update on error
            setIsFollowing(previous);
            showToast('Could not update follow status');
        } finally {
            // Clear loading state
            setFollowLoading(false);
        }
    };

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

    useEffect(() => {
        if (isEditModeParam && currentUser && (!userId || parseInt(userId) === currentUser.id)) {
            setIsEditing(true);
            setEditForm({
                full_name: currentUser.full_name || '',
                username: currentUser.username || '',
                email: currentUser.email || '',
                biography: currentUser.biography || '',
                avatar_url: currentUser.avatar_url || '',
                animated_avatar_url: currentUser.animated_avatar_url || ''
            });
        }
    }, [isEditModeParam, currentUser, userId]);

    const displayUser = searchedUser || currentUser;
    const isOwnProfile = !searchedUser || searchedUser.id === currentUser?.id;

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
            showToast('Image must be 5MB or smaller');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const result = await uploadAPI.uploadImage(formData);
            setEditForm(prev => ({ ...prev, avatar_url: result.url }));
            showToast('Profile picture updated! Save profile to finish.');
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
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
        <div className="profile-wrapper w-full" style={{ padding: '0 2rem 3rem', marginTop: '20px' }}>
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
                    <div className="flex flex-column align-items-center gap-3">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar-ring"></div>
                            <div className="relative">
                                <Avatar
                                    image={isEditing ? getPublicUrl(editForm.avatar_url || displayUser.avatar_url) : getPublicUrl(displayUser.avatar_url)}
                                    label={!displayUser.avatar_url ? displayUser.username?.charAt(1).toUpperCase() : null}
                                    size="xlarge"
                                    shape="circle"
                                    style={{
                                        width: '110px',
                                        height: '110px',
                                        backgroundColor: 'var(--color-primary)',
                                        color: '#fff',
                                        fontSize: '4rem',
                                        border: '4px solid var(--color-border)',
                                        position: 'relative',
                                        zIndex: 1,
                                        cursor: isEditing ? 'pointer' : 'default'
                                    }}
                                    onClick={isEditing ? handleAvatarClick : undefined}
                                />
                                {isEditing && (
                                    <span
                                        className="pi pi-camera"
                                        onClick={handleAvatarClick}
                                        style={{
                                            position: 'absolute',
                                            bottom: '0px',
                                            right: '0px',
                                            background: 'var(--color-primary)',
                                            color: '#fff',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            border: '2px solid var(--color-bg-card)',
                                            fontSize: '14px',
                                            zIndex: 2
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {(editForm.animated_avatar_url || displayUser.animated_avatar_url) && (
                            <div
                                className="cursor-pointer border-round-xl shadow-2"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    border: '2px solid var(--color-primary-light)',
                                    overflow: 'hidden',
                                    backgroundColor: 'var(--color-bg-elevated)'
                                }}
                                onClick={isOwnProfile ? () => setShowAvatarBuilder(true) : undefined}
                                title={isOwnProfile ? 'Edit animated avatar' : 'Animated avatar'}
                            >
                                <img
                                    src={editForm.animated_avatar_url || displayUser.animated_avatar_url}
                                    alt="Animated avatar"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block',
                                        animation: isOwnProfile ? 'spin-loop 2s linear infinite paused' : 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'running'}
                                    onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'paused'}
                                />
                            </div>
                        )}

                        {isEditing && !(editForm.animated_avatar_url || displayUser.animated_avatar_url) && (
                            <div
                                className="cursor-pointer border-round-xl shadow-2"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    border: '2px dashed var(--color-border)',
                                    overflow: 'hidden',
                                    backgroundColor: 'var(--color-bg-elevated)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onClick={() => setShowAvatarBuilder(true)}
                                title="Create animated avatar"
                            >
                                <i className="pi pi-palette text-lg" style={{ color: 'var(--color-text-muted)' }}></i>
                            </div>
                        )}

                        {isEditing && (
                            <div className="flex flex-column align-items-center gap-2">
                                <Button
                                    type="button"
                                    label={uploading ? 'Uploading...' : 'Upload Photo'}
                                    icon={`pi ${uploading ? 'pi-spin pi-spinner' : 'pi-upload'}`}
                                    className="p-button-outlined p-button-sm p-button-rounded"
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={uploading}
                                />
                                <Button
                                    type="button"
                                    label="Animated Avatar"
                                    icon="pi pi-palette"
                                    className="p-button-outlined p-button-sm p-button-rounded"
                                    onClick={() => setShowAvatarBuilder(true)}
                                />
                            </div>
                        )}
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
                                <div className="flex align-items-center justify-content-center md:justify-content-start gap-4 mb-3 flex-wrap">
                                    <h1 className="text-5xl font-bold m-0" style={{ letterSpacing: '-2px', color: 'var(--color-text-main)' }}>{displayUser.full_name || displayUser.username}</h1>
                                    {!isOwnProfile && displayUser.id && (
                                        <Button
                                            label={isFollowing ? 'Following' : 'Follow'}
                                            icon={`pi ${isFollowing ? 'pi-check' : 'pi-user-plus'}`}
                                            className={`p-button-rounded ${isFollowing ? 'p-button-outlined' : ''}`}
                                            onClick={handleFollowToggle}
                                            loading={followLoading}
                                            style={{
                                                minWidth: '120px',
                                                backgroundColor: isFollowing ? 'transparent' : 'var(--color-primary)',
                                                color: isFollowing ? 'var(--color-primary)' : '#ffffff',
                                                border: `2px solid var(--color-primary)`
                                            }}
                                        />
                                    )}
                                    {isOwnProfile && currentUser && (
                                        <Button
                                            icon="pi pi-user-edit"
                                            className="p-button-rounded p-button-outlined"
                                            onClick={() => {
                                                setIsEditing(true);
                                                setEditForm({
                                                    full_name: displayUser.full_name || '',
                                                    username: displayUser.username || '',
                                                    email: displayUser.email || '',
                                                    biography: displayUser.biography || '',
                                                    avatar_url: displayUser.avatar_url || '',
                                                    animated_avatar_url: displayUser.animated_avatar_url || ''
                                                });
                                            }}
                                        />
                                    )}
                                </div>
                                <span className="text-2xl mb-4 block font-medium" style={{ color: 'var(--color-text-sub)' }}>@{displayUser.username}</span>
                                {displayUser.biography && (
                                    <p className="text-xl line-height-4 max-w-35rem mx-auto md:mx-0" style={{ color: 'var(--color-text-sub)' }}>
                                        {displayUser.biography}
                                    </p>
                                )}
<div className="flex align-items-center gap-4 mt-3">
                                     {/* Display following count - shows how many users this profile follows */}
                                     <div className="text-center">
                                         <span className="font-bold text-xl block" style={{ color: 'var(--color-text-main)' }}>{displayUser.following_count || 0}</span>
                                         <span className="text-sm" style={{ color: 'var(--color-text-sub)' }}>Following</span>
                                     </div>
                                     {/* Display followers count - shows how many users follow this profile */}
                                     <div className="text-center">
                                         <span className="font-bold text-xl block" style={{ color: 'var(--color-text-main)' }}>{displayUser.followers_count || 0}</span>
                                         <span className="text-sm" style={{ color: 'var(--color-text-sub)' }}>Followers</span>
                                     </div>
                                     {/* Display posts count - shows total posts by this user */}
                                     <div className="text-center">
                                         <span className="font-bold text-xl block" style={{ color: 'var(--color-text-main)' }}>{userPosts.length}</span>
                                         <span className="text-sm" style={{ color: 'var(--color-text-sub)' }}>Posts</span>
                                     </div>
                                 </div>
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
                                    <span className="text-sm" style={{ color: 'var(--color-text-sub)' }}>{formatDate(item.created_at)}</span>
                                </div>
                                <p className="m-0" style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-sub)' }}>{item.summary}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="m-0" style={{ color: 'var(--color-text-muted)' }}>No activity yet.</p>
                )}
            </div>

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

            <Dialog
                header="Create Your Animated Avatar"
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
                            setEditForm(prev => ({ ...prev, animated_avatar_url: avatarUrl }));
                            showToast('Animated avatar created! Save profile to apply.');
                        }
                        setShowAvatarBuilder(false);
                    }}
                />
            </Dialog>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    );
};

export default ProfilePage;
