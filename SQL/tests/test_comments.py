# Comment Routes Tests
# =============================================================================
# Tests for comment endpoints.
# Each test uses fresh in-memory database (see conftest.py).
# =============================================================================
import pytest
from fastapi import status

from app.models import User

class TestGetComments:
    """Tests for getting comments."""

    def test_get_comments_for_post(self, client, test_post, db_session, test_user):
        """Test getting comments for a post."""
        # Create a comment
        from app.models import Comment
        comment = Comment(
            content="Test comment",
            post_id=test_post.id,
            author_id=test_user.id
        )
        db_session.add(comment)
        db_session.commit()
        
        response = client.get(f"/comments/post/{test_post.id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["content"] == "Test comment"

    def test_get_comments_post_not_found(self, client):
        """Test getting comments for nonexistent post returns 404."""
        response = client.get("/comments/post/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestCreateComment:
    """Tests for creating comments."""

    def test_create_comment_authenticated(self, client, auth_headers, test_post):
        """Test creating comment with valid auth."""
        response = client.post(
            "/comments/",
            json={
                "content": "Great post!",
                "post_id": test_post.id
            },
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["content"] == "Great post!"
        assert data["post_id"] == test_post.id

    def test_create_comment_unauthenticated(self, client, test_post):
        """Test creating comment without auth fails."""
        response = client.post(
            "/comments/",
            json={
                "content": "Great post!",
                "post_id": test_post.id
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_comment_post_not_found(self, client, auth_headers):
        """Test creating comment for nonexistent post fails."""
        response = client.post(
            "/comments/",
            json={
                "content": "Great post!",
                "post_id": 99999
            },
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestDeleteComment:
    """Tests for deleting comments."""

    def test_delete_comment_author(self, client, auth_headers, test_post, db_session, test_user):
        """Test deleting own comment succeeds."""
        from app.models import Comment
        
        # Create comment
        comment = Comment(
            content="Test comment to delete",
            post_id=test_post.id,
            author_id=test_user.id
        )
        db_session.add(comment)
        db_session.commit()
        db_session.refresh(comment)
        
        response = client.delete(
            f"/comments/{comment.id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK

    def test_delete_comment_non_author(self, client, db_session, test_post, test_user):
        """Test deleting another user's comment fails."""
        from app.models import Comment
        from app.routers.user_routes import get_password_hash
        
        # Create another user
        other_user = User(
            email="other@example.com",
            username="otheruser",
            full_name="Other User",
            hashed_password=get_password_hash("password123")
        )
        db_session.add(other_user)
        db_session.commit()
        
        # Create comment from other user
        comment = Comment(
            content="Other user's comment",
            post_id=test_post.id,
            author_id=other_user.id
        )
        db_session.add(comment)
        db_session.commit()
        db_session.refresh(comment)
        
        # Login as test user
        response = client.post(
            "/users/login",
            data={"username": "testuser", "password": "testpassword123"}
        )
        test_headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
        
        # Try to delete other user's comment
        response = client.delete(
            f"/comments/{comment.id}",
            headers=test_headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
