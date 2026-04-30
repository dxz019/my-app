# Post Routes Test : endpoints.
# Each test uses fresh in-memory database (see conftest.py).

import pytest
from fastapi import status

from app.models import User

class TestGetPosts:
    """Tests for getting posts."""

    def test_get_posts_empty(self, client):
        """Test getting posts when none exist."""
        response = client.get("/posts/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_get_posts_with_data(self, client, test_post):
        """Test getting posts returns created post."""
        response = client.get("/posts/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Test Post"

    def test_get_post_by_id(self, client, test_post):
        """Test getting single post by ID."""
        response = client.get(f"/posts/{test_post.id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Test Post"

    def test_get_post_by_id_not_found(self, client):
        """Test getting nonexistent post returns 404."""
        response = client.get("/posts/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestCreatePost:
    """Tests for creating posts."""

    def test_create_post_authenticated(self, client, auth_headers):
        """Test creating post with valid auth."""
        response = client.post(
            "/posts/",
            json={
                "title": "New Post",
                "content": "New post content",
                "image_url": "https://example.com/image.jpg"
            },
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "New Post"
        assert data["content"] == "New post content"

    def test_create_post_unauthenticated(self, client):
        """Test creating post without auth fails."""
        response = client.post(
            "/posts/",
            json={
                "title": "New Post",
                "content": "New post content"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUpdatePost:
    """Tests for updating posts."""

    def test_update_post_author(self, client, auth_headers, test_post):
        """Test updating own post succeeds."""
        response = client.put(
            f"/posts/{test_post.id}",
            json={"title": "Updated Title"},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Updated Title"

    def test_update_post_non_author(self, client, db_session, test_user, test_post):
        """Test updating another user's post fails."""
        # Create another user
        from app.routers.user_routes import get_password_hash
        other_user = User(
            email="other@example.com",
            username="otheruser",
            full_name="Other User",
            hashed_password=get_password_hash("password123")
        )
        db_session.add(other_user)
        db_session.commit()
        
        # Login as other user
        response = client.post(
            "/users/login",
            data={"username": "otheruser", "password": "password123"}
        )
        other_headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
        
        # Try to update test_user's post
        response = client.put(
            f"/posts/{test_post.id}",
            json={"title": "Hacked Title"},
            headers=other_headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestDeletePost:
    """Tests for deleting posts."""

    def test_delete_post_author(self, client, auth_headers, test_post):
        """Test deleting own post succeeds."""
        response = client.delete(
            f"/posts/{test_post.id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        
        # Verify post is deleted
        response = client.get(f"/posts/{test_post.id}")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_post_non_author(self, client, db_session, test_post):
        """Test deleting another user's post fails."""
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
        
        # Login as other user
        response = client.post(
            "/users/login",
            data={"username": "otheruser", "password": "password123"}
        )
        other_headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
        
        # Try to delete test_user's post
        response = client.delete(
            f"/posts/{test_post.id}",
            headers=other_headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
