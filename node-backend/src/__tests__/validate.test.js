import { describe, expect, it, vi } from 'vitest';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive()
});

describe('Validate Middleware', () => {
    it('passes valid data through', () => {
        const middleware = validate(testSchema);
        const req = { body: { name: 'John', age: 25 } };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        const next = vi.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.body).toEqual({ name: 'John', age: 25 });
    });

    it('returns 400 for invalid data', () => {
        const middleware = validate(testSchema);
        const req = { body: { name: '' } };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        const next = vi.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            detail: 'Validation failed',
            errors: expect.any(Array)
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('strips unknown fields', () => {
        const middleware = validate(testSchema);
        const req = { body: { name: 'John', age: 25, unknown: 'value' } };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        const next = vi.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.body.unknown).toBeUndefined();
    });
});