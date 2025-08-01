import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import { Zone } from "../models/zone.model.js";
import { Incident } from "../models/incident.model.js";
import { User } from "../models/user.model.js";

dotenv.config();

const seedAllData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Zone.deleteMany({});
    await Incident.deleteMany({});
    console.log("Cleared existing data");

    // Create sample users
    const hashedPassword = await bcryptjs.hash("password123", 12);
    
    const users = [
      {
        email: "admin@emergency.com",
        password: hashedPassword,
        name: "John Smith",
        role: "admin",
        isVerified: true,
        phoneNumber: "+1 (555) 123-4567",
        assignedZone: "all",
        isActive: true,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        email: "operator1@emergency.com",
        password: hashedPassword,
        name: "Sarah Johnson",
        role: "operator",
        isVerified: true,
        phoneNumber: "+1 (555) 234-5678",
        assignedZone: "central",
        isActive: true,
        lastLogin: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        email: "operator2@emergency.com",
        password: hashedPassword,
        name: "Alex Rodriguez",
        role: "operator",
        isVerified: true,
        phoneNumber: "+1 (555) 345-6789",
        assignedZone: "south",
        isActive: true,
        lastLogin: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        email: "responder1@emergency.com",
        password: hashedPassword,
        name: "Mike Chen",
        role: "responder",
        isVerified: true,
        phoneNumber: "+1 (555) 456-7890",
        assignedZone: "east",
        isActive: true,
        currentLocation: {
          latitude: 40.7130,
          longitude: -74.0056,
          lastUpdated: new Date(Date.now() - 15 * 60 * 1000)
        },
        lastLogin: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        email: "responder2@emergency.com",
        password: hashedPassword,
        name: "Emily Davis",
        role: "responder",
        isVerified: true,
        phoneNumber: "+1 (555) 567-8901",
        assignedZone: "west",
        isActive: true,
        currentLocation: {
          latitude: 40.7131,
          longitude: -74.0075,
          lastUpdated: new Date(Date.now() - 10 * 60 * 1000)
        },
        lastLogin: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        email: "responder3@emergency.com",
        password: hashedPassword,
        name: "Lisa Wang",
        role: "responder",
        isVerified: true,
        phoneNumber: "+1 (555) 678-9012",
        assignedZone: "north",
        isActive: true,
        currentLocation: {
          latitude: 40.7151,
          longitude: -74.0065,
          lastUpdated: new Date(Date.now() - 5 * 60 * 1000)
        },
        lastLogin: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        email: "responder4@emergency.com",
        password: hashedPassword,
        name: "David Kim",
        role: "responder",
        isVerified: false,
        phoneNumber: "+1 (555) 789-0123",
        assignedZone: "south",
        isActive: false,
        lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} sample users`);

    // Create sample zones
    const zones = [
      {
        name: "east_zone",
        displayName: "East Zone",
        description: "Main entrance and registration area",
        // coordinates: [
        //   [-74.0059, 40.7128], [-74.0049, 40.7128], [-74.0049, 40.7138], [-74.0059, 40.7138], [-74.0059, 40.7128]
        // ],
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
        // coordinates: [
        //   [-74.0079, 40.7128], [-74.0069, 40.7128], [-74.0069, 40.7138], [-74.0079, 40.7138], [-74.0079, 40.7128]
        // ],
        center: { latitude: 40.7133, longitude: -74.0074 },
        capacity: 4500,
        currentOccupancy: 2800,
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
        description: "Emergency exits and medical stations",
        // coordinates: [
        //   [-74.0069, 40.7148], [-74.0059, 40.7148], [-74.0059, 40.7158], [-74.0069, 40.7158], [-74.0069, 40.7148]
        // ],
        center: { latitude: 40.7153, longitude: -74.0064 },
        capacity: 3000,
        currentOccupancy: 1500,
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
        description: "Main stage and performance area",
        // coordinates: [
        //   [-74.0069, 40.7108], [-74.0059, 40.7108], [-74.0059, 40.7118], [-74.0069, 40.7118], [-74.0069, 40.7108]
        // ],
        center: { latitude: 40.7113, longitude: -74.0064 },
        capacity: 6000,
        currentOccupancy: 4200,
        riskLevel: "high",
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
      },
      {
        name: "central_zone",
        displayName: "Central Zone",
        description: "Command center and administration",
        // coordinates: [
        //   [-74.0064, 40.7123], [-74.0059, 40.7123], [-74.0059, 40.7133], [-74.0064, 40.7133], [-74.0064, 40.7123]
        // ],
        center: { latitude: 40.7128, longitude: -74.0062 },
        capacity: 2000,
        currentOccupancy: 800,
        riskLevel: "low",
        eventType: "conference",
        cameras: [
          {
            id: "cam_central_01",
            name: "Central Zone Camera 1",
            location: { latitude: 40.7125, longitude: -74.0061 },
            isActive: true,
            streamUrl: "rtmp://stream.example.com/central_01"
          }
        ],
        emergencyExits: [
          {
            name: "Central Exit A",
            location: { latitude: 40.7130, longitude: -74.0065 },
            isBlocked: false
          }
        ]
      },
      {
        name: "parking_zone",
        displayName: "Parking Zone",
        description: "Vehicle parking and transportation hub",
        // coordinates: [
        //   [-74.0079, 40.7108], [-74.0069, 40.7108], [-74.0069, 40.7118], [-74.0079, 40.7118], [-74.0079, 40.7108]
        // ],
        center: { latitude: 40.7113, longitude: -74.0074 },
        capacity: 4500,
        currentOccupancy: 2100,
        riskLevel: "low",
        eventType: "other",
        cameras: [
          {
            id: "cam_parking_01",
            name: "Parking Zone Camera 1",
            location: { latitude: 40.7110, longitude: -74.0076 },
            isActive: true,
            streamUrl: "rtmp://stream.example.com/parking_01"
          }
        ],
        emergencyExits: [
          {
            name: "Parking Exit A",
            location: { latitude: 40.7115, longitude: -74.0080 },
            isBlocked: false
          }
        ]
      }
    ];

    const createdZones = await Zone.insertMany(zones);
    console.log(`Created ${createdZones.length} sample zones`);

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
        assignedAt: new Date(Date.now() - 15 * 60 * 1000),
        boundingBoxes: [
          { x: 300, y: 200, width: 80, height: 120, label: "person_down", confidence: 92 }
        ]
      },
      {
        type: "fire",
        zone: "north_zone",
        location: { latitude: 40.7151, longitude: -74.0065, description: "Emergency exit area" },
        severity: "critical",
        confidence: 95,
        description: "Smoke and potential fire detected in emergency exit area",
        status: "resolved",
        humanApprovalRequired: true,
        humanApproved: true,
        priority: 5,
        videoSnapshot: "/snapshots/fire_001.jpg",
        assignedAt: new Date(Date.now() - 45 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 20 * 60 * 1000),
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
        type: "security_threat",
        zone: "south_zone",
        location: { latitude: 40.7112, longitude: -74.0065, description: "Stage area" },
        severity: "high",
        confidence: 78,
        description: "Suspicious activity detected near stage area",
        status: "in_progress",
        humanApprovalRequired: true,
        priority: 4,
        videoSnapshot: "/snapshots/security_001.jpg",
        assignedAt: new Date(Date.now() - 8 * 60 * 1000),
        boundingBoxes: [
          { x: 250, y: 180, width: 60, height: 100, label: "suspicious_person", confidence: 78 }
        ]
      },
      {
        type: "equipment_failure",
        zone: "central_zone",
        location: { latitude: 40.7125, longitude: -74.0061, description: "Command center" },
        severity: "medium",
        confidence: 85,
        description: "Communication equipment malfunction detected",
        status: "assigned",
        humanApprovalRequired: false,
        priority: 3,
        videoSnapshot: "/snapshots/equipment_001.jpg",
        assignedAt: new Date(Date.now() - 25 * 60 * 1000),
        boundingBoxes: [
          { x: 100, y: 50, width: 150, height: 100, label: "equipment_failure", confidence: 85 }
        ]
      }
    ];

    const createdIncidents = await Incident.insertMany(incidents);
    console.log(`Created ${createdIncidents.length} sample incidents`);

    console.log("All sample data seeded successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@emergency.com / password123");
    console.log("Operator: operator1@emergency.com / password123");
    console.log("Responder: responder1@emergency.com / password123");
    
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the seeding function
seedAllData();
