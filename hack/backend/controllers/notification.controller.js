import Notification from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { sendNotificationEmail } from "../nodemailer/emails.js";

// Send notification
export const sendNotification = async (req, res) => {
  try {
    const {
      type,
      title,
      message,
      severity,
      recipients,
      sendInApp,
      sendEmail,
      sendSMS,
      specificRecipients,
      metadata
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    // Get sender info
    const senderId = req.userId;
    const senderRole = req.userRole;

    if (!senderId || !senderRole) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Get sender details for email
    const senderUser = await User.findById(senderId);
    const senderName = senderUser ? senderUser.name : 'System Administrator';

    // Create notification
    const notification = new Notification({
      type: type || 'general',
      title,
      message,
      severity: severity || 'medium',
      recipients: recipients || 'all',
      sendInApp: sendInApp !== false,
      sendEmail: sendEmail || false,
      sendSMS: sendSMS || false,
      specificRecipients: specificRecipients || [],
      sentBy: senderId,
      sentByRole: senderRole,
      metadata: metadata || {}
    });

    // Get target users based on recipients
    let targetUsers = [];
    switch (recipients) {
      case 'all':
        targetUsers = await User.find({ isVerified: true });
        break;
      case 'admins':
        targetUsers = await User.find({ role: 'admin', isVerified: true });
        break;
      case 'operators':
        targetUsers = await User.find({ role: 'operator', isVerified: true });
        break;
      case 'responders':
        targetUsers = await User.find({ role: 'responder', isVerified: true });
        break;
      case 'specific':
        targetUsers = await User.find({ 
          _id: { $in: specificRecipients }, 
          isVerified: true 
        });
        break;
      default:
        targetUsers = await User.find({ isVerified: true });
    }

    // Update delivery stats
    notification.deliveryStats.total = targetUsers.length;
    await notification.save();

    // Send email notifications if requested
    let emailDelivered = 0;
    let emailFailed = 0;

    if (sendEmail && targetUsers.length > 0) {
      for (const user of targetUsers) {
        try {
          await sendNotificationEmail(user.email, {
            title,
            message,
            type,
            severity,
            senderName: senderName,
            timestamp: new Date()
          });
          emailDelivered++;
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          emailFailed++;
        }
      }
    }

    // Update delivery stats
    await notification.updateDeliveryStats(
      sendInApp ? targetUsers.length : emailDelivered,
      emailFailed
    );

    // Emit real-time notification via Socket.IO if available
    if (sendInApp && req.io) {
      const notificationData = {
        id: notification._id,
        type,
        title,
        message,
        severity,
        timestamp: notification.createdAt,
        sender: {
          name: senderName,
          role: senderRole
        }
      };

      // Emit to specific rooms based on recipients
      switch (recipients) {
        case 'all':
          req.io.emit('notification', notificationData);
          break;
        case 'admins':
          req.io.to('admin').emit('notification', notificationData);
          break;
        case 'operators':
          req.io.to('operator').emit('notification', notificationData);
          break;
        case 'responders':
          req.io.to('responder').emit('notification', notificationData);
          break;
        case 'specific':
          targetUsers.forEach(user => {
            req.io.to(user._id.toString()).emit('notification', notificationData);
          });
          break;
      }
    }

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      data: {
        notificationId: notification._id,
        delivered: notification.deliveryStats.delivered,
        failed: notification.deliveryStats.failed,
        total: notification.deliveryStats.total
      }
    });

  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message
    });
  }
};

// Send emergency alert
export const sendEmergencyAlert = async (req, res) => {
  try {
    const { message, metadata } = req.body;
    const senderId = req.userId;

    const emergencyNotification = {
      type: 'emergency',
      title: '🚨 Emergency Alert',
      message: message || 'Emergency situation detected. All personnel please follow emergency protocols.',
      severity: 'critical',
      recipients: 'all',
      sendInApp: true,
      sendEmail: true,
      sendSMS: true,
      metadata: {
        alertType: 'emergency',
        initiatedBy: senderId,
        ...metadata
      }
    };

    // Use the sendNotification function
    req.body = emergencyNotification;
    return await sendNotification(req, res);

  } catch (error) {
    console.error("Error sending emergency alert:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send emergency alert",
      error: error.message
    });
  }
};

// Get notification history
export const getNotificationHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      severity,
      recipients,
      dateFrom,
      dateTo
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    if (type) filters.type = type;
    if (severity) filters.severity = severity;
    if (recipients) filters.recipients = recipients;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const notifications = await Notification.getNotificationHistory(filters);
    const total = await Notification.countDocuments(
      Notification.getNotificationHistory(filters).getQuery()
    );

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error("Error fetching notification history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification history",
      error: error.message
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const stats = await Notification.getNotificationStats(timeRange);
    const result = stats[0] || {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      emergencyAlerts: 0,
      systemNotifications: 0,
      announcements: 0
    };

    res.status(200).json({
      success: true,
      data: {
        timeRange,
        stats: result
      }
    });

  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification statistics",
      error: error.message
    });
  }
};

// Test notification
export const testNotification = async (req, res) => {
  try {
    const senderId = req.userId;

    const testNotificationData = {
      type: 'test',
      title: 'Test Notification',
      message: 'This is a test notification from the admin panel.',
      severity: 'low',
      recipients: 'admins',
      sendInApp: true,
      sendEmail: false,
      metadata: {
        testMode: true,
        initiatedBy: senderId
      }
    };

    req.body = testNotificationData;
    return await sendNotification(req, res);

  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test notification",
      error: error.message
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    await notification.markAsRead(userId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });

  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message
    });
  }
};

// Get unread notifications for user
export const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    const notifications = await Notification.find({
      $or: [
        { recipients: 'all' },
        { recipients: userRole },
        { recipients: 'specific', specificRecipients: userId }
      ],
      sendInApp: true,
      'readBy.user': { $ne: userId }
    })
    .populate('sentBy', 'name role')
    .sort({ createdAt: -1 })
    .limit(50);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount: notifications.length
      }
    });

  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread notifications",
      error: error.message
    });
  }
};
