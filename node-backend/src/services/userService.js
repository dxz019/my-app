import db from '../database.js';
import bcrypt from 'bcryptjs';
import { formatUser } from '../utils/formatters.js';

/**
 * Service for handling all User-related business logic and DB operations
 */
export const userService = {
    /**
     * Finds a user by ID
     */
    async getUserById(id) {
        const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        return formatUser(row);
    },

    /**
     * Finds a user by Email or Username (for login)
     */
    async getUserByLogin(identifier) {
        // Case-insensitive lookup for email or username
        const row = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE').get(identifier, identifier);
        return row; // returns full row including password
    },

    /**
     * Checks if a user exists by username or email (Case-insensitive)
     */
    async userExists(username, email) {
        return db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE').get(username, email);
    },

    /**
     * Creates a new user
     */
    async createUser({ username, email, password, full_name }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = db.prepare(
            'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)'
        ).run(username, email, hashedPassword, full_name);
        
        return this.getUserById(result.lastInsertRowid);
    },

    /**
     * Updates a user profile
     */
    async updateUser(id, { full_name, username, email, biography, avatar_url }) {
        const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

        if (!existingUser) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        const mergedUser = {
            full_name: full_name ?? existingUser.full_name,
            username: username ?? existingUser.username,
            email: email ?? existingUser.email,
            biography: biography ?? existingUser.biography,
            avatar_url: avatar_url ?? existingUser.avatar_url
        };

        try {
            db.prepare(
                'UPDATE users SET full_name = ?, username = ?, email = ?, biography = ?, avatar_url = ? WHERE id = ?'
            ).run(
                mergedUser.full_name,
                mergedUser.username,
                mergedUser.email,
                mergedUser.biography,
                mergedUser.avatar_url,
                id
            );
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                const friendlyError = new Error('Username or email already exists');
                friendlyError.status = 400;
                throw friendlyError;
            }
            throw error;
        }

        return this.getUserById(id);
    },

    async getUserActivity(userId, limit = 25) {
        const activity = db.prepare(`
            SELECT * FROM (
                SELECT
                    'post' AS type,
                    p.id AS entity_id,
                    p.id AS post_id,
                    p.title AS title,
                    p.content AS summary,
                    p.created_at AS created_at
                FROM posts p
                WHERE p.author_id = ?

                UNION ALL

                SELECT
                    'comment' AS type,
                    c.id AS entity_id,
                    c.post_id AS post_id,
                    p.title AS title,
                    c.content AS summary,
                    c.created_at AS created_at
                FROM comments c
                JOIN posts p ON p.id = c.post_id
                WHERE c.author_id = ?

                UNION ALL

                SELECT
                    'like' AS type,
                    l.id AS entity_id,
                    p.id AS post_id,
                    p.title AS title,
                    p.content AS summary,
                    l.created_at AS created_at
                FROM likes l
                JOIN posts p ON p.id = l.post_id
                WHERE l.user_id = ?
            )
            ORDER BY datetime(created_at) DESC, entity_id DESC
            LIMIT ?
        `).all(userId, userId, userId, limit);

        return activity;
    },

    /**
     * Search users by name or username
     */
    async searchUsers(query) {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return [];

        const prefix = `${normalizedQuery}%`;
        const contains = `%${normalizedQuery}%`;

        const rows = db.prepare(`
            SELECT *
            FROM users
            WHERE LOWER(username) LIKE ? OR LOWER(full_name) LIKE ?
            ORDER BY
                CASE
                    WHEN LOWER(username) LIKE ? THEN 0
                    WHEN LOWER(full_name) LIKE ? THEN 1
                    ELSE 2
                END,
                username COLLATE NOCASE ASC
            LIMIT 10
        `).all(contains, contains, prefix, prefix);
        
        return rows.map(formatUser);
    },

    /**
     * Follow a user
     */
    async followUser(followerId, followedId) {
        // Prevent self-following
        if (followerId === followedId) {
            const error = new Error('Cannot follow yourself');
            error.status = 400;
            throw error;
        }

        // Check if already following
        const existingFollow = db.prepare(
            'SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ?'
        ).get(followerId, followedId);

        if (existingFollow) {
            return; // Already following
        }

        // Create the follow relationship
        db.prepare(
            'INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)'
        ).run(followerId, followedId);
    },

    /**
     * Unfollow a user
     */
    async unfollowUser(followerId, followedId) {
        db.prepare(
            'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?'
        ).run(followerId, followedId);
    },

    /**
     * Check if a user is following another user
     */
    async isFollowing(followerId, followedId) {
        const follow = db.prepare(
            'SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ?'
        ).get(followerId, followedId);
        
        return !!follow;
    },

    /**
     * Get followers of a user
     */
    async getFollowers(userId, limit = 25, offset = 0) {
        const rows = db.prepare(`
            SELECT u.* FROM users u
            JOIN follows f ON u.id = f.follower_id
            WHERE f.followed_id = ?
            ORDER BY f.created_at DESC
            LIMIT ? OFFSET ?
        `).all(userId, limit, offset);
        
        return rows.map(formatUser);
    },

    /**
     * Get users that a user is following
     */
    async getFollowing(userId, limit = 25, offset = 0) {
        const rows = db.prepare(`
            SELECT u.* FROM users u
            JOIN follows f ON u.id = f.followed_id
            WHERE f.follower_id = ?
            ORDER BY f.created_at DESC
            LIMIT ? OFFSET ?
        `).all(userId, limit, offset);
        
        return rows.map(formatUser);
    },

    /**
     * Get follower count for a user
     */
    async getFollowerCount(userId) {
        const count = db.prepare(
            'SELECT COUNT(*) as count FROM follows WHERE followed_id = ?'
        ).get(userId);
        
        return count.count;
    },

    /**
     * Get following count for a user
     */
    async getFollowingCount(userId) {
        const count = db.prepare(
            'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?'
        ).get(userId);
        
        return count.count;
    },

    /**
     * Get suggested users to follow (random)
     */
    async getSuggestedUsers(excludeUserId, limit = 5) {
        const rows = db.prepare(`
            SELECT * FROM users 
            WHERE id != ? 
            ORDER BY RANDOM() 
            LIMIT ?
        `).all(excludeUserId || -1, limit);
        return rows.map(formatUser);
    }
};
