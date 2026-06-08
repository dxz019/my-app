/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/users': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/posts': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/comments': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/upload': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/drafts': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/direct-messages': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/saved-posts': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/stories': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/health': {
                target: 'http://localhost:3001',
                changeOrigin: true
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/__test__/setup.jsx',
        include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
        css: true,
        pool: 'forks'
    }
})