import db from '../database.js';

export function runMigrations() {
    // USERS TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            email           TEXT    NOT NULL UNIQUE,
            username        TEXT    NOT NULL UNIQUE,
            password        TEXT    NOT NULL, 
            full_name       TEXT,
            avatar_url      TEXT,
            biography       TEXT,
            is_active       INTEGER NOT NULL DEFAULT 1,
            is_admin        INTEGER NOT NULL DEFAULT 0,
            followers_count INTEGER NOT NULL DEFAULT 0,
            following_count INTEGER NOT NULL DEFAULT 0,
            created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    `);

    // POSTS TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS posts (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            title      TEXT    NOT NULL,
            content    TEXT    NOT NULL,
            image_url  TEXT,
            media      TEXT,   -- JSON array of media objects
            author_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TEXT    NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    `);

    // Ensure 'media' column exists for existing databases
    try {
        db.exec('ALTER TABLE posts ADD COLUMN media TEXT');
    } catch (e) {
        // Column already exists or table doesn't exist yet
    }

    // Ensure 'image_url' column exists (legacy support)
    try {
        db.exec('ALTER TABLE posts ADD COLUMN image_url TEXT');
    } catch (e) {
        // Column already exists
    }

    // Create comments table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            author_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
            FOREIGN KEY (author_id) REFERENCES users (id)
        )
    `).run();

    // PERFORMANCE INDEXES
    db.prepare('CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)').run();

    // LIKES TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS likes (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            created_at TEXT    NOT NULL DEFAULT (datetime('now')),
            UNIQUE(user_id, post_id)
        )
    `);

    // COMMENT LIKES TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS comment_likes (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
            created_at TEXT    NOT NULL DEFAULT (datetime('now')),
            UNIQUE(user_id, comment_id)
        )
    `);

    // FOLLOWS TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS follows (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            followed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TEXT    NOT NULL DEFAULT (datetime('now')),
            UNIQUE(follower_id, followed_id)
        )
    `);

    // REPOSTS TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS reposts (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            content    TEXT,  -- Optional comment when reposting
            created_at TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    `);

    // DRAFTS TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS drafts (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type           TEXT    NOT NULL,  -- 'post', 'comment', 'reply', etc.
            content        TEXT,  -- The main text content
            media_urls     TEXT,  -- JSON array of media URLs (images, videos)
            scheduled_for  TEXT,  -- ISO datetime string for when to publish/execute
            recurrence     TEXT,  -- e.g., 'daily', 'weekly', 'monthly', or null for one-time
            status         TEXT    NOT NULL DEFAULT 'draft',  -- 'draft', 'scheduled', 'posted', 'failed'
            reminder_sent  INTEGER NOT NULL DEFAULT 0,  -- 0 or 1, for ask-before-posting mode
            created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
            updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    `);

    // HASHTAGS TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS hashtags (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            tag        TEXT    NOT NULL UNIQUE,
            created_at TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    `);

    // POST_HASHTAGS TABLE (many-to-many relationship)
    db.exec(`
        CREATE TABLE IF NOT EXISTS post_hashtags (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            hashtag_id INTEGER NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
            created_at TEXT    NOT NULL DEFAULT (datetime('now')),
            UNIQUE(post_id, hashtag_id)
        )
    `);

    // DIRECT_MESSAGES TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS direct_messages (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            receiver_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            content        TEXT    NOT NULL,
            is_read        INTEGER NOT NULL DEFAULT 0,  -- 0 = unread, 1 = read
            created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    `);

    // SAVED_POSTS TABLE
    db.exec(`
        CREATE TABLE IF NOT EXISTS saved_posts (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            created_at TEXT    NOT NULL DEFAULT (datetime('now')),
            UNIQUE(user_id, post_id)
        )
    `);

    db.prepare('CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(user_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_follows_followed ON follows(followed_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_reposts_user ON reposts(user_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_reposts_post ON reposts(post_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_drafts_user ON drafts(user_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_drafts_scheduled_for ON drafts(scheduled_for)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON hashtags(tag)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_post_hashtags_post ON post_hashtags(post_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON post_hashtags(hashtag_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver ON direct_messages(receiver_id)').run();
db.prepare('CREATE INDEX IF NOT EXISTS idx_saved_posts_user ON saved_posts(user_id)').run();
     db.prepare('CREATE INDEX IF NOT EXISTS idx_saved_posts_post ON saved_posts(post_id)').run();

     // STORIES TABLE (for interactive story editor)
     db.exec(`
         CREATE TABLE IF NOT EXISTS stories (
             id              INTEGER PRIMARY KEY AUTOINCREMENT,
             title           TEXT    NOT NULL,
             description     TEXT,
             author_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
             is_public       INTEGER NOT NULL DEFAULT 0,
             config          TEXT,  -- JSON with nodes, edges, startNodeId
             thumbnail_url   TEXT,
             created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
             updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
         )
     `);

     db.prepare('CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id)').run();
     db.prepare('CREATE INDEX IF NOT EXISTS idx_stories_public ON stories(is_public)').run();

     console.log('[DB] Database schema and performance indexes verified.');
}
