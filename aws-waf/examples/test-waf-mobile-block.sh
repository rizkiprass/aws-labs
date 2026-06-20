#!/bin/bash
# ============================================
# AWS WAF Test Script — Mobile/Tablet Block
# Usage: ./test-waf-mobile-block.sh <ALB_DNS>
# ============================================

ALB_DNS="${1:?Usage: $0 <ALB_DNS>}"
BASE_URL="http://$ALB_DNS"

echo "📱 AWS WAF Mobile/Tablet Block Tests"
echo "Target: $BASE_URL"
echo ""

# --- iPhone ---
echo -n "iPhone User-Agent: "
curl -s -o /dev/null -w "%{http_code}" -A \
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1' \
  "$BASE_URL/"
echo " (expected: 403)"

# --- Android ---
echo -n "Android User-Agent: "
curl -s -o /dev/null -w "%{http_code}" -A \
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36' \
  "$BASE_URL/"
echo " (expected: 403)"

# --- iPad ---
echo -n "iPad User-Agent: "
curl -s -o /dev/null -w "%{http_code}" -A \
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1' \
  "$BASE_URL/"
echo " (expected: 403)"

# --- Desktop Chrome ---
echo -n "Desktop Chrome: "
curl -s -o /dev/null -w "%{http_code}" -A \
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' \
  "$BASE_URL/"
echo " (expected: 200)"

# --- Desktop Firefox ---
echo -n "Desktop Firefox: "
curl -s -o /dev/null -w "%{http_code}" -A \
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0' \
  "$BASE_URL/"
echo " (expected: 200)"

# --- Custom 403 body check ---
echo ""
echo "=== Custom 403 Body Check ==="
echo "iPhone response headers + body:"
curl -s -i -A \
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1' \
  "$BASE_URL/" | head -20

echo ""
echo "✅ Mobile block tests complete."
echo "Tip: Check 'Desktop site' mode on mobile bypasses this rule (User-Agent changes)."
