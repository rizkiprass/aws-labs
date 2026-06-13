/**
 * Email Routes - REST API for email operations
 */

import { Router } from 'express';
import emailService from '../services/emailService.js';
import { getWelcomeTemplate, getNotificationTemplate, getOtpTemplate } from '../templates/index.js';

const router = Router();

/**
 * POST /api/email/send
 * Send a single email
 */
router.post('/send', async (req, res) => {
    try {
        const { to, subject, text, html, templateType, templateData } = req.body;

        if (!to || !subject) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: to, subject'
            });
        }

        let emailHtml = html;

        // Use template if specified
        if (templateType && templateData) {
            switch (templateType) {
                case 'welcome':
                    emailHtml = getWelcomeTemplate(templateData);
                    break;
                case 'notification':
                    emailHtml = getNotificationTemplate(templateData);
                    break;
                case 'otp':
                    emailHtml = getOtpTemplate(templateData);
                    break;
            }
        }

        const result = await emailService.sendEmail({
            to,
            subject,
            text: text || subject,
            html: emailHtml
        });

        res.json(result);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/email/send-welcome
 * Send a welcome email
 */
router.post('/send-welcome', async (req, res) => {
    try {
        const { to, userName, actionUrl } = req.body;

        if (!to || !userName) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: to, userName'
            });
        }

        const html = getWelcomeTemplate({
            userName,
            actionUrl: actionUrl || 'https://example.com'
        });

        const result = await emailService.sendEmail({
            to,
            subject: `Welcome, ${userName}! 🎉`,
            text: `Welcome ${userName}! Thank you for joining us.`,
            html
        });

        res.json(result);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/email/send-otp
 * Send an OTP verification email
 */
router.post('/send-otp', async (req, res) => {
    try {
        const { to, otp, userName, expiryMinutes } = req.body;

        if (!to || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: to, otp'
            });
        }

        const html = getOtpTemplate({
            otp: otp.toString(),
            userName: userName || 'User',
            expiryMinutes: expiryMinutes || 5
        });

        const result = await emailService.sendEmail({
            to,
            subject: `Your verification code: ${otp}`,
            text: `Your OTP is ${otp}. Valid for ${expiryMinutes || 5} minutes.`,
            html
        });

        res.json(result);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/email/send-notification
 * Send a notification email
 */
router.post('/send-notification', async (req, res) => {
    try {
        const { to, title, message, type, actionUrl, actionText } = req.body;

        if (!to || !title || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: to, title, message'
            });
        }

        const html = getNotificationTemplate({
            title,
            message,
            type: type || 'info',
            actionUrl,
            actionText
        });

        const result = await emailService.sendEmail({
            to,
            subject: title,
            text: message,
            html
        });

        res.json(result);
    } catch (error) {
        console.error('Error sending notification email:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/email/send-bulk
 * Send bulk emails
 */
router.post('/send-bulk', async (req, res) => {
    try {
        const { recipients, subject, text, html } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid recipients array'
            });
        }

        const results = [];
        for (const recipient of recipients) {
            try {
                const result = await emailService.sendEmail({
                    to: recipient.email,
                    subject: subject.replace('{{name}}', recipient.name || ''),
                    text: text?.replace('{{name}}', recipient.name || ''),
                    html: html?.replace(/\{\{name\}\}/g, recipient.name || '')
                });
                results.push({ email: recipient.email, ...result });
            } catch (error) {
                results.push({
                    email: recipient.email,
                    success: false,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            total: recipients.length,
            results
        });
    } catch (error) {
        console.error('Error sending bulk email:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/email/templates
 * List all SES templates
 */
router.get('/templates', async (req, res) => {
    try {
        const templates = await emailService.listTemplates();
        res.json({ success: true, templates });
    } catch (error) {
        console.error('Error listing templates:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
