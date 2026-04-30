import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { savedPostService } from '../services/savedPostService.js';

const router = express.Router();

// Save a post
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.body;
        const savedPost = await savedPostService.savePost({
            userId: req.user.id,
            postId: parseInt(postId)
        });
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('Save post error:', error);
        res.status(500).json({ detail: 'Internal server error saving post' });
    }
});

// Unsave a post
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.body;
        const unsaved = await savedPostService.unsavePost({
            userId: req.user.id,
            postId: parseInt(postId)
        });
        if (!unsaved) {
            return res.status(404).json({ detail: 'Saved post not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Unsave post error:', error);
        res.status(500).json({ detail: 'Internal server error unsaving post' });
    }
});

// Check if a post is saved
router.get('/:postId/check', authenticateToken, async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const isSaved = await savedPostService.isSaved(req.user.id, postId);
        res.json({ isSaved });
    } catch (error) {
        console.error('Check saved post error:', error);
        res.status(500).json({ detail: 'Internal server error checking saved post' });
    }
});

// Get saved posts for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const savedPosts = await savedPostService.getSavedPosts(req.user.id, limit, offset);
        res.json(savedPosts);
    } catch (error) {
        console.error('Get saved posts error:', error);
        res.status(500).json({ detail: 'Internal server error getting saved posts' });
    }
});

// Get save count for a post
router.get('/:postId/count', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const count = await savedPostService.getSaveCount(postId);
        res.json({ count });
    } catch (error) {
        console.error('Get save count error:', error);
        res.status(500).json({ detail: 'Internal server error getting save count' });
    }
});

export default router;