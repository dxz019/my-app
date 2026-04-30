import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { commentSchema } from '../validations/postSchema.js';
import { commentService } from '../services/commentService.js';

const router = express.Router();

// Get comments for a post (Aligned with Frontend /comments/post/:id)
router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await commentService.getCommentsByPostId(req.params.postId);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error fetching comments' });
    }
});

// Add a comment (Aligned with frontend POST /comments/)
router.post('/', authenticateToken, validate(commentSchema), async (req, res) => {
    const { post_id, content } = req.body;
    if (!post_id) return res.status(400).json({ detail: 'post_id is required' });

    try {
        const updatedComments = await commentService.createComment({
            post_id: post_id,
            author_id: req.user.id,
            content: content
        });
        res.status(201).json(updatedComments);
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ detail: 'Internal server error adding comment' });
    }
});

// Delete a comment
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const success = await commentService.deleteComment(req.params.id, req.user.id);
        if (!success) {
            return res.status(404).json({ detail: 'Comment not found or unauthorized' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error deleting comment' });
    }
});

export default router;
