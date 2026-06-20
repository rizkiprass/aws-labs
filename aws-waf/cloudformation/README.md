# AWS WAF Lab CloudFormation

Template: `waf-lab-infra.yaml`

This stack creates the base infrastructure for a low-cost WAF lab:

- VPC with two public subnets and two private subnets
- Internet-facing public Application Load Balancer
- Private EC2 instance with no public IP
- Dummy Python web app on port `8080`
- SSM interface endpoints for Session Manager access

This template intentionally does not create any AWS WAF resources. Create and associate the WebACL manually later when you are ready to test WAF rules.

## Deploy

```bash
aws cloudformation deploy \
  --stack-name waf-lab \
  --template-file cloudformation/waf-lab-infra.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides ProjectName=waf-lab
```

## Outputs

After deploy, get the public lab URL:

```bash
aws cloudformation describe-stacks \
  --stack-name waf-lab \
  --query "Stacks[0].Outputs[?OutputKey=='LabAppUrl'].OutputValue" \
  --output text
```

## Test Endpoints

Replace `$URL` with the `LabAppUrl` output.

```bash
curl "$URL"
curl "$URL/admin"
curl "$URL/search?q=' OR 1=1--"
curl "$URL/xss?input=<script>alert(1)</script>"
curl "$URL/path-traversal?file=../../etc/passwd"
curl "$URL/ratelimit"
curl -X POST "$URL/upload" --data-binary @/etc/hosts
curl -X POST "$URL/login" -d "username=admin&password=password"
```

## Suggested WAF Rules To Create Later

After this stack is deployed, you can manually create a regional WebACL and associate it with the ALB output by this stack. Useful rules to test:

- URI path rule for `/admin`
- Method and path rule for `POST /upload`
- Query string rule for `../`
- Rate-based rule scoped to `/ratelimit`

Managed rule groups:

- `AWSManagedRulesSQLiRuleSet`
- `AWSManagedRulesKnownBadInputsRuleSet`
- `AWSManagedRulesCommonRuleSet`

## Notes

- The app intentionally reflects request input for WAF testing. Do not use it as a production app.
- The ALB is HTTP-only for lab simplicity.
- The EC2 instance is private. Use AWS Systems Manager Session Manager if shell access is needed.
- There is no NAT Gateway. The app uses Python standard library only, so it does not need package downloads during boot.
