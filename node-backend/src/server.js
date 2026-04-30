import app from './app.js';
import { runMigrations } from './models/migrate.js';
import logger from './utils/logger.js';

// Global unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1); // Exit with failure to restart in production
});

// Run migrations on startup
try {
    runMigrations();
} catch (error) {
    logger.error('Failed to run migrations:', error);
    process.exit(1);
}

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Thoughts Backend running on http://0.0.0.0:${PORT}`);
    logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
const shutdown = () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
