import jwt from 'jsonwebtoken';
import db from '../database.js';

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

/**
 * Middleware to authenticate requests using JWT
 */

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ detail: 'Access token required' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ detail: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

/**
 * Optional authentication - allows guests but attaches user if token exists
 */

export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
};
