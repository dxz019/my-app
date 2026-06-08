import { useState, useCallback } from 'react';
import { commentsAPI } from '../services/api';

export const useComments = (token, currentUser) => {
    const [comments, setComments] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchComments = useCallback(async (postId) => {
        setLoading(true);
        try {
            const data = await commentsAPI.getPostComments(postId);
            setComments(prev => ({ ...prev, [postId]: data }));
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCommentsForPosts = useCallback(async (postIds, forceRefresh = false) => {
        await Promise.all(postIds.map(postId => {
            if (forceRefresh || !comments[postId]) {
                return fetchComments(postId);
            }
            return Promise.resolve();
        }));
    }, [comments, fetchComments]);

    const addComment = useCallback(async (postId, content) => {
        if (!token || !currentUser) {
            throw new Error('Must be logged in to comment');
        }

        const commentData = {
            content,
            post_id: postId,
            author_id: currentUser.id,
        };

        await commentsAPI.createComment(commentData);
        await fetchComments(postId); // Refresh comments for this post
    }, [token, currentUser, fetchComments]);

    const getCommentsForPost = useCallback((postId) => {
        return comments[postId] || [];
    }, [comments]);

    const deleteComment = useCallback(async (commentId) => {
        await commentsAPI.deleteComment(commentId);
    }, []);

    const toggleComments = useCallback((postId, showComments, setShowComments) => {
        if (!showComments) {
            fetchComments(postId);
        }
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    }, [fetchComments]);

    return {
        comments,
        loading,
        fetchComments,
        fetchCommentsForPosts,
        addComment,
        deleteComment,
        getCommentsForPost,
        toggleComments,
    };
};

export default useComments;
