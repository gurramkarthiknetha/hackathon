"""
User management routes for FastAPI application.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from bson import ObjectId

from app.deps import get_db, require_admin, require_operator, require_any_role
from app.users.models import (
    UserListResponse, UserSearchQuery, ResponderLocationResponse, 
    ZoneAssignment, UserStats, LocationUpdate
)
from app.auth.models import UserResponse, UserUpdate
from app.auth.service import AuthService

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", response_model=UserListResponse)
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    role: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    isActive: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(require_operator),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get paginated list of users with filtering"""
    
    # Build query
    query = {}
    if role:
        query["role"] = role
    if zone:
        query["assignedZone"] = zone
    if isActive is not None:
        query["isActive"] = isActive
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await db.users.count_documents(query)
    
    # Get paginated results
    skip = (page - 1) * limit
    cursor = db.users.find(query).skip(skip).limit(limit).sort("createdAt", -1)
    users = await cursor.to_list(length=limit)
    
    # Convert to response format
    user_responses = []
    for user in users:
        user["_id"] = str(user["_id"])
        user_responses.append(UserResponse(**user))
    
    return UserListResponse(
        users=user_responses,
        total=total,
        page=page,
        limit=limit
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(require_any_role),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user by ID"""
    
    # Users can only view their own profile unless they're admin/operator
    if (current_user["role"] not in ["admin", "operator"] and 
        current_user["_id"] != user_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    user = await AuthService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(**user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: dict = Depends(require_operator),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update user information"""
    
    # Check if user exists
    existing_user = await AuthService.get_user_by_id(db, user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user
    update_data = user_update.dict(exclude_unset=True)
    success = await AuthService.update_user(db, user_id, update_data)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update user")
    
    # Return updated user
    updated_user = await AuthService.get_user_by_id(db, user_id)
    return UserResponse(**updated_user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Soft delete user (deactivate)"""
    
    # Check if user exists
    existing_user = await AuthService.get_user_by_id(db, user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent self-deletion
    if current_user["_id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Deactivate user
    success = await AuthService.update_user(db, user_id, {"isActive": False})
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete user")
    
    return {"success": True, "message": "User deactivated successfully"}


@router.get("/responders/locations", response_model=ResponderLocationResponse)
async def get_responder_locations(
    current_user: dict = Depends(require_any_role),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get locations of all active responders"""
    
    # Query active responders with location data
    query = {
        "role": "responder",
        "isActive": True,
        "currentLocation": {"$exists": True, "$ne": None}
    }
    
    responders = await db.users.find(query).to_list(length=None)
    
    responder_locations = []
    for responder in responders:
        location_data = {
            "userId": str(responder["_id"]),
            "name": responder["name"],
            "role": responder["role"],
            "currentLocation": responder.get("currentLocation"),
            "assignedZone": responder.get("assignedZone"),
            "lastUpdated": responder.get("currentLocation", {}).get("lastUpdated"),
            "isActive": responder["isActive"]
        }
        responder_locations.append(location_data)
    
    return ResponderLocationResponse(
        responders=responder_locations,
        total=len(responder_locations)
    )


@router.patch("/responders/{user_id}/location")
async def update_responder_location(
    user_id: str,
    location: LocationUpdate,
    current_user: dict = Depends(require_any_role),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update responder's current location"""
    
    # Check permissions - responders can only update their own location
    if (current_user["role"] == "responder" and 
        current_user["_id"] != user_id):
        raise HTTPException(status_code=403, detail="Can only update your own location")
    
    # Update location
    success = await AuthService.update_user_location(
        db, user_id, location.latitude, location.longitude
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="User not found or update failed")
    
    return {"success": True, "message": "Location updated successfully"}


@router.post("/assign-zone")
async def assign_user_to_zone(
    assignment: ZoneAssignment,
    current_user: dict = Depends(require_operator),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Assign user to a zone"""
    
    # Check if user exists
    user = await AuthService.get_user_by_id(db, assignment.userId)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if zone exists
    zone = await db.zones.find_one({"name": assignment.zoneName})
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    # Update user's assigned zone
    success = await AuthService.update_user(db, assignment.userId, {
        "assignedZone": assignment.zoneName
    })
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to assign zone")
    
    # Add user to zone's assigned responders if they're a responder
    if user["role"] == "responder":
        await db.zones.update_one(
            {"name": assignment.zoneName},
            {"$addToSet": {"assignedResponders": ObjectId(assignment.userId)}}
        )
    
    return {"success": True, "message": "Zone assigned successfully"}


@router.get("/stats", response_model=UserStats)
async def get_user_statistics(
    current_user: dict = Depends(require_operator),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user statistics"""
    
    # Aggregate user statistics
    pipeline = [
        {
            "$group": {
                "_id": None,
                "totalUsers": {"$sum": 1},
                "activeUsers": {
                    "$sum": {"$cond": [{"$eq": ["$isActive", True]}, 1, 0]}
                },
                "verifiedUsers": {
                    "$sum": {"$cond": [{"$eq": ["$isVerified", True]}, 1, 0]}
                },
                "unverifiedUsers": {
                    "$sum": {"$cond": [{"$eq": ["$isVerified", False]}, 1, 0]}
                },
                "adminCount": {
                    "$sum": {"$cond": [{"$eq": ["$role", "admin"]}, 1, 0]}
                },
                "operatorCount": {
                    "$sum": {"$cond": [{"$eq": ["$role", "operator"]}, 1, 0]}
                },
                "responderCount": {
                    "$sum": {"$cond": [{"$eq": ["$role", "responder"]}, 1, 0]}
                }
            }
        }
    ]
    
    result = await db.users.aggregate(pipeline).to_list(length=1)
    
    if not result:
        stats_data = {
            "totalUsers": 0,
            "activeUsers": 0,
            "usersByRole": {"admin": 0, "operator": 0, "responder": 0},
            "verifiedUsers": 0,
            "unverifiedUsers": 0
        }
    else:
        data = result[0]
        stats_data = {
            "totalUsers": data.get("totalUsers", 0),
            "activeUsers": data.get("activeUsers", 0),
            "usersByRole": {
                "admin": data.get("adminCount", 0),
                "operator": data.get("operatorCount", 0),
                "responder": data.get("responderCount", 0)
            },
            "verifiedUsers": data.get("verifiedUsers", 0),
            "unverifiedUsers": data.get("unverifiedUsers", 0)
        }
    
    return UserStats(**stats_data)
