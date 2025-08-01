import { Incident } from "../models/incident.model.js";
import { Zone } from "../models/zone.model.js";
import { User } from "../models/user.model.js";
import {
  sendIncidentCreatedNotification,
  sendIncidentAssignedNotification,
  sendIncidentStatusUpdateNotification
} from "../services/alertEmailService.js";

// Get all active incidents
export const getActiveIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ 
      status: { $in: ["active", "assigned", "in_progress"] } 
    })
    .populate("assignedTo", "name role")
    .populate("approvedBy", "name")
    .sort({ createdAt: -1 })
    .limit(50);

    res.status(200).json({
      success: true,
      data: incidents
    });
  } catch (error) {
    console.error("Error fetching active incidents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active incidents"
    });
  }
};

// Get incidents by zone
export const getIncidentsByZone = async (req, res) => {
  try {
    const { zone } = req.params;
    const { status, limit = 20 } = req.query;

    const query = { zone };
    if (status) {
      query.status = status;
    }

    const incidents = await Incident.find(query)
      .populate("assignedTo", "name role")
      .populate("resolvedBy", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: incidents
    });
  } catch (error) {
    console.error("Error fetching incidents by zone:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch incidents"
    });
  }
};

// Create new incident
export const createIncident = async (req, res) => {
  try {
    const {
      type,
      zone,
      location,
      severity,
      confidence,
      description,
      videoSnapshot,
      boundingBoxes,
      humanApprovalRequired
    } = req.body;

    // Calculate priority based on severity and type
    let priority = 3;
    if (severity === "critical") priority = 5;
    else if (severity === "high") priority = 4;
    else if (severity === "medium") priority = 3;
    else if (severity === "low") priority = 2;

    // High-risk incident types require human approval
    const highRiskTypes = ["fire", "security_threat", "medical_emergency"];
    const requiresApproval = humanApprovalRequired || highRiskTypes.includes(type);

    const incident = new Incident({
      type,
      zone,
      location,
      severity,
      confidence,
      description,
      videoSnapshot,
      boundingBoxes: boundingBoxes || [],
      humanApprovalRequired: requiresApproval,
      priority
    });

    await incident.save();

    // Populate the created incident
    await incident.populate("assignedTo", "name role");

    // Send email notifications to relevant users
    try {
      await sendIncidentCreatedNotification(incident);
    } catch (emailError) {
      console.error("Failed to send incident created email notifications:", emailError);
      // Don't fail the incident creation if email fails
    }

    res.status(201).json({
      success: true,
      data: incident,
      message: "Incident created successfully"
    });
  } catch (error) {
    console.error("Error creating incident:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create incident"
    });
  }
};

// Update incident status
export const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.userId;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    // Store previous status for email notification
    const previousStatus = incident.status;

    // Update status
    incident.status = status;

    // Add notes if provided
    if (notes) {
      incident.notes.push({
        text: notes,
        addedBy: userId,
        addedAt: new Date()
      });
    }

    // Set resolved timestamp if resolving
    if (status === "resolved") {
      incident.resolvedAt = new Date();
      incident.resolvedBy = userId;

      // Calculate response time if assigned
      if (incident.assignedAt) {
        const responseTimeMs = incident.resolvedAt - incident.assignedAt;
        incident.responseTime = Math.round(responseTimeMs / (1000 * 60)); // in minutes
      }
    }

    await incident.save();
    await incident.populate(["assignedTo", "resolvedBy", "approvedBy"], "name role");

    // Get the user who updated the incident for email notification
    const updatedByUser = await User.findById(userId).select("name role");

    // Send email notifications about the status update
    try {
      await sendIncidentStatusUpdateNotification(incident, previousStatus, updatedByUser, notes);
    } catch (emailError) {
      console.error("Failed to send incident status update email notifications:", emailError);
      // Don't fail the status update if email fails
    }

    res.status(200).json({
      success: true,
      data: incident,
      message: "Incident updated successfully"
    });
  } catch (error) {
    console.error("Error updating incident:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update incident"
    });
  }
};

// Assign incident to responder
export const assignIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { responderId } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    // Verify responder exists and has correct role
    const responder = await User.findById(responderId);
    if (!responder || !["responder", "admin"].includes(responder.role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid responder"
      });
    }

    incident.assignedTo = responderId;
    incident.assignedAt = new Date();
    incident.status = "assigned";

    await incident.save();
    await incident.populate("assignedTo", "name role phoneNumber");

    // Send email notifications about the assignment
    try {
      await sendIncidentAssignedNotification(incident, responder);
    } catch (emailError) {
      console.error("Failed to send incident assigned email notifications:", emailError);
      // Don't fail the assignment if email fails
    }

    res.status(200).json({
      success: true,
      data: incident,
      message: "Incident assigned successfully"
    });
  } catch (error) {
    console.error("Error assigning incident:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign incident"
    });
  }
};

// Get incident timeline
export const getIncidentTimeline = async (req, res) => {
  try {
    const { startDate, endDate, zone, type } = req.query;
    
    const query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (zone) query.zone = zone;
    if (type) query.type = type;

    const incidents = await Incident.find(query)
      .select("type zone severity status createdAt resolvedAt")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: incidents
    });
  } catch (error) {
    console.error("Error fetching incident timeline:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch incident timeline"
    });
  }
};
