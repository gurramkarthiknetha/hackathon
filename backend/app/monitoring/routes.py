"""
Monitoring routes for incidents, zones, and dashboard functionality.
"""

from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import logging

from app.deps import get_database, get_current_user, require_role
from app.auth.models import UserResponse
from app.monitoring.models import (
    Incident, IncidentCreate, IncidentUpdate, IncidentQuery, IncidentResponse,
    Zone, ZoneCreate, ZoneUpdate, ZoneQuery, DashboardStats, AlertCreate
)
from app.middleware.security import incident_limiter
from app.realtime.socket import sio

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])
logger = logging.getLogger(__name__)


# Incident endpoints
@router.get("/incidents", response_model=IncidentResponse)
@incident_limiter.limit("100/60second")
async def get_incidents(
    query: IncidentQuery = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Get incidents with filtering and pagination"""
    try:
        # Build MongoDB filter
        filter_dict = {}
        
        if query.zone:
            filter_dict["zone"] = query.zone
        if query.type:
            filter_dict["type"] = query.type
        if query.severity:
            filter_dict["severity"] = query.severity
        if query.status:
            filter_dict["status"] = query.status
        if query.assignedTo:
            filter_dict["assignedTo"] = query.assignedTo
        if query.startDate or query.endDate:
            date_filter = {}
            if query.startDate:
                date_filter["$gte"] = query.startDate
            if query.endDate:
                date_filter["$lte"] = query.endDate
            filter_dict["createdAt"] = date_filter
        
        # Get total count
        total = await db.incidents.count_documents(filter_dict)
        
        # Calculate pagination
        skip = (query.page - 1) * query.limit
        total_pages = (total + query.limit - 1) // query.limit
        
        # Get incidents
        cursor = db.incidents.find(filter_dict).sort("createdAt", -1).skip(skip).limit(query.limit)
        incidents = await cursor.to_list(length=query.limit)
        
        return IncidentResponse(
            incidents=[Incident(**incident) for incident in incidents],
            total=total,
            page=query.page,
            limit=query.limit,
            totalPages=total_pages
        )
        
    except Exception as e:
        logger.error(f"Error fetching incidents: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch incidents")


@router.get("/incidents/{incident_id}", response_model=Incident)
@incident_limiter.limit("100/60second")
async def get_incident(
    incident_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Get incident by ID"""
    try:
        if not ObjectId.is_valid(incident_id):
            raise HTTPException(status_code=400, detail="Invalid incident ID")
        
        incident = await db.incidents.find_one({"_id": ObjectId(incident_id)})
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        return Incident(**incident)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching incident {incident_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch incident")


@router.post("/incidents", response_model=Incident, status_code=status.HTTP_201_CREATED)
@incident_limiter.limit("50/60second")
async def create_incident(
    incident_data: IncidentCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(require_role(["operator", "admin"]))
):
    """Create new incident"""
    try:
        # Create incident document
        incident_doc = {
            **incident_data.dict(),
            "aiGenerated": False,  # Manual creation
            "humanApprovalRequired": False,
            "humanApproved": True,
            "status": "active",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await db.incidents.insert_one(incident_doc)
        incident_doc["_id"] = result.inserted_id
        
        # Emit real-time notification
        await sio.emit("new-incident", {
            "incident": {**incident_doc, "_id": str(result.inserted_id)},
            "createdBy": current_user.name
        })
        
        logger.info(f"Incident created: {result.inserted_id} by {current_user.email}")
        return Incident(**incident_doc)
        
    except Exception as e:
        logger.error(f"Error creating incident: {e}")
        raise HTTPException(status_code=500, detail="Failed to create incident")


@router.put("/incidents/{incident_id}", response_model=Incident)
@incident_limiter.limit("50/60second")
async def update_incident(
    incident_id: str,
    update_data: IncidentUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Update incident"""
    try:
        if not ObjectId.is_valid(incident_id):
            raise HTTPException(status_code=400, detail="Invalid incident ID")
        
        # Check if incident exists
        incident = await db.incidents.find_one({"_id": ObjectId(incident_id)})
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        # Build update document
        update_doc = {"updatedAt": datetime.utcnow()}
        
        if update_data.status:
            update_doc["status"] = update_data.status
            if update_data.status == "assigned" and update_data.assignedTo:
                update_doc["assignedTo"] = update_data.assignedTo
                update_doc["assignedAt"] = datetime.utcnow()
            elif update_data.status == "resolved":
                update_doc["resolvedAt"] = datetime.utcnow()
                if incident.get("assignedAt"):
                    response_time = (datetime.utcnow() - incident["assignedAt"]).total_seconds() / 60
                    update_doc["responseTime"] = int(response_time)
        
        if update_data.humanApproved is not None:
            update_doc["humanApproved"] = update_data.humanApproved
        
        if update_data.notes:
            note = {
                "text": update_data.notes,
                "addedAt": datetime.utcnow(),
                "addedBy": current_user.name
            }
            update_doc["$push"] = {"notes": note}
        
        # Update incident
        await db.incidents.update_one(
            {"_id": ObjectId(incident_id)},
            {"$set": update_doc} if "$push" not in update_doc else {
                "$set": {k: v for k, v in update_doc.items() if k != "$push"},
                "$push": update_doc["$push"]
            }
        )
        
        # Get updated incident
        updated_incident = await db.incidents.find_one({"_id": ObjectId(incident_id)})
        
        # Emit real-time update
        await sio.emit("incident-update", {
            "incident": {**updated_incident, "_id": str(updated_incident["_id"])},
            "updatedBy": current_user.name
        })
        
        logger.info(f"Incident updated: {incident_id} by {current_user.email}")
        return Incident(**updated_incident)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating incident {incident_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update incident")


# Zone endpoints
@router.get("/zones", response_model=List[Zone])
@incident_limiter.limit("100/60second")
async def get_zones(
    query: ZoneQuery = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Get all zones with optional filtering"""
    try:
        filter_dict = {}
        
        if query.isActive is not None:
            filter_dict["isActive"] = query.isActive
        if query.riskLevel:
            filter_dict["riskLevel"] = query.riskLevel
        if query.eventType:
            filter_dict["eventType"] = query.eventType
        
        cursor = db.zones.find(filter_dict).sort("name", 1)
        zones = await cursor.to_list(length=None)
        
        return [Zone(**zone) for zone in zones]
        
    except Exception as e:
        logger.error(f"Error fetching zones: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch zones")


@router.get("/zones/{zone_id}", response_model=Zone)
@incident_limiter.limit("100/60second")
async def get_zone(
    zone_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Get zone by ID or name"""
    try:
        # Try to find by ObjectId first, then by name
        if ObjectId.is_valid(zone_id):
            zone = await db.zones.find_one({"_id": ObjectId(zone_id)})
        else:
            zone = await db.zones.find_one({"name": zone_id})
        
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")
        
        return Zone(**zone)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching zone {zone_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch zone")


@router.post("/zones", response_model=Zone, status_code=status.HTTP_201_CREATED)
@incident_limiter.limit("20/60second")
async def create_zone(
    zone_data: ZoneCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(require_role(["admin"]))
):
    """Create new zone (admin only)"""
    try:
        # Check if zone name already exists
        existing = await db.zones.find_one({"name": zone_data.name})
        if existing:
            raise HTTPException(status_code=400, detail="Zone name already exists")
        
        zone_doc = {
            **zone_data.dict(),
            "currentOccupancy": 0,
            "isActive": True,
            "assignedResponders": [],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await db.zones.insert_one(zone_doc)
        zone_doc["_id"] = result.inserted_id
        
        logger.info(f"Zone created: {zone_data.name} by {current_user.email}")
        return Zone(**zone_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating zone: {e}")
        raise HTTPException(status_code=500, detail="Failed to create zone")


@router.put("/zones/{zone_id}", response_model=Zone)
@incident_limiter.limit("50/60second")
async def update_zone(
    zone_id: str,
    update_data: ZoneUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(require_role(["operator", "admin"]))
):
    """Update zone"""
    try:
        # Find zone
        if ObjectId.is_valid(zone_id):
            zone = await db.zones.find_one({"_id": ObjectId(zone_id)})
            filter_dict = {"_id": ObjectId(zone_id)}
        else:
            zone = await db.zones.find_one({"name": zone_id})
            filter_dict = {"name": zone_id}
        
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")
        
        # Build update document
        update_doc = {
            **update_data.dict(exclude_unset=True),
            "updatedAt": datetime.utcnow()
        }
        
        await db.zones.update_one(filter_dict, {"$set": update_doc})
        
        # Get updated zone
        updated_zone = await db.zones.find_one(filter_dict)
        
        logger.info(f"Zone updated: {zone_id} by {current_user.email}")
        return Zone(**updated_zone)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating zone {zone_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update zone")


# Dashboard endpoints
@router.get("/dashboard/stats", response_model=DashboardStats)
@incident_limiter.limit("50/60second")
async def get_dashboard_stats(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics"""
    try:
        # Incident stats
        total_incidents = await db.incidents.count_documents({})
        active_incidents = await db.incidents.count_documents({"status": {"$in": ["active", "assigned", "in_progress"]}})
        resolved_incidents = await db.incidents.count_documents({"status": "resolved"})
        critical_incidents = await db.incidents.count_documents({"severity": "critical", "status": {"$ne": "resolved"}})
        high_priority_incidents = await db.incidents.count_documents({"priority": {"$gte": 4}, "status": {"$ne": "resolved"}})
        
        # Zone stats
        total_zones = await db.zones.count_documents({})
        active_zones = await db.zones.count_documents({"isActive": True})
        
        # Capacity stats
        capacity_pipeline = [
            {"$group": {
                "_id": None,
                "totalCapacity": {"$sum": "$capacity"},
                "currentOccupancy": {"$sum": "$currentOccupancy"}
            }}
        ]
        capacity_result = await db.zones.aggregate(capacity_pipeline).to_list(1)
        total_capacity = capacity_result[0]["totalCapacity"] if capacity_result else 0
        current_occupancy = capacity_result[0]["currentOccupancy"] if capacity_result else 0
        occupancy_rate = (current_occupancy / total_capacity * 100) if total_capacity > 0 else 0
        
        # Response time stats
        response_time_pipeline = [
            {"$match": {"responseTime": {"$exists": True}}},
            {"$group": {"_id": None, "avgResponseTime": {"$avg": "$responseTime"}}}
        ]
        response_time_result = await db.incidents.aggregate(response_time_pipeline).to_list(1)
        avg_response_time = response_time_result[0]["avgResponseTime"] if response_time_result else None
        
        # Incidents by type
        type_pipeline = [
            {"$group": {"_id": "$type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        type_result = await db.incidents.aggregate(type_pipeline).to_list(None)
        incidents_by_type = {item["_id"]: item["count"] for item in type_result}
        
        # Incidents by severity
        severity_pipeline = [
            {"$group": {"_id": "$severity", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        severity_result = await db.incidents.aggregate(severity_pipeline).to_list(None)
        incidents_by_severity = {item["_id"]: item["count"] for item in severity_result}
        
        # Incidents by status
        status_pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        status_result = await db.incidents.aggregate(status_pipeline).to_list(None)
        incidents_by_status = {item["_id"]: item["count"] for item in status_result}
        
        return DashboardStats(
            totalIncidents=total_incidents,
            activeIncidents=active_incidents,
            resolvedIncidents=resolved_incidents,
            criticalIncidents=critical_incidents,
            highPriorityIncidents=high_priority_incidents,
            totalZones=total_zones,
            activeZones=active_zones,
            totalCapacity=total_capacity,
            currentOccupancy=current_occupancy,
            occupancyRate=round(occupancy_rate, 2),
            averageResponseTime=round(avg_response_time, 2) if avg_response_time else None,
            incidentsByType=incidents_by_type,
            incidentsBySeverity=incidents_by_severity,
            incidentsByStatus=incidents_by_status
        )
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard statistics")


@router.post("/alerts", status_code=status.HTTP_201_CREATED)
@incident_limiter.limit("20/60second")
async def create_alert(
    alert_data: AlertCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(require_role(["operator", "admin"]))
):
    """Create and broadcast alert"""
    try:
        # Create alert document
        alert_doc = {
            **alert_data.dict(),
            "createdBy": current_user.name,
            "createdAt": datetime.utcnow()
        }
        
        # Broadcast alert via Socket.IO
        await sio.emit("alert", alert_doc)
        
        # Optionally save to database for audit trail
        await db.alerts.insert_one(alert_doc)
        
        logger.info(f"Alert created: {alert_data.type} in {alert_data.zone} by {current_user.email}")
        return {"message": "Alert created and broadcasted successfully"}
        
    except Exception as e:
        logger.error(f"Error creating alert: {e}")
        raise HTTPException(status_code=500, detail="Failed to create alert")
