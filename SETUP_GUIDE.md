# Setup Guide - THOUGHTS Social Media Platform

This guide walks you through setting up the complete development environment for the THOUGHTS social media platform.

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start](#2-quick-start)
3. [Frontend Setup](#3-frontend-setup-ui)
4. [Node.js Backend Setup](#4-nodejs-backend-setup)
5. [Python Backend Setup](#5-python-backend-setup-sql)
6. [Configuration](#6-configuration)
7. [Running the Application](#7-running-the-application)
8. [Database Management](#8-database-management)
9. [Troubleshooting](#9-troubleshooting)
10. [Deployment](#10-deployment)

---

## 1. Prerequisites

Ensure you have the following installed before proceeding:

### Required Software

| Tool | Minimum Version | Check Command | Install Link |
|------|----------------|---------------|--------------|
| Node.js | 18.x LTS | `node --version` | nodejs.org |
| npm | 9.x | `npm --version` | Included with Node |
| Python | 3.11+ | `python3 --version` | python.org |
| pip | Latest | `pip --version` | Included with Python |
| Git | 2.x | `git --version` | git-scm.com |

### Optional Tools
- **Docker** (for containerized deployment)
- **PM2** (process manager for production)
- **VS Code** (recommended IDE with extensions)

---

## 2. Quick Start

For the fastest path to a running application:

```bash
# 1. Clone the repository
git clone https://github.com/dxz019/MY-APP.git
cd MY-APP

# 2. Install frontend dependencies
cd UI && npm install && cd ..

# 3. Install Node.js backend dependencies
cd node-backend && npm install && cd ..

# 4. Configure Node.js backend
cd node-backend
cp .env.example .env
# Edit .env if needed (defaults are fine for development)
cd ..

# 5. Run both frontend and Node.js backend
npm start
```

Access the app at: **http://localhost:5173**

---

## 3. Frontend Setup (`UI/`)

### 3.1 Install Dependencies

```bash
cd UI
npm install
```

This installs all dependencies from `UI/package.json` including:
- React ecosystem (react, react-dom, react-router-dom)
- UI library (primereact, primeflex, primeicons)
- Build tools (vite)
- Testing (vitest, testing-library)

### 3.2 Development Server

```bash
npm run dev
```

Starts Vite dev server at **http://localhost:5173** with Hot Module Replacement (HMR).

**Useful scripts:**
```bash
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:coverage  # Generate coverage report
```

### 3.3 Environment Variables

Create `.env` file in `UI/` directory:

```env
# Vite exposes variables prefixed with VITE_ to the client
VITE_API_BASE_URL=http://localhost:3001
```

Update `UI/src/services/api.js` if you change this variable.
By default it uses:
```javascript
export const API_BASE_URL = 'http://localhost:3001';
```

**Important:** The backend URL should match whichever backend you're running.

---

## 4. Node.js Backend Setup (`node-backend/`)

### 4.1 Install Dependencies

```bash
cd node-backend
npm install
```

This installs:
- Express and middleware
- Database driver (better-sqlite3)
- Auth libraries (jsonwebtoken, bcryptjs)
- Validation (zod)
- File upload (multer)
- Logging (winston)
- Documentation (swagger-jsdoc, swagger-ui-express)

### 4.2 Database Setup

The SQLite database is created automatically on first run.

**Location:** `node-backend/database/blog.db` (created by migrations)

No manual setup needed - migrations run automatically when `server.js` starts.

### 4.3 Environment Configuration

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Security (CHANGE IN PRODUCTION!)
SECRET_KEY=dev-secret-key-for-development-only-do-not-use-in-prod
IS_PRODUCTION=false

# JWT Settings
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours (for dev)

# Database (optional override)
# DATABASE_PATH=./database/blog.db
```

**Production SECRET_KEY:**
Generate a strong random secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.4 File Uploads Setup

Uploaded images automatically saved to:
`node-backend/uploads/`

This directory is created automatically if missing.

**Permissions:** Ensure the directory is writable by the Node.js process.

### 4.5 Running the Server

**Development (with auto-reload):**
```bash
npm run dev
```
Uses `nodemon` to restart on file changes.

**Production:**
```bash
npm start
```
Uses plain `node`.

**Server output:**
```
🚀 Thoughts Backend running on http://0.0.0.0:3001
API Documentation: http://localhost:3001/api-docs
```

### 4.6 API Documentation

Swagger UI available at: **http://localhost:3001/api-docs**

---

## 5. Python Backend Setup (`SQL/`)

### 5.1 Install Dependencies

```bash
cd SQL
pip install -r requirements.txt
```

Dependencies:
- fastapi & uvicorn (web server)
- sqlalchemy (ORM)
- pydantic (validation)
- passlib + bcrypt (password hashing)
- python-jose (JWT)
- alembic (migrations)
- pytest (testing)

**Tip:** Use a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5.2 Database Setup

The SQLite database file is at: `SQL/blog.db`

Migrations run automatically on startup via:
```python
# In app/models/__init__.py or startup
Base.metadata.create_all(bind=engine)
```

**Manual migration with Alembic** (if needed):
```bash
alembic upgrade head
```

### 5.3 Environment Configuration

Create `.env` in `SQL/`:

```env
DATABASE_URL=sqlite:///./blog.db
SECRET_KEY=dev-secret-key-for-development-only-do-not-use-in-prod
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 5.4 Running the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or using `python -m`:
```bash
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Access points:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs (Swagger UI)
- Alternative docs: http://localhost:8000/redoc (ReDoc)

### 5.5 Running with Root Script

From project root:
```bash
npm run start:backend
```
(Note: orchestrates the Python backend per root package.json)

---

## 6. Configuration

### 6.1 Switching Backends

The frontend (`UI/`) is configured to use **one backend at a time**.

**Option A: Node.js backend (default)**
File: `UI/src/services/api.js`:
```javascript
export const API_BASE_URL = 'http://localhost:3001';
```

**Option B: Python backend**
```javascript
export const API_BASE_URL = 'http://localhost:8000';
```

After changing, restart the frontend dev server.

### 6.2 CORS Configuration

**Node.js (`node-backend/src/app.js`):**
```javascript
app.use(cors({
    origin: '*', // CHANGE to your frontend URL in production
    credentials: true
}));
```

**Python (`SQL/app/main.py`):**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # RESTRICT in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 6.3 Rate Limiting

Currently only on auth endpoints (Node.js):
- 200 requests per 15 minutes for `/users/register` and `/users/login`

Adjust in `node-backend/src/app.js`:
```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,  // Increase/decrease as needed
    // ...
});
```

### 6.4 Image Upload Limits

**Node.js (`node-backend/src/routes/upload.js`):**
```javascript
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // 10MB
    // ...
});
```

**Python (if implemented):** Similar limit in FastAPI file upload params.

---

## 7. Running the Application

### 7.1 Development Mode (Recommended)

Start both frontend and backend in separate terminal windows:

**Terminal 1 - Node.js backend:**
```bash
cd node-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd UI
npm run dev
```

Open **http://localhost:5173** in your browser.

### 7.2 Using Python Backend

**Terminal 1 - Python backend:**
```bash
cd SQL
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd UI
npm run dev
```

### 7.3 One-Command Startup (Root)

The root `package.json` provides:

```bash
npm start
```

This runs:
```json
"start": "npm run start:backend & npm run start:frontend"
```

**Note:** This starts the Python backend by default (`SQL/`). For Node.js, edit root package.json or start manually.

### 7.4 Production Mode

**Build frontend:**
```bash
cd UI
npm run build
```

Output in `UI/dist/` - static files you can serve with any web server (nginx, Apache, etc.)

**Start backend with PM2:**
```bash
cd node-backend
pm2 start src/server.js --name "thoughts-backend"
pm2 save
pm2 startup  # Generate startup script
```

---

## 8. Database Management

### 8.1 Viewing the Database

**SQLite CLI:**
```bash
cd node-backend/database
sqlite3 blog.db
```

Then in SQLite shell:
```sql
.tables
.schema users
SELECT * FROM users;
.quit
```

**DB Browser for SQLite** (GUI):
- Download: https://sqlitebrowser.org/
- Open `node-backend/database/blog.db`

### 8.2 Resetting the Database

**Node.js:**
```bash
cd node-backend
rm -rf database/blog.db
# Restart server - creates fresh empty DB with migrations
npm run dev
```

**Python:**
```bash
cd SQL
rm blog.db
# Restart server - creates fresh DB
uvicorn app.main:app --reload
```

### 8.3 Seeding Data

**Node.js seed script:**
```bash
cd node-backend
npm run seed
```

This populates with sample users, posts, and comments.

**Python seed (if available):**
```bash
cd SQL
python seed.py
# or
python -m app.seed
```

### 8.4 Database Migrations

**Node.js (Automatic):**
Migrations run on server startup via `src/models/migrate.js`.

**Manual migration (rarely needed):**
The `migrate.js` file is designed to be idempotent (safe to run repeatedly).

**Python (Alembic):**
```bash
cd SQL
alembic upgrade head        # Apply pending migrations
alembic downgrade -1       # Rollback one
alembic history            # View migration history
```

---

## 9. Troubleshooting

### 9.1 Common Issues

#### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Fix:**
```bash
# Find process using the port
lsof -ti:3001 | xargs kill -9   # Mac/Linux
# OR
netstat -ano | findstr :3001  # Windows

# Or change PORT in .env file
```

#### Node Module Issues

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Python Module Issues

```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

#### Database Locked (SQLite)

SQLite allows only one writer at a time.

**Cause:** Multiple backends running simultaneously.

**Fix:** Ensure only one backend process is active.

#### Frontend Cannot Connect to Backend

**Symptoms:** Network errors in browser console.

**Diagnosis:**
1. Check backend is running: `curl http://localhost:3001/health`
2. Verify `API_BASE_URL` in `UI/src/services/api.js` points to correct backend port
3. Check CORS errors in browser console

#### Migration Errors (Node.js)

```
Error: SQLITE_CONSTRAINT: UNIQUE constraint failed
```

**Cause:** Database schema out of sync.

**Fix:** Delete `database/blog.db` and restart.

### 9.2 Debug Mode

**Node.js:**
Enable debug logging:
```bash
DEBUG=* npm run dev
```

Or increase log level in `node-backend/src/utils/logger.js`.

**Python/FastAPI:**
```bash
uvicorn app.main:app --reload --log-level debug
```

### 9.3 Clear Everything & Restart

**Nuclear option:**
```bash
# Frontend
cd UI && rm -rf node_modules dist .vite && npm install && cd ..

# Node.js Backend
cd node-backend && rm -rf node_modules database/blog.db && npm install && npm run migrate && cd ..

# Python Backend
cd SQL && rm -rf blog.db __pycache__ alembic/versions/*.py && pip install -r requirements.txt && cd ..
```

---

## 10. Deployment

### 10.1 Production Checklist

- [ ] Set strong `SECRET_KEY` in environment
- [ ] Disable `NODE_ENV=production` / `IS_PRODUCTION=true`
- [ ] Configure CORS for your domain (not `*`)
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Use process manager (PM2, systemd)
- [ ] Set up reverse proxy (nginx)
- [ ] Configure log rotation
- [ ] Enable database backups
- [ ] Set up monitoring (health checks, uptime)
- [ ] Configure rate limiting appropriately
- [ ] Use environment variables (not .env files)

### 10.2 Deploying with PM2 (Node.js)

**Install PM2 globally:**
```bash
npm install -g pm2
```

**Start the app:**
```bash
cd node-backend
pm2 start src/server.js --name "thoughts-backend"
```

**Set up PM2 to start on boot:**
```bash
pm2 startup
pm2 save
```

**Monitor:**
```bash
pm2 status
pm2 logs thoughts-backend
pm2 monit
```

### 10.3 Deploying with Nginx (Reverse Proxy)

**Nginx config** (`/etc/nginx/sites-available/thoughts`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS (recommended)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/ssl.crt;
    ssl_certificate_key /path/to/ssl.key;

    # Frontend (React build)
    location / {
        root /var/www/thoughts/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploads
    location /uploads/ {
        alias /path/to/node-backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Build and deploy frontend:**
```bash
cd UI
npm run build
# Copy dist/ folder to /var/www/thoughts/frontend
```

### 10.4 Docker Deployment (Optional)

Create `Dockerfile` in `node-backend/`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "src/server.js"]
```

Build and run:
```bash
docker build -t thoughts-backend .
docker run -p 3001:3001 thoughts-backend
```

**docker-compose.yml** (full stack):
```yaml
version: '3.8'
services:
  frontend:
    image: nginx:alpine
    volumes:
      - ./UI/dist:/usr/share/nginx/html
    ports:
      - "80:80"
  backend:
    build: ./node-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./node-backend/uploads:/app/uploads
      - ./node-backend/database:/app/database
```

---

## 11. Additional Resources

### Useful Commands

```bash
# Clean install all
rm -rf UI/node_modules node-backend/node_modules && npm --prefix UI install && npm --prefix node-backend install

# Watch logs
tail -f node-backend/server.log

# Test API endpoints
curl http://localhost:3001/health

# Database stats
sqlite3 node-backend/database/blog.db "SELECT COUNT(*) FROM users;"
```

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- SQLite Viewer
- Docker

### Learning Resources
- React: https://react.dev/
- Express: https://expressjs.com/
- FastAPI: https://fastapi.tiangolo.com/
- SQLite: https://www.sqlite.org/docs.html

---

## 12. Getting Help

If you encounter issues not covered here:

1. Check the **Troubleshooting** section above
2. Search existing GitHub issues
3. Create a new issue with:
   - OS and versions
   - Steps to reproduce
   - Error logs
   - Screenshots if applicable

---

*Happy coding! 🚀*
