# 📧 SMTP Guide - Amazon SES

A guide to using Amazon SES via SMTP (Simple Mail Transfer Protocol).

## 🌐 SMTP Endpoints

| Region | Endpoint |
|--------|----------|
| US East (N. Virginia) | `email-smtp.us-east-1.amazonaws.com` |
| US West (Oregon) | `email-smtp.us-west-2.amazonaws.com` |
| EU (Ireland) | `email-smtp.eu-west-1.amazonaws.com` |
| Asia Pacific (Singapore) | `email-smtp.ap-southeast-1.amazonaws.com` |
| Asia Pacific (Tokyo) | `email-smtp.ap-northeast-1.amazonaws.com` |

## 🔌 Ports

| Port | Protocol | Use Case |
|------|----------|----------|
| **587** | STARTTLS | ✅ Recommended |
| **465** | TLS Wrapper | Legacy support |
| **25** | SMTP | ⚠️ Often blocked by ISPs |
| **2587** | STARTTLS | Alternative |

---

## 🔐 SMTP Credentials

### How to Create:
1. Open [SES Console](https://console.aws.amazon.com/ses/)
2. Navigate to: **SMTP settings**
3. Click **Create SMTP credentials**
4. Give the IAM user a name (default: `ses-smtp-user.xxxxxxxx`)
5. Click **Create**
6. **Download or copy the credentials**

### Credential Format:
```
SMTP Username: AKIAXXXXXXXXXXXXXXXX
SMTP Password: BHXXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **Important**: The SMTP password is different from the IAM Secret Access Key!

---

## 📝 Configuration with Nodemailer

### Install Nodemailer:
```bash
npm install nodemailer
```

### Basic Configuration:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});
```

### Send Email:
```javascript
const mailOptions = {
  from: '"Sender Name" <verified@email.com>',
  to: 'recipient@email.com',
  subject: 'Hello from SES!',
  text: 'This is plain text',
  html: '<h1>Hello!</h1><p>This is HTML content</p>'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.messageId);
  }
});
```

---

## 📎 Send with Attachment

```javascript
const mailOptions = {
  from: '"Sender" <verified@email.com>',
  to: 'recipient@email.com',
  subject: 'Email with Attachment',
  text: 'Please see the attached file',
  attachments: [
    {
      filename: 'report.pdf',
      path: './files/report.pdf'
    },
    {
      filename: 'image.png',
      content: Buffer.from('base64content', 'base64')
    }
  ]
};
```

---

## 🎨 Send HTML Email

```javascript
const mailOptions = {
  from: '"Company" <noreply@company.com>',
  to: 'user@email.com',
  subject: 'Welcome!',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #4F46E5; color: white; padding: 20px; }
        .content { padding: 20px; }
        .button { 
          background: #4F46E5; 
          color: white; 
          padding: 10px 20px; 
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome!</h1>
        </div>
        <div class="content">
          <p>Thank you for joining us!</p>
          <a href="https://example.com" class="button">Get Started</a>
        </div>
      </div>
    </body>
    </html>
  `
};
```

---

## 🔧 Environment Variables (.env)

```env
# SMTP Configuration
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password

# Email Settings
EMAIL_FROM=noreply@yourdomain.com
```

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `535 Authentication failed` | Wrong credentials | Regenerate SMTP credentials |
| `554 Message rejected` | Unverified email | Verify sender email in SES |
| `Connection timeout` | Port blocked | Try port 587 or 2587 |
| `Throttling` | Rate limit | Implement retry with backoff |

---

## 🔄 Retry Logic

```javascript
async function sendEmailWithRetry(mailOptions, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

---

**← [Getting Started](./01-getting-started.md)** | **[API Guide →](./03-api-guide.md)**
