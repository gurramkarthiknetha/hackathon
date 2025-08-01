export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 24 hours for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to {companyName}!</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {name},</p>
    <p>Welcome to our platform! We're excited to have you on board.</p>
    <p>Your email has been successfully verified and your account is now active.</p>
    <p>You can now enjoy all the features our platform has to offer.</p>
    <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
    <p>Best regards,<br>The {companyName} Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
    </div>
    <p>Or copy and paste this URL into your browser:</p>
    <p style="word-break: break-all; color: #666;">{resetURL}</p>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

// Alert Email Templates for Incident Notifications

export const INCIDENT_CREATED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Incident Alert</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #ff6b6b, #ee5a52); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">🚨 New Incident Alert</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {recipientName},</p>
    <p>A new incident has been detected and requires attention:</p>

    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid {severityColor};">
      <h3 style="margin: 0 0 10px 0; color: {severityColor};">Incident Details</h3>
      <p><strong>Type:</strong> {incidentType}</p>
      <p><strong>Zone:</strong> {zone}</p>
      <p><strong>Severity:</strong> <span style="color: {severityColor}; font-weight: bold;">{severity}</span></p>
      <p><strong>Confidence:</strong> {confidence}%</p>
      <p><strong>Location:</strong> {location}</p>
      <p><strong>Description:</strong> {description}</p>
      <p><strong>Time:</strong> {timestamp}</p>
      {humanApprovalRequired}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{dashboardURL}" style="background-color: #ff6b6b; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Dashboard</a>
    </div>

    <p style="font-size: 12px; color: #666;">This is an automated alert from the Event Monitoring System.</p>
  </div>
</body>
</html>
`;

export const INCIDENT_ASSIGNED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Incident Assignment</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">📋 Incident Assigned</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {recipientName},</p>
    <p>{assignmentMessage}</p>

    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid {severityColor};">
      <h3 style="margin: 0 0 10px 0; color: {severityColor};">Incident Details</h3>
      <p><strong>Type:</strong> {incidentType}</p>
      <p><strong>Zone:</strong> {zone}</p>
      <p><strong>Severity:</strong> <span style="color: {severityColor}; font-weight: bold;">{severity}</span></p>
      <p><strong>Location:</strong> {location}</p>
      <p><strong>Description:</strong> {description}</p>
      <p><strong>Assigned To:</strong> {assignedTo}</p>
      <p><strong>Assigned At:</strong> {assignedAt}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{dashboardURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Dashboard</a>
    </div>

    <p style="font-size: 12px; color: #666;">This is an automated notification from the Event Monitoring System.</p>
  </div>
</body>
</html>
`;

export const INCIDENT_STATUS_UPDATE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Incident Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, {statusColor}, {statusColorDark}); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">{statusIcon} Incident Status Update</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {recipientName},</p>
    <p>An incident status has been updated:</p>

    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid {statusColor};">
      <h3 style="margin: 0 0 10px 0; color: {statusColor};">Status Update</h3>
      <p><strong>Previous Status:</strong> {previousStatus}</p>
      <p><strong>New Status:</strong> <span style="color: {statusColor}; font-weight: bold;">{newStatus}</span></p>
      <p><strong>Updated By:</strong> {updatedBy}</p>
      <p><strong>Updated At:</strong> {updatedAt}</p>
      {notes}
      {responseTime}
    </div>

    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid {severityColor};">
      <h3 style="margin: 0 0 10px 0;">Incident Details</h3>
      <p><strong>Type:</strong> {incidentType}</p>
      <p><strong>Zone:</strong> {zone}</p>
      <p><strong>Severity:</strong> <span style="color: {severityColor}; font-weight: bold;">{severity}</span></p>
      <p><strong>Location:</strong> {location}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{dashboardURL}" style="background-color: {statusColor}; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Dashboard</a>
    </div>

    <p style="font-size: 12px; color: #666;">This is an automated notification from the Event Monitoring System.</p>
  </div>
</body>
</html>
`;

export const INCIDENT_APPROVAL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Incident Approval Decision</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, {approvalColor}, {approvalColorDark}); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">{approvalIcon} Incident {approvalAction}</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {recipientName},</p>
    <p>A high-risk incident has been {approvalAction} by an operator:</p>

    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid {approvalColor};">
      <h3 style="margin: 0 0 10px 0; color: {approvalColor};">Approval Decision</h3>
      <p><strong>Decision:</strong> <span style="color: {approvalColor}; font-weight: bold;">{approvalDecision}</span></p>
      <p><strong>Approved By:</strong> {approvedBy}</p>
      <p><strong>Decision Time:</strong> {approvalTime}</p>
    </div>

    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid {severityColor};">
      <h3 style="margin: 0 0 10px 0;">Incident Details</h3>
      <p><strong>Type:</strong> {incidentType}</p>
      <p><strong>Zone:</strong> {zone}</p>
      <p><strong>Severity:</strong> <span style="color: {severityColor}; font-weight: bold;">{severity}</span></p>
      <p><strong>Confidence:</strong> {confidence}%</p>
      <p><strong>Location:</strong> {location}</p>
      <p><strong>Description:</strong> {description}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{dashboardURL}" style="background-color: {approvalColor}; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Dashboard</a>
    </div>

    <p style="font-size: 12px; color: #666;">This is an automated notification from the Event Monitoring System.</p>
  </div>
</body>
</html>
`;

export const NOTIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">
        {severityIcon} {companyName}
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        System Notification
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <!-- Severity Badge -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="
          display: inline-block;
          background-color: {severityBgColor};
          color: {severityColor};
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 2px solid {severityColor};
        ">
          {severity} Priority
        </span>
      </div>

      <!-- Title -->
      <h2 style="
        color: #2d3748;
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 20px 0;
        text-align: center;
        line-height: 1.3;
      ">
        {title}
      </h2>

      <!-- Message -->
      <div style="
        background-color: #f8fafc;
        border-left: 4px solid {severityColor};
        padding: 20px;
        margin: 30px 0;
        border-radius: 0 8px 8px 0;
      ">
        <p style="
          margin: 0;
          font-size: 16px;
          line-height: 1.6;
          color: #4a5568;
        ">
          {message}
        </p>
      </div>

      <!-- Metadata -->
      <div style="
        background-color: #edf2f7;
        padding: 20px;
        border-radius: 8px;
        margin: 30px 0;
      ">
        <h3 style="
          margin: 0 0 15px 0;
          font-size: 16px;
          color: #2d3748;
          font-weight: 600;
        ">
          Notification Details
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096; font-weight: 500; width: 30%;">Type:</td>
            <td style="padding: 8px 0; color: #2d3748; text-transform: capitalize;">{type}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096; font-weight: 500;">Sent by:</td>
            <td style="padding: 8px 0; color: #2d3748;">{senderName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096; font-weight: 500;">Time:</td>
            <td style="padding: 8px 0; color: #2d3748;">{timestamp}</td>
          </tr>
        </table>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="#" style="
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px 30px;
          text-decoration: none;
          border-radius: 25px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        ">
          View Dashboard
        </a>
      </div>

      <!-- Important Notice -->
      <div style="
        background-color: #fff5f5;
        border: 1px solid #fed7d7;
        border-radius: 8px;
        padding: 15px;
        margin: 30px 0;
      ">
        <p style="
          margin: 0;
          font-size: 14px;
          color: #c53030;
          text-align: center;
          font-weight: 500;
        ">
          ⚠️ This is an automated system notification. Please do not reply to this email.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="
      background-color: #2d3748;
      padding: 20px;
      text-align: center;
    ">
      <p style="
        margin: 0;
        color: #a0aec0;
        font-size: 14px;
      ">
        © 2024 {companyName}. All rights reserved.
      </p>
      <p style="
        margin: 10px 0 0 0;
        color: #718096;
        font-size: 12px;
      ">
        Emergency Response & Monitoring System
      </p>
    </div>
  </div>
</body>
</html>
`;
