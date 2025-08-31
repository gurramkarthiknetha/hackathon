# AI Event Monitor System

A comprehensive real-time monitoring and incident management system powered by AI for event security and crowd management. The system provides live video analysis, automated threat detection, and role-based incident response coordination.

## 🚀 Features

### Core Functionality
- **Real-time Video Monitoring** - Live video feed analysis with AI-powered detection
- **Automated Incident Detection** - AI identifies fires, crowd surges, medical emergencies, and security threats
- **Role-based Access Control** - Admin, Operator, and Responder roles with specific permissions
- **Interactive Zone Mapping** - Geographic incident visualization with Leaflet maps
- **Real-time Notifications** - WebSocket-powered instant alerts and updates
- **Incident Management** - Complete lifecycle tracking from detection to resolution

### AI Capabilities
- **Computer Vision** - Object detection and scene analysis
- **Threat Classification** - Automatic severity assessment and confidence scoring
- **Bounding Box Detection** - Visual highlighting of detected objects/incidents
- **Smart Alerts** - Context-aware notification system

### User Roles
- **Admin** - System configuration, user management, full access
- **Operator** - Monitor feeds, manage incidents, coordinate responses
- **Responder** - Receive assignments, update incident status, field operations

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** for data persistence
- **Socket.IO** for real-time communication
- **JWT** authentication with role-based authorization
- **Nodemailer** for email notifications
- **Helmet** for security headers
- **Rate limiting** for API protection

### Frontend
- **React 19** with modern hooks
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Zustand** for state management
- **React Router** for navigation
- **Leaflet** for interactive maps
- **Recharts** for data visualization
- **Framer Motion** for animations

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hackathon/hack
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/auth_tutorial

# JWT Secret (generate a strong secret)
JWT_SECRET=your_super_secret_jwt_key_here

# Client URL
CLIENT_URL=http://localhost:5173

# Email Configuration (optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# Google Maps API (for enhanced mapping features)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Database Setup
```bash
# Start MongoDB service
# On macOS with Homebrew:
brew services start mongodb/brew/mongodb-community

# On Ubuntu:
sudo systemctl start mongod

# Seed sample data (optional)
npm run seed-monitoring
```

### 5. Start Backend Server
```bash
npm run dev
```
The backend will start on `http://localhost:3000`

### 6. Frontend Setup
```bash
# In a new terminal
cd ../frontend
npm install
```

### 7. Start Frontend Development Server
```bash
npm run dev
```
The frontend will start on `http://localhost:5173`

## 📁 Project Structure

```
hack/
├── backend/                    # Node.js/Express backend
│   ├── controllers/           # Request handlers
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── middleware/           # Authentication & security
│   ├── services/             # Business logic
│   ├── utils/                # Helper functions
│   ├── nodemailer/           # Email services
│   ├── scripts/              # Database seeding
│   └── index.js              # Server entry point
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── admin/        # Admin-specific components
│   │   │   ├── auth/         # Authentication forms
│   │   │   ├── layout/       # Layout components
│   │   │   ├── maps/         # Map components
│   │   │   ├── monitoring/   # Monitoring dashboards
│   │   │   └── ui/           # Base UI components
│   │   ├── pages/            # Route components
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── auth/         # Auth pages
│   │   │   ├── dashboard/    # Dashboard pages
│   │   │   ├── operator/     # Operator pages
│   │   │   └── responder/    # Responder pages
│   │   ├── services/         # API services
│   │   ├── store/            # State management
│   │   ├── utils/            # Helper functions
│   │   └── App.jsx           # Main app component
│   └── package.json
│
└── README.md                 # This file
```

## 🔐 Authentication & Authorization

### User Registration
1. Navigate to `/signup`
2. Choose role: Admin, Operator, or Responder
3. Complete email verification
4. Access role-specific dashboard

### Role Permissions
- **Admin**: Full system access, user management, system configuration
- **Operator**: Monitor incidents, manage responses, coordinate teams
- **Responder**: Receive assignments, update status, field operations

## 🎯 Key Features Walkthrough

### 1. Live Video Monitoring
- Access real-time video feeds from multiple zones
- AI-powered object detection and threat identification
- Visual bounding boxes around detected objects
- Confidence scoring for AI predictions

### 2. Incident Management
- Automatic incident creation from AI detections
- Manual incident reporting
- Status tracking: Active → Assigned → In Progress → Resolved
- Priority levels and severity classification
- Response time tracking

### 3. Zone-based Mapping
- Interactive map with incident markers
- Zone-specific filtering and monitoring
- Geographic clustering of incidents
- Real-time location updates

### 4. Real-time Notifications
- WebSocket-powered instant alerts
- Role-based notification filtering
- Email notifications for critical incidents
- Sound alerts for urgent situations

### 5. Analytics Dashboard
- Incident statistics and trends
- Response time analytics
- Zone-wise incident distribution
- Performance metrics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/check-auth` - Verify authentication
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password/:token` - Reset password

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/operator` - Operator dashboard data
- `GET /api/dashboard/responder` - Responder dashboard data

### Monitoring
- `GET /api/monitoring/incidents` - Get incidents
- `POST /api/monitoring/incidents` - Create incident
- `PUT /api/monitoring/incidents/:id` - Update incident
- `DELETE /api/monitoring/incidents/:id` - Delete incident

### Real-time Events
- `incident:created` - New incident detected
- `incident:updated` - Incident status changed
- `incident:assigned` - Incident assigned to responder
- `alert:critical` - Critical alert notification

## 🧪 Development Scripts

### Backend
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run seed-monitoring  # Seed sample data
npm run test:notifications  # Test email system
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

**1. Backend won't start - JWT_SECRET missing**
```bash
# Ensure .env file exists and contains JWT_SECRET
cp .env.example .env
# Edit .env and add a strong JWT_SECRET
```

**2. MongoDB connection failed**
```bash
# Start MongoDB service
brew services start mongodb/brew/mongodb-community  # macOS
sudo systemctl start mongod                         # Linux
```

**3. Frontend API calls failing**
- Verify backend is running on port 3000
- Check CORS configuration in backend
- Ensure cookies are enabled in browser

**4. Email notifications not working**
- Configure EMAIL_* variables in .env
- Use app-specific passwords for Gmail
- Check email provider SMTP settings

**5. WebSocket connection issues**
- Verify Socket.IO configuration
- Check firewall settings
- Ensure both frontend and backend are running

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT_SECRET
4. Configure email service
5. Enable HTTPS
6. Set up process manager (PM2)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting (Vercel, Netlify)
3. Configure environment variables
4. Update API URLs for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for enhanced event security and monitoring**
