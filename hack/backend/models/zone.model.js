import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    coordinates: {
      // Simple array of coordinate pairs for zone boundary
      type: [[Number]], // Array of [longitude, latitude] pairs
      required: false,
    },
    center: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    capacity: {
      type: Number,
      default: 0,
    },
    currentOccupancy: {
      type: Number,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    cameras: [{
      id: String,
      name: String,
      location: {
        latitude: Number,
        longitude: Number,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      streamUrl: String,
    }],
    emergencyExits: [{
      name: String,
      location: {
        latitude: Number,
        longitude: Number,
      },
      isBlocked: {
        type: Boolean,
        default: false,
      }
    }],
    assignedResponders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    eventType: {
      type: String,
      enum: ["concert", "rally", "festival", "sports", "conference", "other"],
      default: "other",
    }
  },
  { timestamps: true }
);

// Index for queries
zoneSchema.index({ name: 1 });

export const Zone = mongoose.model("Zone", zoneSchema);
