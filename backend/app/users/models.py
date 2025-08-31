"""
User management Pydantic models and schemas.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId

from app.auth.models import UserResponse, LocationUpdate


class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    limit: int


class UserSearchQuery(BaseModel):
    role: Optional[str] = Field(None, regex="^(admin|operator|responder)$")
    zone: Optional[str] = None
    isActive: Optional[bool] = None
    isVerified: Optional[bool] = None
    search: Optional[str] = None  # Search in name or email


class ResponderLocation(BaseModel):
    userId: str
    name: str
    role: str
    currentLocation: Optional[dict] = None
    assignedZone: Optional[str] = None
    lastUpdated: Optional[datetime] = None
    isActive: bool = True


class ResponderLocationResponse(BaseModel):
    responders: List[ResponderLocation]
    total: int


class ZoneAssignment(BaseModel):
    userId: str
    zoneName: str


class UserStats(BaseModel):
    totalUsers: int
    activeUsers: int
    usersByRole: dict
    verifiedUsers: int
    unverifiedUsers: int
