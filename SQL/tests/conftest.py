# Pytest Configuration - Fresh in-memory database for each test

import os
# Set SECRET_KEY for tests to avoid UserWarning
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("IS_PRODUCTION", "false")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import User, Post, Comment

# Create in-memory SQLite database with shared cache for ForeignKey support
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def db_engine():
    """
    Create a fresh in-memory database engine for each test function.
    """
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    yield engine
    
    # Drop all tables after test
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    """
    Create a database session for each test function.
    """
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """
    Create a test client with overridden database dependency.
    Uses the in-memory database from db_session fixture.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up override
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test user in the database."""
    from app.routers.user_routes import get_password_hash
    
    user = User(
        email="testuser@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password=get_password_hash("testpassword123")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers with valid JWT token."""
    response = client.post(
        "/users/login",
        data={"username": "testuser", "password": "testpassword123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_post(db_session, test_user):
    """Create a test post in the database."""
    post = Post(
        title="Test Post",
        content="This is a test post content",
        author_id=test_user.id
    )
    db_session.add(post)
    db_session.commit()
    db_session.refresh(post)
    return post
