import mongoose from "mongoose";

const emailNotificationSettingsSchema = new mongoose.Schema(
  {
    // Global email notification settings
    emailNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    
    // Notification settings by incident type
    incidentCreated: {
      enabled: {
        type: Boolean,
        default: true,
      },
      notifyRoles: [{
        type: String,
        enum: ["admin", "operator", "responder"],
      }],
      notifyZoneResponders: {
        type: Boolean,
        default: true,
      },
    },
    
    incidentAssigned: {
      enabled: {
        type: Boolean,
        default: true,
      },
      notifyRoles: [{
        type: String,
        enum: ["admin", "operator", "responder"],
      }],
      notifyAssignedResponder: {
        type: Boolean,
        default: true,
      },
    },
    
    incidentStatusUpdate: {
      enabled: {
        type: Boolean,
        default: true,
      },
      notifyRoles: [{
        type: String,
        enum: ["admin", "operator", "responder"],
      }],
      notifyOnResolved: {
        type: Boolean,
        default: true,
      },
      notifyOnInProgress: {
        type: Boolean,
        default: true,
      },
    },
    
    incidentApproval: {
      enabled: {
        type: Boolean,
        default: true,
      },
      notifyRoles: [{
        type: String,
        enum: ["admin", "operator", "responder"],
      }],
      notifyOnApproved: {
        type: Boolean,
        default: true,
      },
      notifyOnDismissed: {
        type: Boolean,
        default: true,
      },
    },
    
    // Severity-based filtering
    severityFilters: {
      notifyOnLow: {
        type: Boolean,
        default: true,
      },
      notifyOnMedium: {
        type: Boolean,
        default: true,
      },
      notifyOnHigh: {
        type: Boolean,
        default: true,
      },
      notifyOnCritical: {
        type: Boolean,
        default: true,
      },
    },
    
    // Email throttling settings
    throttling: {
      enabled: {
        type: Boolean,
        default: false,
      },
      maxEmailsPerHour: {
        type: Number,
        default: 50,
        min: 1,
        max: 1000,
      },
      cooldownMinutes: {
        type: Number,
        default: 5,
        min: 1,
        max: 60,
      },
    },
    
    // SMTP configuration override (optional)
    smtpOverride: {
      enabled: {
        type: Boolean,
        default: false,
      },
      host: String,
      port: Number,
      secure: Boolean,
      user: String,
      pass: String,
      fromName: String,
      fromEmail: String,
    },
    
    // Last updated information
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Default settings
emailNotificationSettingsSchema.statics.getDefaultSettings = function() {
  return {
    emailNotificationsEnabled: true,
    incidentCreated: {
      enabled: true,
      notifyRoles: ["admin", "operator"],
      notifyZoneResponders: true,
    },
    incidentAssigned: {
      enabled: true,
      notifyRoles: ["admin", "operator"],
      notifyAssignedResponder: true,
    },
    incidentStatusUpdate: {
      enabled: true,
      notifyRoles: ["admin", "operator"],
      notifyOnResolved: true,
      notifyOnInProgress: true,
    },
    incidentApproval: {
      enabled: true,
      notifyRoles: ["admin", "operator"],
      notifyOnApproved: true,
      notifyOnDismissed: true,
    },
    severityFilters: {
      notifyOnLow: true,
      notifyOnMedium: true,
      notifyOnHigh: true,
      notifyOnCritical: true,
    },
    throttling: {
      enabled: false,
      maxEmailsPerHour: 50,
      cooldownMinutes: 5,
    },
    smtpOverride: {
      enabled: false,
    },
  };
};

// Get current settings or create default if none exist
emailNotificationSettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this(this.getDefaultSettings());
    await settings.save();
  }
  return settings;
};

// Singleton pattern - only one settings document should exist
emailNotificationSettingsSchema.pre('save', async function() {
  if (this.isNew) {
    const existingSettings = await this.constructor.findOne();
    if (existingSettings) {
      throw new Error('Email notification settings already exist. Use update instead of create.');
    }
  }
});

export const EmailNotificationSettings = mongoose.model("EmailNotificationSettings", emailNotificationSettingsSchema);
