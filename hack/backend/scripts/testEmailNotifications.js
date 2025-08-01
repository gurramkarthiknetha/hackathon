import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../db/connectDB.js";
import { User } from "../models/user.model.js";
import { Zone } from "../models/zone.model.js";
import { Incident } from "../models/incident.model.js";
import { EmailNotificationSettings } from "../models/emailNotificationSettings.model.js";
import {
  sendIncidentCreatedNotification,
  sendIncidentAssignedNotification,
  sendIncidentStatusUpdateNotification,
  sendIncidentApprovalNotification,
  testEmailConfiguration as testEmailConfig
} from "../services/alertEmailService.js";

dotenv.config();

// Test data
const testUsers = [
  {
    name: "Admin User",
    email: "admin@test.com",
    role: "admin",
    password: "password123",
    isVerified: true,
    isActive: true
  },
  {
    name: "Operator User",
    email: "operator@test.com",
    role: "operator",
    password: "password123",
    isVerified: true,
    isActive: true
  },
  {
    name: "Responder User",
    email: "responder@test.com",
    role: "responder",
    password: "password123",
    isVerified: true,
    isActive: true,
    assignedZone: "main-stage"
  }
];

const testZone = {
  name: "main-stage",
  displayName: "Main Stage Area",
  description: "Primary performance area",
  center: {
    latitude: 40.7128,
    longitude: -74.0060
  },
  capacity: 5000,
  eventType: "concert"
};

const testIncident = {
  type: "fire",
  zone: "main-stage",
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    description: "Near main stage"
  },
  severity: "high",
  confidence: 95,
  description: "Smoke detected near main stage equipment",
  humanApprovalRequired: true,
  priority: 4
};

// Test functions
async function setupTestData() {
  console.log("🔧 Setting up test data...");
  
  try {
    // Clean up existing test data
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    await Zone.deleteOne({ name: testZone.name });
    await Incident.deleteMany({ zone: testZone.name });
    
    // Create test users
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }
    
    // Create test zone
    const zone = new Zone(testZone);
    
    // Assign responder to zone
    const responder = createdUsers.find(u => u.role === "responder");
    if (responder) {
      zone.assignedResponders = [responder._id];
    }
    
    await zone.save();
    console.log(`✅ Created zone: ${zone.name}`);
    
    return { users: createdUsers, zone };
  } catch (error) {
    console.error("❌ Error setting up test data:", error);
    throw error;
  }
}

async function testEmailConfiguration() {
  console.log("\n📧 Testing email configuration...");

  try {
    const isValid = await testEmailConfig();
    if (isValid) {
      console.log("✅ Email configuration is valid");
    } else {
      console.log("❌ Email configuration is invalid");
      return false;
    }
  } catch (error) {
    console.error("❌ Email configuration test failed:", error);
    return false;
  }

  return true;
}

async function testIncidentCreatedNotification(testData) {
  console.log("\n🚨 Testing incident created notification...");
  
  try {
    // Create test incident
    const incident = new Incident(testIncident);
    await incident.save();
    
    // Send notification
    await sendIncidentCreatedNotification(incident);
    console.log("✅ Incident created notification sent successfully");
    
    return incident;
  } catch (error) {
    console.error("❌ Error testing incident created notification:", error);
    throw error;
  }
}

async function testIncidentAssignedNotification(incident, testData) {
  console.log("\n📋 Testing incident assigned notification...");
  
  try {
    const responder = testData.users.find(u => u.role === "responder");
    
    // Assign incident
    incident.assignedTo = responder._id;
    incident.assignedAt = new Date();
    incident.status = "assigned";
    await incident.save();
    
    // Send notification
    await sendIncidentAssignedNotification(incident, responder);
    console.log("✅ Incident assigned notification sent successfully");
  } catch (error) {
    console.error("❌ Error testing incident assigned notification:", error);
    throw error;
  }
}

async function testIncidentStatusUpdateNotification(incident, testData) {
  console.log("\n⚡ Testing incident status update notification...");
  
  try {
    const operator = testData.users.find(u => u.role === "operator");
    const previousStatus = incident.status;
    
    // Update incident status
    incident.status = "in_progress";
    await incident.save();
    
    // Send notification
    await sendIncidentStatusUpdateNotification(
      incident, 
      previousStatus, 
      operator, 
      "Responder is on scene and addressing the situation"
    );
    console.log("✅ Incident status update notification sent successfully");
  } catch (error) {
    console.error("❌ Error testing incident status update notification:", error);
    throw error;
  }
}

async function testIncidentApprovalNotification(incident, testData) {
  console.log("\n✅ Testing incident approval notification...");
  
  try {
    const admin = testData.users.find(u => u.role === "admin");
    
    // Approve incident
    incident.humanApproved = true;
    incident.approvedBy = admin._id;
    await incident.save();
    
    // Send notification
    await sendIncidentApprovalNotification(incident, admin, true);
    console.log("✅ Incident approval notification sent successfully");
  } catch (error) {
    console.error("❌ Error testing incident approval notification:", error);
    throw error;
  }
}

async function testEmailNotificationSettings() {
  console.log("\n⚙️ Testing email notification settings...");
  
  try {
    // Get current settings
    const settings = await EmailNotificationSettings.getCurrentSettings();
    console.log("✅ Email notification settings retrieved");
    console.log(`   - Global notifications enabled: ${settings.emailNotificationsEnabled}`);
    console.log(`   - Incident created enabled: ${settings.incidentCreated.enabled}`);
    console.log(`   - Incident assigned enabled: ${settings.incidentAssigned.enabled}`);
    console.log(`   - Status update enabled: ${settings.incidentStatusUpdate.enabled}`);
    console.log(`   - Approval enabled: ${settings.incidentApproval.enabled}`);
    
    return settings;
  } catch (error) {
    console.error("❌ Error testing email notification settings:", error);
    throw error;
  }
}

async function cleanupTestData() {
  console.log("\n🧹 Cleaning up test data...");
  
  try {
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    await Zone.deleteOne({ name: testZone.name });
    await Incident.deleteMany({ zone: testZone.name });
    console.log("✅ Test data cleaned up");
  } catch (error) {
    console.error("❌ Error cleaning up test data:", error);
  }
}

// Main test function
async function runEmailNotificationTests() {
  console.log("🧪 Starting Email Notification System Tests");
  console.log("=" .repeat(50));
  
  try {
    // Connect to database
    await connectDB();
    console.log("✅ Connected to database");
    
    // Test email configuration
    const emailConfigValid = await testEmailConfiguration();
    if (!emailConfigValid) {
      console.log("⚠️ Email configuration is invalid. Some tests may fail.");
    }
    
    // Setup test data
    const testData = await setupTestData();
    
    // Test email notification settings
    await testEmailNotificationSettings();
    
    // Test incident created notification
    const incident = await testIncidentCreatedNotification(testData);
    
    // Test incident assigned notification
    await testIncidentAssignedNotification(incident, testData);
    
    // Test incident status update notification
    await testIncidentStatusUpdateNotification(incident, testData);
    
    // Test incident approval notification
    await testIncidentApprovalNotification(incident, testData);
    
    console.log("\n🎉 All email notification tests completed successfully!");
    
  } catch (error) {
    console.error("\n💥 Email notification tests failed:", error);
  } finally {
    // Cleanup
    await cleanupTestData();
    
    // Close database connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEmailNotificationTests();
}

export { runEmailNotificationTests };
