/**
 * Amazon SES API Example
 * 
 * This example demonstrates how to send emails using Amazon SES via AWS SDK v3.
 * 
 * Prerequisites:
 * 1. Copy .env.example to .env
 * 2. Fill in your AWS credentials (IAM User with SES permissions)
 * 3. Verify sender and recipient emails in SES (sandbox mode)
 * 
 * Run: npm start
 */

import {
    SESClient,
    SendEmailCommand,
    SendTemplatedEmailCommand,
    CreateTemplateCommand,
    DeleteTemplateCommand,
    GetSendQuotaCommand,
    GetSendStatisticsCommand,
    ListIdentitiesCommand
} from '@aws-sdk/client-ses';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ============================================
// SES Client Configuration
// ============================================
const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// ============================================
// Example 1: Send Simple Email
// ============================================
async function sendSimpleEmail() {
    console.log('\n📧 Sending Simple Email via API...');

    const params = {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [process.env.EMAIL_TO]
        },
        Message: {
            Subject: {
                Data: 'Test Email from Amazon SES API',
                Charset: 'UTF-8'
            },
            Body: {
                Text: {
                    Data: `
Hello!

This is a test email using Amazon SES API with AWS SDK v3.

Sent at: ${new Date().toLocaleString('en-US')}

Regards,
SES API Example
          `.trim(),
                    Charset: 'UTF-8'
                }
            }
        }
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('✅ Simple email sent!');
        console.log('   Message ID:', response.MessageId);
        return response;
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// ============================================
// Example 2: Send HTML Email
// ============================================
async function sendHtmlEmail() {
    console.log('\n📧 Sending HTML Email via API...');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
    <!-- Spacer -->
    <tr><td style="height: 40px;"></td></tr>
    
    <!-- Main Card -->
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #334155;">
              <h1 style="color: #f8fafc; margin: 0; font-size: 24px;">🚀 AWS SDK Email</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #94a3b8; line-height: 1.8; margin: 0 0 20px; font-size: 16px;">
                Hello! This email was sent using <strong style="color: #60a5fa;">Amazon SES API</strong> 
                with <strong style="color: #60a5fa;">AWS SDK v3</strong>.
              </p>
              
              <!-- Feature Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #334155; border-radius: 12px; margin: 25px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="color: #f8fafc; margin: 0 0 15px; font-size: 16px;">✨ Features Used:</h3>
                    <ul style="color: #94a3b8; margin: 0; padding-left: 20px; line-height: 1.8;">
                      <li>SendEmailCommand</li>
                      <li>HTML + Text Body</li>
                      <li>UTF-8 Encoding</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <a href="https://docs.aws.amazon.com/ses/" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px;">
                      View SES Documentation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #334155;">
              <p style="color: #64748b; margin: 0; font-size: 13px;">
                Sent via Amazon SES API • ${new Date().toLocaleString('en-US')}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Spacer -->
    <tr><td style="height: 40px;"></td></tr>
  </table>
</body>
</html>
  `.trim();

    const params = {
        Source: `"SES API Demo" <${process.env.EMAIL_FROM}>`,
        Destination: {
            ToAddresses: [process.env.EMAIL_TO]
        },
        Message: {
            Subject: {
                Data: '🚀 HTML Email from AWS SDK',
                Charset: 'UTF-8'
            },
            Body: {
                Text: {
                    Data: 'This is the text version. Please view in HTML-capable email client.',
                    Charset: 'UTF-8'
                },
                Html: {
                    Data: htmlContent,
                    Charset: 'UTF-8'
                }
            }
        }
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('✅ HTML email sent!');
        console.log('   Message ID:', response.MessageId);
        return response;
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// ============================================
// Example 3: Email Template Management
// ============================================
const TEMPLATE_NAME = 'WelcomeTemplate';

async function createEmailTemplate() {
    console.log('\n📝 Creating Email Template...');

    const params = {
        Template: {
            TemplateName: TEMPLATE_NAME,
            SubjectPart: 'Welcome to {{serviceName}}, {{userName}}! 🎉',
            HtmlPart: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 40px;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h1 style="color: #1e293b; margin: 0 0 20px;">Welcome, {{userName}}! 🎉</h1>
    <p style="color: #64748b; line-height: 1.6;">
      Thank you for joining <strong>{{serviceName}}</strong>. 
      We're excited to have you on board!
    </p>
    <p style="color: #64748b; line-height: 1.6;">
      Your account has been created with the email: <strong>{{userEmail}}</strong>
    </p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <a href="{{actionUrl}}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Get Started
      </a>
    </div>
  </div>
</body>
</html>
      `.trim(),
            TextPart: 'Welcome, {{userName}}! Thank you for joining {{serviceName}}. Visit {{actionUrl}} to get started.'
        }
    };

    try {
        // Try to delete existing template first (ignore error if not exists)
        try {
            await sesClient.send(new DeleteTemplateCommand({ TemplateName: TEMPLATE_NAME }));
        } catch (e) {
            // Template doesn't exist, that's fine
        }

        const command = new CreateTemplateCommand(params);
        await sesClient.send(command);
        console.log('✅ Template created:', TEMPLATE_NAME);
        return true;
    } catch (error) {
        console.error('❌ Error creating template:', error.message);
        throw error;
    }
}

async function sendTemplatedEmail() {
    console.log('\n📧 Sending Templated Email...');

    const params = {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [process.env.EMAIL_TO]
        },
        Template: TEMPLATE_NAME,
        TemplateData: JSON.stringify({
            userName: 'Pras',
            userEmail: process.env.EMAIL_TO,
            serviceName: 'SES Learning Platform',
            actionUrl: 'https://aws.amazon.com/ses/'
        })
    };

    try {
        const command = new SendTemplatedEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('✅ Templated email sent!');
        console.log('   Message ID:', response.MessageId);
        return response;
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// ============================================
// Example 4: Get SES Account Info
// ============================================
async function getSESAccountInfo() {
    console.log('\n📊 Getting SES Account Info...');

    try {
        // Get Send Quota
        const quotaCommand = new GetSendQuotaCommand({});
        const quota = await sesClient.send(quotaCommand);

        console.log('\n   📈 Send Quota:');
        console.log('      Max 24hr send:', quota.Max24HourSend);
        console.log('      Sent last 24hr:', quota.SentLast24Hours);
        console.log('      Max send rate:', quota.MaxSendRate, 'emails/sec');

        // Get Verified Identities
        const identitiesCommand = new ListIdentitiesCommand({ IdentityType: 'EmailAddress' });
        const identities = await sesClient.send(identitiesCommand);

        console.log('\n   📧 Verified Emails:');
        identities.Identities.forEach(email => {
            console.log('      •', email);
        });

        // Get Send Statistics
        const statsCommand = new GetSendStatisticsCommand({});
        const stats = await sesClient.send(statsCommand);

        if (stats.SendDataPoints.length > 0) {
            console.log('\n   📊 Recent Stats (last data point):');
            const latest = stats.SendDataPoints[stats.SendDataPoints.length - 1];
            console.log('      Delivery attempts:', latest.DeliveryAttempts);
            console.log('      Bounces:', latest.Bounces);
            console.log('      Complaints:', latest.Complaints);
            console.log('      Rejects:', latest.Rejects);
        }

        return { quota, identities, stats };
    } catch (error) {
        console.error('❌ Error getting account info:', error.message);
        throw error;
    }
}

// ============================================
// Main - Run Examples
// ============================================
async function main() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Amazon SES API Example               ║');
    console.log('║   Using AWS SDK v3                     ║');
    console.log('╚════════════════════════════════════════╝');

    // Check environment variables
    const requiredEnv = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'EMAIL_FROM', 'EMAIL_TO'];
    const missing = requiredEnv.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('\n❌ Missing environment variables:', missing.join(', '));
        console.error('   Please copy .env.example to .env and fill in your credentials.');
        process.exit(1);
    }

    console.log('\n📋 Configuration:');
    console.log('   Region:', process.env.AWS_REGION);
    console.log('   From:', process.env.EMAIL_FROM);
    console.log('   To:', process.env.EMAIL_TO);

    try {
        // Get account info first
        await getSESAccountInfo();

        // Run email examples
        await sendSimpleEmail();
        await sendHtmlEmail();

        // Template example
        await createEmailTemplate();
        await sendTemplatedEmail();

        console.log('\n✅ All examples completed successfully!');
        console.log('📬 Check your inbox:', process.env.EMAIL_TO);
    } catch (error) {
        console.error('\n❌ Some examples failed. Please check the errors above.');
        console.error('   Error details:', error.name, '-', error.message);
        process.exit(1);
    }
}

main();
