import mongoose from "mongoose";

const detectionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    // [x, y, width, height]
    bbox: {
      type: [Number],
      validate: {
        validator: function (arr) {
          return arr.length === 4;
        },
        message: "bbox must be an array of four numbers [x, y, width, height].",
      },
      required: true,
    },
  },
  { _id: false }
);

const frameResultSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Number, // seconds or milliseconds depending on your convention
      required: true,
    },
    frame: {
      type: String, // e.g., filename like "frame_001.jpg" or could be omitted if not applicable
      default: null,
    },
    detections: {
      type: [detectionSchema],
      default: [],
    },
  },
  { _id: false }
);

const videoDetectionSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: true,
      index: true,
    },
    results: {
      type: [frameResultSchema],
      default: [],
    },
    // Optional metadata
    sourceFilename: String,
    processedAt: {
      type: Date,
      default: () => new Date(),
    },
    durationSeconds: Number,
  },
  { timestamps: true }
);

export const VideoDetection = mongoose.model("VideoDetection", videoDetectionSchema);
