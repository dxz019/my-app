# My App - Social Media Platform

A full-stack social media web application built with React (Frontend) and FastAPI (Backend).

## Overview

My App is a social media platform that allows users to:
- Register and authenticate securely
- Create, view, edit, and delete posts
- Comment on posts
- Search for other users
- View user profiles

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **React Router DOM** - Client-side routing
- **PrimeReact** - UI component library
- **Axios** - HTTP client
- **Chart.js** - Data visualization (future analytics)
- **Vitest** - Testing framework

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database (default)
- **JWT (python-jose)** - Token-based authentication
- **bcrypt** - Password hashing
- **Alembic** - Database migrations
- **pytest** - Testing framework

## Project Structure

```
My app/
├── UI/                     # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── AuthModal.jsx       # Authentication modal
│   │   │   ├── CommentSection.jsx # Comments display & input
│   │   │   ├── CreatePost.jsx     # Post creation form
│   │   │   ├── Header.jsx         # Navigation header
│   │   │   ├── PostCard.jsx       # Post display card
│   │   │   └── SearchBar.jsx      # User search component
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.jsx      # Main feed
│   │   │   ├── LoginPage.jsx      # Login form
│   │   │   ├── ProfilePage.jsx    # User profile
│   │   │   └── RegisterPage.jsx   # Registration form
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useAuth.js    # Authentication state management
│   │   │   ├── useComments.js # Comments CRUD operations
│   │   │   ├── usePosts.js   # Posts CRUD operations
│   │   │   └── useToast.js   # Toast notifications
│   │   ├── services/        # API service layer
│   │   │   └── api.js        # Axios API client
│   │   ├── __test__/        # Test files
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   └── package.json
│
├── SQL/                     # FastAPI Backend
│   ├── app/
│   │   ├── core/            # Core utilities
│   │   │   ├── config.py    # Environment configuration
│   │   │   └── security.py  # JWT & password utilities
│   │   ├── models/          # Database models
│   │   │   ├── user_model.py
│   │   │   ├── post_model.py
│   │   │   └── comment_model.py
│   │   ├── routers/         # API route handlers
│   │   │   ├── user_routes.py
│   │   │   ├── post_routes.py
│   │   │   └── comment_routes.py
│   │   ├── schemas/         # Pydantic schemas
│   │   │   ├── user_schema.py
│   │   │   └── post_schema.py
│   │   ├── database.py      # DB connection
│   │   └── main.py          # FastAPI app
│   └── alembic/             # Database migrations
│
└── README.md
```

## API Endpoints

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

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn

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

## Database Models

### User
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| email | String | Unique email |
| username | String | Unique username |
| hashed_password | String | Bcrypt hashed password |
| full_name | String | Full name (optional) |
| is_active | Boolean | Account status |
| is_admin | Boolean | Admin flag |
| created_at | DateTime | Creation timestamp |

### Post
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| title | String | Post title |
| content | Text | Post content |
| image_url | String | Image URL (optional) |
| author_id | Integer | Foreign key to User |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

### Comment
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| content | Text | Comment content |
| author_id | Integer | Foreign key to User |
| post_id | Integer | Foreign key to Post |
| created_at | DateTime | Creation timestamp |

## Security Features

- **JWT Authentication**: Token-based auth with expiration
- **Password Hashing**: BCrypt password hashing
- **Authorization**: Users can only modify their own content
- **CORS**: Configured for development (allow all origins)

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key | Required for production |
| `DATABASE_URL` | Database connection string | `sqlite:///./blog.db` |
| `IS_PRODUCTION` | Production mode flag | `false` |

## Future Enhancements

- [ ] Like/React to posts
- [ ] Follow/Unfollow users
- [ ] User profile editing
- [ ] Post images upload
- [ ] Direct messaging
- [ ] Activity analytics with Chart.js
- [ ] Email notifications
- [ ] Post hashtags and mentions

## License

MIT License
