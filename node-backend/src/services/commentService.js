import db from '../database.js';

export const commentService = {
    async getCommentsByPostId(postId) {
        const rows = db.prepare(`
            SELECT 
                c.*, 
                u.username as author_username, 
                u.full_name as author_full_name, 
                u.avatar_url as author_avatar_url,
                (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes_count
            FROM comments c
            LEFT JOIN users u ON c.author_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `).all(postId);
        
        return rows.map(row => ({
            ...row,
            author: {
                id: row.author_id,
                username: row.author_username,
                full_name: row.author_full_name,
                avatar_url: row.author_avatar_url
            }
        }));
    },

    async createComment({ post_id, author_id, content }) {
        db.prepare(
            'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)'
        ).run(post_id, author_id, content);
        
        return this.getCommentsByPostId(post_id);
    },

    async deleteComment(id, author_id) {
        const result = db.prepare('DELETE FROM comments WHERE id = ? AND author_id = ?').run(id, author_id);
        return result.changes > 0;
    }
};
