import express from "express";
import {
  getEmailNotificationSettings,
  updateEmailNotificationSettings,
  resetEmailNotificationSettings,
  testEmailNotificationConfiguration,
  sendTestEmailNotification,
  getEmailNotificationStats
} from "../controllers/emailNotificationSettings.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { rolePermissions } from "../middleware/roleAuth.js";

const router = express.Router();

// All email notification settings routes require authentication
router.use(verifyToken);

// Get current email notification settings (admin and operators can view)
router.get("/", rolePermissions.adminOrOperator, getEmailNotificationSettings);

// Update email notification settings (admin only)
router.put("/", rolePermissions.adminOnly, updateEmailNotificationSettings);

// Reset email notification settings to default (admin only)
router.post("/reset", rolePermissions.adminOnly, resetEmailNotificationSettings);

// Test email configuration (admin only)
router.post("/test-config", rolePermissions.adminOnly, testEmailNotificationConfiguration);

// Send test email notification (admin only)
router.post("/test-email", rolePermissions.adminOnly, sendTestEmailNotification);

// Get email notification statistics (admin and operators can view)
router.get("/stats", rolePermissions.adminOrOperator, getEmailNotificationStats);

export default router;
