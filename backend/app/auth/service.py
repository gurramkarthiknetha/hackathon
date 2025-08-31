"""
Authentication service layer with JWT, password hashing, and token utilities.
"""

import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.config import settings


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(seconds=settings.jwt_expires_in)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def generate_verification_code() -> str:
        """Generate a 6-digit verification code."""
        return str(secrets.randbelow(900000) + 100000)
    
    @staticmethod
    def generate_reset_token() -> str:
        """Generate a secure reset token."""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email address."""
        user = await db.users.find_one({"email": email.lower()})
        if user:
            user["_id"] = str(user["_id"])
        return user
    
    @staticmethod
    async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID."""
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if user:
                user["_id"] = str(user["_id"])
            return user
        except Exception:
            return None
    
    @staticmethod
    async def create_user(db: AsyncIOMotorDatabase, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user."""
        # Hash password
        user_data["password"] = AuthService.hash_password(user_data["password"])
        
        # Set default values
        user_data.update({
            "email": user_data["email"].lower(),
            "isVerified": False,
            "lastLogin": datetime.utcnow(),
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        })
        
        # Generate verification token
        verification_code = AuthService.generate_verification_code()
        user_data.update({
            "verificationToken": verification_code,
            "verificationTokenExpiresAt": datetime.utcnow() + timedelta(hours=24)
        })
        
        result = await db.users.insert_one(user_data)
        user_data["_id"] = str(result.inserted_id)
        
        return user_data
    
    @staticmethod
    async def update_user(db: AsyncIOMotorDatabase, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user data."""
        try:
            update_data["updatedAt"] = datetime.utcnow()
            result = await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception:
            return False
    
    @staticmethod
    async def verify_user_email(db: AsyncIOMotorDatabase, verification_code: str) -> Optional[Dict[str, Any]]:
        """Verify user email with verification code."""
        user = await db.users.find_one({
            "verificationToken": verification_code,
            "verificationTokenExpiresAt": {"$gt": datetime.utcnow()}
        })
        
        if user:
            # Update user as verified
            await db.users.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "isVerified": True,
                        "updatedAt": datetime.utcnow()
                    },
                    "$unset": {
                        "verificationToken": "",
                        "verificationTokenExpiresAt": ""
                    }
                }
            )
            user["_id"] = str(user["_id"])
            user["isVerified"] = True
            
        return user
    
    @staticmethod
    async def create_password_reset_token(db: AsyncIOMotorDatabase, email: str) -> Optional[str]:
        """Create password reset token for user."""
        user = await AuthService.get_user_by_email(db, email)
        if not user:
            return None
        
        reset_token = AuthService.generate_reset_token()
        await db.users.update_one(
            {"_id": ObjectId(user["_id"])},
            {
                "$set": {
                    "resetPasswordToken": reset_token,
                    "resetPasswordExpiresAt": datetime.utcnow() + timedelta(hours=1),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return reset_token
    
    @staticmethod
    async def reset_password_with_token(db: AsyncIOMotorDatabase, token: str, new_password: str) -> bool:
        """Reset password using reset token."""
        user = await db.users.find_one({
            "resetPasswordToken": token,
            "resetPasswordExpiresAt": {"$gt": datetime.utcnow()}
        })
        
        if not user:
            return False
        
        # Update password and clear reset token
        hashed_password = AuthService.hash_password(new_password)
        await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "password": hashed_password,
                    "updatedAt": datetime.utcnow()
                },
                "$unset": {
                    "resetPasswordToken": "",
                    "resetPasswordExpiresAt": ""
                }
            }
        )
        
        return True
    
    @staticmethod
    async def update_last_login(db: AsyncIOMotorDatabase, user_id: str):
        """Update user's last login timestamp."""
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "lastLogin": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
    
    @staticmethod
    async def update_user_location(db: AsyncIOMotorDatabase, user_id: str, latitude: float, longitude: float) -> bool:
        """Update user's current location."""
        try:
            result = await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "currentLocation": {
                            "latitude": latitude,
                            "longitude": longitude,
                            "lastUpdated": datetime.utcnow()
                        },
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception:
            return False
