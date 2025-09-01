"""
Authentication routes for FastAPI application.
Provides JWT-based authentication with email verification and password reset.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.deps import get_db
from app.auth.models import (
    UserCreate, UserLogin, UserResponse, AuthResponse,
    EmailVerification, ResendVerification, ForgotPassword, ResetPassword
)
from app.auth.service import AuthService
from app.utils.email import EmailService

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/signup", response_model=AuthResponse)
async def signup(
    request: Request,
    user_data: UserCreate,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Register a new user with email verification."""
    
    try:
        # Log the incoming request data for debugging
        print(f"🔍 Signup request data: {user_data.dict()}")
        
        # Check if user already exists
        existing_user = await AuthService.get_user_by_email(db, user_data.email)
        
        if existing_user:
            if existing_user.get("isVerified"):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User already exists and is verified. Please try logging in instead."
                )
            else:
                # User exists but not verified - allow re-registration
                user_dict = user_data.dict()
                user_dict["_id"] = existing_user["_id"]
                await AuthService.update_user(db, existing_user["_id"], user_dict)
                user = await AuthService.get_user_by_id(db, existing_user["_id"])
                is_reregistration = True
        else:
            # Create new user
            user_dict = user_data.dict()
            user = await AuthService.create_user(db, user_dict)
            is_reregistration = False
        
        # Generate JWT token
        access_token = AuthService.create_access_token(
            data={"sub": user["_id"], "role": user["role"]}
        )
        
        # Set HTTP-only cookie
        response.set_cookie(
            key="token",
            value=access_token,
            httponly=settings.cookie_httponly,
            secure=settings.cookie_secure,
            samesite=settings.cookie_samesite,
            max_age=settings.jwt_expires_in
        )
        
        # Send verification email
        try:
            await EmailService.send_verification_email(
                user["email"], 
                user["verificationToken"]
            )
        except Exception as e:
            print(f"Failed to send verification email: {e}")
        
        message = (
            "Account updated successfully. A new verification code has been sent to your email."
            if is_reregistration
            else "User created successfully. Please check your email for verification code."
        )
        
        return AuthResponse(
            message=message,
            user=UserResponse(**user)
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions (like user already exists)
        raise
    except Exception as e:
        print(f"❌ Signup error: {e}")
        
        # Provide more specific error messages based on the exception type
        error_message = "Failed to create user account"
        
        if "duplicate key error" in str(e).lower() or "11000" in str(e):
            error_message = "An account with this email already exists"
        elif "connection" in str(e).lower() or "timeout" in str(e).lower():
            error_message = "Database connection error. Please try again later"
        elif "validation" in str(e).lower():
            error_message = "Invalid user data provided"
        elif "network" in str(e).lower():
            error_message = "Network error. Please check your connection"
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_message
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: Request,
    credentials: UserLogin,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Authenticate user and return JWT token."""
    
    # Get user by email
    user = await AuthService.get_user_by_email(db, credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not AuthService.verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate JWT token
    access_token = AuthService.create_access_token(
        data={"sub": user["_id"], "role": user["role"]}
    )
    
    # Set HTTP-only cookie
    response.set_cookie(
        key="token",
        value=access_token,
        httponly=settings.cookie_httponly,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.jwt_expires_in
    )
    
    # Update last login
    await AuthService.update_last_login(db, user["_id"])
    user["lastLogin"] = user.get("lastLogin")
    
    return AuthResponse(
        message="Logged in successfully",
        user=UserResponse(**user)
    )


@router.post("/logout", response_model=AuthResponse)
async def logout(response: Response):
    """Clear authentication cookie."""
    response.delete_cookie(
        key="token",
        httponly=settings.cookie_httponly,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite
    )
    
    return AuthResponse(message="Logged out successfully")


@router.post("/verify-email", response_model=AuthResponse)
async def verify_email(
    request: Request,
    verification: EmailVerification,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Verify user email with verification code."""
    
    user = await AuthService.verify_user_email(db, verification.code)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    # Send welcome email
    try:
        await EmailService.send_welcome_email(user["email"], user["name"])
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
    
    return AuthResponse(
        message="Email verified successfully",
        user=UserResponse(**user)
    )


@router.post("/resend-verification", response_model=AuthResponse)
async def resend_verification(
    request: Request,
    data: ResendVerification,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Resend email verification code."""
    
    user = await AuthService.get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.get("isVerified"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already verified"
        )
    
    # Generate new verification code
    verification_code = AuthService.generate_verification_code()
    await AuthService.update_user(db, user["_id"], {
        "verificationToken": verification_code,
        "verificationTokenExpiresAt": user["verificationTokenExpiresAt"]
    })
    
    # Send verification email
    try:
        await EmailService.send_verification_email(user["email"], verification_code)
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please try again."
        )
    
    return AuthResponse(message="Verification email sent successfully")


@router.post("/forgot-password", response_model=AuthResponse)
async def forgot_password(
    request: Request,
    data: ForgotPassword,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Send password reset email."""
    
    reset_token = await AuthService.create_password_reset_token(db, data.email)
    
    # Always return success for security (don't reveal if email exists)
    if reset_token:
        try:
            reset_url = f"{settings.client_url}/reset-password/{reset_token}"
            await EmailService.send_password_reset_email(data.email, reset_url)
        except Exception as e:
            print(f"Failed to send password reset email: {e}")
    
    return AuthResponse(
        message="If an account with that email exists, we've sent a password reset link"
    )


@router.post("/reset-password/{token}", response_model=AuthResponse)
async def reset_password(
    request: Request,
    token: str,
    data: ResetPassword,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Reset password with reset token."""
    
    success = await AuthService.reset_password_with_token(db, token, data.password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Send success email (optional)
    try:
        # Get user to send success email
        # This is a simplified version - in production you might want to get the email
        pass
    except Exception as e:
        print(f"Failed to send password reset success email: {e}")
    
    return AuthResponse(message="Password reset successful")


@router.get("/check-auth", response_model=AuthResponse)
async def check_auth(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Check authentication status from cookie."""
    
    # Try to get user from cookie
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Verify token
    payload = AuthService.verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # Get user
    user = await AuthService.get_user_by_id(db, payload.get("sub"))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return AuthResponse(
        message="Authenticated",
        user=UserResponse(**user)
    )


# Rate limit error handler is now handled in main.py
