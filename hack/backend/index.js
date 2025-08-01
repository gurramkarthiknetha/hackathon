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

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.NODE_ENV === "production"
			? process.env.CLIENT_URL
			: ["http://localhost:5173", "http://10.100.14.125:5173/","https://aieventmonitor.vercel.app/"],
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
		? process.env.CLIENT_URL
		: ["http://localhost:5173", "http://10.100.14.125:5173/"],
	credentials: true,
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/maps", mapsRoutes);

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
