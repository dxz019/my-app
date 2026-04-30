
import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

// Main test group for Auth Middleware
describe('Auth Middleware', () => {

    // Secret key used to generate valid JWT tokens
    const SECRET_KEY = 'your-secret-key';

    // Mock request object with headers
    const mockReq = (header) => ({ headers: header || {} });

    // Mock response object
    const mockRes = () => {
        const res = {};

        // Mock res.status()
        res.status = vi.fn().mockReturnValue(res);

        // Mock res.json()
        res.json = vi.fn().mockReturnValue(res);

        return res;
    };
    const mockNext = vi.fn();

    // Runs before every test case
    beforeEach(() => {
        mockNext.mockClear();
    });

    // Test group for authenticateToken middleware
    describe('authenticateToken', () => {

        // Test when token is missing
        it('returns 401 when no token is provided', () => {
            const req = mockReq({});
            const res = mockRes();

            authenticateToken(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);

            expect(res.json).toHaveBeenCalledWith({ detail: 'Access token required' });

            expect(mockNext).not.toHaveBeenCalled();
        });

        // Test when token is invalid
        it('returns 403 for an invalid token', () => {
            const req = mockReq({ authorization: 'Bearer invalidtoken' });
            const res = mockRes();

            // Run middleware
            authenticateToken(req, res, mockNext);

            // Expect 403 Forbidden
            expect(res.status).toHaveBeenCalledWith(403);

            // Expect invalid token message
            expect(res.json).toHaveBeenCalledWith({ detail: 'Invalid or expired token' });

            // next() should not run
            expect(mockNext).not.toHaveBeenCalled();
        });

        // Test when token is valid
        it('calls next for a valid token', () => {

            // Create valid JWT token
            const token = jwt.sign({ id: 1, username: 'testuser' }, SECRET_KEY);

            // Put token in Authorization header
            const req = mockReq({ authorization: `Bearer ${token}` });
            const res = mockRes();

            // Run middleware
            authenticateToken(req, res, mockNext);

            // next() should run
            expect(mockNext).toHaveBeenCalled();

            // User data should attach in req.user
            expect(req.user).toMatchObject({ id: 1, username: 'testuser' });
        });
    });

    // Test group for optionalAuth middleware
    describe('optionalAuth', () => {

        // Test when no token is given
        it('sets req.user to null when there is no token', () => {
            const req = mockReq({});
            const res = mockRes();

            // Run middleware
            optionalAuth(req, res, mockNext);

            // Request should continue
            expect(mockNext).toHaveBeenCalled();

            // No user logged in
            expect(req.user).toBeNull();
        });

        // Test when invalid token is given
        it('keeps req.user null for an invalid token', () => {
            const req = mockReq({ authorization: 'Bearer invalidtoken' });
            const res = mockRes();

            // Run middleware
            optionalAuth(req, res, mockNext);

            // Request should continue
            expect(mockNext).toHaveBeenCalled();

            // Invalid token ignored
            expect(req.user).toBeNull();
        });

        // Test when valid token is given
        it('attaches a user for a valid token', () => {

            // Create valid JWT token
            const token = jwt.sign({ id: 1, username: 'testuser' }, SECRET_KEY);

            // Put token in request header
            const req = mockReq({ authorization: `Bearer ${token}` });
            const res = mockRes();

            // Run middleware
            optionalAuth(req, res, mockNext);

            // Request should continue
            expect(mockNext).toHaveBeenCalled();

            // User data should attach
            expect(req.user).toMatchObject({ id: 1, username: 'testuser' });
        });
    });
});