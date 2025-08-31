"""
Seed monitoring data script for FastAPI backend.
Creates sample incidents, zones, and test data for development.
"""

import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from app.config import settings


async def seed_monitoring_data():
    """Seed the database with sample monitoring data"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(settings.mongodb_uri)
        db = client[settings.db_name]
        
        print("🔗 Connected to MongoDB")
        
        # Clear existing data
        await db.incidents.delete_many({})
        print("🧹 Cleared existing monitoring data")
        
        # Sample zones data
        sample_zones = [
            {
                "name": "east_zone",
                "displayName": "East Zone",
                "description": "Main stage area with high crowd density",
                "coordinates": [
                    [-74.0059, 40.7128], [-74.0049, 40.7128], 
                    [-74.0049, 40.7138], [-74.0059, 40.7138], 
                    [-74.0059, 40.7128]
                ],
                "center": {"latitude": 40.7133, "longitude": -74.0054},
                "capacity": 5000,
                "currentOccupancy": 3200,
                "riskLevel": "medium",
                "eventType": "concert",
                "isActive": True,
                "cameras": [
                    {
                        "id": "cam_east_01",
                        "name": "East Zone Camera 1",
                        "location": {"latitude": 40.7130, "longitude": -74.0056},
                        "isActive": True,
                        "streamUrl": "rtmp://stream.example.com/east_01"
                    },
                    {
                        "id": "cam_east_02",
                        "name": "East Zone Camera 2",
                        "location": {"latitude": 40.7136, "longitude": -74.0052},
                        "isActive": True,
                        "streamUrl": "rtmp://stream.example.com/east_02"
                    }
                ],
                "emergencyExits": [
                    {
                        "name": "East Exit A",
                        "location": {"latitude": 40.7135, "longitude": -74.0060},
                        "isBlocked": False
                    },
                    {
                        "name": "East Exit B",
                        "location": {"latitude": 40.7131, "longitude": -74.0048},
                        "isBlocked": False
                    }
                ],
                "assignedResponders": [],
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "name": "west_zone",
                "displayName": "West Zone",
                "description": "Food court and vendor area",
                "coordinates": [
                    [-74.0079, 40.7128], [-74.0069, 40.7128],
                    [-74.0069, 40.7138], [-74.0079, 40.7138],
                    [-74.0079, 40.7128]
                ],
                "center": {"latitude": 40.7133, "longitude": -74.0074},
                "capacity": 2000,
                "currentOccupancy": 800,
                "riskLevel": "low",
                "eventType": "festival",
                "isActive": True,
                "cameras": [
                    {
                        "id": "cam_west_01",
                        "name": "West Zone Camera 1",
                        "location": {"latitude": 40.7130, "longitude": -74.0076},
                        "isActive": True,
                        "streamUrl": "rtmp://stream.example.com/west_01"
                    }
                ],
                "emergencyExits": [
                    {
                        "name": "West Exit A",
                        "location": {"latitude": 40.7135, "longitude": -74.0080},
                        "isBlocked": False
                    }
                ],
                "assignedResponders": [],
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "name": "north_zone",
                "displayName": "North Zone",
                "description": "VIP and backstage area",
                "coordinates": [
                    [-74.0069, 40.7148], [-74.0059, 40.7148],
                    [-74.0059, 40.7158], [-74.0069, 40.7158],
                    [-74.0069, 40.7148]
                ],
                "center": {"latitude": 40.7153, "longitude": -74.0064},
                "capacity": 500,
                "currentOccupancy": 120,
                "riskLevel": "low",
                "eventType": "concert",
                "isActive": True,
                "cameras": [
                    {
                        "id": "cam_north_01",
                        "name": "North Zone Camera 1",
                        "location": {"latitude": 40.7150, "longitude": -74.0066},
                        "isActive": True,
                        "streamUrl": "rtmp://stream.example.com/north_01"
                    }
                ],
                "emergencyExits": [
                    {
                        "name": "North Exit A",
                        "location": {"latitude": 40.7155, "longitude": -74.0070},
                        "isBlocked": False
                    }
                ],
                "assignedResponders": [],
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "name": "south_zone",
                "displayName": "South Zone",
                "description": "Parking and entry area",
                "coordinates": [
                    [-74.0069, 40.7108], [-74.0059, 40.7108],
                    [-74.0059, 40.7118], [-74.0069, 40.7118],
                    [-74.0069, 40.7108]
                ],
                "center": {"latitude": 40.7113, "longitude": -74.0064},
                "capacity": 1000,
                "currentOccupancy": 450,
                "riskLevel": "low",
                "eventType": "festival",
                "isActive": True,
                "cameras": [
                    {
                        "id": "cam_south_01",
                        "name": "South Zone Camera 1",
                        "location": {"latitude": 40.7110, "longitude": -74.0066},
                        "isActive": True,
                        "streamUrl": "rtmp://stream.example.com/south_01"
                    }
                ],
                "emergencyExits": [
                    {
                        "name": "South Exit A",
                        "location": {"latitude": 40.7115, "longitude": -74.0070},
                        "isBlocked": False
                    }
                ],
                "assignedResponders": [],
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        ]
        
        # Insert zones
        await db.zones.insert_many(sample_zones)
        print(f"✅ Created {len(sample_zones)} sample zones")
        
        # Sample incidents
        incidents = [
            {
                "type": "crowd_surge",
                "zone": "east_zone",
                "location": {
                    "latitude": 40.7132,
                    "longitude": -74.0055,
                    "description": "Near main stage barrier"
                },
                "severity": "high",
                "confidence": 87,
                "description": "Crowd density exceeding safe limits detected near main stage",
                "status": "active",
                "aiGenerated": True,
                "humanApprovalRequired": True,
                "humanApproved": False,
                "priority": 4,
                "videoSnapshot": "/snapshots/crowd_surge_001.jpg",
                "boundingBoxes": [
                    {
                        "x": 120,
                        "y": 80,
                        "width": 200,
                        "height": 150,
                        "label": "crowd_density",
                        "confidence": 87
                    }
                ],
                "notes": [],
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            },
            {
                "type": "medical_emergency",
                "zone": "west_zone",
                "location": {
                    "latitude": 40.7131,
                    "longitude": -74.0075,
                    "description": "Food court area"
                },
                "severity": "medium",
                "confidence": 92,
                "description": "Person requiring medical assistance detected",
                "status": "assigned",
                "aiGenerated": True,
                "humanApprovalRequired": False,
                "humanApproved": True,
                "priority": 3,
                "videoSnapshot": "/snapshots/medical_001.jpg",
                "assignedAt": datetime.utcnow() - timedelta(minutes=15),
                "boundingBoxes": [
                    {
                        "x": 300,
                        "y": 200,
                        "width": 80,
                        "height": 120,
                        "label": "person_down",
                        "confidence": 92
                    }
                ],
                "notes": [],
                "createdAt": datetime.utcnow() - timedelta(minutes=15),
                "updatedAt": datetime.utcnow() - timedelta(minutes=10)
            },
            {
                "type": "fire",
                "zone": "north_zone",
                "location": {
                    "latitude": 40.7151,
                    "longitude": -74.0065,
                    "description": "Backstage equipment area"
                },
                "severity": "critical",
                "confidence": 95,
                "description": "Smoke and potential fire detected in equipment area",
                "status": "resolved",
                "aiGenerated": True,
                "humanApprovalRequired": True,
                "humanApproved": True,
                "priority": 5,
                "videoSnapshot": "/snapshots/fire_001.jpg",
                "assignedAt": datetime.utcnow() - timedelta(minutes=45),
                "resolvedAt": datetime.utcnow() - timedelta(minutes=20),
                "responseTime": 25,
                "boundingBoxes": [
                    {
                        "x": 150,
                        "y": 100,
                        "width": 100,
                        "height": 80,
                        "label": "smoke",
                        "confidence": 95
                    }
                ],
                "notes": [
                    {
                        "text": "Fire suppression system activated",
                        "addedAt": datetime.utcnow() - timedelta(minutes=30)
                    },
                    {
                        "text": "Area cleared and secured",
                        "addedAt": datetime.utcnow() - timedelta(minutes=20)
                    }
                ],
                "createdAt": datetime.utcnow() - timedelta(minutes=45),
                "updatedAt": datetime.utcnow() - timedelta(minutes=20)
            },
            {
                "type": "unconscious_person",
                "zone": "south_zone",
                "location": {
                    "latitude": 40.7112,
                    "longitude": -74.0065,
                    "description": "Parking area entrance"
                },
                "severity": "medium",
                "confidence": 78,
                "description": "Person appears to be unconscious or in distress",
                "status": "in_progress",
                "aiGenerated": True,
                "humanApprovalRequired": False,
                "humanApproved": True,
                "priority": 3,
                "videoSnapshot": "/snapshots/unconscious_001.jpg",
                "assignedAt": datetime.utcnow() - timedelta(minutes=8),
                "boundingBoxes": [
                    {
                        "x": 250,
                        "y": 180,
                        "width": 60,
                        "height": 100,
                        "label": "person_down",
                        "confidence": 78
                    }
                ],
                "notes": [],
                "createdAt": datetime.utcnow() - timedelta(minutes=8),
                "updatedAt": datetime.utcnow() - timedelta(minutes=5)
            },
            {
                "type": "equipment_failure",
                "zone": "east_zone",
                "location": {
                    "latitude": 40.7134,
                    "longitude": -74.0053,
                    "description": "Sound system area"
                },
                "severity": "low",
                "confidence": 65,
                "description": "Potential equipment malfunction detected",
                "status": "dismissed",
                "aiGenerated": True,
                "humanApprovalRequired": False,
                "humanApproved": False,
                "priority": 2,
                "videoSnapshot": "/snapshots/equipment_001.jpg",
                "notes": [
                    {
                        "text": "False alarm - equipment functioning normally",
                        "addedAt": datetime.utcnow() - timedelta(minutes=10)
                    }
                ],
                "createdAt": datetime.utcnow() - timedelta(minutes=15),
                "updatedAt": datetime.utcnow() - timedelta(minutes=10)
            }
        ]
        
        # Insert incidents
        await db.incidents.insert_many(incidents)
        print(f"✅ Created {len(incidents)} sample incidents")
        
        print("🎉 Sample monitoring data seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding monitoring data: {e}")
    finally:
        client.close()
        print("🔗 Disconnected from MongoDB")


if __name__ == "__main__":
    asyncio.run(seed_monitoring_data())
