import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["fire", "crowd_surge", "unconscious_person", "medical_emergency", "security_threat", "equipment_failure", "other"],
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      description: { type: String, default: "" }
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "assigned", "in_progress", "resolved", "dismissed"],
      default: "active",
    },
    description: {
      type: String,
      required: true,
    },
    aiGenerated: {
      type: Boolean,
      default: true,
    },
    humanApprovalRequired: {
      type: Boolean,
      default: false,
    },
    humanApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    videoSnapshot: {
      type: String,
      default: null,
    },
    boundingBoxes: [{
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      label: String,
      confidence: Number
    }],
    responseTime: {
      type: Number, // in minutes
      default: null,
    },
    notes: [{
      text: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      addedAt: {
        type: Date,
        default: Date.now,
      }
    }],
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    }
  },
  { timestamps: true }
);

// Index for efficient queries
incidentSchema.index({ zone: 1, status: 1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ assignedTo: 1, status: 1 });

export const Incident = mongoose.model("Incident", incidentSchema);
