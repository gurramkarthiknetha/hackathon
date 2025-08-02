import { VideoDetection } from '../models/videoDetection.model.js';

// Store detection results from video service
export const storeDetectionResults = async (req, res) => {
  try {
    const { 
      camera_id, 
      timestamp, 
      detections, 
      person_count, 
      motion_level,
      crowd_analysis,
      fire_smoke_analysis 
    } = req.body;

    // Convert AI detection results to the schema format
    const frameDetections = [];
    
    // Add person detections
    if (person_count > 0) {
      frameDetections.push({
        label: 'person',
        confidence: 0.8, // Default confidence for person detection
        bbox: [0, 0, 100, 100] // Placeholder bbox - would need actual coordinates from AI
      });
    }

    // Add emergency detections
    if (detections) {
      Object.entries(detections).forEach(([eventType, result]) => {
        if (result.detected && result.confidence > 0.5) {
          frameDetections.push({
            label: eventType,
            confidence: result.confidence,
            bbox: [0, 0, 50, 50] // Placeholder bbox
          });
        }
      });
    }

    // Add fire/smoke detections
    if (fire_smoke_analysis) {
      if (fire_smoke_analysis.fire_detected) {
        frameDetections.push({
          label: 'fire',
          confidence: fire_smoke_analysis.fire_confidence,
          bbox: [0, 0, 75, 75] // Placeholder bbox
        });
      }
      if (fire_smoke_analysis.smoke_detected) {
        frameDetections.push({
          label: 'smoke',
          confidence: fire_smoke_analysis.smoke_confidence,
          bbox: [0, 0, 75, 75] // Placeholder bbox
        });
      }
    }

    // Create frame result
    const frameResult = {
      timestamp: timestamp,
      frame: `${camera_id}_${Date.now()}.jpg`,
      detections: frameDetections
    };

    // Find existing video detection record or create new one
    let videoDetection = await VideoDetection.findOne({ videoId: camera_id });
    
    if (!videoDetection) {
      videoDetection = new VideoDetection({
        videoId: camera_id,
        sourceFilename: `camera_${camera_id}`,
        results: [frameResult]
      });
    } else {
      // Add new frame result and keep only last 1000 frames
      videoDetection.results.push(frameResult);
      if (videoDetection.results.length > 1000) {
        videoDetection.results = videoDetection.results.slice(-1000);
      }
    }

    await videoDetection.save();

    res.status(200).json({
      success: true,
      message: 'Detection results stored successfully',
      frameCount: videoDetection.results.length
    });

  } catch (error) {
    console.error('Error storing detection results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store detection results',
      error: error.message
    });
  }
};

// Get detection results for a camera/video
export const getDetectionResults = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { limit = 100, startTime, endTime } = req.query;

    const videoDetection = await VideoDetection.findOne({ videoId });
    
    if (!videoDetection) {
      return res.status(404).json({
        success: false,
        message: 'No detection results found for this video'
      });
    }

    let results = videoDetection.results;

    // Apply time filters
    if (startTime) {
      results = results.filter(r => r.timestamp >= parseFloat(startTime));
    }
    if (endTime) {
      results = results.filter(r => r.timestamp <= parseFloat(endTime));
    }

    // Apply limit
    results = results.slice(-parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        videoId: videoDetection.videoId,
        sourceFilename: videoDetection.sourceFilename,
        processedAt: videoDetection.processedAt,
        totalFrames: videoDetection.results.length,
        results: results
      }
    });

  } catch (error) {
    console.error('Error getting detection results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get detection results',
      error: error.message
    });
  }
};

// Get detection statistics
export const getDetectionStats = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { timeRange = 3600 } = req.query; // Default 1 hour

    const videoDetection = await VideoDetection.findOne({ videoId });
    
    if (!videoDetection) {
      return res.status(404).json({
        success: false,
        message: 'No detection results found for this video'
      });
    }

    const now = Date.now() / 1000;
    const startTime = now - parseInt(timeRange);

    // Filter recent results
    const recentResults = videoDetection.results.filter(r => r.timestamp >= startTime);

    // Calculate statistics
    const stats = {
      totalFrames: recentResults.length,
      detectionCounts: {},
      averageConfidence: {},
      timeRange: timeRange
    };

    recentResults.forEach(frame => {
      frame.detections.forEach(detection => {
        const label = detection.label;
        
        if (!stats.detectionCounts[label]) {
          stats.detectionCounts[label] = 0;
          stats.averageConfidence[label] = [];
        }
        
        stats.detectionCounts[label]++;
        stats.averageConfidence[label].push(detection.confidence);
      });
    });

    // Calculate average confidences
    Object.keys(stats.averageConfidence).forEach(label => {
      const confidences = stats.averageConfidence[label];
      stats.averageConfidence[label] = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    });

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting detection stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get detection statistics',
      error: error.message
    });
  }
};

// Delete old detection results (cleanup)
export const cleanupOldDetections = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await VideoDetection.deleteMany({
      processedAt: { $lt: cutoffDate }
    });

    res.status(200).json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old detection records`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error cleaning up detections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old detections',
      error: error.message
    });
  }
};
