/**
 * Amazon SES SMTP Example
 * 
 * This example demonstrates how to send emails using Amazon SES via SMTP
 * with Nodemailer.
 * 
 * Prerequisites:
 * 1. Copy .env.example to .env
 * 2. Fill in your SMTP credentials from SES Console
 * 3. Verify sender and recipient emails in SES (sandbox mode)
 * 
 * Run: npm start
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ============================================
// SMTP Configuration
// ============================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

// ============================================
// Example 1: Send Simple Text Email
// ============================================
async function sendTextEmail() {
  console.log('\n📧 Sending Text Email...');
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: 'Test Email from Amazon SES (Text)',
    text: `
Hello!

This is a test email using Amazon SES via SMTP.

Sent at: ${new Date().toLocaleString('en-US')}

Regards,
SES SMTP Example
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Text email sent!');
    console.log('   Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// ============================================
// Example 2: Send HTML Email
// ============================================
async function sendHtmlEmail() {
  console.log('\n📧 Sending HTML Email...');
  
  const mailOptions = {
    from: `"SES Demo" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_TO,
    subject: 'Welcome to Our Service! 🎉',
    text: 'Welcome! Thank you for joining us.', // Fallback
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome! 🎉</h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1f2937; margin: 0 0 20px;">Hello there!</h2>
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
          Thank you for joining our service. We're excited to have you on board!
        </p>
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
          This email was sent using <strong>Amazon SES</strong> via SMTP with Nodemailer.
        </p>
        
        <!-- Button -->
        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
              <a href="https://aws.amazon.com/ses/" 
                 style="display: inline-block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-weight: bold;">
                Learn More About SES
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0; font-size: 14px;">
          Sent using Amazon SES SMTP Example
        </p>
        <p style="color: #9ca3af; margin: 10px 0 0; font-size: 12px;">
          ${new Date().toLocaleString('en-US')}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ HTML email sent!');
    console.log('   Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// ============================================
// Example 3: Send Email with Attachment
// ============================================
async function sendEmailWithAttachment() {
  console.log('\n📧 Sending Email with Attachment...');
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: 'Email with Attachment',
    text: 'Please see the attachment in this email.',
    attachments: [
      {
        filename: 'sample.txt',
        content: `
Sample Attachment
=================

This is an example attachment file sent via Amazon SES.

Created at: ${new Date().toISOString()}

Tips for using Amazon SES:
1. Always verify the sender email
2. Monitor bounce and complaint rates
3. Use configuration sets for tracking
4. Implement proper retry logic

Happy emailing! 📧
        `.trim()
      },
      {
        filename: 'data.json',
        content: JSON.stringify({
          message: 'Hello from SES!',
          timestamp: new Date().toISOString(),
          platform: 'Amazon SES',
          method: 'SMTP'
        }, null, 2)
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email with attachment sent!');
    console.log('   Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// ============================================
// Example 4: Verify SMTP Connection
// ============================================
async function verifyConnection() {
  console.log('\n🔍 Verifying SMTP connection...');
  
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified!');
    console.log('   Host:', process.env.SMTP_HOST);
    console.log('   Port:', process.env.SMTP_PORT);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// ============================================
// Main - Run Examples
// ============================================
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Amazon SES SMTP Example              ║');
  console.log('║   Using Nodemailer                     ║');
  console.log('╚════════════════════════════════════════╝');

  // Check environment variables
  const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'EMAIL_FROM', 'EMAIL_TO'];
  const missing = requiredEnv.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('\n❌ Missing environment variables:', missing.join(', '));
    console.error('   Please copy .env.example to .env and fill in your credentials.');
    process.exit(1);
  }

  console.log('\n📋 Configuration:');
  console.log('   From:', process.env.EMAIL_FROM);
  console.log('   To:', process.env.EMAIL_TO);

  // Verify connection first
  const connected = await verifyConnection();
  if (!connected) {
    console.error('\n❌ Cannot connect to SMTP server. Please check your credentials.');
    process.exit(1);
  }

  // Run examples
  try {
    await sendTextEmail();
    await sendHtmlEmail();
    await sendEmailWithAttachment();
    
    console.log('\n✅ All examples completed successfully!');
    console.log('📬 Check your inbox:', process.env.EMAIL_TO);
  } catch (error) {
    console.error('\n❌ Some examples failed. Please check the errors above.');
    process.exit(1);
  }
}

main();
