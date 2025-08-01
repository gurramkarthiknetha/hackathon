import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/roleAuth.js";
import Notification from "../models/notification.model.js";
import {
  sendNotification,
  sendEmergencyAlert,
  getNotificationHistory,
  getNotificationStats,
  testNotification,
  markNotificationAsRead,
  getUnreadNotifications
} from "../controllers/notification.controller.js";

const router = express.Router();

// Middleware to attach io to request
const attachIO = (req, res, next) => {
  req.io = req.app.get('io');
  next();
};

// Public routes (none for notifications)

// Protected routes - require authentication
router.use(verifyToken);
router.use(attachIO); // Attach Socket.IO to all routes

// Send notification (admin only)
router.post("/send", requireRole('admin'), sendNotification);

// Send emergency alert (admin and operators)
router.post("/emergency", requireRole('admin', 'operator'), sendEmergencyAlert);

// Test notification (admin only)
router.post("/test", requireRole('admin'), testNotification);

// Get notification history (admin only)
router.get("/history", requireRole('admin'), getNotificationHistory);

// Get notification statistics (admin only)
router.get("/stats", requireRole('admin'), getNotificationStats);

// Get unread notifications for current user
router.get("/unread", getUnreadNotifications);

// Mark notification as read
router.put("/:notificationId/read", markNotificationAsRead);

// Bulk operations (admin only)
router.post("/bulk", requireRole('admin'), async (req, res) => {
  try {
    const { notifications } = req.body;
    
    if (!notifications || !Array.isArray(notifications)) {
      return res.status(400).json({
        success: false,
        message: "Notifications array is required"
      });
    }

    const results = [];
    let totalDelivered = 0;
    let totalFailed = 0;

    for (const notificationData of notifications) {
      try {
        // Create a new request object for each notification
        const mockReq = {
          ...req,
          body: notificationData
        };
        
        // Create a mock response to capture results
        let notificationResult = null;
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              notificationResult = { statusCode: code, data };
              return mockRes;
            }
          })
        };

        // Send the notification
        await sendNotification(mockReq, mockRes);
        
        if (notificationResult && notificationResult.statusCode === 200) {
          results.push({
            success: true,
            notification: notificationData.title,
            delivered: notificationResult.data.data.delivered
          });
          totalDelivered += notificationResult.data.data.delivered;
        } else {
          results.push({
            success: false,
            notification: notificationData.title,
            error: "Failed to send"
          });
          totalFailed++;
        }
      } catch (error) {
        results.push({
          success: false,
          notification: notificationData.title,
          error: error.message
        });
        totalFailed++;
      }
    }

    res.status(200).json({
      success: true,
      message: "Bulk notification operation completed",
      data: {
        results,
        summary: {
          total: notifications.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          totalDelivered,
          totalFailed
        }
      }
    });

  } catch (error) {
    console.error("Error in bulk notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send bulk notifications",
      error: error.message
    });
  }
});

// Schedule notification (admin only)
router.post("/schedule", requireRole('admin'), async (req, res) => {
  try {
    const { scheduleTime, ...notificationData } = req.body;
    
    if (!scheduleTime) {
      return res.status(400).json({
        success: false,
        message: "Schedule time is required"
      });
    }

    const scheduledDate = new Date(scheduleTime);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Schedule time must be in the future"
      });
    }

    // Create scheduled notification
    const notification = new Notification({
      ...notificationData,
      sentBy: req.user._id,
      sentByRole: req.user.role,
      scheduledFor: scheduledDate,
      isScheduled: true,
      status: 'pending'
    });

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification scheduled successfully",
      data: {
        notificationId: notification._id,
        scheduledFor: scheduledDate
      }
    });

  } catch (error) {
    console.error("Error scheduling notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule notification",
      error: error.message
    });
  }
});

// Get scheduled notifications (admin only)
router.get("/scheduled", requireRole('admin'), async (req, res) => {
  try {
    const scheduledNotifications = await Notification.find({
      isScheduled: true,
      status: 'pending',
      scheduledFor: { $gt: new Date() }
    })
    .populate('sentBy', 'name email role')
    .sort({ scheduledFor: 1 });

    res.status(200).json({
      success: true,
      data: {
        notifications: scheduledNotifications
      }
    });

  } catch (error) {
    console.error("Error fetching scheduled notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch scheduled notifications",
      error: error.message
    });
  }
});

// Cancel scheduled notification (admin only)
router.delete("/scheduled/:notificationId", requireRole('admin'), async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    if (!notification.isScheduled || notification.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Notification cannot be cancelled"
      });
    }

    notification.status = 'cancelled';
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Scheduled notification cancelled successfully"
    });

  } catch (error) {
    console.error("Error cancelling scheduled notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel scheduled notification",
      error: error.message
    });
  }
});

// Get delivery status for a notification (admin only)
router.get("/:notificationId/delivery-status", requireRole('admin'), async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId)
      .populate('sentBy', 'name email role')
      .populate('readBy.user', 'name email role');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        notification: {
          id: notification._id,
          title: notification.title,
          type: notification.type,
          severity: notification.severity,
          status: notification.status,
          deliveryStats: notification.deliveryStats,
          sentAt: notification.sentAt,
          completedAt: notification.completedAt,
          readBy: notification.readBy,
          sentBy: notification.sentBy
        }
      }
    });

  } catch (error) {
    console.error("Error fetching delivery status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery status",
      error: error.message
    });
  }
});

export default router;
export { attachIO };
