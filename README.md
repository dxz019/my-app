# MY-APP

A social media web application built with React and Express.

## Quick Start

```bash
# Frontend
cd UI && npm install && npm run dev

# Backend
cd node-backend && npm install && npm run dev
```

## Features

- User authentication (register/login with JWT)
- Create, view, delete posts
- Comment on posts
- Search users & posts
- Image upload support

## Tech Stack

- **Frontend:** React, PrimeReact, Vitest
- **Backend:** Express, SQLite, JWT, bcrypt

## Environment Variables

Create `.env` in `node-backend/`:

```env
PORT=3001
JWT_SECRET=your-secret-key
DATABASE_URL=./database/blog.db
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Register new user |
| POST | `/users/login` | Login (returns JWT) |
| GET | `/users/me` | Get current user |
| GET | `/posts/` | Get all posts |
| POST | `/posts/` | Create post |
| DELETE | `/posts/:id` | Delete post |
| GET | `/comments/post/:postId` | Get comments |
| POST | `/comments/` | Create comment |
| POST | `/upload/image` | Upload image |

## Running Tests

```bash
# Frontend tests
cd UI && npm run test

# Backend tests
cd node-backend && npm run test
```