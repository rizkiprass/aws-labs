# 🔌 API Guide - Amazon SES with AWS SDK

A guide to using Amazon SES via AWS SDK v3 for Node.js.

## 📦 Installation

```bash
npm install @aws-sdk/client-ses
```

---

## 🔐 Credentials Configuration

### Option 1: Environment Variables
```env
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
```

### Option 2: Credentials File
```
~/.aws/credentials

[default]
aws_access_key_id = AKIAXXXXXXXXXXXXXXXX
aws_secret_access_key = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Option 3: Explicit Configuration
```javascript
import { SESClient } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
```

---

## 📧 SendEmail - Basic

```javascript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: "us-east-1" });

async function sendEmail() {
  const params = {
    Source: "sender@verified-domain.com",
    Destination: {
      ToAddresses: ["recipient@email.com"],
      CcAddresses: [],
      BccAddresses: []
    },
    Message: {
      Subject: {
        Data: "Hello from SES!",
        Charset: "UTF-8"
      },
      Body: {
        Text: {
          Data: "This is plain text content",
          Charset: "UTF-8"
        },
        Html: {
          Data: "<h1>Hello!</h1><p>This is HTML content</p>",
          Charset: "UTF-8"
        }
      }
    }
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log("Email sent! Message ID:", response.MessageId);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
```

---

## 📨 SendRawEmail - Advanced

For emails with attachments or custom headers:

```javascript
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { createMimeMessage } from 'mimetext';

const sesClient = new SESClient({ region: "us-east-1" });

async function sendRawEmail() {
  // Build MIME message
  const msg = createMimeMessage();
  msg.setSender({ name: 'Sender', addr: 'sender@domain.com' });
  msg.setRecipient('recipient@email.com');
  msg.setSubject('Email with Attachment');
  msg.addMessage({
    contentType: 'text/html',
    data: '<h1>Hello!</h1><p>See attachment</p>'
  });
  msg.addAttachment({
    filename: 'document.pdf',
    contentType: 'application/pdf',
    data: Buffer.from(pdfContent).toString('base64')
  });

  const params = {
    RawMessage: {
      Data: Buffer.from(msg.asRaw())
    }
  };

  const command = new SendRawEmailCommand(params);
  const response = await sesClient.send(command);
  return response;
}
```

---

## 📋 SendTemplatedEmail

### 1. Create a Template in SES

```javascript
import { SESClient, CreateTemplateCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: "us-east-1" });

async function createTemplate() {
  const params = {
    Template: {
      TemplateName: "WelcomeTemplate",
      SubjectPart: "Welcome, {{name}}!",
      HtmlPart: `
        <html>
          <body>
            <h1>Welcome, {{name}}!</h1>
            <p>Thank you for joining {{company}}.</p>
            <a href="{{actionUrl}}">Get Started</a>
          </body>
        </html>
      `,
      TextPart: "Welcome, {{name}}! Thank you for joining {{company}}."
    }
  };

  const command = new CreateTemplateCommand(params);
  await sesClient.send(command);
}
```

### 2. Send with Template

```javascript
import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

async function sendTemplatedEmail() {
  const params = {
    Source: "noreply@domain.com",
    Destination: {
      ToAddresses: ["user@email.com"]
    },
    Template: "WelcomeTemplate",
    TemplateData: JSON.stringify({
      name: "John Doe",
      company: "Acme Inc",
      actionUrl: "https://example.com/start"
    })
  };

  const command = new SendTemplatedEmailCommand(params);
  const response = await sesClient.send(command);
  return response;
}
```

---

## 📤 SendBulkTemplatedEmail

Send to many recipients with a single API call:

```javascript
import { SESClient, SendBulkTemplatedEmailCommand } from "@aws-sdk/client-ses";

async function sendBulkEmail() {
  const params = {
    Source: "noreply@domain.com",
    Template: "WelcomeTemplate",
    DefaultTemplateData: JSON.stringify({
      company: "Acme Inc",
      actionUrl: "https://example.com"
    }),
    Destinations: [
      {
        Destination: { ToAddresses: ["user1@email.com"] },
        ReplacementTemplateData: JSON.stringify({ name: "User 1" })
      },
      {
        Destination: { ToAddresses: ["user2@email.com"] },
        ReplacementTemplateData: JSON.stringify({ name: "User 2" })
      },
      {
        Destination: { ToAddresses: ["user3@email.com"] },
        ReplacementTemplateData: JSON.stringify({ name: "User 3" })
      }
    ]
  };

  const command = new SendBulkTemplatedEmailCommand(params);
  const response = await sesClient.send(command);
  return response;
}
```

---

## 📊 Error Handling

```javascript
import { SESServiceException } from "@aws-sdk/client-ses";

async function sendEmailSafe(params) {
  try {
    const command = new SendEmailCommand(params);
    return await sesClient.send(command);
  } catch (error) {
    if (error instanceof SESServiceException) {
      switch (error.name) {
        case 'MessageRejected':
          console.error('Email rejected:', error.message);
          break;
        case 'MailFromDomainNotVerifiedException':
          console.error('Domain not verified');
          break;
        case 'ConfigurationSetDoesNotExistException':
          console.error('Configuration set not found');
          break;
        case 'AccountSendingPausedException':
          console.error('Sending paused - check reputation');
          break;
        default:
          console.error('SES Error:', error.name, error.message);
      }
    }
    throw error;
  }
}
```

---

## 🔄 Rate Limiting & Retries

```javascript
async function sendWithRetry(params, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sesClient.send(new SendEmailCommand(params));
    } catch (error) {
      const isRetryable = 
        error.name === 'Throttling' || 
        error.name === 'ServiceUnavailable';
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 100;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

---

## 📈 Monitoring & Metrics

### Get Send Statistics

```javascript
import { SESClient, GetSendStatisticsCommand } from "@aws-sdk/client-ses";

async function getStats() {
  const command = new GetSendStatisticsCommand({});
  const response = await sesClient.send(command);
  
  // Returns last 2 weeks of data
  console.log(response.SendDataPoints);
  // { Timestamp, DeliveryAttempts, Bounces, Complaints, Rejects }
}
```

### Get Send Quota

```javascript
import { SESClient, GetSendQuotaCommand } from "@aws-sdk/client-ses";

async function getQuota() {
  const command = new GetSendQuotaCommand({});
  const response = await sesClient.send(command);
  
  console.log('Max 24hr:', response.Max24HourSend);
  console.log('Sent 24hr:', response.SentLast24Hours);
  console.log('Max per second:', response.MaxSendRate);
}
```

---

**← [SMTP Guide](./02-smtp-guide.md)** | **[Back to README](../README.md)**
