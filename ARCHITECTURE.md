# Architecture Documentation - THOUGHTS Social Media Platform

This document describes the system architecture, design patterns, and technical decisions made in the THOUGHTS social media platform.

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Design](#5-database-design)
6. [Security Architecture](#6-security-architecture)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Design Principles](#8-api-design-principles)
9. [Performance Considerations](#9-performance-considerations)
10. [Scalability Decisions](#10-scalability-decisions)
11. [Technology Choices](#11-technology-choices)
12. [Dual Backend Strategy](#12-dual-backend-strategy)

---

## 1. System Overview

THOUGHTS is a classic **client-server** web application following the **three-tier architecture**:

```
┌─────────────────────────────────────────┐
│            Client (Browser)             │
│  React SPA with PrimeReact components  │
└──────────────┬──────────────────────────┘
               │ HTTPS/REST API
               ▼
┌─────────────────────────────────────────┐
│         Backend API Servers             │
│  Node.js/Express OR Python/FastAPI     │
└──────────────┬──────────────────────────┘
               │ SQL queries
               ▼
┌─────────────────────────────────────────┐
│         SQLite Database                 │
│  users, posts, comments, likes, etc.   │
└─────────────────────────────────────────┘
```

**Key Characteristics:**
- **Stateless API**: No server-side session state (JWT-based)
- **RESTful design**: Resource-oriented endpoints
- **Separation of concerns**: Frontend, Backend, Database are independent
- **Horizontal scaling ready**: Stateless nature allows load balancing

---

## 2. Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         Load Balancer (Future)                     │
└───────┬──────────────────────┬─────────────────────┬─────────────┘
        │                      │                     │
        ▼                      ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│  React App   │      │ Node.js API  │     │  FastAPI     │
│  (Static)    │      │  Port 3001   │     │  Port 8000  │
│  Vite Build  │      │  Express     │     │              │
└──────┬───────┘      └──────┬───────┘     └──────┬───────┘
       │                     │                     │
       └──────────┬──────────┴─────────────────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │   SQLite Database   │
       │   (blog.db)         │
       └─────────────────────┘
```

**Data Flow Example (Create Post):**
```
User clicks "Post" → React component → API call → Express route →
Validation → Service layer → Database query → Response → UI update
```

---

## 3. Frontend Architecture

### Technology Stack
- **React 18** with functional components and hooks
- **React Router v6** for client-side routing
- **PrimeReact** for UI components (pre-styled, accessible)
- **PrimeFlex** for utility CSS classes
- **Vite** for fast development and optimized builds

### State Management

Uses **local component state** (React `useState`) and **custom hooks** for shared logic:

```javascript
// Custom hooks encapsulate business logic
const { token, currentUser, login, logout } = useAuth();
const { posts, fetchPosts, createPost } = usePosts(token, currentUser);
const { showToast } = useToast();
```

**Why custom hooks over Redux/Context?**
- Simpler for app scale (few global state pieces)
- Easier to debug (state co-located with components)
- No additional dependencies

### Component Structure

```
src/
├── components/       # Reusable presentational components
│   ├── Header.jsx           # Navigation bar
│   ├── PostCard.jsx         # Single post display
│   ├── CreatePost.jsx       # Modal for creating posts
│   ├── SearchBar.jsx        # User search input
│   ├── TrendingSidebar.jsx  # Trending posts/hashtags
│   ├── CommentSection.jsx   # Comments for a post
│   └── AuthModal.jsx        # Login/Register modal
├── pages/            # Route-level page components
│   ├── HomePage.jsx
│   ├── ProfilePage.jsx
│   ├── ExplorePage.jsx
│   ├── LoginPage.jsx
│   └── RegisterPage.jsx
├── hooks/            # Custom React hooks
│   ├── useAuth.js           # Auth state & methods
│   ├── usePosts.js          # Post fetching & mutations
│   ├── useComments.js       # Comment fetching & mutations
│   └── useToast.js          # Toast notification system
└── services/
    └── api.js                # Axios instance + API methods
```

### Routing Strategy

**React Router v6** with protected routes:

```jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/explore" element={<ExplorePage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/profile/:userId" element={<ProfilePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
</Routes>
```

**Protected routes**: Middleware pattern inside components using `requireAuth()` function that checks token and shows auth modal if needed.

### API Client

Centralized Axios instance in `UI/src/services/api.js`:
- Base URL configuration
- Request interceptor for JWT injection
- Error handling utilities
- Endpoint namespaces (authAPI, postsAPI, usersAPI, etc.)

### Styling Approach

**CSS-in-JS via inline styles + PrimeReact + PrimeFlex:**
- Uses CSS custom properties (design tokens) in `tokens.css`
- Theme support (light/dark) via class toggling on `html` element
- Responsive layout using PrimeFlex grid system (`col-12 lg:col-8`)
- Component styling via PrimeReact theme (Lara Dark Blue)

**Design Tokens** (`tokens.css`):
```css
:root {
  --color-primary: #0066FF;
  --color-bg-page: #ffffff;
  --color-bg-card: #f8f9fa;
  --color-text-main: #1a1a1a;
  --color-text-sub: #6c757d;
  --color-border: #dee2e6;
}

html.dark-theme {
  --color-primary: #4d94ff;
  --color-bg-page: #121212;
  --color-bg-card: #1e1e1e;
  --color-text-main: #e0e0e0;
  --color-text-sub: #b0b0b0;
  --color-border: #333333;
}
```

---

## 4. Backend Architecture

### Design Pattern: Layered Architecture

Each backend follows a **clean separation of concerns**:

```
┌──────────────────────────────────────┐
│           Routes Layer               │  ← HTTP handling, route definitions
├──────────────────────────────────────┤
│         Middleware Layer             │  ← Auth, validation, rate limiting
├──────────────────────────────────────┤
│         Service Layer                │  ← Business logic, DB operations
├──────────────────────────────────────┤
│         Data/Model Layer             │  ← Database schema, queries
└──────────────────────────────────────┘
```

### Node.js/Express Backend

**Structure:**
```
node-backend/src/
├── app.js           → Express app setup (middleware, routes, error handlers)
├── server.js        → Entry point (listen, migrations)
├── config.js        → Environment configuration
├── database.js      → SQLite connection (better-sqlite3)
├── middleware/       → Authentication & validation middleware
├── routes/          → Route definitions with Swagger docs
├── services/        → Business logic layer
├── validations/     → Zod request schemas
├── utils/           → Logger, formatters, Swagger setup
├── models/          → Migration & seed scripts
└── uploads/         → Static image files
```

**Key Middleware:**
- `helmet()`: Security headers
- `cors()`: Cross-origin support
- `express.json()`: Body parsing
- `rateLimit()`: Rate limiting on auth routes
- `authenticateToken`: JWT verification
- `validate`: Zod schema validation

**Service Pattern:**
```javascript
// services/userService.js
export const userService = {
  async getUserById(id) { ... },
  async createUser(data) { ... },
  async updateUser(id, data) { ... },
  // All DB queries encapsulated
};
```

### Python/FastAPI Backend

**Structure:**
```
SQL/app/
├── main.py           → FastAPI app, router inclusion
├── database.py       → SQLAlchemy engine & session
├── core/
│   ├── config.py    → Settings (pydantic BaseSettings)
│   └── security.py  → JWT encoding/decoding, bcrypt
├── models/          → SQLAlchemy ORM models
├── schemas/         → Pydantic request/response models
├── routers/         → APIRouter definitions
└── tests/           → Pytest test suite
```

**FastAPI Features:**
- Automatic OpenAPI/Swagger generation
- Pydantic validation (same schemas used for requests & responses)
- Dependency injection for database sessions

**Service Pattern:** Business logic typically in routers or separate service modules.

---

## 5. Database Design

### Schema Overview

```
users (1) ←--- (N) posts
users (1) ←--- (N) comments
users (1) ←--- (N) likes
users (1) ←--- (N) comment_likes

posts (1) ←--- (N) comments
posts (1) ←--- (N) likes

comments (1) ←--- (N) comment_likes
```

### normalization

- **3rd Normal Form (3NF)** - No redundant data
- Foreign keys with `ON DELETE CASCADE` for data integrity
- Unique constraints to prevent duplicate likes

### Indexing Strategy

Indexes on:
- `users(username)`, `users(email)` - fast lookup for login/search
- `posts(author_id)` - efficient user post queries
- `comments(post_id)`, `comments(author_id)` - comment fetching
- `likes(post_id)`, `likes(user_id)` - like count/check queries
- `comment_likes(comment_id)`, `comment_likes(user_id)` - comment like queries

### Migrations

**Node.js:** Automatic migrations on server startup (`src/models/migrate.js`) using raw SQL via better-sqlite3. Simple `CREATE TABLE IF NOT EXISTS` approach.

**Python:** Alembic-based migrations for versioned schema changes (more robust).

---

## 6. Security Architecture

### Authentication: JWT (JSON Web Tokens)

**Flow:**
```
User logs in → Verify credentials → Sign JWT → Return token → Client stores → Send in Authorization header
```

**Token Structure:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
.Payload.
{
  "id": 1,
  "username": "johndoe",
  "exp": 1714100000  // Expiration timestamp
}
.Signature.
```

**Security Notes:**
- Token signed with SECRET_KEY (must be strong in production)
- 24-hour expiration
- No refresh tokens (user re-login required)

### Password Security

- **Hashing**: bcrypt with 10 salt rounds
- **Storage**: Only hashed passwords stored in DB
- **Comparison**: `bcrypt.compare()` timing-safe

### Request Security

**Node.js Middleware:**
- `helmet()`: Sets HTTP security headers (XSS, HSTS, CSP)
- `express-rate-limit()`: Throttles auth endpoints (200/15min)
- CORS: Allow all in dev (restrict in prod)
- Input validation: Zod schemas before processing

**Python Middleware:**
- FastAPI's built-in request validation via Pydantic
- CORS middleware
- Rate limiting (future enhancement)

### File Upload Security

**Multer Config (Node.js):**
- File size limit: 10MB
- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
- Filename: Randomized with timestamp + random number
- Storage: Local filesystem (`/uploads` directory)

**Security Measures:**
- No path traversal (multer handles)
- No executable files (only images)
- Auth required for upload endpoint

### SQL Injection Prevention

- **Node.js**: Parameterized queries with `db.prepare()` (better-sqlite3)
- **Python**: SQLAlchemy ORM with parameter binding

Never concatenate user input into SQL strings.

### XSS Prevention

- User-generated content (post content, comments) should be sanitized before rendering or storage
- DOMPurify available for sanitization (currently in dependencies but not fully used)
- React escapes strings by default (safe in JSX)

---

## 7. Authentication & Authorization

### Authentication Flow

```
┌─────────┐    Register/Login    ┌──────────────┐    Issue Token    ┌─────────┐
│ Client  │ -------------------→ │  Backend API │ ---------------→ │   JWT   │
│(React)  │   (email+password)   │              │  (signed token)  │  Token  │
└─────────┘                      └──────┬───────┘                  └────┬────┘
                                            │                             │
                                            │ Store in localStorage       │
                                            ↓                             │
                                   ┌─────────┐                          │
                                   │Local    │                          │
                                   │Storage │                          │
                                   └─────────┘                          │
                                            │                             │
                                            │ Include in                  │
                                            │ Authorization header        │
                                            ↓                             ↓
                                   ┌─────────────────────────┐    ┌──────────────┐
                                   │   Authenticated Request │    │  Verify &    │
                                   │   Authorization: Bearer │ →  │  Extract    │
                                   │   <token>               │    │  user ID    │
                                   └─────────────────────────┘    └──────────────┘
```

### Authorization Rules

| Resource | Action | Who Allowed |
|----------|--------|-------------|
| Post | Create | Any authenticated user |
| Post | Delete | Owner only |
| Post | Like/Unlike | Any authenticated user |
| Comment | Create | Any authenticated user |
| Comment | Delete | Owner only |
| User Profile | Update | Owner only |
| User Profile | View | Public |

**Implementation:**
- `authenticateToken` middleware checks JWT and attaches `req.user`
- Route handlers check `req.user.id === resource.owner_id`

### Session Management

- Stateless (no server sessions)
- Token stored in frontend `localStorage` with `token` key
- Token automatically sent in Authorization header via Axios interceptor
- Logout: Remove token from localStorage (server cannot invalidate until expiry)

---

## 8. API Design Principles

### RESTful Resource Modeling

Resources: `users`, `posts`, `comments`, `likes`

**Naming:**
- Plural nouns: `/users`, `/posts`, `/comments`
- Nested resources: `/comments/post/{postId}`, `/users/{id}/activity`

**HTTP Methods:**
- `GET`: Read (safe, idempotent)
- `POST`: Create (not idempotent)
- `PUT`: Update (idempotent)
- `DELETE`: Delete (idempotent)

**Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Deletion successful
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

### Request/Response Format

**Standard JSON**, UTF-8 encoded.

**Success responses** return resource objects directly or in arrays.

**Error responses** standardized:
```json
{
  "detail": "Human-readable error message"
}
```

**Validation errors** (Zod/Pydantic):
```json
{
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### Pagination

**Offset-based pagination:**
```
GET /posts/?limit=20&offset=40
```
- `limit`: max items to return
- `offset`: skip N items

**Future:** Could upgrade to cursor-based for better performance with large datasets.

---

## 9. Performance Considerations

### Database Optimizations

1. **Eager Loading (JOINs)**
   - Avoided N+1 query problem
   - Single query fetches posts + author + counts:
   ```sql
   SELECT p.*, u.username, u.full_name,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count
   FROM posts p
   LEFT JOIN users u ON p.author_id = u.id
   ```

2. **Indexes on Foreign Keys**
   - Speeds up JOINs and WHERE clauses on relationships

3. **SQLite WAL Mode**
   ```javascript
   db.pragma('journal_mode = WAL');
   ```
   - Allows concurrent reads during writes
   - Better performance for read-heavy workloads

### Frontend Optimizations

1. **Lazy Comment Loading**
   - Comments fetched only when expanded (not on page load)
   - Drastically reduces initial data payload

2. **React.memo & useCallback**
   - Prevents unnecessary re-renders of PostCard components
   - Memoizes callback functions passed to children

3. **Custom Hooks for Data Fetching**
   - Centralized logic, easy caching extensions (React Query future)

4. **Optimistic UI** (potential):
   - Like button updates before server confirms

### API Optimizations

**Rate Limiting:** Prevents abuse on auth endpoints.

**Response Compression:** Not currently used (gzip middleware can be added).

---

## 10. Scalability Decisions

### Current State: Monolithic

Both backends are monolithic apps (single codebase, single process). Adequate for small-scale deployment.

### If Scaling Needed

**Horizontal Scaling (Multiple Instances):**
- Stateless design allows load balancing
- Shared SQLite DB problematic (file lock contention across servers)
- **Solution**: Migrate to PostgreSQL/MySQL for concurrent access

**Database Scaling:**
- Read replicas for heavy read workloads
- Connection pooling

**Caching Layer (Future):**
- Redis for:
  - Session storage (if move from JWT)
  - Rate limiting counters
  - Cached post lists (avoid frequent DB hits)

**Content Delivery:**
- Uploaded images served via CDN (Cloudinary, S3 + CloudFront)
- Static asset offloading

---

## 11. Technology Choices

### Why React + PrimeReact?

- **React**: Industry standard, vast ecosystem, component-based
- **PrimeReact**: Comprehensive UI library (no need to build from scratch), built-in accessibility, theming support
- **Vite**: Extremely fast HMR, simple configuration

### Why Node.js/Express?

- JavaScript everywhere (full-stack JS)
- Better-sqlite3: Synchronous, fast for simple queries
- Express: Minimal, flexible, huge middleware ecosystem
- JWT ecosystem mature

### Why Python/FastAPI?

- Modern, fast (ASGI), auto-documentation
- SQLAlchemy: Industry-standard ORM with migrations
- Pydantic: Excellent data validation
- Great for data-heavy APIs

**Dual Backend Rationale:**
- Demonstrates polyglot persistence
- Educational (showcases two stacks)
- Flexibility to choose based on team expertise

### Why SQLite?

- Zero configuration, file-based
- Perfect for development, prototyping, small apps
- Serverless, portable
- **Limitation:** Write concurrency (only one writer at a time)
- **Future:** Larger scale → PostgreSQL

---

## 12. Dual Backend Strategy

### Rationale

The project maintains **two separate backend implementations**:

- `node-backend/` - Production-ready Node.js/Express API
- `SQL/` - Python/FastAPI API (learning/demonstration)

**Why both?**
1.Educational - Compare/contrast two popular stacks
2.Flexibility - Choose backend based on team expertise
3.Backup - If one fails, other can serve frontend
4.Demonstration of same API contract with different tech

### Running One Backend

**Only one backend should run at a time** (both try to use same SQLite file → locking issues).

**Frontend Configuration:**
Edit `UI/src/services/api.js`:
```javascript
export const API_BASE_URL = 'http://localhost:3001'; // Node.js
// or
export const API_BASE_URL = 'http://localhost:8000'; // Python
```

### Maintaining Both

When adding features, update **both backends** to maintain parity:

1. Node.js: Add route → service → validation
2. Python: Add router → model → schema
3. Test both backends separately
4. Keep API contracts identical

**Future:** Could extract shared OpenAPI spec and generate code for both.

---

## 13. Deployment Architecture

### Current (Development)

```
Frontend (Vite dev server) → Backend (Node/Python) → SQLite file
All on localhost
```

### Production Considerations

**Option A: Monolithic Server**
```
┌────────────────────────────────────┐
│  Ubuntu VPS (DigitalOcean, AWS EC2)│
│  ├── Nginx (reverse proxy)        │
│  ├── Node.js PM2 process          │
│  ├── SQLite file                  │
│  └── React static build           │
└────────────────────────────────────┘
```

**Option B: Microservices (Future)**
```
┌─────────┐    ┌─────────┐    ┌─────────┐
│  Front  │ →  │ Auth    │ →  │ Users   │
│  (S3/   │    │ Service │    │ Service │
│  CloudFront)        │         │         │
└─────────┘    └─────────┘    └─────────┘
                  └─────────┐
                            ↓
                    ┌─────────────┐
                    │  PostgreSQL │
                    └─────────────┘
```

**Recommended Path:**
1.First: Monolithic Node.js + SQLite
2.Later: Migrate DB to PostgreSQL
3.Later: Split services as traffic grows

---

## 14. Monitoring & Observability

### Current: Minimal

- Winston logger (Node.js) writes to console
- Python uses standard logging
- No metrics collection (future: Prometheus)
- No error tracking (future: Sentry)
- No APM (future: Datadog, New Relic)

### Logs

**Node.js:**
```javascript
logger.info(`🚀 Thoughts Backend running on http://0.0.0.0:${PORT}`);
logger.error('Failed to run migrations:', error);
```

**Python:**
```python
print('[DB] Database schema and performance indexes verified.')
```

**Recommendation:** Structured JSON logging (JSON format), log aggregation (ELK stack).

---

## 15. Testing Strategy

### Frontend (Vitest + React Testing Library)

**Unit tests:** Hooks, utility functions, component rendering

**Integration tests:** Full user flows (login → create post)

**Example structure:**
```
UI/src/__test__/
├── components/        # Component tests
├── pages/            # Page tests
├── hooks/            # Hook tests
└── setup.jsx         # Test config
```

### Node.js Backend (Vitest + Supertest)

**Unit tests:** Service functions, validations, utilities

**API tests:** Endpoint integration with Supertest

**Example:**
```javascript
import request from 'supertest';
import app from '../src/app.js';

describe('POST /users/register', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({ username: 'test', email: 'test@test.com', ... });
    expect(res.status).toBe(201);
  });
});
```

### Python Backend (Pytest + httpx)

Similar approach using FastAPI's TestClient.

### CI/CD (Future)

- GitHub Actions for automated tests
- Linting (ESLint, Black)
- Type checking (TypeScript for frontend)

---

## 16. Development Workflow

### Recommended Process

1.Choose backend (Node.js or Python) and ensure it's running
2.Implement API changes in chosen backend
3.Update frontend API client if endpoints change
4.Write tests for new features
5.Run full test suite
6.Update documentation (this file, API.md, README.md)
7.Commit with descriptive message

### Environment Management

- `node-backend/.env` for backend configuration
- `UI/.env` for frontend (Vite uses `VITE_` prefix for exposed vars)
- `.env` files gitignored

---

## 17. Known Technical Debt & Future Improvements

1. **Image Upload Storage**: Currently local filesystem → S3/Cloudinary
2. **Caching Layer**: Redis for frequent queries (user profiles, posts)
3. **Real-time Updates**: WebSocket for live notifications
4. **Rate Limiting**: More granular per-endpoint
5. **Error Tracking**: Sentry or similar
6. **Type Safety**: Add TypeScript to frontend (in progress) and backend
7. **API Versioning**: `/api/v1/` prefixes
8. **Database Migration Tool**: Better migration management
9. **Docker Containerization**: For consistent deployment
10. **CI/CD Pipeline**: Automated testing and deployment

---

## 18. Glossary

- **JWT**: JSON Web Token - compact, URL-safe token for authentication
- **ORM**: Object-Relational Mapping - maps database tables to objects
- **WAL**: Write-Ahead Logging - SQLite journaling mode for concurrency
- **SPA**: Single-Page Application - frontend loads once, client-side routing
- **CSRF**: Cross-Site Request Forgery - attack vector (mitigated by same-site policies)
- **CORS**: Cross-Origin Resource Sharing - browser security mechanism
- **REST**: Representational State Transfer - architectural style for APIs
- **MVC**: Model-View-Controller - pattern used in layered architecture
- **SSR**: Server-Side Rendering - not used (CSR only currently)

---

*Last updated: April 2025*
