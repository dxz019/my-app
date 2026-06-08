import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { usersAPI, getPublicUrl } from '../services/api';

const TrendingSidebar = () => {
    const navigate = useNavigate();
    // Store suggested users to display in "Who to follow" section
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    // Loading state for initial fetch of suggested users
    const [loading, setLoading] = useState(false);
    // Track loading state per user ID for follow/unfollow button feedback
    const [followLoading, setFollowLoading] = useState({});
    // Get auth token from localStorage to check if user is logged in
    const [token] = useState(localStorage.getItem('token'));

    // Predefined trending topics displayed in the sidebar
    const trends = [
        { id: 1, topic: 'Food & Cuisine', posts: '2.4K', sub: '#DeliciousThoughts' },
        { id: 2, topic: 'Artificial Intelligence', posts: '1.8K', sub: '#FutureAI' },
        { id: 3, topic: 'Travel Adventures', posts: '1.2K', sub: '#Wanderlust' },
        { id: 4, topic: 'Web Development', posts: '950', sub: '#CodeLife' },
        { id: 5, topic: 'Design Trends', posts: '820', sub: '#Minimalist' }
    ];

    // Fetch 4 random suggested users on component mount
    useEffect(() => {
        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const users = await usersAPI.getSuggestedUsers(4);
                setSuggestedUsers(users);
            } catch (error) {
                console.error('Failed to fetch suggested users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    // Handle follow/unfollow toggle for a user
    const handleFollow = async (e, userId) => {
        // Prevent click from bubbling to parent (which navigates to profile)
        e.stopPropagation();
        // Redirect to login if user is not authenticated
        if (!token) {
            navigate('/login');
            return;
        }
        // Set loading state for this specific user's button
        setFollowLoading(prev => ({ ...prev, [userId]: true }));
        try {
            // Check current follow status to determine action
            const user = suggestedUsers.find(u => u.id === userId);
            if (user?.isFollowing) {
                // User is already followed - unfollow them
                const result = await usersAPI.unfollow(userId);
                // Update local state: remove isFollowing and update follower count
                setSuggestedUsers(prev => prev.map(u => 
                    u.id === userId 
                        ? { ...u, isFollowing: false, followers_count: result?.user?.followers_count ?? u.followers_count } 
                        : u
                ));
            } else {
                // User is not followed - follow them
                const result = await usersAPI.toggleFollow(userId);
                // Update local state: mark as following and update follower count
                setSuggestedUsers(prev => prev.map(u => 
                    u.id === userId 
                        ? { ...u, isFollowing: true, followers_count: result?.user?.followers_count ?? u.followers_count } 
                        : u
                ));
            }
            // Dispatch custom event to notify header to refresh current user stats
            window.dispatchEvent(new CustomEvent('user-followed'));
        } catch (error) {
            console.error('Follow error:', error);
        } finally {
            // Clear loading state for this user's button
            setFollowLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    return (
        <div className="flex flex-column gap-4 sticky" style={{ top: '100px', maxWidth: '350px' }}>
            {/* Trending Section */}
            <div className="surface-card p-4 shadow-3 border-round-2xl border-1 surface-border">
                <h2 className="text-xl font-bold mb-4 px-2 text-color" style={{ letterSpacing: '-0.5px' }}>
                    Trending Thoughts
                </h2>

                <div className="flex flex-column gap-2">
                    {trends.map((trend) => (
                        <div 
                            key={trend.id}
                            className="flex flex-column gap-1 p-3 border-round-xl cursor-pointer hover:bg-black-alpha-10 transition-all transition-duration-200"
                            onClick={() => {
                                 const tag = trend.sub.replace('#', '');
                                 navigate(`/explore?tag=${tag}`);
                            }}
                        >
                            <div className="flex align-items-center justify-content-between">
                                <span className="text-sm font-semibold text-primary">{trend.sub}</span>
                                <i className="pi pi-chart-line text-xs text-primary"></i>
                            </div>
                            <span className="text-base font-bold text-color">{trend.topic}</span>
                            <span className="text-xs text-color-secondary">{trend.posts} Thoughts today</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Who to Follow Section */}
            <div className="surface-card p-4 shadow-3 border-round-2xl border-1 surface-border">
                <h2 className="text-xl font-bold mb-4 px-2 text-color" style={{ letterSpacing: '-0.5px' }}>
                    Who to follow
                </h2>

                <div className="flex flex-column gap-3">
                    {loading ? (
                        <div className="flex justify-content-center p-4">
                            <i className="pi pi-spin pi-spinner text-primary"></i>
                        </div>
                    ) : (
                        suggestedUsers.map((user) => (
                            <div key={user.id} className="flex align-items-center justify-content-between gap-2 p-2 hover:bg-black-alpha-5 border-round-xl transition-all">
                                <div className="flex align-items-center gap-3 cursor-pointer overflow-hidden" onClick={() => navigate(`/profile/${user.id}`)}>
                                    <Avatar 
                                        image={getPublicUrl(user.avatar_url)} 
                                        label={!user.avatar_url ? user.username.charAt(0).toUpperCase() : null}
                                        shape="circle" 
                                        style={{ backgroundColor: 'var(--color-primary)', color: '#fff', flexShrink: 0 }}
                                    />
                                    <div className="flex flex-column overflow-hidden">
                                        <span className="text-sm font-bold text-color white-space-nowrap overflow-hidden text-overflow-ellipsis">{user.full_name || user.username}</span>
                                        <span className="text-xs text-color-secondary overflow-hidden text-overflow-ellipsis">@{user.username}</span>
                                    </div>
                                </div>
                                <Button 
                                    label={user.isFollowing ? "Following" : "Follow"} 
                                    className={`p-button-sm p-button-rounded ${user.isFollowing ? 'p-button-success' : 'p-button-outlined'}`}
                                    loading={followLoading[user.id]}
                                    onClick={(e) => handleFollow(e, user.id)}
                                />
                            </div>
                        ))
                    )}
                    <div className="px-2 mt-2">
                        <span className="text-primary text-sm font-semibold cursor-pointer hover:underline">Show more</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingSidebar;