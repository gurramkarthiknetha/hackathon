import mongoose from "mongoose";
import dotenv from "dotenv";
import { Zone } from "../models/zone.model.js";
import { Incident } from "../models/incident.model.js";
import { User } from "../models/user.model.js";

dotenv.config();

const seedMonitoringData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Incident.deleteMany({});
    console.log("Cleared existing monitoring data");

    // Skip zones for now and just create incidents
    console.log("Skipping zones creation for now");

    // Create sample incidents without zones
    const sampleZones = [
      {
        name: "east_zone",
        displayName: "East Zone",
        description: "Main stage area with high crowd density",
        coordinates: [
          [-74.0059, 40.7128], [-74.0049, 40.7128], [-74.0049, 40.7138], [-74.0059, 40.7138], [-74.0059, 40.7128]
        ],
        center: { latitude: 40.7133, longitude: -74.0054 },
        capacity: 5000,
        currentOccupancy: 3200,
        riskLevel: "medium",
        eventType: "concert",
        cameras: [
          {
            id: "cam_east_01",
            name: "East Zone Camera 1",
            location: { latitude: 40.7130, longitude: -74.0056 },
            isActive: true,
            streamUrl: "rtmp://stream.example.com/east_01"
          },
          {
            id: "cam_east_02",
            name: "East Zone Camera 2",
            location: { latitude: 40.7136, longitude: -74.0052 },
            isActive: true,
            streamUrl: "rtmp://stream.example.com/east_02"
          }
        ],
        emergencyExits: [
          {
            name: "East Exit A",
            location: { latitude: 40.7135, longitude: -74.0060 },
            isBlocked: false
          },
          {
            name: "East Exit B",
            location: { latitude: 40.7131, longitude: -74.0048 },
            isBlocked: false
          }
        ]
      },
      {
        name: "west_zone",
        displayName: "West Zone",
        description: "Food court and vendor area",
        coordinates: [
          [-74.0079, 40.7128], [-74.0069, 40.7128], [-74.0069, 40.7138], [-74.0079, 40.7138], [-74.0079, 40.7128]
        ],
        center: { latitude: 40.7133, longitude: -74.0074 },
        capacity: 2000,
        currentOccupancy: 800,
        riskLevel: "low",
        eventType: "festival",
        cameras: [
          {
            id: "cam_west_01",
            name: "West Zone Camera 1",
            location: { latitude: 40.7130, longitude: -74.0076 },
            isActive: true,
            streamUrl: "rtmp://stream.example.com/west_01"
          }
        ],
        emergencyExits: [
          {
            name: "West Exit A",
            location: { latitude: 40.7135, longitude: -74.0080 },
            isBlocked: false
          }
        ]
      },
      {
        name: "north_zone",
        displayName: "North Zone",
        description: "VIP and backstage area",
        coordinates: [
          [-74.0069, 40.7148], [-74.0059, 40.7148], [-74.0059, 40.7158], [-74.0069, 40.7158], [-74.0069, 40.7148]
        ],
        center: { latitude: 40.7153, longitude: -74.0064 },
        capacity: 500,
        currentOccupancy: 120,
        riskLevel: "low",
        eventType: "concert",
        cameras: [
          {
            id: "cam_north_01",
            name: "North Zone Camera 1",
            location: { latitude: 40.7150, longitude: -74.0066 },
            isActive: true,
            streamUrl: "rtmp://stream.example.com/north_01"
          }
        ],
        emergencyExits: [
          {
            name: "North Exit A",
            location: { latitude: 40.7155, longitude: -74.0070 },
            isBlocked: false
          }
        ]
      },
      {
        name: "south_zone",
        displayName: "South Zone",
        description: "Parking and entry area",
        coordinates: [
          [-74.0069, 40.7108], [-74.0059, 40.7108], [-74.0059, 40.7118], [-74.0069, 40.7118], [-74.0069, 40.7108]
        ],
        center: { latitude: 40.7113, longitude: -74.0064 },
        capacity: 1000,
        currentOccupancy: 450,
        riskLevel: "low",
        eventType: "festival",
        cameras: [
          {
            id: "cam_south_01",
            name: "South Zone Camera 1",
            location: { latitude: 40.7110, longitude: -74.0066 },
            isActive: true,
            streamUrl: "rtmp://stream.example.com/south_01"
          }
        ],
        emergencyExits: [
          {
            name: "South Exit A",
            location: { latitude: 40.7115, longitude: -74.0070 },
            isBlocked: false
          }
        ]
      }
    ];

    // Skip zone creation for now
    console.log("Skipped zone creation");

    // Create sample incidents
    const incidents = [
      {
        type: "crowd_surge",
        zone: "east_zone",
        location: { latitude: 40.7132, longitude: -74.0055, description: "Near main stage barrier" },
        severity: "high",
        confidence: 87,
        description: "Crowd density exceeding safe limits detected near main stage",
        status: "active",
        humanApprovalRequired: true,
        priority: 4,
        videoSnapshot: "/snapshots/crowd_surge_001.jpg",
        boundingBoxes: [
          { x: 120, y: 80, width: 200, height: 150, label: "crowd_density", confidence: 87 }
        ]
      },
      {
        type: "medical_emergency",
        zone: "west_zone",
        location: { latitude: 40.7131, longitude: -74.0075, description: "Food court area" },
        severity: "medium",
        confidence: 92,
        description: "Person requiring medical assistance detected",
        status: "assigned",
        humanApprovalRequired: false,
        priority: 3,
        videoSnapshot: "/snapshots/medical_001.jpg",
        assignedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        boundingBoxes: [
          { x: 300, y: 200, width: 80, height: 120, label: "person_down", confidence: 92 }
        ]
      },
      {
        type: "fire",
        zone: "north_zone",
        location: { latitude: 40.7151, longitude: -74.0065, description: "Backstage equipment area" },
        severity: "critical",
        confidence: 95,
        description: "Smoke and potential fire detected in equipment area",
        status: "resolved",
        humanApprovalRequired: true,
        humanApproved: true,
        priority: 5,
        videoSnapshot: "/snapshots/fire_001.jpg",
        assignedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        resolvedAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        responseTime: 25,
        boundingBoxes: [
          { x: 150, y: 100, width: 100, height: 80, label: "smoke", confidence: 95 }
        ],
        notes: [
          {
            text: "Fire suppression system activated",
            addedAt: new Date(Date.now() - 30 * 60 * 1000)
          },
          {
            text: "Area cleared and secured",
            addedAt: new Date(Date.now() - 20 * 60 * 1000)
          }
        ]
      },
      {
        type: "unconscious_person",
        zone: "south_zone",
        location: { latitude: 40.7112, longitude: -74.0065, description: "Parking area entrance" },
        severity: "medium",
        confidence: 78,
        description: "Person appears to be unconscious or in distress",
        status: "in_progress",
        humanApprovalRequired: false,
        priority: 3,
        videoSnapshot: "/snapshots/unconscious_001.jpg",
        assignedAt: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
        boundingBoxes: [
          { x: 250, y: 180, width: 60, height: 100, label: "person_down", confidence: 78 }
        ]
      },
      {
        type: "equipment_failure",
        zone: "east_zone",
        location: { latitude: 40.7134, longitude: -74.0053, description: "Sound system area" },
        severity: "low",
        confidence: 65,
        description: "Potential equipment malfunction detected",
        status: "dismissed",
        humanApprovalRequired: false,
        priority: 2,
        videoSnapshot: "/snapshots/equipment_001.jpg",
        notes: [
          {
            text: "False alarm - equipment functioning normally",
            addedAt: new Date(Date.now() - 10 * 60 * 1000)
          }
        ]
      }
    ];

    const createdIncidents = await Incident.insertMany(incidents);
    console.log(`Created ${createdIncidents.length} sample incidents`);

    console.log("Sample monitoring data seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding monitoring data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the seeding function
seedMonitoringData();
