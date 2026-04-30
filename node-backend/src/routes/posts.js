import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { postSchema } from '../validations/postSchema.js';
import { postService } from '../services/postService.js';

const router = express.Router();

// Get all posts
router.get('/', optionalAuth, async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const posts = await postService.getAllPosts(limit, offset, req.user?.id);
        res.json(posts);
    } catch (error) {
        console.error('Fetch posts error:', error);
        res.status(500).json({ detail: 'Internal server error fetching thoughts' });
    }
});

// Create a new post
router.post('/', authenticateToken, validate(postSchema), async (req, res) => {
    try {
        const newPost = await postService.createPost({
            author_id: req.user.id,
            ...req.body
        });
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ detail: 'Internal server error creating thought' });
    }
});

// Delete a post
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const success = await postService.deletePost(req.params.id, req.user.id);
        if (!success) {
            return res.status(404).json({ detail: 'Thought not found or unauthorized' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error deleting thought' });
    }
});

// Search posts
router.get('/search/all', optionalAuth, async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);

    try {
        const posts = await postService.searchPosts(query, req.user?.id);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error during search' });
    }
});

// Like a post
router.post('/:id/like', authenticateToken, async (req, res) => {
    try {
        const result = await postService.likePost(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ detail: 'Internal server error liking post' });
    }
});

// Unlike a post
router.delete('/:id/like', authenticateToken, async (req, res) => {
    try {
        const result = await postService.unlikePost(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Unlike error:', error);
        res.status(500).json({ detail: 'Internal server error unliking post' });
    }
});

// Repost a post
router.post('/:id/repost', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        const repost = await postService.createRepost({
            userId: req.user.id,
            postId: parseInt(req.params.id),
            content
        });
        res.status(201).json(repost);
    } catch (error) {
        console.error('Repost error:', error);
        res.status(500).json({ detail: 'Internal server error creating repost' });
    }
});

// Get reposts for a post
router.get('/:id/reposts', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const reposts = await postService.getRepostsByPostId(postId, limit, offset);
        res.json(reposts);
    } catch (error) {
        console.error('Get reposts error:', error);
        res.status(500).json({ detail: 'Internal server error getting reposts' });
    }
});

// Get repost count for a post
router.get('/:id/repost-count', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const count = await postService.getRepostCount(postId);
        res.json({ count });
    } catch (error) {
        console.error('Get repost count error:', error);
        res.status(500).json({ detail: 'Internal server error getting repost count' });
    }
});

// Check if user has reposted a post
router.get('/:id/user-reposted', authenticateToken, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;
        
        const hasReposted = await postService.hasUserReposted(userId, postId);
        res.json({ hasReposted });
    } catch (error) {
        console.error('Check user repost error:', error);
        res.status(500).json({ detail: 'Internal server error checking user repost' });
    }
});

// Get posts by hashtag
router.get('/hashtag/:tag', optionalAuth, async (req, res) => {
    try {
        const tag = req.params.tag;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const posts = await postService.getPostsByHashtag(tag, limit, offset, req.user?.id);
        res.json(posts);
    } catch (error) {
        console.error('Get posts by hashtag error:', error);
        res.status(500).json({ detail: 'Internal server error getting posts by hashtag' });
    }
});

// Get all hashtags
router.get('/hashtags', optionalAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const hashtags = await postService.getAllHashtags(limit, offset);
        res.json(hashtags);
    } catch (error) {
        console.error('Get all hashtags error:', error);
        res.status(500).json({ detail: 'Internal server error getting all hashtags' });
    }
});


export default router;
