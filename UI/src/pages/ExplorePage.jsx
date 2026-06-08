import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import useComments from '../hooks/useComments';
import TrendingSidebar from '../components/TrendingSidebar';
import { Button } from 'primereact/button';
import { getErrorMessage } from '../services/api';

const ExplorePage = ({ posts: propPosts, token, currentUser, showToast, fetchPosts, requireAuth, updatePostLikes }) => {
    const { comments, fetchCommentsForPosts, addComment } = useComments(token, currentUser);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTag = searchParams.get('tag');
    const activeQuery = (searchParams.get('query') || '').trim();
    const [showComments, setShowComments] = useState({});

    // Sort posts by "Trending" logic: Likes + Comments count
    const trendingPosts = useMemo(() => {
        if (!propPosts) return [];
        let filtered = [...propPosts];

        // If a tag is active, filter by tag content
        if (activeTag) {
            const tagLower = activeTag.toLowerCase();
            filtered = filtered.filter(post =>
                post.content.toLowerCase().includes(`#${tagLower}`) ||
                post.content.toLowerCase().includes(tagLower)
            );
        }

        if (activeQuery) {
            const normalizedQuery = activeQuery.toLowerCase();
            filtered = filtered.filter((post) =>
                post.content.toLowerCase().includes(normalizedQuery) ||
                (post.title || '').toLowerCase().includes(normalizedQuery) ||
                (post.author?.username || '').toLowerCase().includes(normalizedQuery) ||
                (post.author?.full_name || '').toLowerCase().includes(normalizedQuery)
            );
        }

        return filtered.sort((a, b) => {
            const scoreA = (a.likes_count || 0) * 2 + (a.comments_count || 0);
            const scoreB = (b.likes_count || 0) * 2 + (b.comments_count || 0);
            return scoreB - scoreA;
        });
    }, [propPosts, activeTag, activeQuery]);

    // Automatic parallel comment fetching removed here to drastically speed up UI.
    // Comments are now only fetched dynamically upon toggling.

    const handleToggleComments = (postId) => {
        if (!showComments[postId]) {
            fetchCommentsForPosts([postId]);
        }
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    return (
        <div className="w-full" style={{ padding: '100px 2rem 3rem' }}>
            <div className="flex align-items-center justify-content-between mb-6 px-2">
                <div className="flex align-items-center gap-3">
                    <i className={`pi ${activeTag ? 'pi-hashtag' : 'pi-chart-line'} text-4xl text-primary`}></i>
                    <div>
                        <h1 className="text-4xl font-bold m-0 text-color">
                            {activeTag ? `Thoughts on #${activeTag}` : activeQuery ? `Results for "${activeQuery}"` : 'Explore Trending'}
                        </h1>
                        <p className="text-lg text-500 m-0 mt-1">
                            {activeTag
                                ? `Showing all top thoughts tagged with #${activeTag}`
                                : activeQuery
                                    ? `Showing thoughts and people related to "${activeQuery}"`
                                    : "Discover what's sparking conversations across the platform"
                            }
                        </p>
                    </div>
                </div>
                {(activeTag || activeQuery) && (
                    <Button
                        label="Clear Filter"
                        icon="pi pi-times"
                        className="p-button-text p-button-rounded p-button-plain text-primary"
                        onClick={() => setSearchParams({})}
                    />
                )}
            </div>

            <div className="flex flex-column gap-4">
                <div className="grid">
                    {trendingPosts.map((post) => (
                        <div key={post.id} className="col-12">
                            <PostCard
                                key={post.id}
                                post={post}
                                currentUser={currentUser}
                                token={token}
                                comments={comments}
                                showComments={showComments}
                                onToggleComments={handleToggleComments}
                                onAddComment={async (postId, text) => {
                                    if (!requireAuth()) return;
                                    try {
                                        await addComment(postId, text);
                                        await fetchPosts();
                                        showToast('Comment added!');
                                    } catch (error) {
                                        showToast(getErrorMessage(error, 'Failed to add comment'));
                                        throw error;
                                    }
                                }}
                                onDeletePost={fetchPosts}
                                onDeleteComment={async (postId) => {
                                    await fetchCommentsForPosts([postId], true);
                                    await fetchPosts();
                                }}
                                onUpdatePostLikes={updatePostLikes}
                                requireAuth={requireAuth}
                            />
                        </div>
                    ))}
                </div>

                {trendingPosts.length === 0 && (
                    <div className="surface-card p-8 border-round-2xl text-center border-1 surface-border shadow-1 mt-4">
                        <i className="pi pi-search text-primary text-6xl mb-4 block"></i>
                        <h2 className="text-2xl font-bold mb-2">No trending thoughts detected yet.</h2>
                        <p className="text-lg text-500 mb-5">Try searching for something else or explore different tags.</p>
                    </div>
                )}
            </div>
        </div>
    );

};

export default ExplorePage;
