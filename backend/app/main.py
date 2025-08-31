"""
FastAPI main application with Socket.IO integration.
Replaces the Node.js Express server with full feature parity.
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import socketio
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.db.mongo import connect_to_mongo, close_mongo_connection, check_connection
from app.middleware.security import (
    setup_cors_middleware,
    SecurityHeadersMiddleware,
    RequestSanitizationMiddleware,
    RequestLoggingMiddleware,
    limiter
)
from app.auth.routes import router as auth_router
from app.realtime.socket import sio, create_socket_app


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print(f"🚀 Starting {settings.app_name}")
    print(f"🌍 Environment: {settings.environment}")
    
    # Connect to database
    await connect_to_mongo()
    
    # Initialize Socket.IO server
    print("🔌 Socket.IO server initialized")
    
    print(f"✅ Server ready on {settings.app_host}:{settings.app_port}")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down server...")
    await close_mongo_connection()
    print("✅ Server shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="AI-powered event monitoring platform with real-time incident detection and emergency response",
    version="2.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add rate limiter state
app.state.limiter = limiter

# Setup middleware (order matters!)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestSanitizationMiddleware)
setup_cors_middleware(app)

# Mount Socket.IO app
socket_app = create_socket_app(app)
app.mount("/socket.io", socket_app)

# Include routers
from app.routers import api_router
app.include_router(api_router)

# Health check endpoints
@app.get("/health/live")
async def health_live():
    """Liveness probe - returns 200 if server is running"""
    return {"status": "ok", "timestamp": "2025-08-31T19:32:17+05:30"}


@app.get("/health/ready")
async def health_ready():
    """Readiness probe - returns 200 if server is ready to accept requests"""
    db_healthy = await check_connection()
    
    if not db_healthy:
        raise HTTPException(status_code=503, detail="Database connection unhealthy")
    
    return {
        "status": "ready",
        "database": "connected",
        "timestamp": "2025-08-31T19:32:17+05:30"
    }


# Detection alert endpoint for AI model integration (compatibility with existing ML services)
@app.post("/api/detection-alert")
async def detection_alert(request: Request):
    """Process detection alerts from AI models"""
    try:
        alert_data = await request.json()
        print(f"📡 Received detection alert: {alert_data}")
        
        # Process alert through Socket.IO (will be implemented in realtime module)
        await sio.emit('new-incident', alert_data)
        
        return {"success": True, "message": "Alert processed successfully"}
    except Exception as e:
        print(f"❌ Error processing detection alert: {e}")
        raise HTTPException(status_code=500, detail="Failed to process alert")


# Rate limit error handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    response = JSONResponse(
        status_code=429,
        content={"success": False, "message": f"Rate limit exceeded: {exc.detail}"}
    )
    response = request.app.state.limiter._inject_headers(
        response, request.state.view_rate_limit
    )
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if settings.debug:
        import traceback
        print(f"❌ Unhandled exception: {exc}")
        print(traceback.format_exc())
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error" if not settings.debug else str(exc)
        }
    )


# Serve static files in production (optional)
if settings.environment == "production":
    try:
        app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
    except RuntimeError:
        # Frontend dist directory doesn't exist
        pass


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.debug,
        log_level="info" if settings.debug else "warning"
    )
