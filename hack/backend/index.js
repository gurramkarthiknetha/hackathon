import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";
import { verifyTransporter } from "./nodemailer/nodemailer.config.js";
import { globalErrorHandler } from "./utils/errorHandler.js";
import {
	generalLimiter,
	helmetConfig,
	sanitizeRequest,
	requestLogger
} from "./middleware/security.js";

import authRoutes from "./routes/auth.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import monitoringRoutes from "./routes/monitoring.route.js";
import mapsRoutes from "./routes/maps.route.js";
import emailNotificationSettingsRoutes from "./routes/emailNotificationSettings.route.js";
import notificationRoutes from "./routes/notification.route.js";
import messageRoutes from "./routes/message.route.js";
import videoRoutes from "./routes/video.route.js";

// Import models for WebSocket handlers
import { Message } from "./models/message.model.js";
import { User } from "./models/user.model.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.NODE_ENV === "production"
			? ["https://aieventmonitor.vercel.app", process.env.CLIENT_URL].filter(Boolean)
			: ["http://localhost:5173", "http://10.100.14.125:5173/", "https://aieventmonitor.vercel.app"],
		methods: ["GET", "POST"]
	}
});

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Security middleware
app.use(helmetConfig);
app.use(requestLogger);
app.use(generalLimiter);
app.use(sanitizeRequest);

// CORS configuration
const corsOptions = {
	origin: process.env.NODE_ENV === "production"
		? ["https://aieventmonitor.vercel.app", process.env.CLIENT_URL].filter(Boolean)
		: ["http://localhost:5173", "http://10.100.14.125:5173/", "https://aieventmonitor.vercel.app"],
	credentials: true,
	optionsSuccessStatus: 200,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
	preflightContinue: false
};
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/email-settings", emailNotificationSettingsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/video", videoRoutes);

// Global error handler (must be after all routes)
app.use(globalErrorHandler);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Socket.IO connection handling
io.on('connection', (socket) => {
	console.log('User connected:', socket.id);

	// Join room based on user role
	socket.on('join-room', (data) => {
		const { userId, role, zone } = data;
		socket.userId = userId;
		socket.role = role;
		socket.zone = zone;

		// Join appropriate rooms
		socket.join(role); // Join role-based room
		if (zone) socket.join(zone); // Join zone-based room
		if (role === 'responder') socket.join('responders');
		if (role === 'operator' || role === 'admin') socket.join('operators');

		console.log(`User ${userId} (${role}) joined rooms`);
	});

	// Handle location updates from responders
	socket.on('location-update', (data) => {
		if (socket.role === 'responder') {
			// Broadcast location to operators and other responders
			socket.to('operators').emit('responder-location-update', {
				userId: socket.userId,
				location: data.location,
				timestamp: new Date()
			});
		}
	});

	// Handle incident updates
	socket.on('incident-update', (data) => {
		// Broadcast to all connected users
		io.emit('incident-updated', data);
	});

	// Handle new incidents
	socket.on('new-incident', (data) => {
		// Broadcast to operators and responders in the zone
		io.to('operators').emit('new-incident', data);
		if (data.zone) {
			io.to(data.zone).emit('new-incident', data);
		}
	});

	// Handle responder status updates
	socket.on('status-update', (data) => {
		if (socket.role === 'responder') {
			socket.to('operators').emit('responder-status-update', {
				userId: socket.userId,
				status: data.status,
				timestamp: new Date()
			});
		}
	});

	// Handle team communication messages
	socket.on('send-message', async (data) => {
		try {
			const { content, type, priority, recipients, targetZone, specificRecipients } = data;

			// Get sender information
			const sender = await User.findById(socket.userId);
			if (!sender) {
				socket.emit('message-error', { error: 'Sender not found' });
				return;
			}

			// Create message in database
			const message = new Message({
				content,
				type: type || 'team',
				priority: priority || 'normal',
				sender: socket.userId,
				senderName: sender.name,
				senderRole: sender.role,
				recipients: recipients || 'responders',
				targetZone,
				specificRecipients,
				isEmergency: priority === 'critical'
			});

			await message.save();

			// Prepare message data for broadcasting
			const messageData = {
				id: message._id,
				content: message.content,
				type: message.type,
				priority: message.priority,
				sender: {
					id: sender._id,
					name: sender.name,
					role: sender.role
				},
				recipients: message.recipients,
				targetZone: message.targetZone,
				timestamp: message.createdAt,
				isEmergency: message.isEmergency
			};

			// Broadcast message based on recipients
			switch (recipients) {
				case 'all':
					io.emit('new-message', messageData);
					break;
				case 'responders':
					io.to('responders').emit('new-message', messageData);
					break;
				case 'operators':
					io.to('operators').emit('new-message', messageData);
					break;
				case 'admins':
					io.to('admin').emit('new-message', messageData);
					break;
				case 'zone':
					if (targetZone) {
						io.to(targetZone).emit('new-message', messageData);
					}
					break;
				case 'specific':
					// Send to specific users (implementation would need user socket mapping)
					if (specificRecipients && specificRecipients.length > 0) {
						// For now, emit to all and let clients filter
						io.emit('new-message', messageData);
					}
					break;
				default:
					io.to('responders').emit('new-message', messageData);
			}

			// Confirm message sent to sender
			socket.emit('message-sent', { messageId: message._id, timestamp: message.createdAt });

		} catch (error) {
			console.error('Error sending message:', error);
			socket.emit('message-error', { error: 'Failed to send message' });
		}
	});

	// Handle message read status
	socket.on('mark-message-read', async (data) => {
		try {
			const { messageId } = data;
			const message = await Message.findById(messageId);

			if (message) {
				await message.markAsRead(socket.userId);

				// Notify sender that message was read
				socket.to(message.sender.toString()).emit('message-read', {
					messageId,
					readBy: socket.userId,
					readAt: new Date()
				});
			}
		} catch (error) {
			console.error('Error marking message as read:', error);
		}
	});

	// Handle broadcast messages (emergency/high priority)
	socket.on('broadcast-message', async (data) => {
		try {
			// Only allow operators and admins to broadcast
			if (socket.role !== 'operator' && socket.role !== 'admin') {
				socket.emit('message-error', { error: 'Unauthorized to broadcast' });
				return;
			}

			const { content, priority, recipients } = data;

			const sender = await User.findById(socket.userId);
			if (!sender) {
				socket.emit('message-error', { error: 'Sender not found' });
				return;
			}

			const message = new Message({
				content,
				type: 'broadcast',
				priority: priority || 'high',
				sender: socket.userId,
				senderName: sender.name,
				senderRole: sender.role,
				recipients: recipients || 'all',
				isEmergency: priority === 'critical'
			});

			await message.save();

			const messageData = {
				id: message._id,
				content: message.content,
				type: message.type,
				priority: message.priority,
				sender: {
					id: sender._id,
					name: sender.name,
					role: sender.role
				},
				recipients: message.recipients,
				timestamp: message.createdAt,
				isEmergency: message.isEmergency
			};

			// Broadcast to all users
			io.emit('new-message', messageData);
			socket.emit('message-sent', { messageId: message._id, timestamp: message.createdAt });

		} catch (error) {
			console.error('Error broadcasting message:', error);
			socket.emit('message-error', { error: 'Failed to broadcast message' });
		}
	});

	socket.on('disconnect', () => {
		console.log('User disconnected:', socket.id);
	});
});

// Make io available to routes
app.set('io', io);

server.listen(PORT, async () => {
	await connectDB();
	await verifyTransporter();
	console.log("Server is running on port: ", PORT);
});
