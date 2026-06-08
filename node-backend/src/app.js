import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
import { setupSwagger } from './utils/swagger.js';

// Route imports
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import uploadRoutes from './routes/upload.js';
import draftRoutes from './routes/drafts.js';
import directMessageRoutes from './routes/directMessages.js';
import savedPostRoutes from './routes/savedPosts.js';
import storyRoutes from './routes/stories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Security Middleware ---
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow loading local images
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { detail: 'Too many requests, please try again later' }
});
app.use('/users/register', limiter); // Targeted rate limiting
app.use('/users/login', limiter);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // For development
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

// --- Documentation ---
setupSwagger(app);

// --- Static Files ---
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Routes ---
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/upload', uploadRoutes);
app.use('/drafts', draftRoutes);
app.use('/direct-messages', directMessageRoutes);
app.use('/saved-posts', savedPostRoutes);
app.use('/stories', storyRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// --- Error Handling ---
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        detail: `Endpoint not found: ${req.method} ${req.url}`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error(`${err.name}: ${err.message} \n ${err.stack}`);

    const statusCode = err.status || 500;
    res.status(statusCode).json({
        detail: process.env.NODE_ENV === 'production'
            ? 'An internal error occurred.'
            : err.message
    });
});

export default app;
