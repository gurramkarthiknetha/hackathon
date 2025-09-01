"""
MongoDB connection and database utilities using Motor (async MongoDB driver).
"""

import asyncio
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import pymongo
from pymongo.errors import ServerSelectionTimeoutError

from app.config import settings


class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

db = MongoDB()


async def connect_to_mongo():
    """Create database connection."""
    try:
        db.client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=8000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
        )
        
        # Test the connection
        await db.client.admin.command('ping')
        
        db.database = db.client[settings.db_name]
        
        # Create indexes
        await create_indexes()
        
        print(f"✅ Connected to MongoDB: {settings.db_name}")
        
    except ServerSelectionTimeoutError:
        print("❌ Failed to connect to MongoDB - Server selection timeout")
        raise
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection."""
    if db.client:
        db.client.close()
        print("✅ Disconnected from MongoDB")


async def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    if db.database is None:
        await connect_to_mongo()
    return db.database


async def create_indexes():
    """Create database indexes for optimal query performance."""
    if db.database is None:
        return
    
    try:
        # Users collection indexes
        await db.database.users.create_index("email", unique=True)
        await db.database.users.create_index("resetPasswordToken")
        await db.database.users.create_index("verificationToken")
        
        # Incidents collection indexes
        await db.database.incidents.create_index([("zone", 1), ("status", 1)])
        await db.database.incidents.create_index([("createdAt", -1)])
        await db.database.incidents.create_index([("assignedTo", 1), ("status", 1)])
        await db.database.incidents.create_index("type")
        await db.database.incidents.create_index("severity")
        
        # Zones collection indexes
        await db.database.zones.create_index("name", unique=True)
        await db.database.zones.create_index("isActive")
        
        # Messages collection indexes
        await db.database.messages.create_index([("sender", 1), ("createdAt", -1)])
        await db.database.messages.create_index([("recipients", 1), ("targetZone", 1), ("createdAt", -1)])
        await db.database.messages.create_index([("type", 1), ("priority", 1), ("createdAt", -1)])
        await db.database.messages.create_index("readBy.user")
        await db.database.messages.create_index([("createdAt", -1)])
        
        # Notifications collection indexes
        await db.database.notifications.create_index([("sentBy", 1), ("createdAt", -1)])
        await db.database.notifications.create_index([("recipients", 1), ("createdAt", -1)])
        await db.database.notifications.create_index([("type", 1), ("severity", 1)])
        await db.database.notifications.create_index([("status", 1), ("scheduledFor", 1)])
        await db.database.notifications.create_index("readBy.user")
        
        # Video detection collection indexes
        await db.database.video_detections.create_index([("videoId", 1), ("timestamp", -1)])
        await db.database.video_detections.create_index("cameraId")
        await db.database.video_detections.create_index([("createdAt", -1)])
        
        # Email notification settings indexes
        await db.database.email_notification_settings.create_index("isActive")
        
        print("✅ Database indexes created successfully")
        
    except Exception as e:
        print(f"⚠️ Warning: Failed to create some indexes: {e}")


async def check_connection() -> bool:
    """Check if database connection is healthy."""
    try:
        if not db.client:
            return False
        await db.client.admin.command('ping')
        return True
    except Exception:
        return False
