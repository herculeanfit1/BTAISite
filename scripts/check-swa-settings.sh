#!/usr/bin/env bash
# Diff the live Static Web App's application settings against the contract in
# infra/swa-settings.contract.json.
#
# Read-only. Compares NAMES only and never prints a value, because three of
# these settings are secrets and this repo is public.
#
# The offline half of this check runs in CI: __tests__/infra/swa-settings.test.ts
# cross-checks the contract against the code's process.env usage in both
# directions. This script adds the half that needs Azure — whether the live
# resource matches what the contract claims.
#
# Usage: ./scripts/check-swa-settings.sh
# Requires: az CLI authenticated to the BTAI subscription.

set -euo pipefail

CONTRACT="infra/swa-settings.contract.json"
[ -r "$CONTRACT" ] || { echo "Cannot read $CONTRACT — run from the repo root" >&2; exit 1; }

RG="$(python3 -c "import json;print(json.load(open('$CONTRACT'))['resourceGroup'])")"
SWA="$(python3 -c "import json;print(json.load(open('$CONTRACT'))['resource'])")"

echo "Comparing live settings on $SWA against $CONTRACT"
echo

live="$(az staticwebapp appsettings list --name "$SWA" --resource-group "$RG" \
          --query "properties | keys(@)" -o tsv | sort)"
declared="$(python3 -c "
import json
c = json.load(open('$CONTRACT'))
for s in c['settings']:
    print(s['name'])
" | sort)"

missing="$(comm -13 <(echo "$live") <(echo "$declared") || true)"
extra="$(comm -23 <(echo "$live") <(echo "$declared") || true)"

status=0

if [ -n "$missing" ]; then
  echo "MISSING FROM THE LIVE RESOURCE — the code expects these and they are not set:"
  echo "$missing" | sed 's/^/  /'
  echo
  status=1
fi

if [ -n "$extra" ]; then
  echo "PRESENT LIVE BUT UNDECLARED — add to the contract, or remove from the resource:"
  echo "$extra" | sed 's/^/  /'
  echo
  status=1
fi

if [ "$status" -eq 0 ]; then
  echo "In sync: $(echo "$declared" | wc -l | tr -d ' ') settings, names match exactly."
fi

# Key Vault posture. The Static Web App is Standard tier with a system-assigned
# identity, so Key Vault references ARE supported here — the secrets are literal
# values by history, not by platform limitation. CLAUDE.md claimed otherwise
# until 2026-07-27.
kvrefs="$(az staticwebapp appsettings list --name "$SWA" --resource-group "$RG" -o json \
  | python3 -c "
import json,sys
d = json.load(sys.stdin).get('properties', {})
print(sum(1 for v in d.values() if isinstance(v, str) and v.startswith('@Microsoft.KeyVault')))
")"
echo
echo "Key Vault references in use: $kvrefs of 3 secrets."
[ "$kvrefs" -eq 3 ] || echo "  (Tracked gap — see docs/strategy/ROADMAP.md. Values are literals today.)"

exit "$status"
