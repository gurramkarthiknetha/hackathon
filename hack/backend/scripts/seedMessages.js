import mongoose from "mongoose";
import dotenv from "dotenv";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

const seedMessages = async () => {
  try {
    await connectDB();

    // Get some users to use as senders
    const users = await User.find().limit(3);
    if (users.length === 0) {
      console.log("No users found. Please seed users first.");
      process.exit(1);
    }

    // Clear existing messages
    await Message.deleteMany({});
    console.log("Cleared existing messages");

    // Sample messages
    const sampleMessages = [
      {
        content: "All units, be advised of crowd surge in South Zone",
        type: "broadcast",
        priority: "high",
        sender: users[0]._id,
        senderName: users[0].name,
        senderRole: users[0].role,
        recipients: "all",
        isEmergency: false
      },
      {
        content: "Medical emergency resolved at East Zone entrance",
        type: "team",
        priority: "normal",
        sender: users[1]._id,
        senderName: users[1].name,
        senderRole: users[1].role,
        recipients: "responders",
        isEmergency: false
      },
      {
        content: "Requesting backup at West Zone security checkpoint",
        type: "team",
        priority: "high",
        sender: users[2]._id,
        senderName: users[2].name,
        senderRole: users[2].role,
        recipients: "responders",
        isEmergency: false
      },
      {
        content: "Radio check - all units please respond",
        type: "team",
        priority: "normal",
        sender: users[0]._id,
        senderName: users[0].name,
        senderRole: users[0].role,
        recipients: "responders",
        isEmergency: false
      },
      {
        content: "EMERGENCY: Fire detected in North Zone - evacuate immediately",
        type: "emergency",
        priority: "critical",
        sender: users[1]._id,
        senderName: users[1].name,
        senderRole: users[1].role,
        recipients: "all",
        isEmergency: true
      }
    ];

    // Create messages with different timestamps
    for (let i = 0; i < sampleMessages.length; i++) {
      const message = new Message({
        ...sampleMessages[i],
        createdAt: new Date(Date.now() - (sampleMessages.length - i) * 5 * 60 * 1000) // 5 minutes apart
      });
      await message.save();
    }

    console.log(`Created ${sampleMessages.length} sample messages`);
    
    // Display created messages
    const messages = await Message.find().populate('sender', 'name role').sort({ createdAt: -1 });
    console.log("\nCreated messages:");
    messages.forEach(msg => {
      console.log(`- [${msg.priority.toUpperCase()}] ${msg.senderName}: ${msg.content}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding messages:", error);
    process.exit(1);
  }
};

seedMessages();
