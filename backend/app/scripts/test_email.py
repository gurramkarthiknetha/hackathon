"""
Test email notifications script for FastAPI backend.
Tests email functionality with sample data.
"""

import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from app.config import settings
from app.utils.email import EmailService


async def create_test_users():
    """Create test users for email testing"""
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.db_name]
    
    test_users = [
        {
            "_id": ObjectId(),
            "name": "John Doe",
            "email": "john.doe@example.com",
            "role": "operator",
            "zone": "east_zone",
            "isVerified": True,
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "role": "responder",
            "zone": "west_zone",
            "isVerified": True,
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "name": "Mike Johnson",
            "email": "mike.johnson@example.com",
            "role": "admin",
            "zone": None,
            "isVerified": True,
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    # Clear existing test users
    await db.users.delete_many({"email": {"$in": [user["email"] for user in test_users]}})
    
    # Insert test users
    await db.users.insert_many(test_users)
    print(f"✅ Created {len(test_users)} test users")
    
    client.close()
    return test_users


async def create_test_incidents():
    """Create test incidents for email notifications"""
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.db_name]
    
    test_incidents = [
        {
            "_id": ObjectId(),
            "type": "fire",
            "zone": "east_zone",
            "location": {
                "latitude": 40.7132,
                "longitude": -74.0055,
                "description": "Main stage area"
            },
            "severity": "critical",
            "confidence": 95,
            "description": "Fire detected in main stage area - immediate evacuation required",
            "status": "active",
            "aiGenerated": True,
            "humanApprovalRequired": True,
            "humanApproved": False,
            "priority": 5,
            "videoSnapshot": "/snapshots/fire_critical_001.jpg",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "type": "crowd_surge",
            "zone": "west_zone",
            "location": {
                "latitude": 40.7131,
                "longitude": -74.0075,
                "description": "Food court entrance"
            },
            "severity": "high",
            "confidence": 87,
            "description": "Dangerous crowd density detected at food court entrance",
            "status": "active",
            "aiGenerated": True,
            "humanApprovalRequired": True,
            "humanApproved": True,
            "priority": 4,
            "videoSnapshot": "/snapshots/crowd_surge_001.jpg",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "type": "medical_emergency",
            "zone": "north_zone",
            "location": {
                "latitude": 40.7151,
                "longitude": -74.0065,
                "description": "VIP area"
            },
            "severity": "medium",
            "confidence": 92,
            "description": "Person requiring immediate medical assistance",
            "status": "assigned",
            "aiGenerated": True,
            "humanApprovalRequired": False,
            "humanApproved": True,
            "priority": 3,
            "videoSnapshot": "/snapshots/medical_001.jpg",
            "assignedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    # Clear existing test incidents
    await db.incidents.delete_many({"description": {"$regex": "test|Test"}})
    
    # Insert test incidents
    await db.incidents.insert_many(test_incidents)
    print(f"✅ Created {len(test_incidents)} test incidents")
    
    client.close()
    return test_incidents


async def test_verification_email():
    """Test email verification email"""
    print("\n📧 Testing email verification email...")
    
    email_service = EmailService()
    
    try:
        await email_service.send_verification_email(
            email="test@example.com",
            name="Test User",
            verification_code="123456"
        )
        print("✅ Verification email sent successfully")
    except Exception as e:
        print(f"❌ Failed to send verification email: {e}")


async def test_welcome_email():
    """Test welcome email"""
    print("\n📧 Testing welcome email...")
    
    email_service = EmailService()
    
    try:
        await email_service.send_welcome_email(
            email="test@example.com",
            name="Test User"
        )
        print("✅ Welcome email sent successfully")
    except Exception as e:
        print(f"❌ Failed to send welcome email: {e}")


async def test_password_reset_email():
    """Test password reset email"""
    print("\n📧 Testing password reset email...")
    
    email_service = EmailService()
    
    try:
        await email_service.send_password_reset_email(
            email="test@example.com",
            name="Test User",
            reset_token="sample_reset_token_123"
        )
        print("✅ Password reset email sent successfully")
    except Exception as e:
        print(f"❌ Failed to send password reset email: {e}")


async def test_incident_notification_email():
    """Test incident notification email"""
    print("\n📧 Testing incident notification email...")
    
    email_service = EmailService()
    
    incident_data = {
        "type": "fire",
        "zone": "east_zone",
        "severity": "critical",
        "description": "Fire detected in main stage area - immediate evacuation required",
        "location": {
            "latitude": 40.7132,
            "longitude": -74.0055,
            "description": "Main stage area"
        },
        "createdAt": datetime.utcnow().isoformat()
    }
    
    try:
        # Create custom incident notification email
        subject = f"🚨 CRITICAL INCIDENT: {incident_data['type'].title()} in {incident_data['zone'].replace('_', ' ').title()}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">🚨 Critical Incident Alert</h1>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
                    <h2 style="color: #dc3545; margin-top: 0;">Incident Details</h2>
                    
                    <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                        <p><strong>Type:</strong> {incident_data['type'].title()}</p>
                        <p><strong>Zone:</strong> {incident_data['zone'].replace('_', ' ').title()}</p>
                        <p><strong>Severity:</strong> <span style="color: #dc3545; font-weight: bold;">{incident_data['severity'].upper()}</span></p>
                        <p><strong>Location:</strong> {incident_data['location']['description']}</p>
                        <p><strong>Description:</strong> {incident_data['description']}</p>
                        <p><strong>Time:</strong> {incident_data['createdAt']}</p>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #856404; margin-top: 0;">⚠️ Immediate Action Required</h3>
                        <p style="margin-bottom: 0;">This is a critical incident requiring immediate response. Please check the monitoring dashboard for real-time updates.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="{settings.client_url}/dashboard" 
                           style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Dashboard
                        </a>
                    </div>
                </div>
                
                <div style="background: #6c757d; color: white; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
                    <p style="margin: 0; font-size: 14px;">AI Event Monitor - Automated Incident Detection System</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        await email_service.send_email(
            to_email="test@example.com",
            subject=subject,
            html_content=html_content,
            text_content=f"Critical Incident Alert: {incident_data['type']} in {incident_data['zone']}\n\n{incident_data['description']}"
        )
        print("✅ Incident notification email sent successfully")
    except Exception as e:
        print(f"❌ Failed to send incident notification email: {e}")


async def test_bulk_notifications():
    """Test bulk email notifications to multiple users"""
    print("\n📧 Testing bulk email notifications...")
    
    # Create test users and incidents
    test_users = await create_test_users()
    test_incidents = await create_test_incidents()
    
    email_service = EmailService()
    
    # Send notifications to all test users
    for user in test_users:
        for incident in test_incidents:
            if incident["severity"] in ["critical", "high"]:  # Only send for high priority incidents
                try:
                    subject = f"🚨 {incident['severity'].upper()}: {incident['type'].title()} in {incident['zone'].replace('_', ' ').title()}"
                    
                    html_content = f"""
                    <html>
                    <body style="font-family: Arial, sans-serif;">
                        <h2>Hello {user['name']},</h2>
                        <p>A {incident['severity']} incident has been detected:</p>
                        <ul>
                            <li><strong>Type:</strong> {incident['type'].title()}</li>
                            <li><strong>Zone:</strong> {incident['zone'].replace('_', ' ').title()}</li>
                            <li><strong>Description:</strong> {incident['description']}</li>
                        </ul>
                        <p>Please check the dashboard for more details.</p>
                        <p>Best regards,<br>AI Event Monitor Team</p>
                    </body>
                    </html>
                    """
                    
                    await email_service.send_email(
                        to_email=user["email"],
                        subject=subject,
                        html_content=html_content,
                        text_content=f"Incident Alert: {incident['type']} in {incident['zone']}"
                    )
                    print(f"✅ Sent {incident['type']} notification to {user['name']} ({user['email']})")
                    
                    # Small delay to avoid overwhelming SMTP server
                    await asyncio.sleep(0.5)
                    
                except Exception as e:
                    print(f"❌ Failed to send notification to {user['email']}: {e}")


async def main():
    """Main test function"""
    print("🧪 Starting Email Notification Tests")
    print("=" * 50)
    
    # Test individual email types
    await test_verification_email()
    await test_welcome_email()
    await test_password_reset_email()
    await test_incident_notification_email()
    
    # Test bulk notifications
    await test_bulk_notifications()
    
    print("\n" + "=" * 50)
    print("🎉 Email notification tests completed!")
    print("\nNote: Check your email configuration in .env file if tests failed.")
    print("Make sure to use valid SMTP credentials and 'from' email address.")


if __name__ == "__main__":
    asyncio.run(main())
