import db from '../database.js';
import { formatPost } from '../utils/formatters.js';

/**
 * Service for handling all Saved Post-related business logic and DB operations
 */
export const savedPostService = {
    /**
     * Save a post
     */
    async savePost({ userId, postId }) {
        // Check if already saved
        const existing = db.prepare(
            'SELECT 1 FROM saved_posts WHERE user_id = ? AND post_id = ?'
        ).get(userId, postId);
        
        if (existing) {
            // Already saved, return the post
            const post = await postService.getPostById(postId, userId);
            return post;
        }
        
        // Save the post
        const result = db.prepare(`
            INSERT INTO saved_posts (user_id, post_id)
            VALUES (?, ?)
        `).run(userId, postId);
        
        // Return the saved post
        const post = await postService.getPostById(postId, userId);
        return post;
    },

    /**
     * Unsave a post
     */
    async unsavePost({ userId, postId }) {
        const result = db.prepare(`
            DELETE FROM saved_posts 
            WHERE user_id = ? AND post_id = ?
        `).run(userId, postId);
        
        return result.changes > 0;
    },

    /**
     * Check if a post is saved by a user
     */
    async isSaved(userId, postId) {
        const saved = db.prepare(
            'SELECT 1 FROM saved_posts WHERE user_id = ? AND post_id = ?'
        ).get(userId, postId);
        
        return !!saved;
    },

    /**
     * Get saved posts for a user
     */
    async getSavedPosts(userId, limit = 20, offset = 0) {
        const rows = db.prepare(`
            SELECT 
                p.*, 
                u.username as author_username, 
                u.full_name as author_full_name, 
                u.avatar_url as author_avatar_url,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) > 0 as is_liked
            FROM saved_posts sp
            JOIN posts p ON sp.post_id = p.id
            LEFT JOIN users u ON p.author_id = u.id
            WHERE sp.user_id = ?
            ORDER BY sp.created_at DESC
            LIMIT ? OFFSET ?
        `).all(userId, userId, limit, offset);
        
        return rows.map(formatPost);
    },

    /**
     * Get save count for a post
     */
    async getSaveCount(postId) {
        const count = db.prepare(`
            SELECT COUNT(*) as count 
            FROM saved_posts 
            WHERE post_id = ?
        `).get(postId);
        
        return count.count;
    }
};