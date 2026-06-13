# Amazon SES — Code Examples & CloudFormation

Production-ready code and infrastructure for setting up Amazon SES with full tracking, alerts, and logging.

This lab corresponds to the [Amazon SES topic](https://github.com/rizkiprass/knowledge/tree/main/topics/amazon-ses) in the knowledge repo. See the [lab hands-on guide](https://github.com/rizkiprass/knowledge/blob/main/topics/amazon-ses/02-lab-hands-on/amazon-ses-lab.md) for detailed step-by-step instructions.

## What This Lab Deploys

- ✅ SES verified domain identity with Easy DKIM
- ✅ 3 configuration sets (default, transactional, marketing)
- ✅ CloudWatch event destinations for all config sets
- ✅ S3 bucket for event logging via Kinesis Firehose
- ✅ SNS topic for bounce/complaint alerts
- ✅ CloudWatch alarms for reputation monitoring
- ✅ Custom MAIL FROM domain support

## Quick Start (CloudFormation)

### 1. Deploy the stack

```bash
aws cloudformation create-stack \
  --stack-name amazon-ses \
  --template-body file://cloudformation/amazon-ses.yaml \
  --parameters \
    ParameterKey=DomainName,ParameterValue=yourdomain.com \
    ParameterKey=DmarcReportEmail,ParameterValue=dmarc@yourdomain.com \
    ParameterKey=S3LogBucketName,ParameterValue=your-ses-logs-bucket \
    ParameterKey=AlertEmail,ParameterValue=alerts@yourdomain.com \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### 2. Confirm SNS subscription

Check the email address you provided for `AlertEmail` and click the AWS confirmation link.

### 3. Add DNS records

After the stack is created:

1. Go to **SES Console** → **Verified identities** → your domain → **DKIM** to get the 3 CNAME records
2. Add them to your DNS provider
3. Wait for DKIM verification (usually 5-30 minutes)
4. If you set `MailFromSubdomain`, add the required MX and SPF records shown in the SES Console

### 4. Send a test email

```bash
# Use the example SMTP script
cd examples/smtp-example
npm install
cp .env.example .env
# Edit .env with your SMTP credentials
npm start
```

## Examples

The `examples/` folder contains working code sourced from the [Learn-SES](https://github.com/rizkiprass/Learn-SES) project:

- **`smtp-example/`** — Send via SMTP with Nodemailer (text, HTML, attachment)
- **`api-example/`** — Send via AWS SDK v3 (simple, HTML, templates, account info)
- **`full-app/`** — Express.js server with REST API + web UI
- **`bulk-email-example.js`** — Send to thousands via `SendBulkTemplatedEmailCommand`
- **`input-email-examples.js`** — Read recipients from CSV / JSON / TXT

See [`examples/README.md`](./examples/README.md) for full details.

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `DomainName` | The domain to verify in SES | (required) |
| `Environment` | Environment label (dev/staging/prod) | dev |
| `MailFromSubdomain` | Subdomain for custom MAIL FROM | bounce |
| `DmarcPolicy` | DMARC policy (none/quarantine/reject) | quarantine |
| `DmarcReportEmail` | Email to receive DMARC reports | (required) |
| `S3LogBucketName` | S3 bucket name for SES event logs | (required) |
| `AlertEmail` | Email to receive bounce/complaint alerts | (required) |
| `BounceRateThreshold` | Bounce rate alarm threshold | 0.05 (5%) |
| `ComplaintRateThreshold` | Complaint rate alarm threshold | 0.001 (0.1%) |

## Outputs

After deployment, the stack exports:
- `DomainIdentity` — SES verified domain
- `DefaultConfigSetName` — Default config set
- `TransactionalConfigSetName` — Transactional config set
- `MarketingConfigSetName` — Marketing config set
- `S3LogBucket` — S3 bucket for logs
- `FirehoseStreamName` — Kinesis Firehose stream name
- `AlertTopicArn` — SNS topic for alerts
- `MailFromDomain` — Custom MAIL FROM domain

## Cost

Approximate monthly cost for a typical workload (10,000 emails/month):
- SES sending: ~$1.00
- S3 storage: ~$0.10
- Kinesis Firehose: ~$0.50
- CloudWatch metrics/alarms: ~$0.50
- **Total: ~$2-5/month**

## Cleanup

```bash
# Empty and delete S3 bucket first
aws s3 rm s3://your-ses-logs-bucket --recursive
aws s3 rb s3://your-ses-logs-bucket

# Delete the CloudFormation stack
aws cloudformation delete-stack --stack-name amazon-ses
aws cloudformation wait stack-delete-complete --stack-name amazon-ses

# Remove DNS records
# Delete verified identity in SES Console
# Delete SMTP credentials in SES Console
```

## Related

- 📖 [Amazon SES hands-on lab guide](https://github.com/rizkiprass/knowledge/blob/main/topics/amazon-ses/02-lab-hands-on/amazon-ses-lab.md)
- 📝 [Medium blog post](https://github.com/rizkiprass/knowledge/blob/main/topics/amazon-ses/04-medium/amazon-ses-post.md)
- 💼 [LinkedIn post](https://github.com/rizkiprass/knowledge/blob/main/topics/amazon-ses/05-linkedin/amazon-ses-linkedin.md)
- 💻 [Original Learn-SES examples](https://github.com/rizkiprass/Learn-SES)
