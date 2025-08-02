import express from "express";
import {
  getActiveIncidents,
  getIncidentsByZone,
  createIncident,
  updateIncidentStatus,
  assignIncident,
  getIncidentTimeline
} from "../controllers/monitoring.controller.js";
import {
  getAllZones,
  getZoneById,
  getResponderLocations,
  updateResponderLocation,
  createZone,
  updateZoneOccupancy,
  assignResponderToZone
} from "../controllers/zones.controller.js";
import {
  processAIQuery,
  getQueryHistory,
  approveIncident
} from "../controllers/ai.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { rolePermissions } from "../middleware/roleAuth.js";
import { incidentLimiter } from "../middleware/security.js";

const router = express.Router();

// All monitoring routes require authentication
router.use(verifyToken);

// Incident routes
router.get("/incidents/active", rolePermissions.anyRole, getActiveIncidents);
router.get("/incidents/zone/:zone", rolePermissions.anyRole, getIncidentsByZone);
router.get("/incidents/timeline", rolePermissions.anyRole, getIncidentTimeline);
router.post("/incidents", incidentLimiter, rolePermissions.adminOrOperator, createIncident);
router.patch("/incidents/:id/status", rolePermissions.anyRole, updateIncidentStatus);
router.patch("/incidents/:id/assign", rolePermissions.adminOrOperator, assignIncident);
router.patch("/incidents/:id/approve", rolePermissions.adminOrOperator, approveIncident);

// Zone routes
router.get("/zones", rolePermissions.anyRole, getAllZones);
router.get("/zones/:id", rolePermissions.anyRole, getZoneById);
router.post("/zones", rolePermissions.adminOnly, createZone);
router.patch("/zones/:id/occupancy", rolePermissions.adminOrOperator, updateZoneOccupancy);
router.post("/zones/assign-responder", rolePermissions.adminOrOperator, assignResponderToZone);

// Responder location routes
router.get("/responders/locations", rolePermissions.anyRole, getResponderLocations);
router.patch("/responders/location", rolePermissions.adminOrResponder, updateResponderLocation);

// AI query routes
router.post("/ai/query", rolePermissions.adminOrOperator, processAIQuery);
router.get("/ai/history", rolePermissions.adminOrOperator, getQueryHistory);

export default router;
