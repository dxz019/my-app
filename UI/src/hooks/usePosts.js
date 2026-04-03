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
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch posts on mount
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const createPost = useCallback(async (content) => {
        if (!token || !currentUser) {
            throw new Error('Must be logged in to create a post');
        }

        const postData = {
            title: 'Post',
            content,
            author_id: currentUser.id,
        };

        await postsAPI.createPost(postData);
        await fetchPosts(); // Refresh posts after creation
    }, [token, currentUser, fetchPosts]);

    const getUserPosts = useCallback(async (userId) => {
        setLoading(true);
        try {
            const data = await postsAPI.getUserPosts(userId);
            return data;
        } catch (err) {
            console.error('Error fetching user posts:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getFilteredPosts = useCallback((filterType, searchedUser = null) => {
        if (!token || !currentUser) return posts;

        if (filterType === 'profile') {
            // If there's a searched user, show their posts
            if (searchedUser) {
                return posts.filter(post => post.author_id === searchedUser.id);
            }
            // Otherwise show current user's posts
            return posts.filter(post => post.author_id === currentUser.id);
        } else {
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
        getUserPosts,
        getFilteredPosts,
    };
};

export default usePosts;
