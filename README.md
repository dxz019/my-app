# My App - Social Media Platform

A full-stack social media web application built with React (Frontend) and SQL (Backend).

## Overview

" My App " is a  media platform that allows users to:
- Register and authenticate securely
- Create, view, edit, and delete posts
- Comment on posts
- Search for other users
- View user profiles

## Tech Stack

### Frontend
- **PrimeReact** - UI component library
- **Axios** - HTTP client
- **Chart.js** - Data visualization (future analytics)
- **Vitest** - Testing framework

### Backend
- **SQLAlchemy** - ORM
- **SQLite** - Database (default)
- **JWT (python-jose)** - Token-based authentication
- **bcrypt** - Password hashing
- **Alembic** - Database migrations
- **pytest** - Testing framework

### Authentication (`/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Register new user |
| POST | `/users/login` | Login and get JWT token |
| GET | `/users/me` | Get current user |
| GET | `/users/{user_id}` | Get user by ID |
| GET | `/users/search/{username}` | Search users by username |

### Posts (`/posts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts/` | Get all posts (paginated) |
| GET | `/posts/{post_id}` | Get single post |
| POST | `/posts/` | Create new post (auth required) |
| PUT | `/posts/{post_id}` | Update post (author only) |
| DELETE | `/posts/{post_id}` | Delete post (author only) |

### Comments (`/comments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/comments/post/{post_id}` | Get comments for a post |
| GET | `/comments/` | Get all comments (admin) |
| POST | `/comments/` | Create comment (auth required) |
| DELETE | `/comments/{comment_id}` | Delete comment (author only) |

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "My app"
   ```

2. **Setup Backend**
   ```bash
   cd SQL
   pip install -r requirements.txt
   
   # Set environment variables (optional for development)
   export SECRET_KEY="your-secret-key"
   export DATABASE_URL="sqlite:///./blog.db"
   
   # Run the backend
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`

3. **Setup Frontend**
   ```bash
   cd UI
   npm install
   
   # Run the frontend
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Running Tests

**Frontend:**
```bash
cd UI
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once
npm run test:coverage # Run with coverage
```

**Backend:**
```bash
cd SQL
pytest
```

## Security Features

- **JWT Authentication**: Token-based auth with expiration
- **Password Hashing**: BCrypt password hashing
- **Authorization**: Users can only modify their own content