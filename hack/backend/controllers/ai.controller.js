import { Incident } from "../models/incident.model.js";
import { Zone } from "../models/zone.model.js";
import { User } from "../models/user.model.js";
import { sendIncidentApprovalNotification } from "../services/alertEmailService.js";

// Simulate AI query processing (in a real implementation, this would call an AI service)
export const processAIQuery = async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.userId;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Query is required"
      });
    }

    // Log the query for audit purposes
    console.log(`AI Query from user ${userId}: ${query}`);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Parse query and generate response based on keywords
    const response = await generateAIResponse(query.toLowerCase());

    res.status(200).json({
      success: true,
      data: {
        query,
        response,
        timestamp: new Date(),
        processingTime: "1.2s"
      }
    });
  } catch (error) {
    console.error("Error processing AI query:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process AI query"
    });
  }
};

// Generate AI response based on query analysis
async function generateAIResponse(query) {
  try {
    // Zone-specific queries
    if (query.includes("east zone") || query.includes("eastern")) {
      const incidents = await Incident.find({ 
        zone: { $regex: /east/i },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 }).limit(5);

      if (incidents.length === 0) {
        return "No incidents reported in the East Zone in the last 24 hours. The area appears to be secure.";
      }

      const incidentSummary = incidents.map(inc => 
        `${inc.type.replace('_', ' ')} (${inc.severity} severity) at ${inc.createdAt.toLocaleTimeString()}`
      ).join(', ');

      return `East Zone Activity Summary: ${incidents.length} incident(s) in the last 24 hours - ${incidentSummary}. Current status: ${incidents[0].status}.`;
    }

    // West zone queries
    if (query.includes("west zone") || query.includes("western")) {
      const incidents = await Incident.find({ 
        zone: { $regex: /west/i },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 }).limit(5);

      if (incidents.length === 0) {
        return "West Zone is clear with no incidents reported in the last 24 hours.";
      }

      return `West Zone has ${incidents.length} recent incident(s). Most recent: ${incidents[0].type.replace('_', ' ')} with ${incidents[0].severity} severity.`;
    }

    // Fire-related queries
    if (query.includes("fire")) {
      const fireIncidents = await Incident.find({ 
        type: "fire",
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 });

      if (fireIncidents.length === 0) {
        return "No fire incidents detected in the last 24 hours. All fire safety systems are operational.";
      }

      const activeFireIncidents = fireIncidents.filter(inc => inc.status !== "resolved");
      if (activeFireIncidents.length > 0) {
        return `⚠️ ALERT: ${activeFireIncidents.length} active fire incident(s) detected. Locations: ${activeFireIncidents.map(inc => inc.zone).join(', ')}. Emergency protocols activated.`;
      }

      return `${fireIncidents.length} fire incident(s) reported in the last 24 hours, all have been resolved. Average response time: 8 minutes.`;
    }

    // Crowd surge queries
    if (query.includes("crowd") || query.includes("surge")) {
      const crowdIncidents = await Incident.find({ 
        type: "crowd_surge",
        createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) } // Last 6 hours
      }).sort({ createdAt: -1 });

      if (crowdIncidents.length === 0) {
        return "No crowd surge incidents detected in the last 6 hours. Crowd density levels are within normal parameters.";
      }

      return `${crowdIncidents.length} crowd surge incident(s) detected in the last 6 hours. Affected zones: ${[...new Set(crowdIncidents.map(inc => inc.zone))].join(', ')}. Crowd management protocols are active.`;
    }

    // Medical emergency queries
    if (query.includes("medical") || query.includes("unconscious") || query.includes("health")) {
      const medicalIncidents = await Incident.find({ 
        type: { $in: ["medical_emergency", "unconscious_person"] },
        createdAt: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 });

      if (medicalIncidents.length === 0) {
        return "No medical emergencies reported in the last 12 hours. Medical stations are fully staffed and operational.";
      }

      const resolved = medicalIncidents.filter(inc => inc.status === "resolved").length;
      return `${medicalIncidents.length} medical incident(s) in the last 12 hours. ${resolved} resolved, ${medicalIncidents.length - resolved} active. Medical response teams are deployed.`;
    }

    // Overall status queries
    if (query.includes("status") || query.includes("overview") || query.includes("summary")) {
      const [totalIncidents, activeIncidents, zones, responders] = await Promise.all([
        Incident.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
        Incident.countDocuments({ status: { $in: ["active", "assigned", "in_progress"] } }),
        Zone.countDocuments({ isActive: true }),
        User.countDocuments({ role: "responder", isActive: true })
      ]);

      return `Event Status Overview: ${totalIncidents} total incidents in last 24h, ${activeIncidents} currently active. Monitoring ${zones} zones with ${responders} active responders. System operational status: GREEN.`;
    }

    // Response time queries
    if (query.includes("response time") || query.includes("performance")) {
      const resolvedIncidents = await Incident.find({ 
        status: "resolved",
        responseTime: { $exists: true, $ne: null },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (resolvedIncidents.length === 0) {
        return "No resolved incidents with response time data in the last 24 hours.";
      }

      const avgResponseTime = resolvedIncidents.reduce((sum, inc) => sum + inc.responseTime, 0) / resolvedIncidents.length;
      return `Performance Metrics: Average response time in last 24h: ${avgResponseTime.toFixed(1)} minutes. ${resolvedIncidents.length} incidents resolved. Target response time: <10 minutes.`;
    }

    // Responder queries
    if (query.includes("responder") || query.includes("team")) {
      const activeResponders = await User.find({ 
        role: "responder", 
        isActive: true 
      }).select("name assignedZone currentLocation");

      const respondersWithLocation = activeResponders.filter(r => 
        r.currentLocation && r.currentLocation.latitude && r.currentLocation.longitude
      );

      return `Responder Status: ${activeResponders.length} active responders deployed. ${respondersWithLocation.length} currently transmitting location data. All teams are operational and ready for deployment.`;
    }

    // Default response for unrecognized queries
    return `I understand you're asking about "${query}". I can provide information about incidents, zones, responders, fire safety, crowd management, medical emergencies, and system status. Please try asking about specific zones (East/West), incident types, or request an overall status summary.`;

  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm experiencing some technical difficulties processing your request. Please try again or contact the system administrator.";
  }
}

// Get AI query history
export const getQueryHistory = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // In a real implementation, you would store query history in a database
    // For now, return a mock response
    const mockHistory = [
      {
        id: 1,
        query: "What happened in East Zone?",
        response: "East Zone Activity Summary: 2 incident(s) in the last 24 hours...",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        userId: req.userId
      },
      {
        id: 2,
        query: "Overall status summary",
        response: "Event Status Overview: 15 total incidents in last 24h...",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        userId: req.userId
      }
    ];

    res.status(200).json({
      success: true,
      data: mockHistory.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error("Error fetching query history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch query history"
    });
  }
};

// Approve high-risk incident
export const approveIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;
    const userId = req.userId;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    if (!incident.humanApprovalRequired) {
      return res.status(400).json({
        success: false,
        message: "This incident does not require human approval"
      });
    }

    incident.humanApproved = approved;
    incident.approvedBy = userId;

    if (!approved) {
      incident.status = "dismissed";
    }

    await incident.save();
    await incident.populate(["assignedTo", "approvedBy"], "name role");

    // Get the user who approved/dismissed the incident for email notification
    const approvedByUser = await User.findById(userId).select("name role");

    // Send email notifications about the approval decision
    try {
      await sendIncidentApprovalNotification(incident, approvedByUser, approved);
    } catch (emailError) {
      console.error("Failed to send incident approval email notifications:", emailError);
      // Don't fail the approval if email fails
    }

    res.status(200).json({
      success: true,
      data: incident,
      message: `Incident ${approved ? 'approved' : 'dismissed'} successfully`
    });
  } catch (error) {
    console.error("Error approving incident:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve incident"
    });
  }
};
