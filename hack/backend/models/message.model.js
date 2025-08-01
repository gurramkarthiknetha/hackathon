import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  // Message content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Message type
  type: {
    type: String,
    enum: ['direct', 'team', 'broadcast', 'emergency'],
    default: 'team',
    required: true
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal',
    required: true
  },
  
  // Sender information
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['admin', 'operator', 'responder'],
    required: true
  },
  
  // Recipients
  recipients: {
    type: String,
    enum: ['all', 'responders', 'operators', 'admins', 'zone', 'specific'],
    default: 'responders',
    required: true
  },
  
  // Specific recipients (when recipients = 'specific')
  specificRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Zone-based messaging (when recipients = 'zone')
  targetZone: {
    type: String,
    default: null
  },
  
  // Message metadata
  isEmergency: {
    type: Boolean,
    default: false
  },
  
  // Read tracking
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Delivery tracking
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Message status
  status: {
    type: String,
    enum: ['pending', 'delivered', 'failed'],
    default: 'pending'
  },
  
  // Thread/reply support
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  // Attachments (for future use)
  attachments: [{
    type: String,
    url: String,
    filename: String,
    size: Number
  }],
  
  // Location context (optional)
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    description: { type: String, default: null }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipients: 1, targetZone: 1, createdAt: -1 });
messageSchema.index({ type: 1, priority: 1, createdAt: -1 });
messageSchema.index({ 'readBy.user': 1 });
messageSchema.index({ createdAt: -1 });

// Instance methods
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({ user: userId, readAt: new Date() });
    return this.save();
  }
  return Promise.resolve(this);
};

messageSchema.methods.markAsDelivered = function(userId) {
  const existingDelivery = this.deliveredTo.find(delivery => delivery.user.toString() === userId.toString());
  if (!existingDelivery) {
    this.deliveredTo.push({ user: userId, deliveredAt: new Date() });
    return this.save();
  }
  return Promise.resolve(this);
};

// Static methods
messageSchema.statics.getMessagesForUser = function(userId, userRole, userZone, options = {}) {
  const query = {
    $or: [
      // Messages sent by the user
      { sender: userId },
      // Messages for all users
      { recipients: 'all' },
      // Messages for user's role
      { recipients: userRole + 's' },
      // Messages for user's zone (if user has a zone)
      ...(userZone ? [{ recipients: 'zone', targetZone: userZone }] : []),
      // Direct messages to the user
      { recipients: 'specific', specificRecipients: userId }
    ]
  };
  
  const limit = options.limit || 50;
  const skip = options.skip || 0;
  
  return this.find(query)
    .populate('sender', 'name role')
    .populate('specificRecipients', 'name role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

messageSchema.statics.getUnreadCount = function(userId, userRole, userZone) {
  const query = {
    $and: [
      {
        $or: [
          { recipients: 'all' },
          { recipients: userRole + 's' },
          ...(userZone ? [{ recipients: 'zone', targetZone: userZone }] : []),
          { recipients: 'specific', specificRecipients: userId }
        ]
      },
      {
        sender: { $ne: userId } // Don't count own messages
      },
      {
        'readBy.user': { $ne: userId } // Not read by this user
      }
    ]
  };
  
  return this.countDocuments(query);
};

export const Message = mongoose.model("Message", messageSchema);
