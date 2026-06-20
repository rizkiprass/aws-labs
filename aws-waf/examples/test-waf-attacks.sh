#!/bin/bash
# ============================================
# AWS WAF Test Script — Attack Payloads
# Usage: ./test-waf-attacks.sh <ALB_DNS>
# ====================================

ALB_DNS="${1:?Usage: $0 <ALB_DNS>}"
BASE_URL="http://$ALB_DNS"

echo "🔥 AWS WAF Attack Payload Tests"
echo "Target: $BASE_URL"
echo ""

# --- SQL Injection ---
echo "=== SQL Injection ==="
echo -n "Payload: /api/users?id=1 OR 1=1 → "
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users?id=1%20OR%201=1"
echo ""

echo -n "Payload: /search?q=' UNION SELECT 1,2,3-- → "
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/search?q=%27%20UNION%20SELECT%201,2,3--"
echo ""

# --- XSS ---
echo ""
echo "=== XSS ==="
echo -n "Payload: /xss?input=<script>alert(1)</script> → "
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/xss?input=%3Cscript%3Ealert(1)%3C/script%3E"
echo ""

# --- Admin Path ---
echo ""
echo "=== Admin Protection ==="
echo -n "Path: /admin → "
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin"
echo ""

# --- Path Traversal ---
echo ""
echo "=== Path Traversal ==="
echo -n "Payload: /path-traversal?file=../../etc/passwd → "
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/path-traversal?file=../../etc/passwd"
echo ""

# --- Body Size ---
echo ""
echo "=== Body Size Restriction ==="
echo -n "Small body (3 bytes): "
curl -s -o /dev/null -w "%{http_code}" -X PATCH --data 'x=1' "$BASE_URL/upload"
echo ""

echo -n "Large body (20KB): "
head -c 20000 /dev/zero | tr '\0' 'A' | curl -s -o /dev/null -w "%{http_code}" -X PATCH --data-binary @- "$BASE_URL/upload"
echo ""

# --- Normal Request ---
echo ""
echo "=== Baseline ==="
echo -n "Normal GET /: "
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/"
echo ""

echo ""
echo "✅ Tests complete. Expected: 403 for attacks, 200 for baseline."
echo "Use 'aws wafv2 get-sampled-requests' to verify which rule matched."
