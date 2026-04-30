# User Routes Tests
# =============================================================================
# Tests for authentication and user endpoints.
# Each test uses fresh in-memory database (see conftest.py).
# =============================================================================
import pytest
from fastapi import status

class TestUserRegistration:
    """Tests for user registration endpoint."""

    def test_register_new_user(self, client):
        """Test successful user registration."""
        response = client.post(
            "/users/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "full_name": "New User",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["username"] == "newuser"
        assert data["full_name"] == "New User"
        assert "hashed_password" not in data
        assert "password" not in data

    def test_register_duplicate_email(self, client, test_user):
        """Test registration fails with duplicate email."""
        response = client.post(
            "/users/register",
            json={
                "email": test_user.email,  # Already exists
                "username": "anotheruser",
                "full_name": "Another User",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email already registered" in response.json()["detail"]

    def test_register_duplicate_username(self, client, test_user):
        """Test registration fails with duplicate username."""
        response = client.post(
            "/users/register",
            json={
                "email": "another@example.com",
                "username": test_user.username,  # Already exists
                "full_name": "Another User",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Username already taken" in response.json()["detail"]

    def test_register_invalid_email(self, client):
        """Test registration fails with invalid email format."""
        response = client.post(
            "/users/register",
            json={
                "email": "not-an-email",
                "username": "user",
                "full_name": "User",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


class TestUserLogin:
    """Tests for user login endpoint."""

    def test_login_success(self, client, test_user):
        """Test successful login returns JWT token."""
        response = client.post(
            "/users/login",
            data={
                "username": "testuser",
                "password": "testpassword123"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, test_user):
        """Test login fails with wrong password."""
        response = client.post(
            "/users/login",
            data={
                "username": "testuser",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, client):
        """Test login fails with nonexistent user."""
        response = client.post(
            "/users/login",
            data={
                "username": "nonexistent",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestGetCurrentUser:
    """Tests for /users/me endpoint."""

    def test_get_current_user_authenticated(self, client, auth_headers):
        """Test getting current user with valid token."""
        response = client.get("/users/me", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["username"] == "testuser"

    def test_get_current_user_unauthenticated(self, client):
        """Test getting current user without token fails."""
        response = client.get("/users/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestSearchUsers:
    """Tests for user search endpoint."""

    def test_search_users_found(self, client, test_user):
        """Test searching for users by username."""
        response = client.get("/users/search/test")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 1
        assert data[0]["username"] == "testuser"

    def test_search_users_not_found(self, client):
        """Test searching for nonexistent user."""
        response = client.get("/users/search/nonexistent")
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestGetUserById:
    """Tests for getting user by ID."""

    def test_get_user_by_id_found(self, client, test_user):
        """Test getting user by valid ID."""
        response = client.get(f"/users/{test_user.id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["username"] == "testuser"

    def test_get_user_by_id_not_found(self, client):
        """Test getting user by nonexistent ID."""
        response = client.get("/users/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND
