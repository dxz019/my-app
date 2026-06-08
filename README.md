# THOUGHTS - Social Media Platform

A full-stack social media web application with dual backend implementations (Node.js/Express and Python/FastAPI) sharing a SQLite database.

## 🏗️ Architecture

**Three-tier client-server architecture:**
- **Frontend**: React 18 SPA with PrimeReact UI components
- **Backend**: Choose either Node.js/Express OR Python/FastAPI
- **Database**: Shared SQLite database with normalized schema

**Key Features:**
- User authentication (JWT)
- Posts, comments, likes system
- User profiles with avatars
- Search & explore functionality
- Responsive design with dark/light theme
- Image upload support
- **Follow/Unfollow system with real-time count updates**

## 📁 Project Structure

```
MY-APP/
├── UI/                 # React Frontend (port 5173)
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

## 📋 Recent Changes (feature/follow-button-fix)

### Follow/Unfollow System Fix
- **TrendingSidebar.jsx**: Added `handleFollow()` function with optimistic UI updates and follower count refresh
- **ProfilePage.jsx**: Added `handleFollowToggle()` with immediate count updates after follow/unfollow actions
- **users.js**: Follow/unfollow endpoints now return updated user object with fresh `followers_count`/`following_count`
- **userService.js**: Added inline comments explaining follow/unfollow database operations
- **Database schema**: Added `followers_count` and `following_count` columns to users table
- **seed.js**: Updated to initialize count columns correctly

### Git Commands for Pushing (excluding SQL folder)
```bash
# Create and switch to feature branch
git checkout -b feature/follow-button-fix

# Add all files except SQL/database
git add UI/ node-backend/ .gitignore README.md

# Commit changes
git commit -m "Fix follow/unfollow functionality and count display

- Add onClick handler to Follow button in TrendingSidebar
- Update follow/unfollow endpoints to return updated user data
- Add followers_count/following_count to database schema
- Implement optimistic UI updates for follow actions"

# Push to remote
git push -u origin feature/follow-button-fix
```

## 🎨 UI Screenshots

*Note: Add screenshots in `docs/screenshots/` directory*
- `login-page.png` - Authentication screen
- `home-feed.png` - Main feed with trending sidebar
- `profile-page.png` - User profile with follow button and counts
- `explore-page.png` - Search and hashtag exploration