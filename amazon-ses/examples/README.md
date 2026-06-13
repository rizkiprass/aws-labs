# Amazon SES Code Examples

Code examples demonstrating how to use Amazon SES via SMTP, API, and as part of a full application. Adapted from the [Learn-SES](https://github.com/rizkiprass/Learn-SES) learning project.

## Structure

```
examples/
├── smtp-example/          # Send via SMTP with Nodemailer
│   ├── index.js           # 4 examples: text, HTML, attachment, connection verify
│   ├── .env.example
│   └── package.json
│
├── api-example/           # Send via AWS SDK v3
│   ├── index.js           # 4 examples: simple, HTML, template, account info
│   ├── .env.example
│   └── package.json
│
├── full-app/              # Express.js app with email service
│   ├── src/
│   │   ├── services/emailService.js   # Reusable email service class
│   │   ├── routes/emailRoutes.js      # REST API endpoints
│   │   ├── templates/index.js         # Email templates
│   │   └── index.js                   # App entry point
│   ├── public/index.html              # Simple web UI
│   ├── .env.example
│   └── package.json
│
├── bulk-email-example.js  # Bulk email: batch, parallel queue, DB-driven
├── input-email-examples.js # Loading recipients from various sources
│
├── emails.csv             # Sample email list (CSV)
├── emails.json            # Sample email list (JSON)
├── emails.txt             # Sample email list (TXT)
│
└── docs/
    ├── 01-getting-started.md
    ├── 02-smtp-guide.md
    └── 03-api-guide.md
```

## Quick Start

### 1. SMTP Example (Recommended for beginners)

```bash
cd smtp-example
npm install
cp .env.example .env
# Edit .env with your SES SMTP credentials
node index.js
```

Sends 3 sample emails: text, HTML with styled template, and email with attachments.

### 2. API Example (AWS SDK v3)

```bash
cd api-example
npm install
cp .env.example .env
# Edit .env with your AWS credentials (IAM user with SES permissions)
node index.js
```

Sends 4 sample emails: simple, HTML, templated, and shows account stats.

### 3. Full App (Express + UI)

```bash
cd full-app
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
# Open http://localhost:3000
```

Provides a web UI and REST API for sending emails.

### 4. Bulk Email

```bash
# Requires AWS credentials configured (via .env or IAM role)
node bulk-email-example.js
```

Demonstrates 3 methods for sending bulk emails:
- Method 1: Simple batching (50 per call)
- Method 2: Parallel processing with queue (5 concurrent)
- Method 3: Database-driven with retry logic

## Prerequisites

- Node.js 18+
- AWS account with SES enabled
- For sandbox mode: verified email addresses for both sender and recipient
- For production mode: [request production access](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html)

## AWS Credentials

### For SMTP

Create SMTP credentials in the SES Console:
1. Open [AWS SES Console](https://console.aws.amazon.com/ses/)
2. **SMTP Settings** → **Create SMTP Credentials**
3. Save the username and password to your `.env` file

### For API

Create an IAM User with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "ses:SendEmail",
      "ses:SendRawEmail",
      "ses:SendTemplatedEmail",
      "ses:SendBulkTemplatedEmail",
      "ses:CreateTemplate",
      "ses:GetTemplate",
      "ses:ListTemplates",
      "ses:DeleteTemplate",
      "ses:GetSendQuota",
      "ses:GetSendStatistics",
      "ses:ListIdentities"
    ],
    "Resource": "*"
  }]
}
```

## Sandbox vs Production

By default, SES accounts start in **sandbox mode**:
- ✅ Can only send to verified email addresses
- ✅ Maximum 200 emails per 24 hours
- ✅ Maximum 1 email per second

For production access, see: https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html

## Documentation

See [`docs/`](./docs/) for detailed guides:
- [Getting Started](./docs/01-getting-started.md)
- [SMTP Guide](./docs/02-smtp-guide.md)
- [API Guide](./docs/03-api-guide.md)

## License

MIT — Adapted from [rizkiprass/Learn-SES](https://github.com/rizkiprass/Learn-SES)
