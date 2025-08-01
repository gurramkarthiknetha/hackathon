import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  // Basic notification info
  type: {
    type: String,
    enum: ['general', 'emergency', 'system', 'announcement', 'maintenance', 'test'],
    default: 'general',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    required: true
  },

  // Sender information
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentByRole: {
    type: String,
    enum: ['admin', 'operator', 'responder'],
    required: true
  },

  // Recipients
  recipients: {
    type: String,
    enum: ['all', 'admins', 'operators', 'responders', 'specific'],
    default: 'all',
    required: true
  },
  specificRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Delivery options
  sendInApp: {
    type: Boolean,
    default: true
  },
  sendEmail: {
    type: Boolean,
    default: false
  },
  sendSMS: {
    type: Boolean,
    default: false
  },

  // Delivery tracking
  status: {
    type: String,
    enum: ['pending', 'sending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  deliveryStats: {
    total: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
  },

  // Scheduling
  scheduledFor: {
    type: Date,
    default: null
  },
  isScheduled: {
    type: Boolean,
    default: false
  },

  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Read tracking for in-app notifications
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

  // Timestamps
  sentAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ sentBy: 1, createdAt: -1 });
notificationSchema.index({ recipients: 1, createdAt: -1 });
notificationSchema.index({ type: 1, severity: 1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ 'readBy.user': 1 });

// Virtual for unread count
notificationSchema.virtual('unreadCount').get(function() {
  return this.deliveryStats.delivered - this.readBy.length;
});

// Methods
notificationSchema.methods.markAsRead = function(userId) {
  if (!this.readBy.some(read => read.user.toString() === userId.toString())) {
    this.readBy.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

notificationSchema.methods.updateDeliveryStats = function(delivered, failed) {
  this.deliveryStats.delivered += delivered || 0;
  this.deliveryStats.failed += failed || 0;
  this.deliveryStats.pending = Math.max(0, this.deliveryStats.total - this.deliveryStats.delivered - this.deliveryStats.failed);
  
  if (this.deliveryStats.pending === 0) {
    this.status = this.deliveryStats.failed > 0 ? 'completed' : 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadForUser = function(userId) {
  return this.find({
    $or: [
      { recipients: 'all' },
      { recipients: 'admins', /* user role check needed */ },
      { recipients: 'operators', /* user role check needed */ },
      { recipients: 'responders', /* user role check needed */ },
      { recipients: 'specific', specificRecipients: userId }
    ],
    sendInApp: true,
    'readBy.user': { $ne: userId }
  }).sort({ createdAt: -1 });
};

notificationSchema.statics.getNotificationHistory = function(filters = {}) {
  const query = {};
  
  if (filters.type) query.type = filters.type;
  if (filters.severity) query.severity = filters.severity;
  if (filters.sentBy) query.sentBy = filters.sentBy;
  if (filters.recipients) query.recipients = filters.recipients;
  if (filters.status) query.status = filters.status;
  
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }
  
  return this.find(query)
    .populate('sentBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50)
    .skip((filters.page - 1) * (filters.limit || 50) || 0);
};

notificationSchema.statics.getNotificationStats = function(timeRange = '7d') {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '1d':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        totalDelivered: { $sum: '$deliveryStats.delivered' },
        totalFailed: { $sum: '$deliveryStats.failed' },
        emergencyAlerts: { $sum: { $cond: [{ $eq: ['$type', 'emergency'] }, 1, 0] } },
        systemNotifications: { $sum: { $cond: [{ $eq: ['$type', 'system'] }, 1, 0] } },
        announcements: { $sum: { $cond: [{ $eq: ['$type', 'announcement'] }, 1, 0] } }
      }
    }
  ]);
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  if (this.isNew) {
    this.sentAt = new Date();
    if (!this.isScheduled) {
      this.status = 'sending';
    }
  }
  next();
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
