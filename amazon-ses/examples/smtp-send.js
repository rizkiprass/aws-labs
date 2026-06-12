/**
 * Amazon SES SMTP Send Example
 *
 * Sends an email via SES SMTP using nodemailer.
 * Uses configuration set for tracking (open, click, bounce, complaint).
 *
 * Prerequisites:
 *   1. Get SMTP credentials from SES Console → SMTP Settings → Create SMTP Credentials
 *   2. Verify your sender domain in SES
 *   3. Copy .env.example to .env and fill in your credentials
 *
 * Usage:
 *   npm install
 *   node smtp-send.js
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Validate required env vars
const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL', 'TO_EMAIL'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a test email
 */
async function sendEmail() {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: process.env.TO_EMAIL,
    subject: 'Test email from Amazon SES',
    text: 'This is a plain text version of the email.',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Hello from Amazon SES!</h1>
          <p>This is a test email sent via SES SMTP using Node.js and nodemailer.</p>
          <p>Check the SES dashboard to see delivery, open, and click tracking events.</p>
          <p>
            <a href="https://aws.amazon.com/ses/" style="background: #ff9900; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Learn more about SES
            </a>
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Sent from ${process.env.FROM_EMAIL}
          </p>
        </body>
      </html>
    `,
    // SES-specific headers
    headers: {
      'X-SES-CONFIGURATION-SET': process.env.CONFIGURATION_SET || 'default-monitoring-config',
    },
  };

  try {
    console.log('📧 Sending email...');
    console.log(`   From: ${mailOptions.from}`);
    console.log(`   To: ${mailOptions.to}`);
    console.log(`   Subject: ${mailOptions.subject}`);
    console.log(`   Config Set: ${mailOptions.headers['X-SES-CONFIGURATION-SET']}`);
    console.log('');

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Check the recipient inbox');
    console.log('  2. Open the email to trigger an OPEN event');
    console.log('  3. Click a link to trigger a CLICK event');
    console.log('  4. View events in CloudWatch metrics or VDM dashboard');
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    process.exit(1);
  }
}

sendEmail();
