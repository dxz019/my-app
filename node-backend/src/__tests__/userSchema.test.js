import { registerSchema, loginSchema, profileUpdateSchema } from '../validations/userSchema.js';

describe('User Validation Schemas', () => {
    describe('registerSchema', () => {
        it('should validate correct registration data', () => {
            const validData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                full_name: 'Test User'
            };
            
            const result = registerSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject short username', () => {
            const invalidData = {
                username: 'ab',
                email: 'test@example.com',
                password: 'password123',
                full_name: 'Test User'
            };
            
            const result = registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should reject invalid email', () => {
            const invalidData = {
                username: 'testuser',
                email: 'invalid-email',
                password: 'password123',
                full_name: 'Test User'
            };
            
            const result = registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should reject short password', () => {
            const invalidData = {
                username: 'testuser',
                email: 'test@example.com',
                password: '123',
                full_name: 'Test User'
            };
            
            const result = registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('loginSchema', () => {
        it('should validate with username', () => {
            const validData = {
                username: 'testuser',
                password: 'password123'
            };
            
            const result = loginSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should validate with email', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123'
            };
            
            const result = loginSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject without identifier', () => {
            const invalidData = {
                password: 'password123'
            };
            
            const result = loginSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('profileUpdateSchema', () => {
        it('should reject empty updates', () => {
            const invalidData = {};
            
            const result = profileUpdateSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should validate full_name', () => {
            const validData = {
                full_name: 'Updated Name'
            };
            
            const result = profileUpdateSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject biography too long', () => {
            const invalidData = {
                biography: 'a'.repeat(501)
            };
            
            const result = profileUpdateSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
