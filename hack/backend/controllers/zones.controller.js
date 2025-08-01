import { Zone } from "../models/zone.model.js";
import { User } from "../models/user.model.js";
import { Incident } from "../models/incident.model.js";

// Get all zones
export const getAllZones = async (req, res) => {
  try {
    const zones = await Zone.find({ isActive: true })
      .populate("assignedResponders", "name role currentLocation isActive")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: zones
    });
  } catch (error) {
    console.error("Error fetching zones:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch zones"
    });
  }
};

// Get zone by ID with detailed information
export const getZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const zone = await Zone.findById(id)
      .populate("assignedResponders", "name role currentLocation isActive phoneNumber");

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found"
      });
    }

    // Get recent incidents for this zone
    const recentIncidents = await Incident.find({ 
      zone: zone.name,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
    .populate("assignedTo", "name")
    .sort({ createdAt: -1 })
    .limit(10);

    res.status(200).json({
      success: true,
      data: {
        zone,
        recentIncidents
      }
    });
  } catch (error) {
    console.error("Error fetching zone:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch zone"
    });
  }
};

// Get responder locations for all zones
export const getResponderLocations = async (req, res) => {
  try {
    const responders = await User.find({
      role: "responder",
      isActive: true,
      "currentLocation.latitude": { $exists: true, $ne: null },
      "currentLocation.longitude": { $exists: true, $ne: null }
    })
    .select("name assignedZone currentLocation")
    .sort({ "currentLocation.lastUpdated": -1 });

    res.status(200).json({
      success: true,
      data: responders
    });
  } catch (error) {
    console.error("Error fetching responder locations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch responder locations"
    });
  }
};

// Update responder location
export const updateResponderLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.userId;

    // Validate coordinates
    if (!latitude || !longitude || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates"
      });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "responder") {
      return res.status(403).json({
        success: false,
        message: "Only responders can update location"
      });
    }

    user.currentLocation = {
      latitude,
      longitude,
      lastUpdated: new Date()
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        location: user.currentLocation
      },
      message: "Location updated successfully"
    });
  } catch (error) {
    console.error("Error updating responder location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update location"
    });
  }
};

// Create new zone (admin only)
export const createZone = async (req, res) => {
  try {
    const {
      name,
      displayName,
      description,
      coordinates,
      center,
      capacity,
      eventType,
      cameras,
      emergencyExits
    } = req.body;

    const zone = new Zone({
      name,
      displayName,
      description,
      coordinates,
      center,
      capacity: capacity || 0,
      eventType: eventType || "other",
      cameras: cameras || [],
      emergencyExits: emergencyExits || []
    });

    await zone.save();

    res.status(201).json({
      success: true,
      data: zone,
      message: "Zone created successfully"
    });
  } catch (error) {
    console.error("Error creating zone:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Zone name already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create zone"
    });
  }
};

// Update zone occupancy
export const updateZoneOccupancy = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentOccupancy } = req.body;

    const zone = await Zone.findById(id);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found"
      });
    }

    zone.currentOccupancy = currentOccupancy;
    
    // Update risk level based on occupancy
    if (zone.capacity > 0) {
      const occupancyRate = currentOccupancy / zone.capacity;
      if (occupancyRate > 0.9) {
        zone.riskLevel = "high";
      } else if (occupancyRate > 0.7) {
        zone.riskLevel = "medium";
      } else {
        zone.riskLevel = "low";
      }
    }

    await zone.save();

    res.status(200).json({
      success: true,
      data: zone,
      message: "Zone occupancy updated successfully"
    });
  } catch (error) {
    console.error("Error updating zone occupancy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update zone occupancy"
    });
  }
};

// Assign responder to zone
export const assignResponderToZone = async (req, res) => {
  try {
    const { zoneId, responderId } = req.body;

    const zone = await Zone.findById(zoneId);
    const responder = await User.findById(responderId);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found"
      });
    }

    if (!responder || responder.role !== "responder") {
      return res.status(404).json({
        success: false,
        message: "Responder not found"
      });
    }

    // Remove responder from previous zone assignments
    await Zone.updateMany(
      { assignedResponders: responderId },
      { $pull: { assignedResponders: responderId } }
    );

    // Add to new zone
    if (!zone.assignedResponders.includes(responderId)) {
      zone.assignedResponders.push(responderId);
    }

    // Update responder's assigned zone
    responder.assignedZone = zone.name;

    await Promise.all([zone.save(), responder.save()]);

    await zone.populate("assignedResponders", "name role currentLocation");

    res.status(200).json({
      success: true,
      data: zone,
      message: "Responder assigned to zone successfully"
    });
  } catch (error) {
    console.error("Error assigning responder to zone:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign responder to zone"
    });
  }
};
