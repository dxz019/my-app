import db from '../database.js';
import { formatUser } from '../utils/formatters.js';

/**
 * Service for handling all Direct Message-related business logic and DB operations
 */
export const directMessageService = {
    /**
     * Send a direct message
     */
    async sendMessage({ senderId, receiverId, content }) {
        // Validate that users exist
        const senderExists = db.prepare('SELECT 1 FROM users WHERE id = ?').get(senderId);
        const receiverExists = db.prepare('SELECT 1 FROM users WHERE id = ?').get(receiverId);
        
        if (!senderExists || !receiverExists) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        
        // Prevent sending messages to oneself (optional - could allow this)
        if (senderId === receiverId) {
            const error = new Error('Cannot send message to yourself');
            error.status = 400;
            throw error;
        }
        
        const result = db.prepare(`
            INSERT INTO direct_messages (sender_id, receiver_id, content)
            VALUES (?, ?, ?)
        `).run(senderId, receiverId, content);
        
        return this.getMessageById(result.lastInsertRowid);
    },

    /**
     * Get a direct message by ID
     */
    async getMessageById(id) {
        const row = db.prepare(`
            SELECT 
                dm.*,
                s.username as sender_username,
                s.full_name as sender_full_name,
                s.avatar_url as sender_avatar_url,
                r.username as receiver_username,
                r.full_name as receiver_full_name,
                r.avatar_url as receiver_avatar_url
            FROM direct_messages dm
            LEFT JOIN users s ON dm.sender_id = s.id
            LEFT JOIN users r ON dm.receiver_id = r.id
            WHERE dm.id = ?
        `).get(id);
        
        if (!row) return null;
        
        return {
            ...row,
            sender: {
                id: row.sender_id,
                username: row.sender_username,
                full_name: row.sender_full_name,
                avatar_url: row.sender_avatar_url
            },
            receiver: {
                id: row.receiver_id,
                username: row.receiver_username,
                full_name: row.receiver_full_name,
                avatar_url: row.receiver_avatar_url
            }
        };
    },

    /**
     * Get messages between two users (conversation)
     */
    async getConversation(userId1, userId2, limit = 50, offset = 0) {
        const rows = db.prepare(`
            SELECT 
                dm.*,
                s.username as sender_username,
                s.full_name as sender_full_name,
                s.avatar_url as sender_avatar_url,
                r.username as receiver_username,
                r.full_name as receiver_full_name,
                r.avatar_url as receiver_avatar_url
            FROM direct_messages dm
            LEFT JOIN users s ON dm.sender_id = s.id
            LEFT JOIN users r ON dm.receiver_id = r.id
            WHERE 
                (dm.sender_id = ? AND dm.receiver_id = ?) OR
                (dm.sender_id = ? AND dm.receiver_id = ?)
            ORDER BY dm.created_at DESC
            LIMIT ? OFFSET ?
        `).all(userId1, userId2, userId2, userId1, limit, offset);
        
        return rows.map(row => ({
            ...row,
            sender: {
                id: row.sender_id,
                username: row.sender_username,
                full_name: row.sender_full_name,
                avatar_url: row.sender_avatar_url
            },
            receiver: {
                id: row.receiver_id,
                username: row.receiver_username,
                full_name: row.receiver_full_name,
                avatar_url: row.receiver_avatar_url
            }
        }));
    },

    /**
     * Get unread message count for a user
     */
    async getUnreadMessageCount(userId) {
        const count = db.prepare(`
            SELECT COUNT(*) as count 
            FROM direct_messages 
            WHERE receiver_id = ? AND is_read = 0
        `).get(userId);
        
        return count.count;
    },

    /**
     * Mark messages as read
     */
    async markAsRead(messageIds, userId) {
        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            return { updated: 0 };
        }
        
        // Create placeholders for the IN clause
        const placeholders = messageIds.map(() => '?').join(',');
        const query = `
            UPDATE direct_messages 
            SET is_read = 1 
            WHERE id IN (${placeholders}) AND receiver_id = ?
        `;
        
        const result = db.prepare(query).run(...messageIds, userId);
        return { updated: result.changes };
    },

    /**
     * Delete a direct message
     */
    async deleteMessage(id, userId) {
        // Only allow deletion if the user is either sender or receiver
        const message = await this.getMessageById(id);
        if (!message) {
            const error = new Error('Message not found');
            error.status = 404;
            throw error;
        }
        
        if (message.sender.id !== userId && message.receiver.id !== userId) {
            const error = new Error('Unauthorized to delete this message');
            error.status = 403;
            throw error;
        }
        
        const result = db.prepare('DELETE FROM direct_messages WHERE id = ?').run(id);
        return result.changes > 0;
    },

    /**
     * Get recent conversations for a user (with last message preview)
     */
    async getRecentConversations(userId, limit = 20, offset = 0) {
        // This query gets the most recent message in each conversation
        const rows = db.prepare(`
            SELECT 
                dm.*,
                s.username as sender_username,
                s.full_name as sender_full_name,
                s.avatar_url as sender_avatar_url,
                r.username as receiver_username,
                r.full_name as receiver_full_name,
                r.avatar_url as receiver_avatar_url
            FROM direct_messages dm
            LEFT JOIN users s ON dm.sender_id = s.id
            LEFT JOIN users r ON dm.receiver_id = r.id
            WHERE dm.id IN (
                SELECT MAX(id) 
                FROM direct_messages 
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY 
                    CASE 
                        WHEN sender_id = ? THEN receiver_id 
                        ELSE sender_id 
                    END
            )
            ORDER BY dm.created_at DESC
            LIMIT ? OFFSET ?
        `).all(userId, userId, userId, limit, offset);
        
        return rows.map(row => ({
            ...row,
            sender: {
                id: row.sender_id,
                username: row.sender_username,
                full_name: row.sender_full_name,
                avatar_url: row.sender_avatar_url
            },
            receiver: {
                id: row.receiver_id,
                username: row.receiver_username,
                full_name: row.receiver_full_name,
                avatar_url: row.receiver_avatar_url
            }
        }));
    }
};