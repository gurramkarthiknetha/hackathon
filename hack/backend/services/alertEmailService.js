import { createTransporter, emailConfig } from "../nodemailer/nodemailer.config.js";
import {
  INCIDENT_CREATED_TEMPLATE,
  INCIDENT_ASSIGNED_TEMPLATE,
  INCIDENT_STATUS_UPDATE_TEMPLATE,
  INCIDENT_APPROVAL_TEMPLATE,
} from "../nodemailer/emailTemplates.js";
import { User } from "../models/user.model.js";
import { Zone } from "../models/zone.model.js";
import { EmailNotificationSettings } from "../models/emailNotificationSettings.model.js";

// Helper function to get severity color
const getSeverityColor = (severity) => {
  const colors = {
    low: "#4CAF50",
    medium: "#FF9800",
    high: "#FF5722",
    critical: "#F44336",
  };
  return colors[severity] || "#666";
};

// Helper function to get status color and icon
const getStatusInfo = (status) => {
  const statusInfo = {
    active: { color: "#FF5722", colorDark: "#E64A19", icon: "🚨" },
    assigned: { color: "#FF9800", colorDark: "#F57C00", icon: "📋" },
    in_progress: { color: "#2196F3", colorDark: "#1976D2", icon: "⚡" },
    resolved: { color: "#4CAF50", colorDark: "#388E3C", icon: "✅" },
    dismissed: { color: "#9E9E9E", colorDark: "#616161", icon: "❌" },
  };
  return statusInfo[status] || statusInfo.active;
};

// Helper function to get approval info
const getApprovalInfo = (approved) => {
  return approved
    ? {
        color: "#4CAF50",
        colorDark: "#388E3C",
        icon: "✅",
        action: "Approved",
        decision: "APPROVED",
      }
    : {
        color: "#F44336",
        colorDark: "#D32F2F",
        icon: "❌",
        action: "Dismissed",
        decision: "DISMISSED",
      };
};

// Helper function to format location
const formatLocation = (location) => {
  if (location.description) {
    return `${location.description} (${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)})`;
  }
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
};

// Helper function to format incident type
const formatIncidentType = (type) => {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper function to get dashboard URL
const getDashboardURL = (userRole = "operator") => {
  const baseURL = process.env.CLIENT_URL || "http://localhost:5173";
  const roleRoutes = {
    admin: "/dashboard/admin",
    operator: "/dashboard/operator",
    responder: "/dashboard/responder",
  };
  return `${baseURL}${roleRoutes[userRole] || roleRoutes.operator}`;
};

// Get relevant users for notifications based on incident and notification type
const getRelevantUsers = async (incident, notificationType) => {
  const users = [];

  try {
    // Get current notification settings
    const settings = await EmailNotificationSettings.getCurrentSettings();

    // Check if email notifications are globally enabled
    if (!settings.emailNotificationsEnabled) {
      return [];
    }

    // Check if this specific notification type is enabled
    const notificationConfig = settings[notificationType];
    if (!notificationConfig || !notificationConfig.enabled) {
      return [];
    }

    // Check severity filter
    const severityKey = `notifyOn${incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}`;
    if (!settings.severityFilters[severityKey]) {
      return [];
    }

    // Get users based on configured roles
    const rolesToNotify = notificationConfig.notifyRoles || [];

    for (const role of rolesToNotify) {
      const roleUsers = await User.find({ role, isActive: true }).select("email name role");
      users.push(...roleUsers);
    }

    // For assignment notifications, include the assigned responder if configured
    if (notificationType === "incidentAssigned" &&
        incident.assignedTo &&
        notificationConfig.notifyAssignedResponder) {
      const assignedResponder = await User.findById(incident.assignedTo).select("email name role");
      if (assignedResponder) {
        users.push(assignedResponder);
      }
    }

    // Include responders assigned to the incident's zone if configured
    if (notificationType === "incidentCreated" &&
        incident.zone &&
        notificationConfig.notifyZoneResponders) {
      const zone = await Zone.findOne({ name: incident.zone }).populate("assignedResponders", "email name role");
      if (zone && zone.assignedResponders) {
        users.push(...zone.assignedResponders.filter(responder => responder.isActive !== false));
      }
    }

    // Remove duplicates based on email
    const uniqueUsers = users.filter((user, index, self) =>
      index === self.findIndex(u => u.email === user.email)
    );

    return uniqueUsers;
  } catch (error) {
    console.error("Error getting relevant users for notifications:", error);
    return [];
  }
};

// Send incident created notification
export const sendIncidentCreatedNotification = async (incident) => {
  try {
    const transporter = createTransporter();
    const users = await getRelevantUsers(incident, "incidentCreated");

    if (users.length === 0) {
      console.log("No users found to notify for incident creation");
      return;
    }

    const severityColor = getSeverityColor(incident.severity);
    const timestamp = new Date(incident.createdAt).toLocaleString();
    const humanApprovalRequired = incident.humanApprovalRequired
      ? '<p><strong>⚠️ Human Approval Required:</strong> This incident requires manual approval before response.</p>'
      : '';

    for (const user of users) {
      const emailContent = INCIDENT_CREATED_TEMPLATE
        .replace(/{recipientName}/g, user.name)
        .replace(/{incidentType}/g, formatIncidentType(incident.type))
        .replace(/{zone}/g, incident.zone)
        .replace(/{severity}/g, incident.severity.toUpperCase())
        .replace(/{severityColor}/g, severityColor)
        .replace(/{confidence}/g, incident.confidence)
        .replace(/{location}/g, formatLocation(incident.location))
        .replace(/{description}/g, incident.description)
        .replace(/{timestamp}/g, timestamp)
        .replace(/{humanApprovalRequired}/g, humanApprovalRequired)
        .replace(/{dashboardURL}/g, getDashboardURL(user.role));

      const mailOptions = {
        from: emailConfig.from,
        to: user.email,
        subject: `🚨 New ${incident.severity.toUpperCase()} Incident Alert - ${incident.zone}`,
        html: emailContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Incident created notification sent to ${user.email} (${user.role})`);
    }
  } catch (error) {
    console.error("❌ Error sending incident created notification:", error);
    throw new Error(`Error sending incident created notification: ${error.message}`);
  }
};

// Send incident assigned notification
export const sendIncidentAssignedNotification = async (incident, assignedUser) => {
  try {
    const transporter = createTransporter();
    const users = await getRelevantUsers(incident, "incidentAssigned");

    if (users.length === 0) {
      console.log("No users found to notify for incident assignment");
      return;
    }

    const severityColor = getSeverityColor(incident.severity);
    const assignedAt = new Date(incident.assignedAt).toLocaleString();

    for (const user of users) {
      // Customize message based on recipient
      let assignmentMessage;
      if (user._id.toString() === incident.assignedTo.toString()) {
        assignmentMessage = "You have been assigned to handle this incident. Please review the details and take appropriate action.";
      } else {
        assignmentMessage = `This incident has been assigned to ${assignedUser.name} for response.`;
      }

      const emailContent = INCIDENT_ASSIGNED_TEMPLATE
        .replace(/{recipientName}/g, user.name)
        .replace(/{assignmentMessage}/g, assignmentMessage)
        .replace(/{incidentType}/g, formatIncidentType(incident.type))
        .replace(/{zone}/g, incident.zone)
        .replace(/{severity}/g, incident.severity.toUpperCase())
        .replace(/{severityColor}/g, severityColor)
        .replace(/{location}/g, formatLocation(incident.location))
        .replace(/{description}/g, incident.description)
        .replace(/{assignedTo}/g, assignedUser.name)
        .replace(/{assignedAt}/g, assignedAt)
        .replace(/{dashboardURL}/g, getDashboardURL(user.role));

      const mailOptions = {
        from: emailConfig.from,
        to: user.email,
        subject: `📋 Incident Assigned - ${incident.zone} (${formatIncidentType(incident.type)})`,
        html: emailContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Incident assigned notification sent to ${user.email} (${user.role})`);
    }
  } catch (error) {
    console.error("❌ Error sending incident assigned notification:", error);
    throw new Error(`Error sending incident assigned notification: ${error.message}`);
  }
};

// Send incident status update notification
export const sendIncidentStatusUpdateNotification = async (incident, previousStatus, updatedByUser, notes = null) => {
  try {
    const transporter = createTransporter();
    const users = await getRelevantUsers(incident, "incidentStatusUpdate");

    if (users.length === 0) {
      console.log("No users found to notify for incident status update");
      return;
    }

    const severityColor = getSeverityColor(incident.severity);
    const statusInfo = getStatusInfo(incident.status);
    const updatedAt = new Date().toLocaleString();
    
    const notesSection = notes 
      ? `<p><strong>Notes:</strong> ${notes}</p>`
      : '';
    
    const responseTimeSection = incident.responseTime 
      ? `<p><strong>Response Time:</strong> ${incident.responseTime} minutes</p>`
      : '';

    for (const user of users) {
      const emailContent = INCIDENT_STATUS_UPDATE_TEMPLATE
        .replace(/{recipientName}/g, user.name)
        .replace(/{previousStatus}/g, previousStatus.toUpperCase())
        .replace(/{newStatus}/g, incident.status.toUpperCase())
        .replace(/{statusColor}/g, statusInfo.color)
        .replace(/{statusColorDark}/g, statusInfo.colorDark)
        .replace(/{statusIcon}/g, statusInfo.icon)
        .replace(/{updatedBy}/g, updatedByUser.name)
        .replace(/{updatedAt}/g, updatedAt)
        .replace(/{notes}/g, notesSection)
        .replace(/{responseTime}/g, responseTimeSection)
        .replace(/{incidentType}/g, formatIncidentType(incident.type))
        .replace(/{zone}/g, incident.zone)
        .replace(/{severity}/g, incident.severity.toUpperCase())
        .replace(/{severityColor}/g, severityColor)
        .replace(/{location}/g, formatLocation(incident.location))
        .replace(/{dashboardURL}/g, getDashboardURL(user.role));

      const mailOptions = {
        from: emailConfig.from,
        to: user.email,
        subject: `${statusInfo.icon} Incident ${incident.status.toUpperCase()} - ${incident.zone}`,
        html: emailContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Incident status update notification sent to ${user.email} (${user.role})`);
    }
  } catch (error) {
    console.error("❌ Error sending incident status update notification:", error);
    throw new Error(`Error sending incident status update notification: ${error.message}`);
  }
};

// Send incident approval/dismissal notification
export const sendIncidentApprovalNotification = async (incident, approvedByUser, approved) => {
  try {
    const transporter = createTransporter();
    const users = await getRelevantUsers(incident, "incidentApproval");

    if (users.length === 0) {
      console.log("No users found to notify for incident approval");
      return;
    }

    const severityColor = getSeverityColor(incident.severity);
    const approvalInfo = getApprovalInfo(approved);
    const approvalTime = new Date().toLocaleString();

    for (const user of users) {
      const emailContent = INCIDENT_APPROVAL_TEMPLATE
        .replace(/{recipientName}/g, user.name)
        .replace(/{approvalAction}/g, approvalInfo.action)
        .replace(/{approvalColor}/g, approvalInfo.color)
        .replace(/{approvalColorDark}/g, approvalInfo.colorDark)
        .replace(/{approvalIcon}/g, approvalInfo.icon)
        .replace(/{approvalDecision}/g, approvalInfo.decision)
        .replace(/{approvedBy}/g, approvedByUser.name)
        .replace(/{approvalTime}/g, approvalTime)
        .replace(/{incidentType}/g, formatIncidentType(incident.type))
        .replace(/{zone}/g, incident.zone)
        .replace(/{severity}/g, incident.severity.toUpperCase())
        .replace(/{severityColor}/g, severityColor)
        .replace(/{confidence}/g, incident.confidence)
        .replace(/{location}/g, formatLocation(incident.location))
        .replace(/{description}/g, incident.description)
        .replace(/{dashboardURL}/g, getDashboardURL(user.role));

      const mailOptions = {
        from: emailConfig.from,
        to: user.email,
        subject: `${approvalInfo.icon} High-Risk Incident ${approvalInfo.action} - ${incident.zone}`,
        html: emailContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Incident approval notification sent to ${user.email} (${user.role})`);
    }
  } catch (error) {
    console.error("❌ Error sending incident approval notification:", error);
    throw new Error(`Error sending incident approval notification: ${error.message}`);
  }
};

// Utility function to test email configuration
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email configuration is valid and ready to send notifications");
    return true;
  } catch (error) {
    console.error("❌ Email configuration test failed:", error);
    return false;
  }
};
