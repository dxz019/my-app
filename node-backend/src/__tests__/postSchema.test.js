import { describe, expect, it } from 'vitest';
import { postSchema, commentSchema } from '../validations/postSchema';

describe('Post Schema Validation', () => {
    it('validates a valid post', () => {
        const post = { content: 'Hello world' };
        const result = postSchema.safeParse(post);
        expect(result.success).toBe(true);
    });

    it('rejects empty post content', () => {
        const post = { content: '' };
        const result = postSchema.safeParse(post);
        expect(result.success).toBe(false);
    });

    it('rejects post content with only whitespace', () => {
        const post = { content: '   ' };
        const result = postSchema.safeParse(post);
        expect(result.success).toBe(false);
    });

    it('validates post with title', () => {
        const post = { content: 'Hello', title: 'My Post' };
        const result = postSchema.safeParse(post);
        expect(result.success).toBe(true);
    });

    it('uses default title when not provided', () => {
        const post = { content: 'Hello' };
        const result = postSchema.safeParse(post);
        expect(result.success).toBe(true);
        expect(result.data.title).toBe('Untitled');
    });

    it('validates post with image_url', () => {
        const post = { content: 'Check this out' };
        const result = postSchema.safeParse(post);
        expect(result.success).toBe(true);
    });

    it('validates post with null image_url', () => {
        const post = { content: 'No image', image_url: null };
        const result = postSchema.safeParse(post);
        expect(result.success).toBe(true);
    });
});

describe('Comment Schema Validation', () => {
    it('validates a valid comment', () => {
        const comment = { post_id: 1, content: 'Great post!' };
        const result = commentSchema.safeParse(comment);
        expect(result.success).toBe(true);
    });

    it('rejects empty comment content', () => {
        const comment = { post_id: 1, content: '' };
        const result = commentSchema.safeParse(comment);
        expect(result.success).toBe(false);
    });

    it('rejects invalid post_id', () => {
        const comment = { post_id: -1, content: 'Comment' };
        const result = commentSchema.safeParse(comment);
        expect(result.success).toBe(false);
    });

    it('coerces string post_id to number', () => {
        const comment = { post_id: '123', content: 'Comment' };
        const result = commentSchema.safeParse(comment);
        expect(result.success).toBe(true);
        expect(result.data.post_id).toBe(123);
    });
});