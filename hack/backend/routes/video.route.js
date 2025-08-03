import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { rolePermissions } from "../middleware/roleAuth.js";
import {
  getCameras,
  startCamera,
  stopCamera,
  getCameraDetections,
  configureDroidCam,
  configureIPWebcam,
  configureCamoStudio,
  detectCameraDevices,
  getDetectionHistory,
  getCameraStatus
} from "../controllers/video.controller.js";

const router = express.Router();

// All video routes require authentication
router.use(verifyToken);

// Camera management routes
router.get("/cameras", rolePermissions.anyRole, getCameras);
router.get("/cameras/:cameraId/status", rolePermissions.anyRole, getCameraStatus);
router.post("/cameras/:cameraId/start", rolePermissions.adminOrOperator, startCamera);
router.post("/cameras/:cameraId/stop", rolePermissions.adminOrOperator, stopCamera);

// Detection routes
router.get("/cameras/:cameraId/detections", rolePermissions.anyRole, getCameraDetections);
router.get("/cameras/:cameraId/history", rolePermissions.anyRole, getDetectionHistory);

// DroidCam configuration
router.post("/cameras/droidcam/configure", rolePermissions.adminOrOperator, configureDroidCam);

// IP Webcam configuration
router.post("/cameras/ipwebcam/configure", rolePermissions.adminOrOperator, configureIPWebcam);

// Camo Studio configuration
router.post("/cameras/camo-studio/configure", rolePermissions.adminOrOperator, configureCamoStudio);

// Device detection
router.post("/cameras/detect-devices", rolePermissions.adminOrOperator, detectCameraDevices);

export default router;
