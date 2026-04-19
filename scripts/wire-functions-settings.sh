#!/usr/bin/env bash
# BTAI-Site — Post-deploy: seed KV + wire Functions App settings
#
# Usage:
#   ./scripts/wire-functions-settings.sh           # Wire KV refs only
#   ./scripts/wire-functions-settings.sh --seed-kv # Also seed KV secrets
#
# Requires:
#   - az CLI (authenticated to BTAI subscription)
#   - op CLI (with BTAI-CC-BTAI-Site vault access via btaisite-sa-token)

set -euo pipefail

RG="BTAI-RG1"
FUNC="func-btai-site-prod"
KV="kv-btai-site-prod"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

# ─── Optional: Seed Key Vault secrets ─────────────────────────
if [[ "${1:-}" == "--seed-kv" ]]; then
  info "Seeding Key Vault secrets from 1Password..."

  export OP_SERVICE_ACCOUNT_TOKEN="$(cat ~/.config/op/btaisite-sa-token)"
  VAULT="BTAI-CC-BTAI-Site"

  RESEND_KEY=$(op item get "Resend" --vault "$VAULT" --fields api-key --reveal 2>/dev/null || echo "")

  if [[ -z "$RESEND_KEY" ]]; then
    # Fall back: read from existing SWA app settings
    warn "Resend not found in 1Password, reading from SWA app settings..."
    RESEND_KEY=$(az staticwebapp appsettings list --name bridgingtrust-website \
      --query 'properties.RESEND_API_KEY' -o tsv 2>/dev/null || echo "")
  fi

  if [[ -n "$RESEND_KEY" ]]; then
    az keyvault secret set --vault-name "$KV" --name "resend-api-key" --value "$RESEND_KEY" -o none
    info "Seeded: resend-api-key"
  else
    fail "Could not retrieve RESEND_API_KEY from any source"
  fi

  info "Key Vault seeded."
  echo ""
fi

# ─── Wire KV references onto Functions app ─────────────────────
info "Wiring Key Vault references to $FUNC..."

KVR="@Microsoft.KeyVault(VaultName=${KV};SecretName="

az webapp config appsettings set \
  --name "$FUNC" \
  --resource-group "$RG" \
  --settings \
    "RESEND_API_KEY=${KVR}resend-api-key)" \
    "EMAIL_FROM=hello@bridgingtrust.ai" \
    "EMAIL_TO=sales@bridgingtrust.ai" \
    "EMAIL_ADMIN=admin@bridgingtrust.ai" \
    "RESEND_TEST_MODE=false" \
  -o none

info "Functions app settings wired."
echo ""
info "Verify with: az webapp config appsettings list --name $FUNC -g $RG -o table"
