import { EmailNotificationSettings } from "../models/emailNotificationSettings.model.js";
import { testEmailConfiguration } from "../services/alertEmailService.js";

// Get current email notification settings
export const getEmailNotificationSettings = async (req, res) => {
  try {
    const settings = await EmailNotificationSettings.getCurrentSettings();
    
    res.status(200).json({
      success: true,
      data: settings,
      message: "Email notification settings retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching email notification settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch email notification settings"
    });
  }
};

// Update email notification settings
export const updateEmailNotificationSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = { ...req.body, lastUpdatedBy: userId };

    let settings = await EmailNotificationSettings.findOne();
    
    if (!settings) {
      // Create new settings if none exist
      settings = new EmailNotificationSettings(updateData);
    } else {
      // Update existing settings
      Object.assign(settings, updateData);
    }

    await settings.save();
    await settings.populate("lastUpdatedBy", "name role");

    res.status(200).json({
      success: true,
      data: settings,
      message: "Email notification settings updated successfully"
    });
  } catch (error) {
    console.error("Error updating email notification settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update email notification settings"
    });
  }
};

// Reset email notification settings to default
export const resetEmailNotificationSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const defaultSettings = EmailNotificationSettings.getDefaultSettings();
    defaultSettings.lastUpdatedBy = userId;

    let settings = await EmailNotificationSettings.findOne();
    
    if (!settings) {
      settings = new EmailNotificationSettings(defaultSettings);
    } else {
      Object.assign(settings, defaultSettings);
    }

    await settings.save();
    await settings.populate("lastUpdatedBy", "name role");

    res.status(200).json({
      success: true,
      data: settings,
      message: "Email notification settings reset to default successfully"
    });
  } catch (error) {
    console.error("Error resetting email notification settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset email notification settings"
    });
  }
};

// Test email configuration
export const testEmailNotificationConfiguration = async (req, res) => {
  try {
    const isValid = await testEmailConfiguration();
    
    if (isValid) {
      res.status(200).json({
        success: true,
        message: "Email configuration is valid and ready to send notifications"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Email configuration test failed. Please check your SMTP settings."
      });
    }
  } catch (error) {
    console.error("Error testing email configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to test email configuration"
    });
  }
};

// Send test email notification
export const sendTestEmailNotification = async (req, res) => {
  try {
    const { testEmail } = req.body;
    const userId = req.userId;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: "Test email address is required"
      });
    }

    // Import here to avoid circular dependency
    const { createTransporter, emailConfig } = await import("../nodemailer/nodemailer.config.js");
    
    const transporter = createTransporter();
    
    const testEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Test Email Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Test Email Notification</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <p>Hello,</p>
          <p>This is a test email notification from the Event Monitoring System.</p>
          <p>If you received this email, your email notification configuration is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Sent at: ${new Date().toLocaleString()}</li>
            <li>Requested by: User ID ${userId}</li>
            <li>System: Event Monitoring System</li>
          </ul>
          <p>Best regards,<br>Event Monitoring System</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
          <p>This is a test message from the Event Monitoring System.</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: emailConfig.from,
      to: testEmail,
      subject: "✅ Test Email Notification - Event Monitoring System",
      html: testEmailContent,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: `Test email notification sent successfully to ${testEmail}`
    });
  } catch (error) {
    console.error("Error sending test email notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email notification"
    });
  }
};

// Get email notification statistics
export const getEmailNotificationStats = async (req, res) => {
  try {
    // This would typically come from a logging/analytics system
    // For now, we'll return mock data
    const stats = {
      totalEmailsSent: 0, // Would be tracked in a separate collection
      emailsSentToday: 0,
      emailsSentThisWeek: 0,
      emailsSentThisMonth: 0,
      lastEmailSent: null,
      emailDeliveryRate: 100, // Would be tracked with delivery confirmations
      commonFailureReasons: [],
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: "Email notification statistics retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching email notification statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch email notification statistics"
    });
  }
};
