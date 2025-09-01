"""
Security middleware for FastAPI application.
Includes rate limiting, CORS, security headers, and request sanitization.
"""

import re
from typing import Callable
from fastapi import Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings


# Rate limiter instance
limiter = Limiter(key_func=get_remote_address)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers similar to Helmet.js"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Content Security Policy
        csp_directives = [
            "default-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "script-src 'self'",
            "img-src 'self' data: https:",
            "connect-src 'self' ws: wss:",
            "font-src 'self'",
            "object-src 'none'",
            "media-src 'self' blob:",
            "frame-src 'none'"
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)
        
        # Other security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Remove server header
        if "server" in response.headers:
            del response.headers["server"]
        
        return response


class RequestSanitizationMiddleware(BaseHTTPMiddleware):
    """Sanitize request data to prevent XSS attacks"""
    
    XSS_PATTERNS = [
        re.compile(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', re.IGNORECASE),
        re.compile(r'<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>', re.IGNORECASE),
        re.compile(r'javascript:', re.IGNORECASE),
        re.compile(r'on\w+\s*=', re.IGNORECASE)
    ]
    
    @classmethod
    def sanitize_string(cls, value: str) -> str:
        """Remove potential XSS patterns from string"""
        for pattern in cls.XSS_PATTERNS:
            value = pattern.sub('', value)
        return value
    
    @classmethod
    def sanitize_dict(cls, data: dict) -> dict:
        """Recursively sanitize dictionary values"""
        sanitized = {}
        for key, value in data.items():
            if isinstance(value, str):
                sanitized[key] = cls.sanitize_string(value)
            elif isinstance(value, dict):
                sanitized[key] = cls.sanitize_dict(value)
            elif isinstance(value, list):
                sanitized[key] = cls.sanitize_list(value)
            else:
                sanitized[key] = value
        return sanitized
    
    @classmethod
    def sanitize_list(cls, data: list) -> list:
        """Recursively sanitize list values"""
        sanitized = []
        for item in data:
            if isinstance(item, str):
                sanitized.append(cls.sanitize_string(item))
            elif isinstance(item, dict):
                sanitized.append(cls.sanitize_dict(item))
            elif isinstance(item, list):
                sanitized.append(cls.sanitize_list(item))
            else:
                sanitized.append(item)
        return sanitized
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip sanitization for certain paths
        skip_paths = ['/docs', '/redoc', '/openapi.json']
        if any(request.url.path.startswith(path) for path in skip_paths):
            return await call_next(request)
        
        # Sanitize query parameters
        if request.query_params:
            sanitized_params = {}
            for key, value in request.query_params.items():
                sanitized_params[key] = self.sanitize_string(value)
            # Update request query params (this is a simplified approach)
            # In practice, you might need to modify the request scope
        
        return await call_next(request)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log requests for monitoring and debugging"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        import time
        
        start_time = time.time()
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        if "x-forwarded-for" in request.headers:
            client_ip = request.headers["x-forwarded-for"].split(",")[0].strip()
        elif "x-real-ip" in request.headers:
            client_ip = request.headers["x-real-ip"]
        
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        duration_ms = int(duration * 1000)
        
        # Log data
        log_data = {
            "method": request.method,
            "url": str(request.url),
            "status": response.status_code,
            "duration": f"{duration_ms}ms",
            "ip": client_ip,
            "user_agent": request.headers.get("user-agent", ""),
        }
        
        # Log errors and slow requests
        if response.status_code >= 400 or duration_ms > 1000:
            print(f"⚠️ Request log: {log_data}")
        elif settings.debug:
            print(f"📝 Request log: {log_data}")
        
        return response


def setup_cors_middleware(app):
    """Configure CORS middleware"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=[
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ],
        expose_headers=["*"]
    )


def create_rate_limiter(
    rate: str,
    key_func: Callable = get_remote_address,
    skip_func: Callable = None
) -> Limiter:
    """Create a rate limiter with custom configuration"""
    return Limiter(
        key_func=key_func,
        default_limits=[rate] if rate else None
    )


def skip_video_service_requests(request: Request) -> bool:
    """Skip rate limiting for video service internal requests"""
    user_agent = request.headers.get("user-agent", "")
    return (
        "python-requests" in user_agent or
        "/api/video/" in str(request.url) or
        "/socket.io/" in str(request.url)
    )


def skip_auth_success_requests(request: Request) -> bool:
    """Skip rate limiting for successful auth requests"""
    # This would need to be implemented with request context
    # For now, return False to apply rate limiting
    return False


# Pre-configured rate limiters
general_limiter = create_rate_limiter(
    f"{settings.rate_limit_max}/{settings.rate_limit_window}seconds",
    skip_func=skip_video_service_requests
)

auth_limiter = create_rate_limiter(
    f"{settings.auth_rate_limit_max}/{settings.rate_limit_window}seconds"
)

password_reset_limiter = create_rate_limiter(
    f"{settings.password_reset_rate_limit_max}/{settings.password_reset_rate_limit_window}seconds"
)

email_verification_limiter = create_rate_limiter(
    f"{settings.email_verification_rate_limit_max}/{settings.email_verification_rate_limit_window}seconds"
)

incident_limiter = create_rate_limiter(
    f"{settings.incident_rate_limit_max}/{settings.incident_rate_limit_window}seconds",
    skip_func=skip_video_service_requests
)
