# AWS Network Firewall Lab — CloudFormation Template

Template: `amazon-network-firewall.yaml`

This stack deploys a complete AWS Network Firewall lab environment:

- **VPC** with firewall subnets, public subnets, and private subnets (2 AZs)
- **AWS Network Firewall** with stateful managed rule groups (Threat Signatures, Domain Lists, Web Attacks)
- **NAT Gateway** for private subnet egress
- **Internet-facing ALB** + **EC2 instance** (Amazon Linux 2023) behind the firewall
- **CloudWatch alarm** for DroppedPackets (threshold > 50/5min)
- **S3 bucket** for firewall alert logs with logging configuration

## Deploy

```bash
aws cloudformation deploy \
  --stack-name nfw-lab \
  --template-file cloudformation/amazon-network-firewall.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides ProjectName=nfw-lab \
  --region ap-southeast-1
```

> **Note:** The template uses SSM parameter for the latest Amazon Linux 2023 AMI. Make sure your account has access to it.

## Outputs

After deploy, get key information:

```bash
aws cloudformation describe-stacks \
  --stack-name nfw-lab \
  --query "Stacks[0].Outputs" \
  --region ap-southeast-1 \
  --output table
```

| Output | Description |
|--------|-------------|
| `LabUrl` | URL to access the test application |
| `FirewallName` | Network Firewall name |
| `FirewallArn` | Network Firewall ARN |
| `FirewallPolicyArn` | Firewall Policy ARN |
| `LogBucketName` | S3 bucket for firewall logs |
| `AlertLogPrefix` | S3 prefix for alert logs (alert/) |
| `DroppedPacketsAlarmName` | CloudWatch alarm name |
| `AlbDnsName` | ALB DNS name |

## Test the Setup

### 1. Access the test application

```bash
LAB_URL=$(aws cloudformation describe-stacks \
  --stack-name nfw-lab \
  --query "Stacks[0].Outputs[?OutputKey=='LabUrl'].OutputValue" \
  --output text --region ap-southeast-1)

curl "$LAB_URL"
```

### 2. Check firewall metrics

```bash
FIREWALL_NAME=$(aws cloudformation describe-stacks \
  --stack-name nfw-lab \
  --query "Stacks[0].Outputs[?OutputKey=='FirewallName'].OutputValue" \
  --output text --region ap-southeast-1)

aws cloudwatch get-metric-statistics \
  --namespace AWS/NetworkFirewall \
  --metric-name DroppedPackets \
  --dimensions Name=FirewallName,Value=$FIREWALL_NAME Name=Engine,Value=Stateful \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 300 --statistics Sum \
  --region ap-southeast-1
```

### 3. View alert logs

```bash
LOG_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name nfw-lab \
  --query "Stacks[0].Outputs[?OutputKey=='LogBucketName'].OutputValue" \
  --output text --region ap-southeast-1)

aws s3 ls s3://$LOG_BUCKET/alert/ --recursive
```

## Architecture

```
Internet → ALB → [AWS Network Firewall] → EC2 (Private Subnet)
                   ↑
            Stateful Rule Groups:
            - ThreatSignatures-Exploits
            - DomainLists
            - ThreatSignatures-WebAttacks
                   ↓
            CloudWatch Alarm (DroppedPackets > 50/5min)
            S3 Alert Logs
```

## Cost

Approximate hourly cost for this lab (ap-southeast-1, USD):

| Resource | Estimated Cost |
|----------|---------------|
| Network Firewall | ~$0.395/hr |
| NAT Gateway | ~$0.045/hr |
| ALB | ~$0.025/hr |
| t3.nano EC2 | ~$0.005/hr |
| S3 + CloudWatch | negligible |
| **Total** | **~$0.47/hr** |

> Remember to clean up when finished to avoid ongoing charges.

## Cleanup

```bash
aws cloudformation delete-stack --stack-name nfw-lab --region ap-southeast-1

# The log bucket must be empty before stack deletion
LOG_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name nfw-lab \
  --query "Stacks[0].Outputs[?OutputKey=='LogBucketName'].OutputValue" \
  --output text --region ap-southeast-1 2>/dev/null || echo "")

if [ -n "$LOG_BUCKET" ]; then
  aws s3 rm s3://$LOG_BUCKET --recursive
fi
```

## See Also

- [Monitoring & Operations Lab Guide](https://github.com/rizkiprass/knowledge/tree/main/topics/amazon-network-firewall/02-lab-hands-on/)
- [AWS Network Firewall Documentation](https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html)
