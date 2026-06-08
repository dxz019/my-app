import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, profileUpdateSchema } from '../validations/userSchema.js';
import { userService } from '../services/userService.js';
import { formatUser } from '../utils/formatters.js';

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

const sendUserRouteError = (res, error, fallbackDetail) => {
    const status = error.status || 500;
    const detail = status >= 500 ? fallbackDetail : error.message;
    return res.status(status).json({ detail });
};

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation failed or user already exists
 */
router.post('/register', validate(registerSchema), async (req, res) => {
    const { username, email, password, full_name } = req.body;

    try {
        const existingUser = await userService.userExists(username, email);
        if (existingUser) {
            return res.status(400).json({ detail: 'Username or email already exists' });
        }

        const newUser = await userService.createUser({ username, email, password, full_name });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ detail: 'Internal server error during registration' });
    }
});

// Login user
router.post('/login', validate(loginSchema), async (req, res) => {
    const { email, username, password } = req.body;
    const identifier = email || username;
    console.log(`[LOGIN] Attempt for identifier: "${identifier}"`);

    try {
        const user = await userService.getUserByLogin(identifier);
        
        if (!user) {
            console.log(`[LOGIN] Failed: User not found for identifier: "${identifier}"`);
            return res.status(401).json({ detail: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`[LOGIN] Failed: Invalid password for user: "${user.username}"`);
            return res.status(401).json({ detail: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: formatUser(user) });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ detail: 'Internal server error during login' });
    }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ detail: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error reading profile' });
    }
});

// Search users (must be before /:id)
router.get('/search/:query', async (req, res) => {
    const { query } = req.params;
    if (!query) return res.json([]);

    try {
        const users = await userService.searchUsers(query);
        res.json(users);
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error during search' });
    }
});

// Get user activity
router.get('/:id/activity', async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ detail: 'User not found' });
        }

        const activity = await userService.getUserActivity(req.params.id);
        res.json(activity);
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error reading user activity' });
    }
});

// Follow a user
router.post('/:id/follow', authenticateToken, async (req, res) => {
    try {
        // Get the ID of the authenticated user from the JWT token
        const userId = req.user.id;
        // Parse the target user ID from URL params
        const followedId = parseInt(req.params.id);

        // Create the follow relationship in the database and update counts
        await userService.followUser(userId, followedId);
        // Fetch the updated user to return fresh follower/following counts
        const updatedUser = await userService.getUserById(followedId);
        // Return success message with updated user data for immediate UI refresh
        res.json({ message: 'User followed successfully', user: updatedUser });
    } catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({ detail: 'Internal server error during follow' });
    }
});

// Unfollow a user
router.post('/:id/unfollow', authenticateToken, async (req, res) => {
    try {
        // Get the ID of the authenticated user from the JWT token
        const userId = req.user.id;
        // Parse the target user ID from URL params
        const followedId = parseInt(req.params.id);

        // Remove the follow relationship and decrement counts
        await userService.unfollowUser(userId, followedId);
        // Fetch the updated user to return fresh follower/following counts
        const updatedUser = await userService.getUserById(followedId);
        // Return success message with updated user data for immediate UI refresh
        res.json({ message: 'User unfollowed successfully', user: updatedUser });
    } catch (error) {
        console.error('Unfollow error:', error);
        res.status(500).json({ detail: 'Internal server error during unfollow' });
    }
});

// Check if user is following another user
router.get('/:id/follow-status', authenticateToken, async (req, res) => {
    try {
        // Get the ID of the authenticated user from the JWT token
        const userId = req.user.id;
        // Parse the target user ID from URL params
        const followedId = parseInt(req.params.id);

        // Check if follow relationship exists between the two users
        const isFollowing = await userService.isFollowing(userId, followedId);
        // Return follow status to determine button state on frontend
        res.json({ isFollowing });
    } catch (error) {
        console.error('Check follow error:', error);
        res.status(500).json({ detail: 'Internal server error checking follow status' });
    }
});

// Get followers of a user
router.get('/:id/followers', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit) || 25;
        const offset = parseInt(req.query.offset) || 0;
        
        const followers = await userService.getFollowers(userId, limit, offset);
        res.json(followers);
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ detail: 'Internal server error getting followers' });
    }
});

// Get users that a user is following
router.get('/:id/following', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit) || 25;
        const offset = parseInt(req.query.offset) || 0;
        
        const following = await userService.getFollowing(userId, limit, offset);
        res.json(following);
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ detail: 'Internal server error getting following' });
    }
});

// Get follower count for a user
router.get('/:id/follower-count', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const count = await userService.getFollowerCount(userId);
        res.json({ count });
    } catch (error) {
        console.error('Get follower count error:', error);
        res.status(500).json({ detail: 'Internal server error getting follower count' });
    }
});

// Get following count for a user
router.get('/:id/following-count', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const count = await userService.getFollowingCount(userId);
        res.json({ count });
    } catch (error) {
        console.error('Get following count error:', error);
        res.status(500).json({ detail: 'Internal server error getting following count' });
    }
});

// Get profile by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ detail: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error reading user' });
    }
});

// Update user profile
router.put('/', authenticateToken, validate(profileUpdateSchema), async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.user.id, req.body);
        res.json(updatedUser);
    } catch (error) {
        sendUserRouteError(res, error, 'Internal server error updating user');
    }
});

// Get suggested users
router.get('/suggested/all', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const users = await userService.getSuggestedUsers(null, limit);
        res.json(users);
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error getting suggestions' });
    }
});

export default router;
