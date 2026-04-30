# Comment Routes - All comment-related API endpoints
# =============================================================================
# Endpoints:
#   GET  /comments/post/{post_id}  - Get all comments for a post
#   GET  /comments/                - Get all comments (admin)
#   POST /comments/                - Create new comment (authenticated)
#   DELETE /comments/{id}         - Delete comment (author only)
# =============================================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Comment, Post
from app.schemas.post_schema import CommentCreate, CommentResponse
from app.core.security import get_current_user

router = APIRouter()

@router.get("/post/{post_id}", response_model=List[CommentResponse])
def get_comments_for_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
    return comments

# Admin endpoint to get all comments with user and post info
@router.get("/", response_model=List[CommentResponse])
def get_all_comments(db: Session = Depends(get_db)):
    comments = db.query(Comment).all()
    return comments

@router.post("/", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Use post_id from body
    post = db.query(Post).filter(Post.id == comment.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    new_comment = Comment(
        content=comment.content,
        author_id=current_user.id,
        post_id=comment.post_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted successfully"}