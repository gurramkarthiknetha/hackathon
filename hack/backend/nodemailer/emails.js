import { createTransporter, emailConfig } from "./nodemailer.config.js";
import {
	VERIFICATION_EMAIL_TEMPLATE,
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	WELCOME_EMAIL_TEMPLATE,
	NOTIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

// Send verification email
export const sendVerificationEmail = async (email, verificationToken) => {
	const transporter = createTransporter();
	
	const mailOptions = {
		from: emailConfig.from,
		to: email,
		subject: "Verify your email",
		html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("✅ Verification email sent successfully:", info.messageId);
		return info;
	} catch (error) {
		console.error("❌ Error sending verification email:", error);
		throw new Error(`Error sending verification email: ${error.message}`);
	}
};

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
	const transporter = createTransporter();
	
	const mailOptions = {
		from: emailConfig.from,
		to: email,
		subject: "Welcome to our platform!",
		html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name).replace("{companyName}", emailConfig.from.name),
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("✅ Welcome email sent successfully:", info.messageId);
		return info;
	} catch (error) {
		console.error("❌ Error sending welcome email:", error);
		throw new Error(`Error sending welcome email: ${error.message}`);
	}
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetURL) => {
	const transporter = createTransporter();
	
	const mailOptions = {
		from: emailConfig.from,
		to: email,
		subject: "Reset your password",
		html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("✅ Password reset email sent successfully:", info.messageId);
		return info;
	} catch (error) {
		console.error("❌ Error sending password reset email:", error);
		throw new Error(`Error sending password reset email: ${error.message}`);
	}
};

// Send password reset success email
export const sendResetSuccessEmail = async (email) => {
	const transporter = createTransporter();
	
	const mailOptions = {
		from: emailConfig.from,
		to: email,
		subject: "Password Reset Successful",
		html: PASSWORD_RESET_SUCCESS_TEMPLATE,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("✅ Password reset success email sent successfully:", info.messageId);
		return info;
	} catch (error) {
		console.error("❌ Error sending password reset success email:", error);
		throw new Error(`Error sending password reset success email: ${error.message}`);
	}
};

// Send notification email
export const sendNotificationEmail = async (email, notificationData) => {
	const transporter = createTransporter();

	const { title, message, type, severity, senderName, timestamp } = notificationData;

	// Get severity color and icon
	const getSeverityStyle = (severity) => {
		switch (severity) {
			case 'critical': return { color: '#dc2626', icon: '🚨', bgColor: '#fef2f2' };
			case 'high': return { color: '#ea580c', icon: '⚠️', bgColor: '#fff7ed' };
			case 'medium': return { color: '#ca8a04', icon: '📢', bgColor: '#fefce8' };
			case 'low': return { color: '#16a34a', icon: 'ℹ️', bgColor: '#f0fdf4' };
			default: return { color: '#6b7280', icon: '📝', bgColor: '#f9fafb' };
		}
	};

	const severityStyle = getSeverityStyle(severity);

	const mailOptions = {
		from: emailConfig.from,
		to: email,
		subject: `${severityStyle.icon} ${title}`,
		html: NOTIFICATION_EMAIL_TEMPLATE
			.replace(/{title}/g, title)
			.replace(/{message}/g, message)
			.replace(/{type}/g, type)
			.replace(/{severity}/g, severity)
			.replace(/{severityColor}/g, severityStyle.color)
			.replace(/{severityIcon}/g, severityStyle.icon)
			.replace(/{severityBgColor}/g, severityStyle.bgColor)
			.replace(/{senderName}/g, senderName || 'System Administrator')
			.replace(/{timestamp}/g, new Date(timestamp).toLocaleString())
			.replace(/{companyName}/g, emailConfig.from.name || 'Emergency Response System'),
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("✅ Notification email sent successfully:", info.messageId);
		return info;
	} catch (error) {
		console.error("❌ Error sending notification email:", error);
		throw new Error(`Error sending notification email: ${error.message}`);
	}
};
