import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { draftService } from '../services/draftService.js';

const router = express.Router();

// Create a new draft
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { type, content, mediaUrls, scheduledFor, recurrence } = req.body;
        const draft = await draftService.createDraft({
            userId: req.user.id,
            type,
            content,
            mediaUrls: mediaUrls || [],
            scheduledFor: scheduledFor || null,
            recurrence: recurrence || null
        });
        res.status(201).json(draft);
    } catch (error) {
        console.error('Create draft error:', error);
        res.status(500).json({ detail: 'Internal server error creating draft' });
    }
});

// Get drafts by user ID
router.get('/', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const status = req.query.status || null;
        
        const drafts = await draftService.getDraftsByUserId(req.user.id, limit, offset, status);
        res.json(drafts);
    } catch (error) {
        console.error('Get drafts error:', error);
        res.status(500).json({ detail: 'Internal server error getting drafts' });
    }
});

// Get a specific draft by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const draft = await draftService.getDraftById(req.params.id);
        if (!draft) {
            return res.status(404).json({ detail: 'Draft not found' });
        }
        
        // Check if the draft belongs to the current user
        if (draft.author.id !== req.user.id) {
            return res.status(403).json({ detail: 'Unauthorized to access this draft' });
        }
        
        res.json(draft);
    } catch (error) {
        console.error('Get draft error:', error);
        res.status(500).json({ detail: 'Internal server error getting draft' });
    }
});

// Update a draft
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { content, mediaUrls, scheduledFor, recurrence, status } = req.body;
        const draft = await draftService.updateDraft(req.params.id, {
            content,
            mediaUrls,
            scheduledFor,
            recurrence,
            status
        });
        
        // Check if the draft belongs to the current user
        if (draft.author.id !== req.user.id) {
            return res.status(403).json({ detail: 'Unauthorized to update this draft' });
        }
        
        res.json(draft);
    } catch (error) {
        console.error('Update draft error:', error);
        if (error.status === 404) {
            return res.status(404).json({ detail: 'Draft not found' });
        }
        res.status(500).json({ detail: 'Internal server error updating draft' });
    }
});

// Delete a draft
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deleted = await draftService.deleteDraft(req.params.id);
        if (!deleted) {
            return res.status(404).json({ detail: 'Draft not found' });
        }
        
        // Note: In a more complete implementation, we would verify ownership here
        res.status(204).send();
    } catch (error) {
        console.error('Delete draft error:', error);
        res.status(500).json({ detail: 'Internal server error deleting draft' });
    }
});

// Mark a draft as posted
router.post('/:id/post', authenticateToken, async (req, res) => {
    try {
        const draft = await draftService.markAsPosted(req.params.id);
        
        // Check if the draft belongs to the current user
        if (!draft || draft.author.id !== req.user.id) {
            return res.status(404).json({ detail: 'Draft not found' });
        }
        
        res.json(draft);
    } catch (error) {
        console.error('Mark draft as posted error:', error);
        res.status(500).json({ detail: 'Internal server error marking draft as posted' });
    }
});

// Mark a draft as failed
router.post('/:id/fail', authenticateToken, async (req, res) => {
    try {
        const draft = await draftService.markAsFailed(req.params.id);
        
        // Check if the draft belongs to the current user
        if (!draft || draft.author.id !== req.user.id) {
            return res.status(404).json({ detail: 'Draft not found' });
        }
        
        res.json(draft);
    } catch (error) {
        console.error('Mark draft as failed error:', error);
        res.status(500).json({ detail: 'Internal server error marking draft as failed' });
    }
});

// Increment reminder sent (for ask-before-posting mode)
router.post('/:id/reminder-sent', authenticateToken, async (req, res) => {
    try {
        const draft = await draftService.getDraftById(req.params.id);
        
        // Check if the draft belongs to the current user
        if (!draft || draft.author.id !== req.user.id) {
            return res.status(404).json({ detail: 'Draft not found' });
        }
        
        await draftService.incrementReminderSent(req.params.id);
        res.json({ message: 'Reminder sent counter incremented' });
    } catch (error) {
        console.error('Increment reminder sent error:', error);
        res.status(500).json({ detail: 'Internal server error incrementing reminder sent' });
    }
});

// Get ready scheduled drafts (for background processing)
router.get('/ready/scheduled', async (req, res) => {
    try {
        // This endpoint would typically be called by a background worker/service
        // For security in production, you might want to add authentication or restrict to internal IPs
        const drafts = await draftService.getReadyScheduledDrafts();
        res.json(drafts);
    } catch (error) {
        console.error('Get ready scheduled drafts error:', error);
        res.status(500).json({ detail: 'Internal server error getting ready scheduled drafts' });
    }
});

export default router;