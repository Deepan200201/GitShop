import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GitShop"
    API_V1_STR: str = "/api/v1"
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+pymysql://gitshop_user:gitshop_password@127.0.0.1:3306/gitshop")
    SECRET_KEY: str = "supersecretkey"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")

    class Config:
        case_sensitive = True

settings = Settings()
