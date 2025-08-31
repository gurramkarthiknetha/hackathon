# Email Notification System

This document describes the email notification system implemented for the Event Monitoring System.

## Overview

The email notification system automatically sends email alerts to relevant users when incidents occur, are assigned, updated, or require approval. The system is highly configurable and allows administrators to control who receives notifications and under what circumstances.

## Features

### 🚨 Incident Created Notifications
- Sent when new incidents are detected
- Notifies operators, admins, and zone responders
- Includes incident details, severity, location, and confidence level
- Highlights if human approval is required

### 📋 Incident Assignment Notifications
- Sent when incidents are assigned to responders
- Notifies the assigned responder and relevant operators/admins
- Includes assignment details and incident information

### ⚡ Incident Status Update Notifications
- Sent when incident status changes (in progress, resolved, etc.)
- Includes previous and new status, update notes, and response time
- Notifies relevant stakeholders based on configuration

### ✅ Incident Approval Notifications
- Sent when high-risk incidents are approved or dismissed
- Notifies all relevant users about the approval decision
- Includes approval details and decision rationale

## Configuration

### Email Settings Model
The system uses the `EmailNotificationSettings` model to store configuration:

```javascript
{
  emailNotificationsEnabled: Boolean,
  incidentCreated: {
    enabled: Boolean,
    notifyRoles: ["admin", "operator", "responder"],
    notifyZoneResponders: Boolean
  },
  incidentAssigned: {
    enabled: Boolean,
    notifyRoles: ["admin", "operator"],
    notifyAssignedResponder: Boolean
  },
  incidentStatusUpdate: {
    enabled: Boolean,
    notifyRoles: ["admin", "operator"],
    notifyOnResolved: Boolean,
    notifyOnInProgress: Boolean
  },
  incidentApproval: {
    enabled: Boolean,
    notifyRoles: ["admin", "operator"],
    notifyOnApproved: Boolean,
    notifyOnDismissed: Boolean
  },
  severityFilters: {
    notifyOnLow: Boolean,
    notifyOnMedium: Boolean,
    notifyOnHigh: Boolean,
    notifyOnCritical: Boolean
  }
}
```

### API Endpoints

#### Get Email Settings
```
GET /api/email-settings
```
Returns current email notification settings (Admin/Operator access)

#### Update Email Settings
```
PUT /api/email-settings
```
Updates email notification settings (Admin only)

#### Reset Email Settings
```
POST /api/email-settings/reset
```
Resets settings to default values (Admin only)

#### Test Email Configuration
```
POST /api/email-settings/test-config
```
Tests SMTP configuration (Admin only)

#### Send Test Email
```
POST /api/email-settings/test-email
Body: { "testEmail": "test@example.com" }
```
Sends a test email to verify configuration (Admin only)

## Email Templates

The system includes professionally designed HTML email templates:

- **INCIDENT_CREATED_TEMPLATE**: New incident alerts with severity-based styling
- **INCIDENT_ASSIGNED_TEMPLATE**: Assignment notifications with role-specific messaging
- **INCIDENT_STATUS_UPDATE_TEMPLATE**: Status change notifications with progress tracking
- **INCIDENT_APPROVAL_TEMPLATE**: Approval/dismissal notifications with decision details

## User Targeting

### Who Gets Notified

1. **Admins**: Receive all notifications by default
2. **Operators**: Receive most notifications, configurable per type
3. **Responders**: 
   - Zone responders get notifications for incidents in their assigned zones
   - Assigned responders get notifications when incidents are assigned to them
4. **Role-based filtering**: Each notification type can be configured to notify specific roles

### Notification Logic

The system determines recipients based on:
- Global notification settings (enabled/disabled)
- Notification type settings (per incident type)
- Severity filters (low, medium, high, critical)
- Role-based permissions
- Zone assignments for responders

## Environment Configuration

Required environment variables:

```env
# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=Event Monitoring System

# Client URL (for dashboard links in emails)
CLIENT_URL=http://localhost:5173
```

## Testing

### Manual Testing
Run the test script to verify email functionality:

```bash
cd backend
node scripts/testEmailNotifications.js
```

This script will:
1. Test email configuration
2. Create test users and incidents
3. Send sample notifications for all types
4. Verify email settings functionality
5. Clean up test data

### API Testing
Use the admin endpoints to:
1. Test SMTP configuration: `POST /api/email-settings/test-config`
2. Send test emails: `POST /api/email-settings/test-email`
3. Verify settings: `GET /api/email-settings`

## Integration Points

### Controllers Integration
Email notifications are integrated into:
- `monitoring.controller.js`: Incident creation, assignment, status updates
- `ai.controller.js`: Incident approval/dismissal

### Error Handling
- Email failures don't block incident operations
- Errors are logged but don't cause API failures
- Graceful degradation when email service is unavailable

## Security Considerations

- Admin-only access to email configuration
- Email addresses are validated before sending
- SMTP credentials are stored securely in environment variables
- Rate limiting can be configured to prevent email spam

## Troubleshooting

### Common Issues

1. **Emails not sending**: Check SMTP configuration and credentials
2. **Wrong recipients**: Verify notification settings and user roles
3. **Template errors**: Check email template syntax and placeholders
4. **Database errors**: Ensure EmailNotificationSettings model is properly initialized

### Debugging

Enable debug logging by checking:
- Console logs for email sending status
- SMTP connection verification
- User query results
- Notification settings retrieval

## Future Enhancements

Potential improvements:
- Email delivery tracking and analytics
- Email templates customization UI
- Bulk notification management
- Integration with external email services (SendGrid, AWS SES)
- Email scheduling and queuing
- Unsubscribe functionality
- Email preferences per user
