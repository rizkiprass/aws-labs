# 🚀 Getting Started with Amazon SES

A complete guide to getting started with Amazon Simple Email Service from scratch.

## 1. Create/Login to AWS Account

1. Open [AWS Console](https://aws.amazon.com/console/)
2. Sign in or create a new account
3. Make sure billing is active

---

## 2. Enable Amazon SES

### Choose a Region
Amazon SES is available in several regions. Choose the closest one:

| Region | Endpoint |
|--------|----------|
| US East (N. Virginia) | `email.us-east-1.amazonaws.com` |
| US West (Oregon) | `email.us-west-2.amazonaws.com` |
| EU (Ireland) | `email.eu-west-1.amazonaws.com` |
| Asia Pacific (Singapore) | `email.ap-southeast-1.amazonaws.com` |
| Asia Pacific (Tokyo) | `email.ap-northeast-1.amazonaws.com` |

### Steps:
1. Open [Amazon SES Console](https://console.aws.amazon.com/ses/)
2. Select your region in the top-right corner
3. SES will be automatically enabled

---

## 3. Verify Email Address

> ⚠️ **Sandbox Mode**: In sandbox, you can only send FROM and TO verified addresses.

### Verify Sender Email:
1. SES Console → **Verified identities**
2. Click **Create identity**
3. Select **Email address**
4. Enter your email
5. Click **Create identity**
6. Check your inbox and click the verification link

### Verify Recipient Email (for testing):
Repeat the steps above for the recipient email.

---

## 4. Create an IAM User for API Access

### Steps:
1. Open [IAM Console](https://console.aws.amazon.com/iam/)
2. Users → **Create user**
3. Name: `ses-user`
4. Select **Attach policies directly**
5. Search and select: `AmazonSESFullAccess`
6. Create user
7. Open the user → **Security credentials**
8. **Create access key** → select "Application running outside AWS"
9. **Save the Access Key ID and Secret Access Key!**

---

## 5. Create SMTP Credentials (for SMTP)

### Steps:
1. SES Console → **SMTP settings**
2. Click **Create SMTP credentials**
3. IAM User Name: `ses-smtp-user`
4. Click **Create**
5. **Download credentials** or copy the SMTP username & password

> ⚠️ The SMTP password is different from the IAM Secret Access Key!

---

## 6. Test Sending Email (Console)

Before coding, test via the console:

1. SES Console → **Verified identities**
2. Click the verified email
3. Click **Send test email**
4. Fill in:
   - **From**: your email (verified)
   - **To**: recipient email (verified in sandbox)
   - **Subject**: Test
   - **Body**: Hello from SES!
5. Click **Send test email**
6. Check the recipient's inbox

---

## 7. Request Production Access (Optional)

To exit sandbox mode:

1. SES Console → **Account dashboard**
2. Click **Request production access**
3. Fill in the form:
   - **Mail type**: Transactional / Marketing
   - **Website URL**: your application URL
   - **Use case description**: Describe your use case
4. Submit and wait for approval (usually 24-48 hours)

---

## ✅ Checklist Before Continuing

- [ ] AWS Account active
- [ ] SES enabled in chosen region
- [ ] Sender email verified
- [ ] Recipient email verified (for sandbox)
- [ ] IAM User with access key (for API)
- [ ] SMTP credentials (for SMTP)

---

## 📌 Tips

1. **Store credentials securely** - Don't commit to Git!
2. **Use .env files** - To store credentials
3. **Test in sandbox first** - Before requesting production access
4. **Monitor bounces & complaints** - To maintain reputation

---

**Next:** [SMTP Guide →](./02-smtp-guide.md)
