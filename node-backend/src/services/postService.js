import db from '../database.js';
import { formatPost, formatRepost } from '../utils/formatters.js';

export const postService = {
    /**
     * Get all posts with author details using a single JOIN query
     * Solves the N+1 problem identified in the code review
     */
    async getAllPosts(limit = 20, offset = 0, currentUserId = null) {
        const rows = db.prepare(`
            SELECT 
                p.*, 
                u.username as author_username, 
                u.full_name as author_full_name, 
                u.avatar_url as author_avatar_url,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                ${currentUserId ? `(SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ${parseInt(currentUserId)}) > 0 as is_liked` : '0 as is_liked'}
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `).all(limit, offset);
        
        return rows.map(formatPost);
    },

    async getPostById(id, currentUserId = null) {
        const row = db.prepare(`
            SELECT 
                p.*, 
                u.username as author_username, 
                u.full_name as author_full_name, 
                u.avatar_url as author_avatar_url,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                ${currentUserId ? `(SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ${parseInt(currentUserId)}) > 0 as is_liked` : '0 as is_liked'}
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.id = ?
        `).get(id);
        
        return formatPost(row);
    },

    async createPost({ author_id, content, title, media = [] }) {
        const mediaJson = JSON.stringify(media);
        const result = db.prepare(
            'INSERT INTO posts (author_id, content, title, media) VALUES (?, ?, ?, ?)'
        ).run(author_id, content, title || 'Untitled', mediaJson);
        
        return this.getPostById(result.lastInsertRowid);
    },

    async deletePost(id, author_id) {
        const result = db.prepare('DELETE FROM posts WHERE id = ? AND author_id = ?').run(id, author_id);
        return result.changes > 0;
    },

    async searchPosts(query, currentUserId = null) {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return [];

        const prefix = `${normalizedQuery}%`;
        const contains = `%${normalizedQuery}%`;

        const rows = db.prepare(`
            SELECT 
                p.*, 
                u.username as author_username, 
                u.full_name as author_full_name, 
                u.avatar_url as author_avatar_url,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                ${currentUserId ? `(SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ${parseInt(currentUserId)}) > 0 as is_liked` : '0 as is_liked'}
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE LOWER(p.content) LIKE ? OR LOWER(p.title) LIKE ?
            ORDER BY
                CASE
                    WHEN LOWER(p.title) LIKE ? THEN 0
                    WHEN LOWER(p.content) LIKE ? THEN 1
                    ELSE 2
                END,
                p.created_at DESC
            LIMIT 20
        `).all(contains, contains, prefix, prefix);
        
        return rows.map(formatPost);
    },

    /**
     * Extract hashtags from content
     */
    extractHashtags(content) {
        if (!content) return [];
        const hashtagRegex = /#(\w+)/g;
        const matches = content.matchAll(hashtagRegex);
        const hashtags = [...matches].map(match => match[1].toLowerCase());
        return [...new Set(hashtags)]; // Remove duplicates
    },

    /**
     * Save hashtags for a post
     */
    async savePostHashtags(postId, content) {
        const hashtags = this.extractHashtags(content);
        
        for (const tag of hashtags) {
            // Insert hashtag if it doesn't exist
            const hashtagInsert = db.prepare(`
                INSERT OR IGNORE INTO hashtags (tag)
                VALUES (?)
            `).run(tag);
            
            // Get the hashtag ID
            const hashtag = db.prepare(`
                SELECT id FROM hashtags WHERE tag = ?
            `).get(tag);
            
            if (hashtag) {
                // Link post to hashtag
                db.prepare(`
                    INSERT OR IGNORE INTO post_hashtags (post_id, hashtag_id)
                    VALUES (?, ?)
                `).run(postId, hashtag.id);
            }
        }
    },

    /**
     * Get posts by hashtag
     */
    async getPostsByHashtag(tag, limit = 20, offset = 0, currentUserId = null) {
        const rows = db.prepare(`
            SELECT 
                p.*, 
                u.username as author_username, 
                u.full_name as author_full_name, 
                u.avatar_url as author_avatar_url,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                ${currentUserId ? `(SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ${parseInt(currentUserId)}) > 0 as is_liked` : '0 as is_liked'}
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            INNER JOIN post_hashtags ph ON p.id = ph.post_id
            INNER JOIN hashtags h ON ph.hashtag_id = h.id
            WHERE LOWER(h.tag) = LOWER(?)
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `).all(tag, limit, offset);
        
        return rows.map(formatPost);
    },

    /**
     * Get all hashtags
     */
    async getAllHashtags(limit = 50, offset = 0) {
        const rows = db.prepare(`
            SELECT h.*, COUNT(ph.post_id) as usage_count
            FROM hashtags h
            LEFT JOIN post_hashtags ph ON h.id = ph.hashtag_id
            GROUP BY h.id
            ORDER BY usage_count DESC, h.tag
            LIMIT ? OFFSET ?
        `).all(limit, offset);
        
        return rows;
    },

    async likePost(postId, userId) {
        db.prepare('INSERT OR IGNORE INTO likes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
        const count = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId).count;
        return { likes_count: count };
    },

    async unlikePost(postId, userId) {
        db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(postId, userId);
        const count = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId).count;
        return { likes_count: count };
    },

    /**
     * Create a repost of a post
     */
    async createRepost({ userId, postId, content = null }) {
        const result = db.prepare(
            'INSERT INTO reposts (user_id, post_id, content) VALUES (?, ?, ?)'
        ).run(userId, postId, content);
        
        return this.getRepostById(result.lastInsertRowid);
    },

    /**
     * Get a repost by ID with post and user details
     */
    async getRepostById(id) {
        const row = db.prepare(`
            SELECT 
                r.*,
                u.username,
                u.full_name,
                u.avatar_url,
                p.id as post_id,
                p.title as post_title,
                p.content as post_content,
                p.media as post_media,
                p.author_id as post_author_id,
                p.created_at as post_created_at
            FROM reposts r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN posts p ON r.post_id = p.id
            WHERE r.id = ?
        `).get(id);
        
        return formatRepost(row);
    },

    /**
     * Get reposts for a post
     */
    async getRepostsByPostId(postId, limit = 20, offset = 0) {
        const rows = db.prepare(`
            SELECT 
                r.*,
                u.username,
                u.full_name,
                u.avatar_url
            FROM reposts r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.post_id = ?
            ORDER BY r.created_at DESC, r.id DESC
            LIMIT ? OFFSET ?
        `).all(postId, limit, offset);
        
        return rows.map(formatRepost);
    },

    /**
     * Get reposts by a user
     */
    async getRepostsByUserId(userId, limit = 20, offset = 0) {
        const rows = db.prepare(`
            SELECT 
                r.*,
                u.username,
                u.full_name,
                u.avatar_url,
                p.id as post_id,
                p.title as post_title,
                p.content as post_content,
                p.image_url as post_image_url,
                p.author_id as post_author_id,
                p.created_at as post_created_at
            FROM reposts r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN posts p ON r.post_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        `).all(userId, limit, offset);
        
        return rows.map(formatRepost);
    },

    /**
     * Get repost count for a post
     */
    async getRepostCount(postId) {
        const count = db.prepare(
            'SELECT COUNT(*) as count FROM reposts WHERE post_id = ?'
        ).get(postId);
        
        return count.count;
    },

    /**
     * Check if a user has reposted a post
     */
    async hasUserReposted(userId, postId) {
        const repost = db.prepare(
            'SELECT 1 FROM reposts WHERE user_id = ? AND post_id = ?'
        ).get(userId, postId);
        
        return !!repost;
    }
};
