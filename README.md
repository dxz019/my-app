# THOUGHTS - Social Media Platform

A full-stack social media web application with dual backend implementations (Node.js/Express and Python/FastAPI) sharing a SQLite database.

![Thoughts App](https://via.placeholder.com/1200x400/0066FF/ffffff?text=THOUGHTS+Social+Media+App)

## 🏗️ Architecture

**Three-tier client-server architecture:**
- **Frontend**: React 18 SPA with PrimeReact UI components
- **Backend**: Choose either Node.js/Express OR Python/FastAPI
- **Database**: Shared SQLite database with normalized schema

## ✨ Features

| Category | Features |
|----------|----------|
| **Authentication** | JWT-based login/register, protected routes |
| **Core** | Posts, comments, likes system |
| **Social** | Follow/unfollow users, follower counts, suggested users |
| **UI** | User profiles with avatars, search & explore, dark/light theme |
| **Media** | Image upload support |

## 📁 Project Structure

```
MY-APP/
├── UI/                 # React Frontend (port 5173)
├── node-backend/       # Node.js/Express API (port 3001)
├── SQL/                # Python/FastAPI API (port 8000)
└── .gitignore          # Excludes database files from git
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+ (optional, for Python backend)
- npm or yarn

### Installation
```bash
git clone https://github.com/dxz019/MY-APP.git
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

## 💡 Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, PrimeReact, Vite, Vitest, PrimeFlex |
| **Node.js Backend** | Express, better-sqlite3, JWT, Zod, Winston |
| **Python Backend** | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| **Database** | SQLite (development/prototyping) |

## ⚠️ Important Notes

1. Only run ONE backend at a time (both use the same SQLite file)
2. The dual backend implementation serves educational purposes
3. For production: Consider PostgreSQL for better concurrency
4. Environment variables required - see `.env.example` files

---

## 📋 Feature Branch: `feature/follow-unfollow-complete`

### Changes Made

#### Follow/Unfollow System
- **TrendingSidebar.jsx**: Added `handleFollow()` function with optimistic UI updates and follower count refresh after follow/unfollow
- **ProfilePage.jsx**: Added `handleFollowToggle()` with immediate count updates after follow/unfollow actions
- **users.js**: Follow/unfollow endpoints now return updated user object with fresh `followers_count`/`following_count`
- **userService.js**: Added inline comments explaining follow/unfollow database operations and count updates
- **Database schema**: Added `followers_count` and `following_count` columns to users table
- **seed.js**: Updated to initialize count columns correctly

### Key Functions Explained

**TrendingSidebar.handleFollow()**
- Prevents click event bubbling to profile navigation
- Checks authentication status before follow action
- Implements optimistic UI with loading states
- Updates local state immediately after API call

**ProfilePage.handleFollowToggle()**
- Optimistically updates follow status before server response
- Refreshes user data via `setSearchedUser` and `refreshCurrentUser`
- Rolls back on error for better UX



## 📤 Git Commands

```bash
# Create and switch to feature branch
git checkout -b feature/follow-unfollow-complete

# Add all files except SQL/database
git add UI/ node-backend/ .gitignore README.md

# Commit changes
git commit -m "Fix follow/unfollow functionality with count updates

- Add handleFollow() in TrendingSidebar with optimistic UI updates
- Add handleFollowToggle() in ProfilePage with count refresh
- Follow/unfollow endpoints return updated user object
- Add followers_count/following_count to database schema
- Add inline comments explaining key functions"

# Push to remote
git push -u origin feature/follow-unfollow-complete
```
