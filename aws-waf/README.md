# AWS WAF Lab

AWS WAF (Web Application Firewall) lab environment with CloudFormation infrastructure and WAF rule testing examples.

## What's Inside

- **CloudFormation template** — deploys VPC, public ALB, private EC2 with dummy web app, SSM endpoints
- **Test scripts** — SQLi, XSS, admin path, rate limiting, mobile block, body size tests
- **Web ACL configs** — example JSON configurations with custom + managed rules

## Architecture

```
Internet → ALB (HTTP:80) → WAF Web ACL → EC2 (private, port 8080)
                                ↓
                    Rules evaluated by priority:
                    0. AWSManagedRulesAntiDDoSRuleSet
                    1. BlockMobileAndTabletUserAgent (custom)
                    2. IPV4 Allow
                    3. IPV6 Allow
                    5. Geo Block (CU, IR, KP, RU, SY, VE)
                    10-12. Rate-based rules (global, GET, POST)
                    20+. Managed rule groups (SQLi, XSS, admin, etc.)
```

## Quick Start

### 1. Deploy Infrastructure

```bash
aws cloudformation deploy \
  --stack-name waf-lab \
  --template-file cloudformation/waf-lab-infra.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides ProjectName=waf-lab \
  --region ap-southeast-3
```

### 2. Create Web ACL (Manual)

The CloudFormation template does NOT create WAF resources — create them manually:

```bash
aws wafv2 create-web-acl \
  --name waf-lab \
  --scope REGIONAL \
  --default-action Allow={} \
  --region ap-southeast-3
```

### 3. Test WAF Rules

```bash
# Get ALB DNS
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --query 'LoadBalancers[?starts_with(LoadBalancerName, `waf-`)].DNSName' \
  --output text --region ap-southeast-3)

# Run tests
cd examples
chmod +x test-waf-*.sh
./test-waf-attacks.sh $ALB_DNS
./test-waf-ratelimit.sh $ALB_DNS
./test-waf-mobile-block.sh $ALB_DNS
```

## Files

```
aws-waf/
├── README.md                          ← You are here
├── cloudformation/
│   ├── README.md                      ← Deploy guide
│   └── waf-lab-infra.yaml             ← CFN template (VPC + ALB + EC2)
└── examples/
    ├── README.md                      ← Examples guide
    ├── test-waf-attacks.sh            ← SQLi, XSS, admin, path traversal tests
    ├── test-waf-ratelimit.sh          ← Rate limiting burst tests
    ├── test-waf-mobile-block.sh       ← Mobile/tablet User-Agent block tests
    ├── waf-lab-web-acl.json           ← Example Web ACL config
    └── waf-lab-web-acl-update.json    ← Example Web ACL update config
```

## Key Concepts

- **Rule Priority**: Lower number = evaluated first. Allow/Block stops evaluation.
- **Count Action**: Records match but continues evaluation — use for testing.
- **Managed Rule Groups**: Pre-configured AWS rules (SQLi, XSS, bot control, etc.)
- **Labels**: Internal tags for rule chaining — detect in one rule, enforce in another.
- **Custom Response**: Show custom HTML instead of empty 403.
- **Sampled Requests**: WAF stores up to 100 samples per rule for debugging.

## Related

- 📝 Knowledge repo: [rizkiprass/knowledge](https://github.com/rizkiprass/knowledge) — lab guide, Medium post, LinkedIn post
- 📖 Lab hands-on: [topics/aws-waf/02-lab-hands-on/aws-waf-lab.md](https://github.com/rizkiprass/knowledge/blob/main/topics/aws-waf/02-lab-hands-on/aws-waf-lab.md)

## Cleanup

```bash
# Disassociate Web ACL
aws wafv2 disassociate-web-acl --resource-arn <ALB_ARN> --region ap-southeast-3

# Delete Web ACL
aws wafv2 delete-web-acl --name waf-lab --id <ACL_ID> --lock-token <LOCK_TOKEN> \
  --scope REGIONAL --region ap-southeast-3

# Delete stack
aws cloudformation delete-stack --stack-name waf-lab --region ap-southeast-3
```

## Cost

- EC2 t3.micro: ~$0.01/hour (free tier eligible)
- ALB: ~$0.025/hour + $0.008/GB processed
- WAF: $5/month per ACL + $1/million requests
- SSM: Free for Session Manager
- **Estimated lab cost: <$5 for a full day of testing**
