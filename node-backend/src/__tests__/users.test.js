import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import db from '../database.js';
import { runMigrations } from '../models/migrate.js';

describe('Users API', () => {
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

        const firstUser = db.prepare(`
            INSERT INTO users (email, username, password, full_name, biography)
            VALUES (?, ?, ?, ?, ?)
        `).run('owner@example.com', 'owner_user', 'hashedpassword', 'Owner User', 'Original bio');
        userId = Number(firstUser.lastInsertRowid);

        db.prepare(`
            INSERT INTO users (email, username, password, full_name)
            VALUES (?, ?, ?, ?)
        `).run('taken@example.com', 'taken_name', 'hashedpassword', 'Taken User');

        const postOne = db.prepare(`
            INSERT INTO posts (title, content, author_id)
            VALUES (?, ?, ?)
        `).run('First Post', 'Owner post content', userId);

        const postTwo = db.prepare(`
            INSERT INTO posts (title, content, author_id)
            VALUES (?, ?, ?)
        `).run('Second Post', 'Another owner post', userId);

        db.prepare(`
            INSERT INTO comments (post_id, author_id, content)
            VALUES (?, ?, ?)
        `).run(Number(postOne.lastInsertRowid), userId, 'Owner comment');

        db.prepare(`
            INSERT INTO likes (user_id, post_id)
            VALUES (?, ?)
        `).run(userId, Number(postTwo.lastInsertRowid));

        token = jwt.sign({ id: userId, username: 'owner_user' }, process.env.SECRET_KEY || 'your-secret-key', { expiresIn: '1h' });
    });

    it('updates profile fields and returns the updated user', async () => {
        const res = await request(app)
            .put('/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
                full_name: 'Updated Owner',
                username: 'owner_user_updated',
                email: 'owner-updated@example.com',
                biography: 'Updated bio',
                avatar_url: 'https://example.com/avatar.png'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.full_name).toBe('Updated Owner');
        expect(res.body.username).toBe('owner_user_updated');
        expect(res.body.avatar_url).toBe('https://example.com/avatar.png');
    });

    it('returns 400 when updating to an existing username', async () => {
        const res = await request(app)
            .put('/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
                username: 'taken_name'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.detail).toBe('Username or email already exists');
    });

    it('accepts uploaded avatar paths during profile updates', async () => {
        const res = await request(app)
            .put('/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
                avatar_url: '/uploads/avatar-owner.png'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.avatar_url).toBe('/uploads/avatar-owner.png');
    });

     it('returns recent user activity', async () => {
         const res = await request(app).get(`/users/${userId}/activity`);

         expect(res.statusCode).toBe(200);
         expect(res.body.length).toBeGreaterThan(0);
         expect(res.body.some((entry) => entry.type === 'post')).toBe(true);
         expect(res.body.some((entry) => entry.type === 'comment')).toBe(true);
         expect(res.body.some((entry) => entry.type === 'like')).toBe(true);
     });

     it('follows a user', async () => {
         // Create a second user to follow
         const secondUser = db.prepare(`
             INSERT INTO users (email, username, password, full_name)
             VALUES (?, ?, ?, ?)
         `).run('followed@example.com', 'followed_user', 'hashedpassword', 'Followed User');
         const followedUserId = Number(secondUser.lastInsertRowid);

         const res = await request(app)
             .post(`/users/${followedUserId}/follow`)
             .set('Authorization', `Bearer ${token}`);

         expect(res.statusCode).toBe(200);
         expect(res.body.message).toBe('User followed successfully');
     });

     it('unfollows a user', async () => {
         // Create a second user to follow/unfollow
         const secondUser = db.prepare(`
             INSERT INTO users (email, username, password, full_name)
             VALUES (?, ?, ?, ?)
         `).run('unfollowed@example.com', 'unfollowed_user', 'hashedpassword', 'Unfollowed User');
         const unfollowedUserId = Number(secondUser.lastInsertRowid);

         // First follow the user
         await request(app)
             .post(`/users/${unfollowedUserId}/follow`)
             .set('Authorization', `Bearer ${token}`);

         // Then unfollow
         const res = await request(app)
             .post(`/users/${unfollowedUserId}/unfollow`)
             .set('Authorization', `Bearer ${token}`);

         expect(res.statusCode).toBe(200);
         expect(res.body.message).toBe('User unfollowed successfully');
     });

it('checks if user is following another user', async () => {
          // Create a second user to check follow status
          const secondUser = db.prepare(`
              INSERT INTO users (email, username, password, full_name)
              VALUES (?, ?, ?, ?)
          `).run('checkfollow@example.com', 'checkfollow_user', 'hashedpassword', 'Check Follow User');
          const checkUserId = Number(secondUser.lastInsertRowid);

          // Initially not following
          let res = await request(app)
              .get(`/users/${checkUserId}/follow-status`)
              .set('Authorization', `Bearer ${token}`);
          
          expect(res.statusCode).toBe(200);
          expect(res.body.isFollowing).toBe(false);

          // Follow the user
          await request(app)
              .post(`/users/${checkUserId}/follow`)
              .set('Authorization', `Bearer ${token}`);

          // Now checking should return true
          res = await request(app)
              .get(`/users/${checkUserId}/follow-status`)
              .set('Authorization', `Bearer ${token}`);
          
          expect(res.statusCode).toBe(200);
          expect(res.body.isFollowing).toBe(true);
      });

     it('gets followers of a user', async () => {
         // Create followers
         const follower1 = db.prepare(`
             INSERT INTO users (email, username, password, full_name)
             VALUES (?, ?, ?, ?)
         `).run('follower1@example.com', 'follower1_user', 'hashedpassword', 'Follower 1 User');
         const follower1Id = Number(follower1.lastInsertRowid);

         const follower2 = db.prepare(`
             INSERT INTO users (email, username, password, full_name)
             VALUES (?, ?, ?, ?)
         `).run('follower2@example.com', 'follower2_user', 'hashedpassword', 'Follower 2 User');
         const follower2Id = Number(follower2.lastInsertRowid);

         // Have them follow the main user
         const follower1Token = jwt.sign({ id: follower1Id, username: 'follower1_user' }, process.env.SECRET_KEY || 'your-secret-key', { expiresIn: '1h' });
         const follower2Token = jwt.sign({ id: follower2Id, username: 'follower2_user' }, process.env.SECRET_KEY || 'your-secret-key', { expiresIn: '1h' });

         await request(app)
             .post(`/users/${userId}/follow`)
             .set('Authorization', `Bearer ${follower1Token}`);

         await request(app)
             .post(`/users/${userId}/follow`)
             .set('Authorization', `Bearer ${follower2Token}`);

         // Get followers
         const res = await request(app)
             .get(`/users/${userId}/followers`)
             .set('Authorization', `Bearer ${token}`);

         expect(res.statusCode).toBe(200);
         expect(Array.isArray(res.body)).toBe(true);
         expect(res.body.length).toBe(2);
     });

     it('gets following count for a user', async () => {
         // Create a user to follow
         const userToFollow = db.prepare(`
             INSERT INTO users (email, username, password, full_name)
             VALUES (?, ?, ?, ?)
         `).run('followcount@example.com', 'followcount_user', 'hashedpassword', 'Follow Count User');
         const userToFollowId = Number(userToFollow.lastInsertRowid);

         // Follow the user
         await request(app)
             .post(`/users/${userToFollowId}/follow`)
             .set('Authorization', `Bearer ${token}`);

         // Get following count
         const res = await request(app)
             .get(`/users/${userId}/following-count`)
             .set('Authorization', `Bearer ${token}`);

         expect(res.statusCode).toBe(200);
         expect(res.body.count).toBe(1);
     });

     it('gets follower count for a user', async () => {
         // Create a follower
         const follower = db.prepare(`
             INSERT INTO users (email, username, password, full_name)
             VALUES (?, ?, ?, ?)
         `).run('followercount@example.com', 'followercount_user', 'hashedpassword', 'Follower Count User');
         const followerId = Number(follower.lastInsertRowid);

         // Have them follow the main user
         const followerToken = jwt.sign({ id: followerId, username: 'followercount_user' }, process.env.SECRET_KEY || 'your-secret-key', { expiresIn: '1h' });

         await request(app)
             .post(`/users/${userId}/follow`)
             .set('Authorization', `Bearer ${followerToken}`);

         // Get follower count
         const res = await request(app)
             .get(`/users/${userId}/follower-count`)
             .set('Authorization', `Bearer ${token}`);

         expect(res.statusCode).toBe(200);
         expect(res.body.count).toBe(1);
     });
 });
