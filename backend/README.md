# AI Event Monitor - FastAPI Backend 🚨

A production-ready **FastAPI** backend for real-time event monitoring and incident management, featuring AI-powered detection, Socket.IO integration, and comprehensive security.

## 🚀 Features

- **FastAPI Framework** - Modern, fast async Python web framework
- **Real-time Communication** - Socket.IO for live updates and notifications
- **AI/ML Integration** - Object detection, fire/smoke detection, pose estimation
- **JWT Authentication** - Secure token-based authentication with role-based access
- **Email Notifications** - Async email service with HTML templates
- **Rate Limiting** - Advanced rate limiting with slowapi
- **Security Middleware** - CORS, security headers, request sanitization
- **MongoDB Integration** - Async Motor driver with optimized queries
- **Incident Management** - Complete CRUD operations for incidents and zones
- **User Management** - Role-based user system with location tracking
- **Dashboard Analytics** - Real-time statistics and monitoring data
- **Docker Support** - Full containerization with docker-compose

## 🛠 Tech Stack

### Backend Core
- **FastAPI** - Modern Python web framework
- **Python 3.11** - Latest Python with async support
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation and serialization
- **python-socketio** - Socket.IO server implementation

### Authentication & Security
- **python-jose** - JWT token handling
- **passlib** - Password hashing with bcrypt
- **slowapi** - Rate limiting middleware
- **python-multipart** - File upload support

### AI/ML Stack
- **PyTorch** - Deep learning framework
- **TensorFlow** - ML framework
- **Ultralytics (YOLOv8)** - Object detection
- **MediaPipe** - Pose estimation and analysis
- **OpenCV** - Computer vision processing
- **librosa** - Audio analysis

### Communication
- **aiosmtplib** - Async email sending
- **Jinja2** - Email template rendering

### Development & Deployment
- **Docker** - Containerization
- **MongoDB** - Document database
- **Redis** - Caching and session storage
- **pytest** - Testing framework

## 📁 Project Structure

```
app/
├── auth/                 # Authentication module
│   ├── models.py        # Pydantic models
│   ├── routes.py        # Auth endpoints
│   └── service.py       # Auth business logic
├── users/               # User management
├── monitoring/          # Incident and zone management
├── ml/                  # AI/ML inference
├── realtime/            # Socket.IO server
├── middleware/          # Security middleware
├── utils/               # Utilities (email, etc.)
├── db/                  # Database connection
├── scripts/             # Data seeding and testing
├── config.py            # Configuration management
├── deps.py              # Dependency injection
├── main.py              # FastAPI application
└── routers.py           # Route configuration
```

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Configure your `.env` file with:
- MongoDB connection string
- JWT secret key
- SMTP email credentials
- Client URL for CORS

### 2. Using Docker (Recommended)

```bash
# Start all services
make docker-up

# View logs
make docker-logs

# Stop services
make docker-down
```

### 3. Local Development

```bash
# Install dependencies
make install

# Seed database with sample data
make seed-data

# Run development server
make dev

# Test email functionality
make test-email
```

### 4. Available Services

- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/docs
- **MongoDB**: localhost:27017
- **Mongo Express**: http://localhost:8081 (admin/admin123)
- **Redis**: localhost:6379

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### User Management
- `GET /api/users` - List users
- `GET /api/users/{user_id}` - Get user details
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Soft delete user
- `GET /api/users/responders/locations` - Get responder locations
- `PUT /api/users/{user_id}/location` - Update user location

### Monitoring
- `GET /api/monitoring/incidents` - List incidents
- `POST /api/monitoring/incidents` - Create incident
- `PUT /api/monitoring/incidents/{id}` - Update incident
- `GET /api/monitoring/zones` - List zones
- `POST /api/monitoring/zones` - Create zone
- `GET /api/monitoring/dashboard/stats` - Dashboard statistics

### AI/ML Inference
- `POST /api/ml/detect/objects` - Object detection
- `POST /api/ml/detect/fire-smoke` - Fire/smoke detection
- `POST /api/ml/analyze/pose` - Pose estimation
- `POST /api/ml/analyze/crowd` - Crowd analysis
- `GET /api/ml/models/status` - Model status

## 🔧 Development Commands

```bash
# Development server with auto-reload
make dev

# Run tests
make test

# Format code
make format

# Lint code
make lint

# Security check
make security

# Clean cache files
make clean

# Database backup
make backup

# Seed sample data
make seed-data
```

## 🐳 Docker Commands

```bash
# Build image
make docker-build

# Start containers
make docker-up

# Stop containers
make docker-down

# View logs
make docker-logs
```

## 🔒 Security Features

- **JWT Authentication** with secure cookie handling
- **Rate Limiting** on all endpoints
- **CORS Protection** with configurable origins
- **Security Headers** (CSP, HSTS, X-Frame-Options)
- **Request Sanitization** to prevent XSS
- **Password Hashing** with bcrypt
- **Input Validation** with Pydantic models
- **Role-based Access Control**

## 📧 Email Templates

The system includes HTML email templates for:
- Email verification
- Welcome messages
- Password reset
- Incident notifications

## 🚨 Real-time Features

Socket.IO events supported:
- `join-room` - Join user to appropriate rooms
- `location-update` - Real-time location updates
- `incident-update` - Live incident status changes
- `new-incident` - New incident notifications
- `send-message` - Team communication
- `broadcast-message` - System-wide announcements

## 📈 Monitoring & Analytics

Dashboard provides:
- Total and active incidents
- Response time analytics
- Zone occupancy rates
- Incident distribution by type/severity
- Real-time statistics

## 🔄 Migration from Node.js

This FastAPI backend provides complete feature parity with the original Node.js backend, including:
- All HTTP routes and Socket.IO events
- MongoDB schemas and indexes
- Authentication and security features
- Email functionality and templates
- Rate limiting and middleware

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
