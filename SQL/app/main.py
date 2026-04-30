from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import user_routes, post_routes, comment_routes

app = FastAPI(title="Social Media API", version="1.0.0")

# Configure CORS - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_routes.router, prefix="/users", tags=["users"])
app.include_router(post_routes.router, prefix="/posts", tags=["posts"])
app.include_router(comment_routes.router, prefix="/comments", tags=["comments"])

@app.get("/")
def root():
    return {"message": "Welcome to Social Media API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
