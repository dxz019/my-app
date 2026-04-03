from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.schemas.user_schema import UserResponse

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    post_id: int  # Add post_id to body

class CommentResponse(CommentBase):
    id: int
    author_id: int
    post_id: int
    created_at: datetime
    author: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

class PostBase(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None

class PostCreate(PostBase):
    author_id: int = None
    image_url: Optional[str] = None  # Add author_id to body

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class PostResponse(PostBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    comments: List[CommentResponse] = []
    author: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
