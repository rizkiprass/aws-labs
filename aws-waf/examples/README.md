# AWS WAF Examples

Test scripts and Web ACL configurations for the AWS WAF lab.

## Files

| File | Description |
|---|---|
| `test-waf-attacks.sh` | Tests SQLi, XSS, admin path, path traversal, body size restrictions |
| `test-waf-ratelimit.sh` | Tests GET and POST rate-based rules with burst requests |
| `test-waf-mobile-block.sh` | Tests mobile/tablet User-Agent blocking + custom 403 response |
| `waf-lab-web-acl.json` | Example Web ACL configuration with all rules |
| `waf-lab-web-acl-update.json` | Example Web ACL update with modified rules |

## Usage

```bash
# Make scripts executable
chmod +x test-waf-*.sh

# Run attack payload tests
./test-waf-attacks.sh <ALB_DNS>

# Run rate limiting tests
./test-waf-ratelimit.sh <ALB_DNS>

# Run mobile/tablet block tests
./test-waf-mobile-block.sh <ALB_DNS>
```

## Prerequisites

- AWS CLI configured with appropriate profile
- Lab infrastructure deployed (see `../cloudformation/`)
- Web ACL created and associated with the ALB
- `curl` installed

## Expected Results

| Test | Expected HTTP Code | Rule Responsible |
|---|---|---|
| SQLi payload | 403 | AWSManagedRulesSQLiRuleSet |
| XSS payload | 403 | AWSManagedRulesCommonRuleSet |
| `/admin` path | 403 | AWSManagedRulesAdminProtectionRuleSet |
| Path traversal | 403 | AWSManagedRulesKnownBadInputsRuleSet |
| Large body (20KB) | 403 | AWSManagedRulesCommonRuleSet (SizeRestrictions) |
| Mobile User-Agent | 403 | Custom: BlockMobileAndTabletUserAgent |
| Normal GET / | 200 | — (passes WAF) |

## Debugging

After running tests, check sampled requests to verify which rule matched:

```bash
aws wafv2 get-sampled-requests \
  --web-acl-arn <WEB_ACL_ARN> \
  --rule-metric-name <METRIC_NAME> \
  --scope REGIONAL \
  --time-window StartTime=<UTC_START>,EndTime=<UTC_END> \
  --max-items 10 \
  --region <REGION> \
  --output json
```
