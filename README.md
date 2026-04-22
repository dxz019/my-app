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

- User authentication (register/login)
- Create, view, delete posts
- Comment on posts
- Search users & posts

## Tech Stack

- **Frontend:** React, PrimeReact, Vitest
- **Backend:** Express, SQLite, JWT

## API Endpoints

- `POST /users/register` - Register
- `POST /users/login` - Login
- `GET /posts/` - Get posts
- `POST /posts/` - Create post
- `GET /comments/post/:postId` - Get comments