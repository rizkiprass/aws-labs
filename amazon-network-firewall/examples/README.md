# Network Firewall Examples

Example scripts for testing and exploring AWS Network Firewall.

## Contents

| Script | Description |
|--------|-------------|
| `check-metrics.sh` | Query DroppedPackets and RejectedPackets metrics from CloudWatch |

## Prerequisites

- AWS CLI configured
- `jq` installed (`sudo dnf install -y jq`)
- Network Firewall deployed (see `cloudformation/`)

## Usage

```bash
# Set your firewall name
export FIREWALL_NAME="nfw-lab-firewall"
export AWS_REGION="ap-southeast-1"

# Run metrics check
./examples/check-metrics.sh
```
