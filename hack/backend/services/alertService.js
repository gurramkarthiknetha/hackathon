import { User } from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { sendNotificationEmail } from "../nodemailer/emails.js";

class AlertService {
  constructor(io) {
    this.io = io;
    this.activeAlerts = new Map(); // Track active alerts to prevent spam
    this.alertCooldown = 30000; // 30 seconds cooldown between same alert types
    this.confidenceThreshold = 0.5; // 50% confidence threshold
  }

  /**
   * Process detection events and send alerts if confidence exceeds threshold
   * @param {Object} detectionData - Detection data with events and confidence levels
   */
  async processDetectionAlert(detectionData) {
    try {
      const { timestamp, events, camera_id } = detectionData;
      
      if (!events || typeof events !== 'object') {
        console.warn('Invalid events data received:', events);
        return;
      }

      // Check each event for confidence threshold
      for (const [eventType, eventData] of Object.entries(events)) {
        if (eventData && typeof eventData === 'object') {
          const confidence = eventData.confidence || 0;
          const status = eventData.status;

          // Send alert if confidence is above threshold and event is detected
          if (confidence > this.confidenceThreshold && status === 'detected') {
            await this.sendEmergencyAlert({
              eventType,
              confidence,
              timestamp,
              camera_id,
              location: detectionData.camera_info?.location || 'Unknown Location'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing detection alert:', error);
    }
  }

  /**
   * Send emergency alert to all logged-in responders
   * @param {Object} alertData - Alert information
   */
  async sendEmergencyAlert(alertData) {
    try {
      const { eventType, confidence, timestamp, camera_id, location } = alertData;
      
      // Check cooldown to prevent spam
      const alertKey = `${eventType}_${camera_id}`;
      const now = Date.now();
      const lastAlert = this.activeAlerts.get(alertKey);
      
      if (lastAlert && (now - lastAlert) < this.alertCooldown) {
        console.log(`Alert cooldown active for ${alertKey}, skipping...`);
        return;
      }

      // Update cooldown
      this.activeAlerts.set(alertKey, now);

      // Get all logged-in users (responders, operators, admins)
      const loggedInUsers = await this.getLoggedInUsers();
      
      if (loggedInUsers.length === 0) {
        console.log('No logged-in users found for alert');
        return;
      }

      // Create alert message
      const alertTitle = `🚨 ${this.getEventDisplayName(eventType)} Alert`;
      const alertMessage = `${this.getEventDisplayName(eventType)} detected with ${Math.round(confidence * 100)}% confidence at ${location}. Immediate response required.`;

      // Create notification record
      const notification = new Notification({
        type: 'emergency_detection',
        title: alertTitle,
        message: alertMessage,
        severity: 'critical',
        recipients: 'all',
        sendInApp: true,
        sendEmail: true,
        sentBy: null, // System generated
        sentByRole: 'system',
        metadata: {
          eventType,
          confidence,
          camera_id,
          location,
          timestamp,
          alertType: 'detection_alert',
          requiresAudio: true
        }
      });

      await notification.save();

      // Send real-time alerts via Socket.IO to all connected users
      const alertPayload = {
        id: notification._id,
        type: 'emergency_detection',
        title: alertTitle,
        message: alertMessage,
        severity: 'critical',
        timestamp: new Date(),
        metadata: {
          eventType,
          confidence,
          camera_id,
          location,
          requiresAudio: true,
          audioFile: '/audio/security-alarm-63578.mp3'
        },
        sender: {
          name: 'AI Detection System',
          role: 'system'
        }
      };

      // Emit to all connected users
      this.io.emit('emergency-alert', alertPayload);
      this.io.emit('notification', alertPayload);

      // Send push notifications to all logged-in users
      await this.sendPushNotifications(loggedInUsers, alertPayload);

      // Send email notifications
      await this.sendEmailAlerts(loggedInUsers, {
        title: alertTitle,
        message: alertMessage,
        eventType,
        confidence,
        location,
        timestamp
      });

      console.log(`Emergency alert sent for ${eventType} to ${loggedInUsers.length} users`);

    } catch (error) {
      console.error('Error sending emergency alert:', error);
    }
  }

  /**
   * Get all currently logged-in users
   * @returns {Array} Array of logged-in user objects
   */
  async getLoggedInUsers() {
    try {
      // Get all active users (you might want to implement a more sophisticated 
      // logged-in tracking system using sessions or socket connections)
      const users = await User.find({ 
        isActive: true,
        role: { $in: ['responder', 'operator', 'admin'] }
      }).select('_id name email role assignedZone');

      return users;
    } catch (error) {
      console.error('Error getting logged-in users:', error);
      return [];
    }
  }

  /**
   * Send push notifications to users
   * @param {Array} users - Array of user objects
   * @param {Object} alertPayload - Alert data
   */
  async sendPushNotifications(users, alertPayload) {
    try {
      // For each user, emit a targeted push notification event
      users.forEach(user => {
        this.io.to(user._id.toString()).emit('push-notification', {
          ...alertPayload,
          userId: user._id,
          requiresAudio: true
        });
      });
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }

  /**
   * Send email alerts to users
   * @param {Array} users - Array of user objects  
   * @param {Object} alertData - Alert information
   */
  async sendEmailAlerts(users, alertData) {
    try {
      const emailPromises = users.map(user => 
        sendNotificationEmail(user.email, {
          title: alertData.title,
          message: alertData.message,
          type: 'emergency_detection',
          severity: 'critical',
          senderName: 'AI Detection System',
          timestamp: alertData.timestamp,
          metadata: {
            eventType: alertData.eventType,
            confidence: alertData.confidence,
            location: alertData.location
          }
        }).catch(error => {
          console.error(`Failed to send email to ${user.email}:`, error);
        })
      );

      await Promise.allSettled(emailPromises);
    } catch (error) {
      console.error('Error sending email alerts:', error);
    }
  }

  /**
   * Get display name for event type
   * @param {string} eventType - Event type key
   * @returns {string} Human-readable event name
   */
  getEventDisplayName(eventType) {
    const eventNames = {
      'fire': 'Fire',
      'smoke': 'Smoke',
      'running': 'Running/Movement',
      'fallen': 'Person Down',
      'medical emergency': 'Medical Emergency',
      'stampede': 'Stampede'
    };

    return eventNames[eventType] || eventType.charAt(0).toUpperCase() + eventType.slice(1);
  }

  /**
   * Clear alert cooldown for testing purposes
   * @param {string} eventType - Event type
   * @param {string} cameraId - Camera ID
   */
  clearAlertCooldown(eventType, cameraId) {
    const alertKey = `${eventType}_${cameraId}`;
    this.activeAlerts.delete(alertKey);
  }

  /**
   * Update confidence threshold
   * @param {number} threshold - New threshold (0.0 to 1.0)
   */
  setConfidenceThreshold(threshold) {
    if (threshold >= 0 && threshold <= 1) {
      this.confidenceThreshold = threshold;
      console.log(`Alert confidence threshold updated to ${threshold * 100}%`);
    }
  }
}

export default AlertService;
