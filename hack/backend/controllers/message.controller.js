import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

// Get messages for the current user
export const getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 50, type, priority } = req.query;
    
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Build query options
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    // Get messages for user
    let messages = await Message.getMessagesForUser(
      userId, 
      user.role, 
      user.assignedZone, 
      options
    );

    // Apply additional filters if provided
    if (type) {
      messages = messages.filter(msg => msg.type === type);
    }
    if (priority) {
      messages = messages.filter(msg => msg.priority === priority);
    }

    // Get unread count
    const unreadCount = await Message.getUnreadCount(userId, user.role, user.assignedZone);

    res.status(200).json({
      success: true,
      data: {
        messages,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: messages.length
        }
      }
    });

  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages"
    });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      content, 
      type = 'team', 
      priority = 'normal', 
      recipients = 'responders',
      targetZone,
      specificRecipients 
    } = req.body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    // Get sender information
    const sender = await User.findById(userId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found"
      });
    }

    // Validate recipients for specific messages
    if (recipients === 'specific' && (!specificRecipients || specificRecipients.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Specific recipients are required when recipients type is 'specific'"
      });
    }

    // Validate zone for zone-based messages
    if (recipients === 'zone' && !targetZone) {
      return res.status(400).json({
        success: false,
        message: "Target zone is required when recipients type is 'zone'"
      });
    }

    // Create message
    const message = new Message({
      content: content.trim(),
      type,
      priority,
      sender: userId,
      senderName: sender.name,
      senderRole: sender.role,
      recipients,
      targetZone,
      specificRecipients,
      isEmergency: priority === 'critical'
    });

    await message.save();

    // Populate sender information for response
    await message.populate('sender', 'name role');

    // Emit via WebSocket if io is available
    const io = req.app.get('io');
    if (io) {
      const messageData = {
        id: message._id,
        content: message.content,
        type: message.type,
        priority: message.priority,
        sender: {
          id: sender._id,
          name: sender.name,
          role: sender.role
        },
        recipients: message.recipients,
        targetZone: message.targetZone,
        timestamp: message.createdAt,
        isEmergency: message.isEmergency
      };

      // Broadcast based on recipients
      switch (recipients) {
        case 'all':
          io.emit('new-message', messageData);
          break;
        case 'responders':
          io.to('responders').emit('new-message', messageData);
          break;
        case 'operators':
          io.to('operators').emit('new-message', messageData);
          break;
        case 'admins':
          io.to('admin').emit('new-message', messageData);
          break;
        case 'zone':
          if (targetZone) {
            io.to(targetZone).emit('new-message', messageData);
          }
          break;
        case 'specific':
          // For now, emit to all and let clients filter
          io.emit('new-message', messageData);
          break;
        default:
          io.to('responders').emit('new-message', messageData);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        message: {
          id: message._id,
          content: message.content,
          type: message.type,
          priority: message.priority,
          sender: message.sender,
          recipients: message.recipients,
          targetZone: message.targetZone,
          timestamp: message.createdAt,
          isEmergency: message.isEmergency
        }
      }
    });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    await message.markAsRead(userId);

    // Emit read status via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(message.sender.toString()).emit('message-read', {
        messageId,
        readBy: userId,
        readAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: "Message marked as read"
    });

  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark message as read"
    });
  }
};

// Get message statistics
export const getMessageStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get various counts
    const [
      totalSent,
      totalReceived,
      unreadCount,
      emergencyCount
    ] = await Promise.all([
      Message.countDocuments({ sender: userId }),
      Message.countDocuments({
        $or: [
          { recipients: 'all' },
          { recipients: user.role + 's' },
          ...(user.assignedZone ? [{ recipients: 'zone', targetZone: user.assignedZone }] : []),
          { recipients: 'specific', specificRecipients: userId }
        ],
        sender: { $ne: userId }
      }),
      Message.getUnreadCount(userId, user.role, user.assignedZone),
      Message.countDocuments({
        $or: [
          { recipients: 'all' },
          { recipients: user.role + 's' },
          ...(user.assignedZone ? [{ recipients: 'zone', targetZone: user.assignedZone }] : []),
          { recipients: 'specific', specificRecipients: userId }
        ],
        isEmergency: true,
        'readBy.user': { $ne: userId }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSent,
        totalReceived,
        unreadCount,
        emergencyCount
      }
    });

  } catch (error) {
    console.error("Error fetching message stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch message statistics"
    });
  }
};

// Broadcast message (admin/operator only)
export const broadcastMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { content, priority = 'high', recipients = 'all' } = req.body;

    // Get sender information
    const sender = await User.findById(userId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found"
      });
    }

    // Check if user has permission to broadcast
    if (sender.role !== 'admin' && sender.role !== 'operator') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to broadcast messages"
      });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    // Create broadcast message
    const message = new Message({
      content: content.trim(),
      type: 'broadcast',
      priority,
      sender: userId,
      senderName: sender.name,
      senderRole: sender.role,
      recipients,
      isEmergency: priority === 'critical'
    });

    await message.save();

    // Emit via WebSocket
    const io = req.app.get('io');
    if (io) {
      const messageData = {
        id: message._id,
        content: message.content,
        type: message.type,
        priority: message.priority,
        sender: {
          id: sender._id,
          name: sender.name,
          role: sender.role
        },
        recipients: message.recipients,
        timestamp: message.createdAt,
        isEmergency: message.isEmergency
      };

      io.emit('new-message', messageData);
    }

    res.status(201).json({
      success: true,
      data: {
        message: {
          id: message._id,
          content: message.content,
          type: message.type,
          priority: message.priority,
          recipients: message.recipients,
          timestamp: message.createdAt,
          isEmergency: message.isEmergency
        }
      }
    });

  } catch (error) {
    console.error("Error broadcasting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to broadcast message"
    });
  }
};
