"""
Pydantic models for monitoring endpoints.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema, handler):
        json_schema = handler(field_schema)
        json_schema.update(type="string")
        return json_schema


class Location(BaseModel):
    latitude: float
    longitude: float
    description: Optional[str] = None


class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int
    label: str
    confidence: float


class IncidentNote(BaseModel):
    text: str
    addedAt: datetime
    addedBy: Optional[str] = None


class Camera(BaseModel):
    id: str
    name: str
    location: Location
    isActive: bool = True
    streamUrl: Optional[str] = None


class EmergencyExit(BaseModel):
    name: str
    location: Location
    isBlocked: bool = False


class Zone(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    displayName: str
    description: Optional[str] = None
    coordinates: List[List[float]]  # Array of [longitude, latitude] pairs
    center: Location
    capacity: int
    currentOccupancy: int = 0
    riskLevel: str = Field(..., pattern="^(low|medium|high|critical)$")
    eventType: Optional[str] = None
    isActive: bool = True
    cameras: List[Camera] = []
    emergencyExits: List[EmergencyExit] = []
    assignedResponders: List[str] = []
    createdAt: datetime
    updatedAt: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Incident(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    type: str
    zone: str
    location: Location
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    confidence: float = Field(..., ge=0, le=100)
    description: str
    status: str = Field(..., pattern="^(active|assigned|in_progress|resolved|dismissed)$")
    aiGenerated: bool = True
    humanApprovalRequired: bool = False
    humanApproved: bool = False
    priority: int = Field(..., ge=1, le=5)
    videoSnapshot: Optional[str] = None
    boundingBoxes: List[BoundingBox] = []
    assignedTo: Optional[str] = None
    assignedAt: Optional[datetime] = None
    resolvedAt: Optional[datetime] = None
    responseTime: Optional[int] = None  # in minutes
    notes: List[IncidentNote] = []
    createdAt: datetime
    updatedAt: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class IncidentCreate(BaseModel):
    type: str
    zone: str
    location: Location
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    confidence: float = Field(..., ge=0, le=100)
    description: str
    priority: int = Field(..., ge=1, le=5)
    videoSnapshot: Optional[str] = None
    boundingBoxes: List[BoundingBox] = []


class IncidentUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(active|assigned|in_progress|resolved|dismissed)$")
    assignedTo: Optional[str] = None
    humanApproved: Optional[bool] = None
    notes: Optional[str] = None


class IncidentQuery(BaseModel):
    zone: Optional[str] = None
    type: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    assignedTo: Optional[str] = None
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    page: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100)


class IncidentResponse(BaseModel):
    incidents: List[Incident]
    total: int
    page: int
    limit: int
    totalPages: int


class ZoneCreate(BaseModel):
    name: str
    displayName: str
    description: Optional[str] = None
    coordinates: List[List[float]]
    center: Location
    capacity: int
    riskLevel: str = Field(..., pattern="^(low|medium|high|critical)$")
    eventType: Optional[str] = None
    cameras: List[Camera] = []
    emergencyExits: List[EmergencyExit] = []


class ZoneUpdate(BaseModel):
    displayName: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    currentOccupancy: Optional[int] = None
    riskLevel: Optional[str] = Field(None, pattern="^(low|medium|high|critical)$")
    isActive: Optional[bool] = None
    assignedResponders: Optional[List[str]] = None


class ZoneQuery(BaseModel):
    isActive: Optional[bool] = None
    riskLevel: Optional[str] = None
    eventType: Optional[str] = None


class DashboardStats(BaseModel):
    totalIncidents: int
    activeIncidents: int
    resolvedIncidents: int
    criticalIncidents: int
    highPriorityIncidents: int
    totalZones: int
    activeZones: int
    totalCapacity: int
    currentOccupancy: int
    occupancyRate: float
    averageResponseTime: Optional[float] = None
    incidentsByType: Dict[str, int]
    incidentsBySeverity: Dict[str, int]
    incidentsByStatus: Dict[str, int]


class AlertCreate(BaseModel):
    type: str
    zone: str
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    message: str
    metadata: Optional[Dict[str, Any]] = None
