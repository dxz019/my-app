import db from '../database.js';
import { formatUser } from '../utils/formatters.js';

/**
 * Service for handling all Draft-related business logic and DB operations
 */
export const draftService = {
    /**
     * Create a new draft
     */
    async createDraft({ userId, type, content, mediaUrls = [], scheduledFor = null, recurrence = null }) {
        const mediaUrlsJson = JSON.stringify(mediaUrls);
        const result = db.prepare(`
            INSERT INTO drafts (user_id, type, content, media_urls, scheduled_for, recurrence)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, type, content, mediaUrlsJson, scheduledFor, recurrence);
        
        return this.getDraftById(result.lastInsertRowid);
    },

    /**
     * Get a draft by ID
     */
    async getDraftById(id) {
        const row = db.prepare(`
            SELECT 
                d.*,
                u.username,
                u.full_name,
                u.avatar_url
            FROM drafts d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        `).get(id);
        
        if (!row) return null;
        
        return {
            ...row,
            media_urls: row.media_urls ? JSON.parse(row.media_urls) : [],
            author: {
                id: row.user_id,
                username: row.username,
                full_name: row.full_name,
                avatar_url: row.avatar_url
            }
        };
    },

    /**
     * Get drafts by user ID
     */
    async getDraftsByUserId(userId, limit = 20, offset = 0, status = null) {
        let query = `
            SELECT 
                d.*,
                u.username,
                u.full_name,
                u.avatar_url
            FROM drafts d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.user_id = ?
        `;
        const params = [userId];
        
        if (status) {
            query += ' AND d.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY d.updated_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const rows = db.prepare(query).all(...params);
        
        return rows.map(row => ({
            ...row,
            media_urls: row.media_urls ? JSON.parse(row.media_urls) : [],
            author: {
                id: row.user_id,
                username: row.username,
                full_name: row.full_name,
                avatar_url: row.avatar_url
            }
        }));
    },

    /**
     * Get scheduled drafts that are ready to be processed
     */
    async getReadyScheduledDrafts() {
        const now = new Date().toISOString();
        const rows = db.prepare(`
            SELECT 
                d.*,
                u.username,
                u.full_name,
                u.avatar_url
            FROM drafts d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.status = 'scheduled' 
            AND d.scheduled_for <= ?
            ORDER BY d.scheduled_for ASC
        `).all(now);
        
        return rows.map(row => ({
            ...row,
            media_urls: row.media_urls ? JSON.parse(row.media_urls) : [],
            author: {
                id: row.user_id,
                username: row.username,
                full_name: row.full_name,
                avatar_url: row.avatar_url
            }
        }));
    },

    /**
     * Update a draft
     */
    async updateDraft(id, { content, mediaUrls, scheduledFor, recurrence, status }) {
        const draft = await this.getDraftById(id);
        if (!draft) {
            const error = new Error('Draft not found');
            error.status = 404;
            throw error;
        }
        
        const mediaUrlsJson = JSON.stringify(mediaUrls !== undefined ? mediaUrls : draft.media_urls);
        
        db.prepare(`
            UPDATE drafts SET
                content = COALESCE(?, content),
                media_urls = ?,
                scheduled_for = COALESCE(?, scheduled_for),
                recurrence = COALESCE(?, recurrence),
                status = COALESCE(?, status),
                updated_at = datetime('now')
            WHERE id = ?
        `).run(
            content,
            mediaUrlsJson,
            scheduledFor,
            recurrence,
            status,
            id
        );
        
        return this.getDraftById(id);
    },

    /**
     * Delete a draft
     */
    async deleteDraft(id) {
        const result = db.prepare('DELETE FROM drafts WHERE id = ?').run(id);
        return result.changes > 0;
    },

    /**
     * Mark a draft as posted
     */
    async markAsPosted(id) {
        return this.updateDraft(id, { status: 'posted' });
    },

    /**
     * Mark a draft as failed
     */
    async markAsFailed(id) {
        return this.updateDraft(id, { status: 'failed' });
    },

    /**
     * Increment reminder sent counter
     */
    async incrementReminderSent(id) {
        db.prepare(`
            UPDATE drafts SET
                reminder_sent = reminder_sent + 1,
                updated_at = datetime('now')
            WHERE id = ?
        `).run(id);
    }
};