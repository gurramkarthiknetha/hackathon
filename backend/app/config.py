"""
Configuration settings for the FastAPI application.
Loads environment variables with validation and defaults.
"""

import os
from typing import List, Optional
from pydantic import BaseSettings, validator


class Settings(BaseSettings):
    # Server Configuration
    app_name: str = "AI Event Monitor API"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    environment: str = "development"
    debug: bool = True
    
    # Database Configuration
    mongodb_uri: str = "mongodb://localhost:27017/auth_tutorial"
    db_name: str = "auth_tutorial"
    
    # JWT Configuration
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expires_in: int = 24 * 60 * 60  # 24 hours in seconds
    
    # Client Configuration
    client_url: str = "http://localhost:5173"
    
    # CORS Configuration
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://10.100.14.125:5173",
        "https://aieventmonitor.vercel.app"
    ]
    
    # Email Configuration (SMTP)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_secure: bool = False
    smtp_user: str
    smtp_pass: str
    smtp_from: str
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

    class Config:
        env_file = ".env"
        env_prefix = ""
        case_sensitive = False
        
        # Environment variable mappings
        fields = {
            'app_host': {'env': 'APP_HOST'},
            'app_port': {'env': 'PORT'},
            'environment': {'env': 'NODE_ENV'},
            'mongodb_uri': {'env': 'MONGO_URI'},
            'jwt_secret': {'env': 'JWT_SECRET'},
            'client_url': {'env': 'CLIENT_URL'},
            'smtp_host': {'env': 'EMAIL_HOST'},
            'smtp_port': {'env': 'EMAIL_PORT'},
            'smtp_secure': {'env': 'EMAIL_SECURE'},
            'smtp_user': {'env': 'EMAIL_USER'},
            'smtp_pass': {'env': 'EMAIL_PASS'},
            'smtp_from': {'env': 'EMAIL_FROM'},
            'smtp_from_name': {'env': 'EMAIL_FROM_NAME'},
            'google_maps_api_key': {'env': 'GOOGLE_MAPS_API_KEY'},
        }


# Global settings instance
settings = Settings()
