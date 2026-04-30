import { z } from 'zod';

export const postSchema = z.object({
    content: z.string().trim().min(1, "Post content cannot be empty").max(1000),
    title: z.string().optional().default('Untitled'),
    image_url: z.string().nullable().optional()
});

export const commentSchema = z.object({
    post_id: z.coerce.number().int().positive("A valid post is required"),
    content: z.string().trim().min(1, "Comment cannot be empty").max(500)
});
