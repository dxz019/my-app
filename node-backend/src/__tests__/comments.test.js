// Import lifecycle hooks and test functions from Vitest
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

// Import Supertest to test API routes
import request from 'supertest';

// Import JWT to create auth token
import jwt from 'jsonwebtoken';

// Import Express app
import app from '../app.js';

// Import database connection
import db from '../database.js';

// Import migration function to create tables
import { runMigrations } from '../models/migrate.js';

// Main test group for Comments API
describe('Comments API', () => {
    let token;
    let userId;
    let postId;

    beforeAll(() => {
        runMigrations();
    });
    beforeEach(() => {
        db.exec('DELETE FROM comment_likes');
        db.exec('DELETE FROM likes');
        db.exec('DELETE FROM comments');
        db.exec('DELETE FROM posts');
        db.exec('DELETE FROM users');

        // Reset auto-increment IDs
        db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'posts', 'comments', 'likes', 'comment_likes')");

        // Insert test user
        const userResult = db.prepare(`
            INSERT INTO users (email, username, password, full_name)
            VALUES (?, ?, ?, ?)
        `).run(
            'commenter@example.com',
            'commenter',
            'hashedpassword',
            'Comment User'
        );

        // Save inserted user ID
        userId = Number(userResult.lastInsertRowid);

        // Insert test post linked to user
        const postResult = db.prepare(`
            INSERT INTO posts (title, content, author_id)
            VALUES (?, ?, ?)
        `).run(
            'Seed Post',
            'A seeded post',
            userId
        );

        // Save inserted post ID
        postId = Number(postResult.lastInsertRowid);

        // Generate valid JWT token for login
        token = jwt.sign(
            { id: userId, username: 'commenter' },
            process.env.SECRET_KEY || 'your-secret-key',
            { expiresIn: '1h' }
        );
    });

    // Test successful comment creation
    it('creates a comment when post_id and content are provided', async () => {

        // Send POST request to /comments
        const res = await request(app)
            .post('/comments')

            // Add token in Authorization header
            .set('Authorization', `Bearer ${token}`)

            // Send comment data
            .send({
                post_id: postId,
                content: 'This is a real comment'
            });

        // Expect success status
        expect(res.statusCode).toBe(201);

        // Response should be array
        expect(Array.isArray(res.body)).toBe(true);

        // Check correct post linked
        expect(res.body[0].post_id).toBe(postId);

        // Check comment content
        expect(res.body[0].content).toBe('This is a real comment');
    });

    // Test blank comment validation
    it('returns validation errors for blank comment content', async () => {

        // Send POST request with blank spaces
        const res = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                post_id: postId,
                content: '   '
            });

        // Expect validation error
        expect(res.statusCode).toBe(400);

        // Main error message
        expect(res.body.detail).toBe('Validation failed');

        // Specific validation message
        expect(res.body.errors[0].message).toContain('Comment cannot be empty');
    });
});