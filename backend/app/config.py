"""
Configuration settings for the FastAPI application.
Loads environment variables with validation and defaults.
"""

import os
from typing import List, Optional
from pydantic import validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Server Configuration
    app_name: str = "AI Event Monitor API"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    environment: str = "development"
    debug: bool = True
    
    # Database Configuration
    mongodb_uri: str = "mongodb+srv://hackergkn:karthik@hackathon.xkjyqhh.mongodb.net/aievent?retryWrites=true&w=majority&appName=hackathon"
    db_name: str = "aievent"
    
    # JWT Configuration
    jwt_secret: str = "default_jwt_secret_change_in_production"
    jwt_algorithm: str = "HS256"
    jwt_expires_in: int = 24 * 60 * 60  # 24 hours in seconds
    
    # Client Configuration
    client_url: str = "http://localhost:5173"
    
    # CORS Configuration
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://10.100.14.125:5173",
        "http://10.100.18.5:5173",
        "https://aieventmonitor.vercel.app"
    ]
    
    # Email Configuration (SMTP)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_secure: bool = False
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None
    smtp_from: Optional[str] = None
    smtp_from_name: str = "AI Event Monitor"
    
    # Google Maps Configuration
    google_maps_api_key: Optional[str] = None
    
    # Rate Limiting Configuration
    rate_limit_window: int = 15 * 60  # 15 minutes
    rate_limit_max: int = 1000
    auth_rate_limit_max: int = 5
    password_reset_rate_limit_max: int = 3
    password_reset_rate_limit_window: int = 60 * 60  # 1 hour
    email_verification_rate_limit_max: int = 15
    email_verification_rate_limit_window: int = 5 * 60  # 5 minutes
    incident_rate_limit_max: int = 100
    incident_rate_limit_window: int = 60  # 1 minute
    
    # Security Configuration
    cookie_secure: bool = False
    cookie_samesite: str = "strict"
    cookie_httponly: bool = True
    
    @validator('environment')
    def validate_environment(cls, v):
        if v not in ['development', 'production', 'testing']:
            raise ValueError('Environment must be development, production, or testing')
        return v
    
    @validator('cors_origins', pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @validator('cookie_secure')
    def set_cookie_secure(cls, v, values):
        if values.get('environment') == 'production':
            return True
        return v
    
    @validator('debug')
    def set_debug(cls, v, values):
        if values.get('environment') == 'production':
            return False
        return v

    model_config = {
        "env_file": ".env",
        "env_prefix": "",
        "case_sensitive": False,
        "extra": "ignore"
    }


# Global settings instance
settings = Settings()
