# Post Routes - All post-related API endpoints
# =============================================================================
# Endpoints:
#   GET  /posts/      - Get all posts (paginated)
#   GET  /posts/{id}  - Get single post by ID
#   POST /posts/      - Create new post (authenticated)
#   PUT  /posts/{id}  - Update post (author only)
#   DELETE /posts/{id} - Delete post (author only)
# =============================================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Post
from app.schemas.post_schema import PostCreate, PostUpdate, PostResponse
from app.core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=List[PostResponse])
def get_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts

@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/", response_model=PostResponse)
def create_post(
    post: PostCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get author_id from JWT token (secure) instead of request body
    new_post = Post(
        title=post.title,
        content=post.content,
        image_url=post.image_url,
        author_id=current_user.id  # Secure: from token, not body
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    
    if post_update.title is not None:
        post.title = post_update.title
    if post_update.content is not None:
        post.content = post_update.content
    
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}