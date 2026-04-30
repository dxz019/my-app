import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { directMessageService } from '../services/directMessageService.js';

const router = express.Router();

// Send a direct message
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const message = await directMessageService.sendMessage({
            senderId: req.user.id,
            receiverId: parseInt(receiverId),
            content
        });
        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        if (error.status === 400) {
            return res.status(400).json({ detail: error.message });
        }
        if (error.status === 404) {
            return res.status(404).json({ detail: 'User not found' });
        }
        res.status(500).json({ detail: 'Internal server error sending message' });
    }
});

// Get conversation between two users
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
    try {
        const otherUserId = parseInt(req.params.userId);
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const conversation = await directMessageService.getConversation(
            req.user.id, 
            otherUserId, 
            limit, 
            offset
        );
        res.json(conversation);
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ detail: 'Internal server error getting conversation' });
    }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const count = await directMessageService.getUnreadMessageCount(req.user.id);
        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ detail: 'Internal server error getting unread count' });
    }
});

// Mark messages as read
router.post('/read', authenticateToken, async (req, res) => {
    try {
        const { messageIds } = req.body;
        if (!Array.isArray(messageIds)) {
            return res.status(400).json({ detail: 'messageIds must be an array' });
        }
        
        const result = await directMessageService.markAsRead(messageIds, req.user.id);
        res.json(result);
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ detail: 'Internal server error marking messages as read' });
    }
});

// Delete a direct message
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deleted = await directMessageService.deleteMessage(req.params.id, req.user.id);
        if (!deleted) {
            return res.status(404).json({ detail: 'Message not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Delete message error:', error);
        if (error.status === 403) {
            return res.status(403).json({ detail: 'Unauthorized to delete this message' });
        }
        if (error.status === 404) {
            return res.status(404).json({ detail: 'Message not found' });
        }
        res.status(500).json({ detail: 'Internal server error deleting message' });
    }
});

// Get recent conversations
router.get('/recent', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const conversations = await directMessageService.getRecentConversations(
            req.user.id,
            limit,
            offset
        );
        res.json(conversations);
    } catch (error) {
        console.error('Get recent conversations error:', error);
        res.status(500).json({ detail: 'Internal server error getting recent conversations' });
    }
});

export default router;