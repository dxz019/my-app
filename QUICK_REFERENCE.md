# Developer Quick Reference - THOUGHTS

Quick reference guide for developers working on THOUGHTS. Keep this handy!

---

## 🚀 Quick Start Commands

```bash
# Clone & Install (all-in-one)
git clone https://github.com/dxz019/MY-APP.git && cd MY-APP && (cd UI && npm install) && (cd node-backend && npm install)

# Start Node.js backend + Frontend (2 terminals)
cd node-backend && npm run dev   # Terminal 1 (port 3001)
cd UI && npm run dev             # Terminal 2 (port 5173)

# Start Python backend + Frontend
cd SQL && uvicorn app.main:app --reload  # Terminal 1 (port 8000)
cd UI && npm run dev                       # Terminal 2 (port 5173)

# One-command (Python + Frontend)
npm start
```

---

## 📁 Project Structure Reference

```
MY-APP/
├── UI/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client
│   │   └── __test__/       # Tests
│   └── vite.config.js
├── node-backend/
│   ├── src/
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation
│   │   ├── validations/    # Zod schemas
│   │   ├── utils/          # Logger, swagger
│   │   └── models/         # Migrations
│   └── uploads/            # Image uploads
├── SQL/                   # Python FastAPI backend
│   ├── app/
│   │   ├── routers/        # API routes
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── core/           # Config, security
│   └── blog.db            # SQLite database
├── README.md
├── API.md                 # Full API docs
├── ARCHITECTURE.md        # System design
├── SETUP_GUIDE.md        # Detailed setup
└── CONTRIBUTING.md       # Contribution rules
```

---

## 🔌 Backend URLs & Ports

| Service | Port | URL | Docs |
|---------|------|-----|------|
| Node.js API | 3001 | http://localhost:3001 | /api-docs |
| Python API | 8000 | http://localhost:8000 | /docs |
| Frontend Dev | 5173 | http://localhost:5173 | - |

**Switch frontend backend:**
Edit `UI/src/services/api.js` → change `API_BASE_URL`

---

## 🔐 Common Tasks

### Create a New User (cURL)

```bash
curl -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"pass123","full_name":"Test User"}'
```

### Login & Get Token

```bash
curl -X POST http://localhost:3001/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

### Make an Authenticated Request

```bash
# Replace TOKEN with actual JWT
curl http://localhost:3001/posts/ \
  -H "Authorization: Bearer TOKEN"
```

### Upload an Image (cURL)

```bash
curl -X POST http://localhost:3001/upload/image \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/path/to/image.jpg"
```

---

## 🛠️ Development Commands

### Frontend (UI/)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Lint code (if configured) |

### Node.js Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run seed` | Populate DB with sample data |
| `npm run migrate` | Run DB migrations |

### Python Backend (SQL/)

| Command | Description |
|---------|-------------|
| `uvicorn app.main:app --reload` | Start dev server (port 8000) |
| `python -m uvicorn app.main:app --reload` | Alternative |
| `pytest` | Run tests |
| `alembic upgrade head` | Run migrations |
| `alembic history` | View migration history |

### Git

```bash
git status                    # Check changes
git diff                      # View changes
git add .                     # Stage all changes
git commit -m "feat: add X"   # Commit
git push origin branch-name   # Push
git pull origin main          # Update from upstream
git log --oneline             # View commit history
```

---

## 🗄️ Database Reference

### Schema Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | id, username, email, password |
| `posts` | User posts/thoughts | id, author_id, title, content, image_url |
| `comments` | Comments on posts | id, post_id, author_id, content |
| `likes` | Post likes | id, user_id, post_id (unique) |
| `comment_likes` | Comment likes | id, user_id, comment_id (unique) |

### Common Queries (Node.js service layer)

```javascript
// Get all posts with author info
db.prepare(`
  SELECT p.*, u.username, u.full_name,
    (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count
  FROM posts p
  LEFT JOIN users u ON p.author_id = u.id
  ORDER BY p.created_at DESC
`).all();

// Get user by email/username (case-insensitive)
db.prepare(`
  SELECT * FROM users
  WHERE email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE
`).get(email, email);

// Insert with last ID
const result = db.prepare('INSERT INTO users (...) VALUES (...)').run(...);
const newId = result.lastInsertRowid;
```

---

## 🔑 Key Files & Locations

| What | Where |
|------|-------|
| Frontend entry | `UI/src/main.jsx` |
| Frontend app | `UI/src/App.jsx` |
| API client | `UI/src/services/api.js` |
| Custom hooks | `UI/src/hooks/` |
| Node.js server entry | `node-backend/src/server.js` |
| Express app setup | `node-backend/src/app.js` |
| Node.js API routes | `node-backend/src/routes/` |
| Business logic (Node) | `node-backend/src/services/` |
| Validation schemas (Node) | `node-backend/src/validations/` |
| Database migrations (Node) | `node-backend/src/models/migrate.js` |
| Python FastAPI entry | `SQL/app/main.py` |
| Python DB models | `SQL/app/models/` |
| Python routes | `SQL/app/routers/` |
| Swagger UI (Node) | http://localhost:3001/api-docs |
| Swagger UI (Python) | http://localhost:8000/docs |

---

## 🧪 Testing Quick Reference

```bash
# Frontend unit test (Vitest)
cd UI
npm test               # Watch mode
npm run test:run       # Single run
npm run test:coverage  # Coverage

# Node.js API tests
cd node-backend
npm test
npm run test:coverage

# Python tests
cd SQL
pytest
pytest -v              # Verbose
pytest --cov=app       # With coverage
```

**Run specific test file:**
```bash
# Frontend
npm test -- HomePage.test.jsx

# Node.js
npm test -- posts.test.js

# Python
pytest tests/test_users.py
```

---

## 🐛 Debugging Tips

### Frontend
- React DevTools browser extension
- Vue/React DevTools: `inspect` element
- Console.log in components
- Check Network tab for API calls

### Node.js Backend
```bash
# Enable debug output
DEBUG=* npm run dev

# Or add console.log in code (temporary)
# or use VS Code debugger:
# - Run > Add Configuration > Node.js
# - Set breakpoints
```

### Python Backend
```bash
uvicorn app.main:app --reload --log-level debug
```

### Database
```bash
# View DB
cd node-backend/database
sqlite3 blog.db

# See tables
.tables

# See schema
.schema users

# Query
SELECT * FROM users;

# Exit
.quit
```

### Common Errors & Fixes

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| `EADDRINUSE` | Port in use | Kill process on port, or change PORT in .env |
| `ECONNREFUSED` | Backend not running | Start backend server |
| `Module not found` | Dependencies missing | `npm install` or `pip install -r requirements.txt` |
| `Database locked` | SQLite write conflict | Stop other backend instance |
| `401 Unauthorized` | Missing/invalid token | Login to get token, retry |
| `400 Validation` | Invalid request data | Check body matches schema |

**Find/kill process on port:**
```bash
# Mac/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <pid> /F
```

---

## 🎨 UI Components (PrimeReact)

Used components (in `UI/src/components/`):
- `Avatar` - User avatars
- `Button` - Clickable buttons
- `InputText` - Text inputs
- `InputTextarea` - Multi-line text
- `Dialog/Modal` (AuthModal) - Overlay dialogs
- `Menu` - Dropdown menus
- `Toolbar` - Header toolbar
- `Toast` - Notifications

**Import:**
```javascript
import { Avatar, Button } from 'primereact/avatar';
import 'primereact/resources/themes/lara-dark-blue/theme.css';
import 'primeicons/primeicons.css';
```

**Styling:**
- Use PrimeFlex classes: `p-4`, `mb-3`, `flex`, `gap-3`, `col-12`, `lg:col-8`
- Custom CSS in `index.css` and `tokens.css`

---

## 📊 API Quick Reference

### Authentication

```
POST   /users/register      Register
POST   /users/login         Login → { token, user }
GET    /users/me            Get current user (token)
PUT    /users/              Update profile (token)
GET    /users/search/:query Search users
GET    /users/:id/activity  User activity
```

### Posts

```
GET    /posts/              All posts (limit, offset)
POST   /posts/              Create post (token)
DELETE /posts/:id           Delete post (token, owner)
GET    /posts/search/all?query=  Search posts
POST   /posts/:id/like      Like post (token)
DELETE /posts/:id/like      Unlike post (token)
```

### Comments

```
GET    /comments/post/:postId  Get comments
POST   /comments/              Add comment (token)
DELETE /comments/:id           Delete comment (token, owner)
```

### Upload

```
POST   /upload/image       Upload image (token, multipart)
```

### Misc

```
GET    /health             Health check (no auth)
GET    /api-docs           Swagger UI (Node.js only)
```

---

## 🔧 Useful Scripts

### Reset Everything

```bash
# Delete DB and rebuild
rm -rf node-backend/database/blog.db
cd node-backend && npm run migrate

# Python
rm SQL/blog.db
cd SQL && uvicorn app.main:app --reload

# Frontend
cd UI && rm -rf node_modules dist .vite && npm install
```

### View Database Stats

```bash
sqlite3 node-backend/database/blog.db "
  SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM posts) as posts,
    (SELECT COUNT(*) FROM comments) as comments,
    (SELECT COUNT(*) FROM likes) as likes;
"
```

### Run All Tests

```bash
cd UI && npm run test:run && cd ..
cd node-backend && npm test && cd ..
cd SQL && pytest && cd ..
```

### Seed Sample Data

```bash
cd node-backend && npm run seed
# (Generates 10 users, 20 posts, 30 comments, random likes)
```

---

## 📝 Adding a New Feature Checklist

1. [ ] Decide which backend (Node.js or Python) — or both
2. [ ] Update database schema in migration file (Node) or Alembic (Python)
3. [ ] Add service function(s) (Node) or model/schema (Python)
4. [ ] Define API route(s) with proper HTTP method
5. [ ] Add validation schema (Zod/Pydantic)
6. [ ] Update frontend API client (`UI/src/services/api.js`)
7. [ ] Create/update UI components/pages
8. [ ] Add tests for all layers
9. [ ] Update documentation (README, API.md, etc.)
10. [ ] Commit with conventional message

---

## 🚀 Deployment Quick Tips

### Environment Variables (Production)

```env
# Node.js
NODE_ENV=production
SECRET_KEY=<strong-random-64-char-hex>
PORT=3001
CORS_ORIGIN=https://yourdomain.com
```

### Build Frontend

```bash
cd UI
npm run build  # Creates static files in dist/
```

### PM2 Start

```bash
cd node-backend
pm2 start src/server.js --name thoughts-api
pm2 save
pm2 startup
```

### Nginx Reverse Proxy (snippet)

```nginx
location / {
    root /var/www/thoughts/frontend;
    try_files $uri $uri/ /index.html;
}

location /api/ {
    proxy_pass http://localhost:3001;
}
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview, quick start, features |
| `API.md` | Full API endpoint documentation |
| `ARCHITECTURE.md` | System design, patterns, decisions |
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `CONTRIBUTING.md` | How to contribute |
| `QUICK_REFERENCE.md` | This file - cheat sheet |

---

## 🆘 Getting Help

1. Check existing documentation files
2. Search closed GitHub issues
3. Ask in GitHub Discussions (if enabled)
4. Create a new issue with details

---

**Keep this file bookmarked!** Press `Ctrl+P` (or `Cmd+P`) to quickly search.

*Generated: April 2025*
