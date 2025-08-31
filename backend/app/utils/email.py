"""
Email service using aiosmtplib for async email sending.
Provides email templates and sending functionality.
"""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from app.config import settings


class EmailService:
    
    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        to_name: Optional[str] = None
    ) -> bool:
        """Send an email using SMTP."""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from}>"
            message["To"] = f"{to_name} <{to_email}>" if to_name else to_email
            
            # Add text part if provided
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)
            
            # Add HTML part
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=settings.smtp_host,
                port=settings.smtp_port,
                start_tls=not settings.smtp_secure,
                username=settings.smtp_user,
                password=settings.smtp_pass,
            )
            
            return True
            
        except Exception as e:
            print(f"Failed to send email to {to_email}: {e}")
            return False
    
    @staticmethod
    async def send_verification_email(email: str, verification_code: str) -> bool:
        """Send email verification code."""
        subject = "Verify Your Email - AI Event Monitor"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #333; text-align: center;">Email Verification</h1>
                <p style="color: #666; font-size: 16px;">
                    Thank you for registering with AI Event Monitor. Please use the verification code below to verify your email address:
                </p>
                <div style="background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h2 style="margin: 0; font-size: 32px; letter-spacing: 5px;">{verification_code}</h2>
                </div>
                <p style="color: #666; font-size: 14px;">
                    This code will expire in 24 hours. If you didn't request this verification, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    AI Event Monitor - Emergency Response System
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Email Verification - AI Event Monitor
        
        Thank you for registering with AI Event Monitor.
        
        Your verification code is: {verification_code}
        
        This code will expire in 24 hours.
        
        If you didn't request this verification, please ignore this email.
        """
        
        return await EmailService.send_email(email, subject, html_content, text_content)
    
    @staticmethod
    async def send_welcome_email(email: str, name: str) -> bool:
        """Send welcome email after successful verification."""
        subject = "Welcome to AI Event Monitor!"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Welcome</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #28a745; text-align: center;">Welcome to AI Event Monitor!</h1>
                <p style="color: #666; font-size: 16px;">
                    Hi {name},
                </p>
                <p style="color: #666; font-size: 16px;">
                    Your email has been successfully verified! You now have full access to the AI Event Monitor platform.
                </p>
                <div style="background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin: 0;">🎉 Account Activated</h3>
                </div>
                <p style="color: #666; font-size: 16px;">
                    You can now:
                </p>
                <ul style="color: #666; font-size: 16px;">
                    <li>Monitor real-time incidents and alerts</li>
                    <li>Communicate with your team</li>
                    <li>Access emergency response tools</li>
                    <li>View analytics and reports</li>
                </ul>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    AI Event Monitor - Emergency Response System
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to AI Event Monitor!
        
        Hi {name},
        
        Your email has been successfully verified! You now have full access to the AI Event Monitor platform.
        
        You can now:
        - Monitor real-time incidents and alerts
        - Communicate with your team
        - Access emergency response tools
        - View analytics and reports
        
        Welcome aboard!
        """
        
        return await EmailService.send_email(email, subject, html_content, text_content, name)
    
    @staticmethod
    async def send_password_reset_email(email: str, reset_url: str) -> bool:
        """Send password reset email."""
        subject = "Reset Your Password - AI Event Monitor"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #dc3545; text-align: center;">Password Reset Request</h1>
                <p style="color: #666; font-size: 16px;">
                    We received a request to reset your password for your AI Event Monitor account.
                </p>
                <p style="color: #666; font-size: 16px;">
                    Click the button below to reset your password:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="color: #007bff; font-size: 14px; word-break: break-all;">
                    {reset_url}
                </p>
                <p style="color: #666; font-size: 14px;">
                    This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    AI Event Monitor - Emergency Response System
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request - AI Event Monitor
        
        We received a request to reset your password for your AI Event Monitor account.
        
        Click this link to reset your password:
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, please ignore this email.
        """
        
        return await EmailService.send_email(email, subject, html_content, text_content)
    
    @staticmethod
    async def send_password_reset_success_email(email: str) -> bool:
        """Send password reset success confirmation."""
        subject = "Password Reset Successful - AI Event Monitor"
        
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset Successful</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #28a745; text-align: center;">Password Reset Successful</h1>
                <p style="color: #666; font-size: 16px;">
                    Your password has been successfully reset for your AI Event Monitor account.
                </p>
                <div style="background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin: 0;">🔒 Password Updated</h3>
                </div>
                <p style="color: #666; font-size: 16px;">
                    You can now log in with your new password. If you didn't make this change, please contact support immediately.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    AI Event Monitor - Emergency Response System
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = """
        Password Reset Successful - AI Event Monitor
        
        Your password has been successfully reset for your AI Event Monitor account.
        
        You can now log in with your new password.
        
        If you didn't make this change, please contact support immediately.
        """
        
        return await EmailService.send_email(email, subject, html_content, text_content)
