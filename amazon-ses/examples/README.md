# Amazon SES — Code Examples

Working code examples for sending email via Amazon SES, sourced from the [Learn-SES](https://github.com/rizkiprass/Learn-SES) learning project.

## Examples

| Example | Description | Run |
|---------|-------------|-----|
| [`smtp-example/`](./smtp-example/) | Send emails via SMTP with Nodemailer (text, HTML, attachment) | `cd smtp-example && npm install && npm start` |
| [`api-example/`](./api-example/) | Send emails via AWS SDK v3 (simple, HTML, templates) | `cd api-example && npm install && npm start` |
| [`full-app/`](./full-app/) | Express.js server with REST API + web UI for email operations | `cd full-app && npm install && npm run dev` |
| [`bulk-email-example.js`](./bulk-email-example.js) | Send to thousands via `SendBulkTemplatedEmailCommand` | _(set env, then `node bulk-email-example.js`)_ |
| [`input-email-examples.js`](./input-email-examples.js) | Read recipients from CSV / JSON / TXT | `node input-email-examples.js` |

## Sample data

- [`emails.csv`](./emails.csv) — sample CSV
- [`emails.json`](./emails.json) — sample JSON
- [`emails.txt`](./emails.txt) — sample TXT (one email per line)

## Quick start (SMTP)

```bash
cd smtp-example
npm install
cp .env.example .env
# Edit .env: set SMTP_USERNAME, SMTP_PASSWORD, EMAIL_FROM, EMAIL_TO
npm start
```

SMTP credentials are different from AWS access keys. Create them at:
**SES Console → SMTP Settings → Create SMTP Credentials**

## Quick start (API)

```bash
cd api-example
npm install
cp .env.example .env
# Edit .env: set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
# The IAM user needs ses:SendEmail, ses:SendRawEmail, ses:SendTemplatedEmail
npm start
```

## Quick start (Full App)

```bash
cd full-app
npm install
cp .env.example .env
# Edit .env with your AWS credentials
npm run dev
# Open http://localhost:3000
```

The full app exposes:
- `POST /api/email/send` — send simple email
- `POST /api/email/send-templated` — send templated email
- `POST /api/email/send-bulk` — send bulk templated email
- `POST /api/email/templates` — create a template
- `GET  /api/email/templates` — list templates
- `GET  /api/email/quota` — get send quota

## Sandbox vs Production

By default, new SES accounts are in **sandbox mode**:
- ✅ Can only send to verified email addresses
- ✅ Max 200 emails per 24 hours
- ✅ Max 1 email per second

Request production access from the SES Console to send to anyone.

## License

MIT — see [Learn-SES](https://github.com/rizkiprass/Learn-SES) original repo.
