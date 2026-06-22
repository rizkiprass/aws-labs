# AWS Network Firewall Lab

CloudFormation template and examples for deploying and monitoring AWS Network Firewall.

This repo is part of the [rizkiprass/aws-labs](https://github.com/rizkiprass/aws-labs) collection.

## Contents

- **`cloudformation/`** — Deploy a Network Firewall with VPC, ALB, EC2, CloudWatch alarms, and S3 logging
- **`examples/`** — Scripts for checking firewall metrics and inspecting alert logs

## Quick Start

```bash
# 1. Deploy the lab environment
aws cloudformation deploy \
  --stack-name nfw-lab \
  --template-file cloudformation/amazon-network-firewall.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides ProjectName=nfw-lab

# 2. Get the lab URL
aws cloudformation describe-stacks \
  --stack-name nfw-lab \
  --query "Stacks[0].Outputs[?OutputKey=='LabUrl'].OutputValue" \
  --output text

# 3. Test the application
curl http://<alb-dns-name>

# 4. Check firewall metrics
export FIREWALL_NAME=nfw-lab-firewall
./examples/check-metrics.sh
```

## Architecture

```
Internet → ALB → [AWS Network Firewall] → EC2 (Private Subnet)
                   ↓
            CloudWatch Alarm (DroppedPackets)
            S3 Alert Logs
```

## Key Features

- **Stateful inspection** with AWS managed rule groups (ThreatSignatures, DomainLists)
- **CloudWatch monitoring** with pre-configured DroppedPackets alarm
- **S3 alert logging** for detailed packet investigation
- **Test application** behind the firewall to generate real traffic

## Cost

~$0.47/hr (Network Firewall + NAT Gateway + ALB + t3.nano EC2). Clean up when done.

## Cleanup

```bash
aws cloudformation delete-stack --stack-name nfw-lab
```

## See Also

- [Monitoring & Operations Lab Guide](https://github.com/rizkiprass/knowledge/tree/main/topics/amazon-network-firewall/02-lab-hands-on/) — Step-by-step lab for metrics, alarms, and rule inspection
- [Medium: AWS Network Firewall Monitoring Deep Dive](https://medium.com/@rizkiprass) — Blog post with best practices
