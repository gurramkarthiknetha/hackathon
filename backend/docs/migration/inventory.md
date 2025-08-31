# Node.js to FastAPI Migration Inventory

## Repository Overview

This document provides a comprehensive inventory of the existing Node.js backend system to guide the migration to FastAPI.

### Current Architecture Summary

The existing system is an **AI-powered event monitoring platform** with real-time incident detection, team communication, and emergency response capabilities. It serves a React frontend and integrates with ML models for video analysis.

**Core Components:**
- Express.js REST API with Socket.IO for real-time communication
- MongoDB with Mongoose ODM
- JWT-based authentication with role-based access control
- Email notifications via Nodemailer
- Rate limiting and security middleware
- ML integration endpoints for video detection

## Backend File Structure

```
backend/
├── controllers/          # Business logic handlers
│   ├── auth.controller.js
│   ├── dashboard.controller.js
│   ├── monitoring.controller.js
│   ├── notification.controller.js
│   ├── message.controller.js
│   ├── video.controller.js
│   ├── videoDetection.controller.js
│   ├── ai.controller.js
│   └── zones.controller.js
├── models/              # Mongoose schemas
│   ├── user.model.js
│   ├── incident.model.js
│   ├── zone.model.js
│   ├── message.model.js
│   ├── notification.model.js
│   ├── emailNotificationSettings.model.js
│   ├── aimodel.model.js
│   └── videoDetection.model.js
├── routes/              # Express route definitions
│   ├── auth.route.js
│   ├── dashboard.route.js
│   ├── monitoring.route.js
│   ├── notification.route.js
│   ├── message.route.js
│   ├── video.route.js
│   ├── videoDetection.route.js
│   ├── maps.route.js
│   └── emailNotificationSettings.route.js
├── middleware/          # Custom middleware
│   ├── security.js      # Rate limiting, helmet, sanitization
│   └── verifyToken.js   # JWT authentication
├── services/            # Business services
│   └── alertService.js  # Alert processing
├── utils/               # Utility functions
│   ├── validation.js
│   ├── errorHandler.js
│   └── generateTokenAndSetCookie.js
├── scripts/             # Utility scripts
│   ├── seedMonitoringData.js
│   └── testEmailNotifications.js
├── nodemailer/          # Email configuration
└── db/                  # Database connection
```

## HTTP Routes Inventory

### Authentication Routes (`/api/auth`)
- `GET /check-auth` - Verify JWT token and return user info
- `POST /signup` - User registration with email verification
- `POST /login` - User authentication
- `POST /logout` - Clear authentication cookie
- `POST /verify-email` - Email verification with code
- `POST /resend-verification` - Resend verification email
- `POST /forgot-password` - Password reset request
- `POST /reset-password/:token` - Password reset with token

### Dashboard Routes (`/api/dashboard`)
- `GET /admin` - Admin dashboard data
- `GET /operator` - Operator dashboard data
- `GET /responder` - Responder dashboard data
- `GET /profile` - User profile information
- `GET /responders` - List of responders for team communication

### Monitoring Routes (`/api/monitoring`)
- `GET /incidents/active` - Get active incidents
- `GET /incidents/zone/:zone` - Get incidents by zone
- `GET /incidents/timeline` - Get incident timeline
- `POST /incidents` - Create new incident
- `PATCH /incidents/:id/status` - Update incident status
- `PATCH /incidents/:id/assign` - Assign incident to responder
- `PATCH /incidents/:id/approve` - Approve incident
- `GET /zones` - Get all zones
- `GET /zones/:id` - Get zone by ID
- `POST /zones` - Create new zone
- `PATCH /zones/:id/occupancy` - Update zone occupancy
- `POST /zones/assign-responder` - Assign responder to zone
- `GET /responders/locations` - Get responder locations
- `PATCH /responders/location` - Update responder location
- `POST /ai/query` - Process AI query
- `GET /ai/history` - Get query history

### Video Detection Routes (`/api/video-detection`)
- `POST /store` - Store detection results from video service
- `GET /results/:videoId` - Get detection results
- `GET /stats/:videoId` - Get detection statistics
- `DELETE /cleanup` - Cleanup old detection records

### Video Routes (`/api/video`)
- `GET /cameras` - Get camera list
- `GET /cameras/:cameraId/status` - Get camera status
- `POST /cameras/:cameraId/start` - Start camera
- `POST /cameras/:cameraId/stop` - Stop camera
- `GET /cameras/:cameraId/detections` - Get camera detections
- `GET /cameras/:cameraId/history` - Get detection history
- `POST /cameras/droidcam/configure` - Configure DroidCam
- `POST /cameras/ipwebcam/configure` - Configure IP Webcam
- `POST /cameras/camo-studio/configure` - Configure Camo Studio
- `POST /cameras/detect-devices` - Detect camera devices

### Notification Routes (`/api/notifications`)
- `POST /send` - Send notification (admin only)
- `POST /emergency` - Send emergency alert
- `POST /test` - Test notification
- `GET /history` - Get notification history
- `GET /stats` - Get notification statistics
- `GET /unread` - Get unread notifications
- `PUT /:notificationId/read` - Mark notification as read
- `POST /bulk` - Bulk operations
- `POST /schedule` - Schedule notification
- `GET /scheduled` - Get scheduled notifications
- `DELETE /scheduled/:notificationId` - Cancel scheduled notification
- `GET /:notificationId/delivery-status` - Get delivery status

### Message Routes (`/api/messages`)
- `GET /` - Get messages for current user
- Additional message endpoints (implementation varies)

### Maps Routes (`/api/maps`)
- `GET /api-key` - Get Google Maps API key
- `POST /static-map` - Generate static map URL
- `POST /embed-map` - Generate embed map URL
- `POST /geocode` - Geocode address
- `POST /reverse-geocode` - Reverse geocode coordinates
- `POST /distance` - Calculate distance between points
- `GET /incidents` - Get incident locations with map data

### Email Settings Routes (`/api/email-settings`)
- Email notification configuration endpoints

### Special Endpoints
- `POST /api/detection-alert` - AI model integration endpoint

## Socket.IO Events

### Client to Server Events
- `join-room` - Join role/zone-based rooms
- `location-update` - Responder location updates
- `incident-update` - Incident status updates
- `new-incident` - New incident creation
- `status-update` - Responder status updates
- `send-message` - Team communication messages
- `mark-message-read` - Mark message as read
- `broadcast-message` - Emergency broadcast messages

### Server to Client Events
- `responder-location-update` - Location updates to operators
- `incident-updated` - Incident status changes
- `new-incident` - New incident notifications
- `responder-status-update` - Status updates to operators
- `new-message` - New team messages
- `message-sent` - Message delivery confirmation
- `message-error` - Message sending errors
- `message-read` - Message read notifications

## MongoDB Collections & Schemas

### Users Collection
```javascript
{
  email: String (unique, required),
  password: String (required, hashed),
  name: String (required),
  role: String (enum: ["admin", "operator", "responder"]),
  lastLogin: Date,
  isVerified: Boolean,
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  assignedZone: String,
  currentLocation: { latitude: Number, longitude: Number, lastUpdated: Date },
  isActive: Boolean,
  phoneNumber: String,
  timestamps: true
}
```

### Incidents Collection
```javascript
{
  type: String (enum: ["fire", "crowd_surge", "unconscious_person", "medical_emergency", "security_threat", "equipment_failure", "other"]),
  zone: String (required),
  location: { latitude: Number, longitude: Number, description: String },
  severity: String (enum: ["low", "medium", "high", "critical"]),
  confidence: Number (0-100),
  status: String (enum: ["active", "assigned", "in_progress", "resolved", "dismissed"]),
  description: String,
  aiGenerated: Boolean,
  humanApprovalRequired: Boolean,
  humanApproved: Boolean,
  approvedBy: ObjectId (ref: User),
  assignedTo: ObjectId (ref: User),
  assignedAt: Date,
  resolvedAt: Date,
  resolvedBy: ObjectId (ref: User),
  videoSnapshot: String,
  boundingBoxes: [{ x: Number, y: Number, width: Number, height: Number, label: String, confidence: Number }],
  responseTime: Number,
  notes: [{ text: String, addedBy: ObjectId, addedAt: Date }],
  priority: Number (1-5),
  timestamps: true,
  indexes: [{ zone: 1, status: 1 }, { createdAt: -1 }, { assignedTo: 1, status: 1 }]
}
```

### Zones Collection
```javascript
{
  name: String (unique, required),
  displayName: String (required),
  description: String,
  coordinates: [[Number]], // Array of [longitude, latitude] pairs
  center: { latitude: Number, longitude: Number },
  capacity: Number,
  currentOccupancy: Number,
  riskLevel: String (enum: ["low", "medium", "high"]),
  isActive: Boolean,
  cameras: [{ id: String, name: String, location: {lat, lng}, isActive: Boolean, streamUrl: String }],
  emergencyExits: [{ name: String, location: {lat, lng}, isBlocked: Boolean }],
  assignedResponders: [ObjectId] (ref: User),
  eventType: String (enum: ["concert", "rally", "festival", "sports", "conference", "other"]),
  timestamps: true,
  indexes: [{ name: 1 }]
}
```

### Messages Collection
```javascript
{
  content: String (required, maxlength: 1000),
  type: String (enum: ['direct', 'team', 'broadcast', 'emergency']),
  priority: String (enum: ['low', 'normal', 'high', 'critical']),
  sender: ObjectId (ref: User),
  senderName: String,
  senderRole: String,
  recipients: String (enum: ['all', 'responders', 'operators', 'admins', 'zone', 'specific']),
  specificRecipients: [ObjectId] (ref: User),
  targetZone: String,
  isEmergency: Boolean,
  readBy: [{ user: ObjectId, readAt: Date }],
  deliveredTo: [{ user: ObjectId, deliveredAt: Date }],
  status: String (enum: ['pending', 'delivered', 'failed']),
  replyTo: ObjectId (ref: Message),
  attachments: [{ type: String, url: String, filename: String, size: Number }],
  location: { latitude: Number, longitude: Number, description: String },
  timestamps: true,
  indexes: [{ sender: 1, createdAt: -1 }, { recipients: 1, targetZone: 1, createdAt: -1 }]
}
```

### Notifications Collection
```javascript
{
  type: String (enum: ['general', 'emergency', 'system', 'announcement', 'maintenance', 'test']),
  title: String (required, maxlength: 200),
  message: String (required, maxlength: 1000),
  severity: String (enum: ['low', 'medium', 'high', 'critical']),
  sentBy: ObjectId (ref: User),
  sentByRole: String,
  recipients: String (enum: ['all', 'admins', 'operators', 'responders', 'specific']),
  specificRecipients: [ObjectId] (ref: User),
  sendInApp: Boolean,
  sendEmail: Boolean,
  sendSMS: Boolean,
  status: String (enum: ['pending', 'sending', 'completed', 'failed', 'cancelled']),
  deliveryStats: { total: Number, delivered: Number, failed: Number, pending: Number },
  scheduledFor: Date,
  isScheduled: Boolean,
  metadata: Mixed,
  readBy: [{ user: ObjectId, readAt: Date }],
  sentAt: Date,
  completedAt: Date,
  timestamps: true
}
```

## Environment Variables

```bash
# Server Configuration
NODE_ENV=development|production
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/auth_tutorial

# JWT Configuration
JWT_SECRET=secret_key

# Client URL
CLIENT_URL=http://localhost:5173

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=email@domain.com
EMAIL_PASS=app_password
EMAIL_FROM=email@domain.com
EMAIL_FROM_NAME=App Name

# Google Maps
GOOGLE_MAPS_API_KEY=api_key
```

## Security & Middleware

### Rate Limiting
- General: 1000 requests/15min
- Auth: 5 requests/15min
- Password reset: 3 requests/hour
- Email verification: 15 requests/5min
- Incident creation: 100 requests/min

### Security Headers (Helmet)
- Content Security Policy
- Cross-Origin Embedder Policy disabled for development
- Standard security headers

### Request Sanitization
- XSS prevention for request body and query parameters
- Script tag removal
- JavaScript protocol blocking

## Dependencies

### Production Dependencies
```json
{
  "axios": "^1.11.0",
  "bcryptjs": "^2.4.3",
  "cookie-parser": "^1.4.6",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.19.2",
  "express-rate-limit": "^8.0.1",
  "express-validator": "^7.2.1",
  "helmet": "^8.1.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.5.2",
  "nodemailer": "^7.0.5",
  "socket.io": "^4.8.1",
  "validator": "^13.15.15"
}
```

## Scripts

### NPM Scripts
- `dev`: Development server with nodemon
- `start`: Production server
- `build`: Frontend build process
- `seed-monitoring`: Seed monitoring data
- `test:notifications`: Test email notifications

### Utility Scripts
- `seedMonitoringData.js`: Creates sample incidents and zones
- `testEmailNotifications.js`: Tests email notification system

## Node.js → FastAPI Mapping

| Node.js Component | FastAPI Equivalent |
|-------------------|-------------------|
| Express Router | FastAPI APIRouter |
| Mongoose Models | Pydantic Models + Motor |
| JWT + bcryptjs | python-jose + passlib |
| express-rate-limit | slowapi |
| helmet | Custom security middleware |
| express-validator | Pydantic validation |
| Socket.IO | python-socketio |
| nodemailer | aiosmtplib |
| cookie-parser | FastAPI cookies (native) |
| CORS | FastAPI CORSMiddleware |
| express.json() | FastAPI (native) |

## Critical Migration Considerations

1. **Socket.IO Protocol Compatibility**: Must maintain exact event names and payloads
2. **JWT Cookie Behavior**: Preserve HttpOnly, SameSite, Secure settings
3. **Rate Limiting Windows**: Match existing limits exactly
4. **MongoDB Indexes**: Create all existing indexes in Motor
5. **Email Templates**: Port all email templates and sending logic
6. **Role-based Access**: Maintain exact permission structure
7. **Frontend API Contract**: Keep all existing endpoints and response formats
8. **Real-time Room Management**: Preserve Socket.IO room logic for zones/roles
