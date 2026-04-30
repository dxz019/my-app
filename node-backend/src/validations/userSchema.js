import { z } from 'zod';

/**
 * Authentication related Zod schemas for strict request validation
 */

const trimmedString = () => z.string().trim();

const avatarUrlSchema = trimmedString().refine((value) => (
    value.length === 0 ||
    value.startsWith('/') ||
    /^https?:\/\//i.test(value)
), {
    message: 'Avatar URL must be a valid URL or uploaded file path'
});

export const registerSchema = z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    full_name: z.string().min(1, "Full name is required").max(100)
});

export const loginSchema = z.object({
    // Accepting 'email' or 'username' to match frontend flexibility
    email: z.string().optional(),
    username: z.string().optional(),
    password: z.string().min(1, "Password is required")
}).refine(data => data.email || data.username, {
    message: "Either email or username is required",
    path: ["identifier"]
});

export const profileUpdateSchema = z.object({
    username: trimmedString().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores").optional(),
    email: trimmedString().email("Invalid email format").optional(),
    full_name: trimmedString().min(1, "Full name is required").max(100).optional(),
    biography: trimmedString().max(500).optional(),
    avatar_url: avatarUrlSchema.optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one profile field is required',
    path: ['profile']
});
