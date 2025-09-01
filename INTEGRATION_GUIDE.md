# Frontend-Backend Integration Guide

## Overview
This guide explains how the React frontend and FastAPI backend are integrated in the AI Event Monitor system.

## Architecture
- **Frontend**: React 19 + Vite (Port 5173)
- **Backend**: FastAPI + Python (Port 8000)
- **Database**: MongoDB
- **Real-time**: Socket.IO

## Quick Start

### 1. Start the Complete System
```bash
python start_system.py
```

### 2. Start Backend Only
```bash
python start_system.py --backend-only
```

### 3. Manual Setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Integration Points

### 1. API Communication
- **Base URL**: `http://localhost:8000/api`
- **Environment**: Configured in `frontend/.env`
- **Proxy**: Vite proxy configured for `/api` and `/socket.io` routes

### 2. Authentication
- **JWT Tokens**: Stored in HTTP-only cookies
- **CORS**: Configured for `localhost:5173` origin
- **Credentials**: Included in all API requests

### 3. Real-time Communication
- **Socket.IO**: WebSocket connection on port 8000
- **Events**: Incident updates, alerts, location tracking
- **Rooms**: Role-based and zone-based rooms

### 4. CORS Configuration
```python
allow_origins=["http://localhost:5173", "http://10.100.14.125:5173"]
allow_credentials=True
allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
```

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```env
APP_PORT=8000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/auth_tutorial
JWT_SECRET=your_secret_key_here
```

## Testing Integration

### Run Integration Tests
```bash
python test_integration.py
```

### Manual Testing
1. Start backend: `python start_system.py --backend-only`
2. Check health: `http://localhost:8000/health/live`
3. Check API docs: `http://localhost:8000/docs`
4. Start frontend: `cd frontend && npm run dev`
5. Test login/signup functionality

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/check-auth` - Verify authentication
- `POST /api/auth/logout` - User logout

### Health Checks
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/operator` - Operator dashboard data
- `GET /api/dashboard/responder` - Responder dashboard data

## Socket.IO Events

### Client → Server
- `join-room` - Join role/zone-based rooms
- `location-update` - Update user location
- `status-update` - Update user status
- `new-incident` - Report new incident

### Server → Client
- `new-incident` - New incident detected
- `incident-updated` - Incident status changed
- `system-alert` - System-wide alerts
- `responder-location-update` - Responder location updates

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS includes frontend URL
   - Check that credentials are enabled

2. **API Connection Failed**
   - Verify backend is running on port 8000
   - Check frontend environment variables
   - Ensure proxy configuration is correct

3. **Socket.IO Connection Failed**
   - Verify Socket.IO endpoint is accessible
   - Check WebSocket proxy configuration
   - Ensure both HTTP and WS protocols are allowed

4. **Authentication Issues**
   - Check JWT secret configuration
   - Verify cookie settings
   - Ensure CORS credentials are enabled

### Debug Mode
Set environment variables for detailed logging:
```env
NODE_ENV=development
DEBUG=true
```

## Development Workflow

1. **Start Development Environment**
   ```bash
   python start_system.py
   ```

2. **Make Changes**
   - Backend changes trigger auto-reload (uvicorn --reload)
   - Frontend changes trigger hot reload (Vite HMR)

3. **Test Integration**
   ```bash
   python test_integration.py
   ```

4. **Check Logs**
   - Backend: Console output from uvicorn
   - Frontend: Browser console and network tab

## Production Deployment

### Backend
- Set `NODE_ENV=production`
- Use secure JWT secret
- Configure production MongoDB URI
- Enable HTTPS
- Set up process manager (PM2/systemd)

### Frontend
- Build: `npm run build`
- Serve static files from backend or CDN
- Update API URLs for production
- Configure environment variables

## Security Considerations

1. **CORS**: Restrict origins in production
2. **JWT**: Use strong secrets and appropriate expiration
3. **HTTPS**: Enable in production
4. **Rate Limiting**: Configured for API protection
5. **Input Validation**: Sanitization middleware enabled
