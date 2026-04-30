import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import db from '../database.js';
import { runMigrations } from '../models/migrate.js';

describe('Posts API', () => {
    let token;
    let userId;

    beforeAll(() => {
        runMigrations();
    });

    beforeEach(() => {
        db.exec('DELETE FROM comment_likes');
        db.exec('DELETE FROM likes');
        db.exec('DELETE FROM comments');
        db.exec('DELETE FROM posts');
        db.exec('DELETE FROM users');
        db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'posts', 'comments', 'likes', 'comment_likes')");

        const insertUser = db.prepare(`
            INSERT INTO users (email, username, password, full_name)
            VALUES (?, ?, ?, ?)
        `);
        const result = insertUser.run('test@example.com', 'testuser', 'hashedpassword', 'Test User');
        userId = Number(result.lastInsertRowid);
        token = jwt.sign({ id: userId, username: 'testuser' }, process.env.SECRET_KEY || 'your-secret-key', { expiresIn: '1h' });
    });

    it('returns 401 for unauthorized post creation', async () => {
        const res = await request(app)
            .post('/posts')
            .send({ content: 'Valid content but no token' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ detail: 'Access token required' });
    });

    it('returns structured validation errors when content is missing', async () => {
        const res = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Missing content post' });

        expect(res.statusCode).toBe(400);
        expect(res.body.detail).toBe('Validation failed');
        expect(res.body.errors[0].message).toBe('Invalid input: expected string, received undefined');
    });

    it('returns structured validation errors when content is empty', async () => {
        const res = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: '' });

        expect(res.statusCode).toBe(400);
        expect(res.body.detail).toBe('Validation failed');
        expect(res.body.errors[0].message).toContain('Post content cannot be empty');
    });

    it('creates a valid post successfully', async () => {
        const res = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'This is completely valid data',
                image_url: '/uploads/valid.png'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.content).toBe('This is completely valid data');
        expect(res.body.author_id).toBe(userId);
    });

     it('returns JSON 404 for unknown endpoints', async () => {
         const res = await request(app).get('/api/unknown-fictional-route');
         expect(res.statusCode).toBe(404);
         expect(res.body.detail).toContain('Endpoint not found');
     });

     it('creates a repost successfully', async () => {
         // First create a post to repost
         const postRes = await request(app)
             .post('/posts')
             .set('Authorization', `Bearer ${token}`)
             .send({
                 content: 'This is a post to be reposted',
                 image_url: '/uploads/post.png'
             });
         
         const postId = postRes.body.id;

         // Now create a repost of that post
         const res = await request(app)
             .post(`/posts/${postId}/repost`)
             .set('Authorization', `Bearer ${token}`)
             .send({
                 content: 'This is my comment on the repost'
             });

         expect(res.statusCode).toBe(201);
         expect(res.body.content).toBe('This is my comment on the repost');
         expect(res.body.post.id).toBe(postId);
         expect(res.body.author.id).toBe(userId);
     });

     it('creates a simple repost without comment', async () => {
         // First create a post to repost
         const postRes = await request(app)
             .post('/posts')
             .set('Authorization', `Bearer ${token}`)
             .send({
                 content: 'This is a post to be reposted',
                 image_url: '/uploads/post.png'
             });
         
         const postId = postRes.body.id;

         // Now create a simple repost (no comment)
         const res = await request(app)
             .post(`/posts/${postId}/repost`)
             .set('Authorization', `Bearer ${token}`)
             .send({});

         expect(res.statusCode).toBe(201);
         expect(res.body.content).toBeNull();
         expect(res.body.post.id).toBe(postId);
         expect(res.body.author.id).toBe(userId);
     });

     it('gets reposts for a post', async () => {
         // Create a post to repost
         const postRes = await request(app)
             .post('/posts')
             .set('Authorization', `Bearer ${token}`)
             .send({
                 content: 'This is a post to be reposted',
                 image_url: '/uploads/post.png'
             });
         
         const postId = postRes.body.id;

         // Create multiple reposts
         await request(app)
             .post(`/posts/${postId}/repost`)
             .set('Authorization', `Bearer ${token}`)
             .send({ content: 'First repost comment' });

         await request(app)
             .post(`/posts/${postId}/repost`)
             .set('Authorization', `Bearer ${token}`)
             .send({ content: 'Second repost comment' });

         // Get reposts for the post
         const res = await request(app)
             .get(`/posts/${postId}/reposts`);

         expect(res.statusCode).toBe(200);
         expect(Array.isArray(res.body)).toBe(true);
         expect(res.body.length).toBe(2);
         expect(res.body[0].content).toBe('Second repost comment'); // Most recent first
         expect(res.body[1].content).toBe('First repost comment');
     });

     it('gets repost count for a post', async () => {
         // Create a post to repost
         const postRes = await request(app)
             .post('/posts')
             .set('Authorization', `Bearer ${token}`)
             .send({
                 content: 'This is a post to be reposted',
                 image_url: '/uploads/post.png'
             });
         
         const postId = postRes.body.id;

         // Initially no reposts
         let res = await request(app)
             .get(`/posts/${postId}/repost-count`);
         
         expect(res.statusCode).toBe(200);
         expect(res.body.count).toBe(0);

         // Add a repost
         await request(app)
             .post(`/posts/${postId}/repost`)
             .set('Authorization', `Bearer ${token}`)
             .send({ content: 'A repost comment' });

         // Check count increased
         res = await request(app)
             .get(`/posts/${postId}/repost-count`);
         
         expect(res.statusCode).toBe(200);
         expect(res.body.count).toBe(1);
     });

     it('checks if user has reposted a post', async () => {
         // Create a post to repost
         const postRes = await request(app)
             .post('/posts')
             .set('Authorization', `Bearer ${token}`)
             .send({
                 content: 'This is a post to be reposted',
                 image_url: '/uploads/post.png'
             });
         
         const postId = postRes.body.id;

         // Initially not reposted
         let res = await request(app)
             .get(`/posts/${postId}/user-reposted`)
             .set('Authorization', `Bearer ${token}`);
         
         expect(res.statusCode).toBe(200);
         expect(res.body.hasReposted).toBe(false);

         // Create a repost
         await request(app)
             .post(`/posts/${postId}/repost`)
             .set('Authorization', `Bearer ${token}`)
             .send({ content: 'A repost comment' });

         // Now checking should return true
         res = await request(app)
             .get(`/posts/${postId}/user-reposted`)
             .set('Authorization', `Bearer ${token}`);
         
         expect(res.statusCode).toBe(200);
         expect(res.body.hasReposted).toBe(true);
     });
 });
