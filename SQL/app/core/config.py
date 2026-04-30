# Configuration - Centralized environment variable management
# =============================================================================
# All environment variables should be read from here.
# This ensures consistent configuration across the application.
# =============================================================================
import os
from typing import Optional

class Settings:
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "sqlite:///./blog.db")
    
    # Security
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "")
    IS_PRODUCTION: bool = os.environ.get("IS_PRODUCTION", "false").lower() == "true"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    def __init__(self):
        self._validate()
    
    def _validate(self):
        """Validate required settings."""
        if not self.SECRET_KEY:
            if self.IS_PRODUCTION:
                raise ValueError("SECRET_KEY environment variable must be set in production")
            import warnings
            warnings.warn(
                "SECRET_KEY not set. Using insecure default for development only. "
                "Set SECRET_KEY environment variable for production!",
                UserWarning
            )
            self.SECRET_KEY = "dev-secret-key-for-development-only-do-not-use-in-prod"
    
    @property
    def database_url(self) -> str:
        """Get database URL with proper prefix for SQLite."""
        if self.DATABASE_URL.startswith("sqlite"):
            # Ensure absolute path for SQLite
            if not self.DATABASE_URL.startswith("sqlite:///"):
                self.DATABASE_URL = "sqlite:///" + self.DATABASE_URL.lstrip("sqlite:")
        return self.DATABASE_URL

# Global settings instance
settings = Settings()
