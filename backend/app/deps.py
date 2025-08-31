"""
Dependency injection for FastAPI application.
Contains common dependencies like database connections, authentication, etc.
"""

from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.db.mongo import get_database


# Security scheme for JWT Bearer tokens
security = HTTPBearer()


async def get_db() -> AsyncIOMotorDatabase:
    """Get database dependency."""
    return await get_database()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> str:
    """
    Extract user ID from JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.jwt_secret, 
            algorithms=[settings.jwt_algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    return user_id


async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> dict:
    """
    Get current user from database using JWT token.
    """
    from bson import ObjectId
    
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user"
        )


async def get_current_user_from_cookie(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> Optional[dict]:
    """
    Get current user from JWT cookie (for compatibility with existing frontend).
    """
    from bson import ObjectId
    
    token = request.cookies.get("token")
    if not token:
        return None
    
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret, 
            algorithms=[settings.jwt_algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
            
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            return None
            
        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])
        return user
    except JWTError:
        return None


def require_role(*allowed_roles: str):
    """
    Dependency factory for role-based access control.
    """
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    
    return role_checker


def require_verified_user():
    """
    Dependency to ensure user is email verified.
    """
    async def verified_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if not current_user.get("isVerified", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email verification required"
            )
        return current_user
    
    return verified_checker


# Common role dependencies
require_admin = require_role("admin")
require_operator = require_role("operator", "admin")
require_responder = require_role("responder", "operator", "admin")
require_any_role = require_role("admin", "operator", "responder")
