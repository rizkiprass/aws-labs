#!/bin/bash
# Network Firewall Metrics Checker
# Usage: FIREWALL_NAME=nfw-lab-firewall ./check-metrics.sh
set -euo pipefail

FIREWALL_NAME="${FIREWALL_NAME:-nfw-lab-firewall}"
REGION="${AWS_REGION:-ap-southeast-1}"
END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
START_TIME=$(date -u -d '6 hours ago' +%Y-%m-%dT%H:%M:%SZ)

echo "================================================"
echo "Network Firewall: $FIREWALL_NAME"
echo "Region: $REGION"
echo "Period: $START_TIME → $END_TIME"
echo "================================================"

echo ""
echo "--- DroppedPackets (Stateful) ---"
aws cloudwatch get-metric-statistics \
  --namespace AWS/NetworkFirewall \
  --metric-name DroppedPackets \
  --dimensions Name=FirewallName,Value=$FIREWALL_NAME Name=Engine,Value=Stateful \
  --start-time "$START_TIME" --end-time "$END_TIME" \
  --period 300 --statistics Sum \
  --region $REGION --output json | jq -r '.Datapoints[] | "\(.Timestamp) → \(.Sum) dropped"' 2>/dev/null || echo "No datapoints"

echo ""
echo "--- DroppedPackets (Stateless) ---"
aws cloudwatch get-metric-statistics \
  --namespace AWS/NetworkFirewall \
  --metric-name DroppedPackets \
  --dimensions Name=FirewallName,Value=$FIREWALL_NAME Name=Engine,Value=Stateless \
  --start-time "$START_TIME" --end-time "$END_TIME" \
  --period 300 --statistics Sum \
  --region $REGION --output json | jq -r '.Datapoints[] | "\(.Timestamp) → \(.Sum) dropped"' 2>/dev/null || echo "No datapoints"

echo ""
echo "--- RejectedPackets (Stateful) ---"
aws cloudwatch get-metric-statistics \
  --namespace AWS/NetworkFirewall \
  --metric-name RejectedPackets \
  --dimensions Name=FirewallName,Value=$FIREWALL_NAME Name=Engine,Value=Stateful \
  --start-time "$START_TIME" --end-time "$END_TIME" \
  --period 300 --statistics Sum \
  --region $REGION --output json | jq -r '.Datapoints[] | "\(.Timestamp) → \(.Sum) rejected"' 2>/dev/null || echo "No datapoints (expected — managed rules use drop)"


echo ""
echo "--- Per-AZ DroppedPackets ---"
for AZ in $(aws ec2 describe-availability-zones --region $REGION --query 'AvailabilityZones[].ZoneName' --output text); do
  COUNT=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/NetworkFirewall \
    --metric-name DroppedPackets \
    --dimensions Name=FirewallName,Value=$FIREWALL_NAME Name=Engine,Value=Stateful Name=AvailabilityZone,Value=$AZ \
    --start-time "$START_TIME" --end-time "$END_TIME" \
    --period 300 --statistics Sum \
    --region $REGION --output json | jq '[.Datapoints[].Sum] | add // 0')
  echo "  $AZ: $COUNT dropped"
done

echo ""
echo "--- Alarm State ---"
ALARM_NAME="${FIREWALL_NAME%-firewall}-droppedpackets-5m"
aws cloudwatch describe-alarms \
  --alarm-names "$ALARM_NAME" \
  --region $REGION --output json | jq -r '.MetricAlarms[] | "\(.AlarmName): \(.StateValue)"' 2>/dev/null || echo "Alarm '$ALARM_NAME' not found"

echo ""
echo "Done."
