import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { 
  getMessages, 
  sendMessage, 
  markMessageAsRead, 
  getMessageStats,
  broadcastMessage 
} from "../controllers/message.controller.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get messages for current user
router.get("/", getMessages);

// Send a new message
router.post("/", sendMessage);

// Get message statistics
router.get("/stats", getMessageStats);

// Mark message as read
router.patch("/:messageId/read", markMessageAsRead);

// Broadcast message (admin/operator only)
router.post("/broadcast", broadcastMessage);

export default router;
