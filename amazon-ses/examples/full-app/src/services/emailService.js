/**
 * Email Service - Amazon SES Integration
 * 
 * Provides methods for sending various types of emails via AWS SES.
 */

import {
    SESClient,
    SendEmailCommand,
    SendTemplatedEmailCommand,
    SendBulkTemplatedEmailCommand,
    CreateTemplateCommand,
    DeleteTemplateCommand,
    GetTemplateCommand,
    ListTemplatesCommand
} from '@aws-sdk/client-ses';

class EmailService {
    constructor() {
        this._client = null;
    }

    // Lazy initialization - create client only when first needed
    get client() {
        if (!this._client) {
            this._client = new SESClient({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                }
            });
        }
        return this._client;
    }

    get defaultFrom() {
        return process.env.EMAIL_FROM;
    }

    /**
     * Send a simple email
     */
    async sendEmail({ to, subject, text, html, from }) {
        const params = {
            Source: from || this.defaultFrom,
            Destination: {
                ToAddresses: Array.isArray(to) ? to : [to]
            },
            Message: {
                Subject: { Data: subject, Charset: 'UTF-8' },
                Body: {
                    Text: { Data: text || '', Charset: 'UTF-8' },
                    Html: { Data: html || text || '', Charset: 'UTF-8' }
                }
            }
        };

        const command = new SendEmailCommand(params);
        const response = await this.client.send(command);
        return {
            success: true,
            messageId: response.MessageId,
            requestId: response.$metadata.requestId
        };
    }

    /**
     * Send email using a template
     */
    async sendTemplatedEmail({ to, templateName, templateData, from }) {
        const params = {
            Source: from || this.defaultFrom,
            Destination: {
                ToAddresses: Array.isArray(to) ? to : [to]
            },
            Template: templateName,
            TemplateData: JSON.stringify(templateData)
        };

        const command = new SendTemplatedEmailCommand(params);
        const response = await this.client.send(command);
        return {
            success: true,
            messageId: response.MessageId,
            requestId: response.$metadata.requestId
        };
    }

    /**
     * Send bulk templated emails
     */
    async sendBulkEmail({ recipients, templateName, defaultTemplateData, from }) {
        const params = {
            Source: from || this.defaultFrom,
            Template: templateName,
            DefaultTemplateData: JSON.stringify(defaultTemplateData),
            Destinations: recipients.map(recipient => ({
                Destination: { ToAddresses: [recipient.email] },
                ReplacementTemplateData: JSON.stringify(recipient.data || {})
            }))
        };

        const command = new SendBulkTemplatedEmailCommand(params);
        const response = await this.client.send(command);
        return {
            success: true,
            status: response.Status,
            requestId: response.$metadata.requestId
        };
    }

    /**
     * Create an email template
     */
    async createTemplate({ name, subject, html, text }) {
        // Try to delete existing template first
        try {
            await this.client.send(new DeleteTemplateCommand({ TemplateName: name }));
        } catch (e) {
            // Template doesn't exist, that's fine
        }

        const params = {
            Template: {
                TemplateName: name,
                SubjectPart: subject,
                HtmlPart: html,
                TextPart: text
            }
        };

        const command = new CreateTemplateCommand(params);
        await this.client.send(command);
        return { success: true, templateName: name };
    }

    /**
     * List all templates
     */
    async listTemplates() {
        const command = new ListTemplatesCommand({ MaxItems: 100 });
        const response = await this.client.send(command);
        return response.TemplatesMetadata || [];
    }

    /**
     * Get template details
     */
    async getTemplate(name) {
        const command = new GetTemplateCommand({ TemplateName: name });
        const response = await this.client.send(command);
        return response.Template;
    }

    /**
     * Delete a template
     */
    async deleteTemplate(name) {
        const command = new DeleteTemplateCommand({ TemplateName: name });
        await this.client.send(command);
        return { success: true };
    }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
