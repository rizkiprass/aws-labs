/**
 * Amazon SES SMTP Bulk Send Example
 *
 * Sends emails to a list of recipients from a JSON file.
 * Useful for marketing campaigns or bulk notifications.
 *
 * Prerequisites:
 *   1. Get SMTP credentials from SES Console
 *   2. Verify your sender domain
 *   3. Account must be in production mode (not sandbox)
 *   4. Create recipients.json with the recipient list
 *
 * Usage:
 *   npm install
 *   node smtp-bulk-send.js
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();

// Validate required env vars
const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

const RECIPIENTS_FILE = process.env.RECIPIENTS_FILE || 'recipients.json';

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email to a single recipient with delay to respect rate limits
 */
async function sendToRecipient(recipient, configSet) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: recipient.email,
    subject: recipient.subject || 'Newsletter from ' + process.env.FROM_EMAIL,
    text: recipient.text || 'This is a test newsletter from Amazon SES.',
    html: recipient.html || `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Hello ${recipient.name || 'there'}!</h1>
          <p>This is a personalized email sent via SES bulk send.</p>
          <p><a href="https://aws.amazon.com/ses/">Learn more about SES</a></p>
        </body>
      </html>
    `,
    headers: {
      'X-SES-CONFIGURATION-SET': configSet,
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Sent to ${recipient.email} — ${info.messageId}`);
    return { email: recipient.email, success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send to ${recipient.email}: ${error.message}`);
    return { email: recipient.email, success: false, error: error.message };
  }
}

/**
 * Main: send to all recipients with rate limiting
 */
async function sendBulk() {
  if (!fs.existsSync(RECIPIENTS_FILE)) {
    console.error(`❌ Recipients file not found: ${RECIPIENTS_FILE}`);
    console.error('Create a recipients.json file:');
    console.error(JSON.stringify({
      recipients: [
        { email: 'user1@example.com', name: 'Alice', subject: 'Hi Alice' },
        { email: 'user2@example.com', name: 'Bob', subject: 'Hi Bob' }
      ]
    }, null, 2));
    process.exit(1);
  }

  const { recipients } = JSON.parse(fs.readFileSync(RECIPIENTS_FILE, 'utf8'));
  const configSet = process.env.CONFIGURATION_SET || 'marketing-config';

  // Rate limiting: SES sandbox = 1/sec, production = check your quota
  const delayMs = parseInt(process.env.DELAY_MS || '200', 10);

  console.log(`📧 Sending bulk email to ${recipients.length} recipients`);
  console.log(`   From: ${process.env.FROM_EMAIL}`);
  console.log(`   Config Set: ${configSet}`);
  console.log(`   Delay between sends: ${delayMs}ms`);
  console.log('');

  const results = [];
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    console.log(`[${i + 1}/${recipients.length}] Sending to ${recipient.email}...`);
    const result = await sendToRecipient(recipient, configSet);
    results.push(result);

    // Rate limiting delay
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Summary
  const success = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Total: ${results.length}`);
  console.log(`   Success: ${success}`);
  console.log(`   Failed: ${failed}`);

  if (failed > 0) {
    console.log('');
    console.log('Failed recipients:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.email}: ${r.error}`);
    });
  }
}

sendBulk().catch(console.error);
