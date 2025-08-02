import axios from 'axios';
import { VideoDetection } from '../models/aimodel.model.js';

// Video streaming service URL
const VIDEO_SERVICE_URL = process.env.VIDEO_SERVICE_URL || 'http://localhost:5001';

// Get all available cameras
export const getCameras = async (req, res) => {
  try {
    const response = await axios.get(`${VIDEO_SERVICE_URL}/api/cameras`);
    
    res.status(200).json({
      success: true,
      data: response.data.cameras
    });
  } catch (error) {
    console.error("Error fetching cameras:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cameras from video service"
    });
  }
};

// Get camera status
export const getCameraStatus = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const response = await axios.get(`${VIDEO_SERVICE_URL}/api/cameras`);
    
    const camera = response.data.cameras.find(cam => cam.id === cameraId);
    
    if (!camera) {
      return res.status(404).json({
        success: false,
        message: "Camera not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: camera
    });
  } catch (error) {
    console.error("Error fetching camera status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch camera status"
    });
  }
};

// Start a camera
export const startCamera = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const userId = req.userId;
    
    console.log(`User ${userId} starting camera ${cameraId}`);
    
    const response = await axios.post(`${VIDEO_SERVICE_URL}/api/cameras/${cameraId}/start`);
    
    res.status(200).json({
      success: response.data.success,
      message: response.data.message
    });
  } catch (error) {
    console.error("Error starting camera:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start camera"
    });
  }
};

// Stop a camera
export const stopCamera = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const userId = req.userId;
    
    console.log(`User ${userId} stopping camera ${cameraId}`);
    
    const response = await axios.post(`${VIDEO_SERVICE_URL}/api/cameras/${cameraId}/stop`);
    
    res.status(200).json({
      success: response.data.success,
      message: response.data.message
    });
  } catch (error) {
    console.error("Error stopping camera:", error);
    res.status(500).json({
      success: false,
      message: "Failed to stop camera"
    });
  }
};

// Get camera detections
export const getCameraDetections = async (req, res) => {
  try {
    const { cameraId } = req.params;
    
    const response = await axios.get(`${VIDEO_SERVICE_URL}/api/cameras/${cameraId}/detections`);
    
    res.status(200).json({
      success: response.data.success,
      data: response.data.data
    });
  } catch (error) {
    console.error("Error fetching camera detections:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch camera detections"
    });
  }
};

// Configure DroidCam
export const configureDroidCam = async (req, res) => {
  try {
    const { ip_address, camera_id } = req.body;
    const userId = req.userId;

    if (!ip_address) {
      return res.status(400).json({
        success: false,
        message: "IP address is required"
      });
    }

    console.log(`User ${userId} configuring DroidCam with IP ${ip_address}`);

    const response = await axios.post(`${VIDEO_SERVICE_URL}/api/cameras/droidcam/configure`, {
      ip_address,
      camera_id: camera_id || 'droidcam_01'
    });

    res.status(200).json({
      success: response.data.success,
      message: response.data.message
    });
  } catch (error) {
    console.error("Error configuring DroidCam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to configure DroidCam"
    });
  }
};

// Configure IP Webcam
export const configureIPWebcam = async (req, res) => {
  try {
    const { webcam_url, camera_id, camera_name } = req.body;
    const userId = req.userId;

    if (!webcam_url) {
      return res.status(400).json({
        success: false,
        message: "Webcam URL is required"
      });
    }

    console.log(`User ${userId} configuring IP Webcam with URL ${webcam_url}`);

    const response = await axios.post(`${VIDEO_SERVICE_URL}/api/cameras/ipwebcam/configure`, {
      webcam_url,
      camera_id: camera_id || 'ipwebcam_01',
      camera_name
    });

    res.status(200).json({
      success: response.data.success,
      message: response.data.message
    });
  } catch (error) {
    console.error("Error configuring IP Webcam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to configure IP Webcam"
    });
  }
};

// Get detection history
export const getDetectionHistory = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const { limit, start_time, end_time } = req.query;
    
    // Try to get from video service first
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit);
      if (start_time) params.append('start_time', start_time);
      if (end_time) params.append('end_time', end_time);
      
      const response = await axios.get(
        `${VIDEO_SERVICE_URL}/api/detection_history/${cameraId}?${params.toString()}`
      );
      
      if (response.data.success) {
        return res.status(200).json({
          success: true,
          data: response.data.data
        });
      }
    } catch (serviceError) {
      console.log("Video service unavailable, falling back to database");
    }
    
    // Fallback to direct database query
    const query = { videoId: cameraId };
    const videoDoc = await VideoDetection.findOne(query);
    
    if (!videoDoc) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    let results = videoDoc.results || [];
    
    // Apply filters
    if (start_time) {
      const startTimestamp = parseFloat(start_time);
      results = results.filter(r => r.timestamp >= startTimestamp);
    }
    
    if (end_time) {
      const endTimestamp = parseFloat(end_time);
      results = results.filter(r => r.timestamp <= endTimestamp);
    }
    
    // Apply limit
    const limitNum = parseInt(limit) || 100;
    results = results.slice(-limitNum);
    
    res.status(200).json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error("Error fetching detection history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch detection history"
    });
  }
};
