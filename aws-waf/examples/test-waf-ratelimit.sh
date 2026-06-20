#!/bin/bash
# ============================================
# AWS WAF Test Script — Rate Limiting
# Usage: ./test-waf-ratelimit.sh <ALB_DNS>
# ============================================

ALB_DNS="${1:?Usage: $0 <ALB_DNS>}"
BASE_URL="http://$ALB_DNS"

echo "⚡ AWS WAF Rate Limiting Tests"
echo "Target: $BASE_URL"
echo ""

# --- GET Rate Limit ---
echo "=== GET Rate Limit Burst (20 requests) ==="
echo "Sending 20 rapid GET requests..."
for i in $(seq 1 20); do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/")
  echo "  Request $i: $CODE"
done

echo ""
echo "=== POST Rate Limit Burst (20 requests) ==="
echo "Sending 20 rapid POST requests..."
for i in $(seq 1 20); do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST --data 'x=1' "$BASE_URL/upload")
  echo "  Request $i: $CODE"
done

echo ""
echo "✅ Rate limit tests complete."
echo "First few requests should be 200, then 403 once limit is exceeded."
echo "GET burst should NOT affect POST, and vice versa."
