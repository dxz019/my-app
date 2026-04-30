/**
 * Middleware to validate request body against a Zod schema.
 * Parsed data is written back to req.body so unknown fields do not leak through.
 */
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            detail: 'Validation failed',
            errors: result.error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message
            }))
        });
    }

    req.body = result.data;
    next();
};
