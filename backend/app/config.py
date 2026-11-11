import os
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "SEHAT-SETU"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Secret Key for JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sehat_setu_secure_production_secret_key_2026_demo_eval")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database Configuration
    # Supports Azure SQL: mssql+pyodbc://username:password@server.database.windows.net/dbname?driver=ODBC+Driver+18+for+SQL+Server
    # Or SQLite fallback for local development / testing: sqlite:///./sehat_setu.db
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sehat_setu.db")
    
    # Azure Blob Storage Configuration (Optional / Fallback)
    AZURE_STORAGE_CONNECTION_STRING: Optional[str] = os.getenv("AZURE_STORAGE_CONNECTION_STRING", None)
    AZURE_STORAGE_CONTAINER_NAME: str = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "sehatsetu-blobs")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
