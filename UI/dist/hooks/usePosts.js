import { useState, useEffect, useCallback } from 'react';
import { postsAPI } from '../services/api';
export const usePosts = (token, currentUser) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await postsAPI.getAllPosts();
            setPosts(data);
        }
        catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    }, [token]);
    // Fetch posts on mount
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);
    const createPost = useCallback(async (content, media = []) => {
        if (!token || !currentUser) {
            throw new Error('Must be logged in to create a post');
        }
        // Ensure media is always an array
        const mediaArray = Array.isArray(media) ? media : (media ? [media] : []);
        const postData = {
            title: 'Post',
            content,
            media: mediaArray,
            author_id: currentUser.id,
        };
        await postsAPI.createPost(postData);
        await fetchPosts(); // Refresh posts after creation
    }, [token, currentUser, fetchPosts]);
    const updatePostLikes = useCallback(async (postId, isUnlike) => {
        if (!token || !currentUser) {
            throw new Error('Must be logged in to like a post');
        }
        if (isUnlike) {
            const result = await postsAPI.unlikePost(postId);
            // Optimistically update the posts state
            setPosts(prevPosts => prevPosts.map(post => post.id === postId ? { ...post, likes_count: result.likes_count, is_liked: false } : post));
            return result;
        }
        else {
            const result = await postsAPI.likePost(postId);
            // Optimistically update the posts state
            setPosts(prevPosts => prevPosts.map(post => post.id === postId ? { ...post, likes_count: result.likes_count, is_liked: true } : post));
            return result;
        }
    }, [token, currentUser]);
    const getUserPosts = useCallback(async (userId) => {
        setLoading(true);
        try {
            const data = await postsAPI.getUserPosts(userId);
            return data;
        }
        catch (err) {
            console.error('Error fetching user posts:', err);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const getFilteredPosts = useCallback((filterType, searchedUser = null) => {
        if (!token || !currentUser)
            return posts;
        if (filterType === 'profile') {
            // If there's a searched user, show their posts
            if (searchedUser) {
                return posts.filter(post => post.author_id === searchedUser.id);
            }
            // Otherwise show current user's posts
            return posts.filter(post => post.author_id === currentUser.id);
        }
        else {
            // Home page: show ALL posts
            return posts;
        }
    }, [token, currentUser, posts]);
    return {
        posts,
        loading,
        error,
        fetchPosts,
        createPost,
        updatePostLikes,
        getUserPosts,
        getFilteredPosts,
    };
};
export default usePosts;
