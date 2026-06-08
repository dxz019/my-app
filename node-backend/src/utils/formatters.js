/**
 * Shared utility functions for formatting and cleaning data
 */

/**
 * Standardizes user objects for API responses, removing sensitive fields like password
 * @param {Object} row - The database row representing a user
 * @returns {Object} - Formatted user object
 */
export const formatUser = (row) => {
     if (!row) return null;
     return {
         id: row.id,
         username: row.username,
         email: row.email,
         full_name: row.full_name,
         biography: row.biography,
         avatar_url: row.avatar_url,
         animated_avatar_url: row.animated_avatar_url,
         // Follow counts - defaults to 0 if null in database
         followers_count: row.followers_count ?? 0,
         following_count: row.following_count ?? 0,
         created_at: row.created_at
     };
};

/**
 * Ensures a post object has the expected structure
 */
export const formatPost = (row) => {
    if (!row) return null;
    return {
        ...row,
        media: row.media ? JSON.parse(row.media) : [],
        author: row.author_id ? {
            id: row.author_id,
            username: row.author_username,
            full_name: row.author_full_name,
            avatar_url: row.author_avatar_url
        } : null
    };
};

/**
 * Ensures a repost object has the expected structure
 */
export const formatRepost = (row) => {
    if (!row) return null;
    return {
        ...row,
        author: row.user_id ? {
            id: row.user_id,
            username: row.username,
            full_name: row.full_name,
            avatar_url: row.avatar_url
        } : null,
        post: row.post_id ? {
            id: row.post_id,
            title: row.title,
            content: row.content,
            media: row.media ? JSON.parse(row.media) : [],
            author_id: row.author_id,
            created_at: row.post_created_at
        } : null
    };
};
