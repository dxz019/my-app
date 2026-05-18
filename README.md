<<<<<<< HEAD
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
=======
# THOUGHTS - Social Media Platform

A full-stack social media web application with dual backend implementations (Node.js/Express and Python/FastAPI) sharing a SQLite database.

## 🏗️ Architecture

**Three-tier client-server architecture:**
- **Frontend**: React 18 SPA with PrimeReact UI components
- **Backend**: Choose either Node.js/Express OR Python/FastAPI
- **Database**: Shared SQLite database with normalized schema

![Architecture Diagram](https://via.placeholder.com/800x400/0066FF/ffffff?text=React+%2B+Node.js/FastAPI+%2B+SQLite)

**Key Features:**
- User authentication (JWT)
- Posts, comments, likes system
- User profiles with avatars
- Search & explore functionality
- Responsive design with dark/light theme
- Image upload support

## 📁 Project Structure

```
MY-APP/
├── UI/                 # React Frontend
├── node-backend/       # Node.js/Express API (port 3001)
├── SQL/               # Python/FastAPI API (port 8000)
└── shared SQLite DB   # blog.db (in respective backend dirs)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Installation
```bash
git clone <repository-url>
cd MY-APP

# Install frontend
cd UI && npm install

# Choose ONE backend:
# Option 1: Node.js Backend
cd ../node-backend && npm install

# Option 2: Python Backend  
cd ../SQL && pip install -r requirements.txt
```

### Running the Application

**Terminal 1 - Backend:**
```bash
# Node.js (port 3001)
cd node-backend && npm run dev

# OR Python (port 8000)
cd SQL && uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd UI && npm run dev
# Visit http://localhost:5173
```

## 🔧 Configuration

Update `UI/src/services/api.js` to point to your chosen backend:
```javascript
export const API_BASE_URL = 'http://localhost:3001'; // Node.js
// export const API_BASE_URL = 'http://localhost:8000'; // Python
```

## 🧪 Testing

```bash
# Frontend
cd UI && npm run test

# Node.js Backend
cd node-backend && npm test

# Python Backend
cd SQL && pytest
```

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed system architecture
- [API.md](API.md) - Complete API reference
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed installation guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines

## 💡 Technology Choices

**Frontend:** React 18, PrimeReact, Vite, Vitest  
**Node.js Backend:** Express, better-sqlite3, JWT, Zod, Winston  
**Python Backend:** FastAPI, SQLAlchemy, Pydantic, Uvicorn  
**Database:** SQLite (development/prototyping)

## ⚠️ Important Notes

1. Only run ONE backend at a time (both use the same SQLite file)
2. The dual backend implementation serves educational purposes
3. For production: Consider PostgreSQL for better concurrency
4. Environment variables required - see `.env.example` files

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

---

*Built with ❤️ for learning full-stack development*
>>>>>>> af07d6f (Update README.md with improved architecture overview and concise project description)
