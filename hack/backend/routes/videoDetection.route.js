import express from 'express';
import {
  storeDetectionResults,
  getDetectionResults,
  getDetectionStats,
  cleanupOldDetections
} from '../controllers/videoDetection.controller.js';

const router = express.Router();

// Store detection results from video service
router.post('/store', storeDetectionResults);

// Get detection results for a specific video/camera
router.get('/results/:videoId', getDetectionResults);

// Get detection statistics for a specific video/camera
router.get('/stats/:videoId', getDetectionStats);

// Cleanup old detection records
router.delete('/cleanup', cleanupOldDetections);

export default router;
