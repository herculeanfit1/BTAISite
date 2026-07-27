#!/usr/bin/env bash
# BTAI-Site — Post-deploy: seed KV + wire Functions App settings
#
# ⚠️  THIS SCRIPT TARGETS THE RETIRED FUNCTIONS APP AND IS INERT FOR PRODUCTION.
#
# Its default mode writes app settings onto func-btai-site-prod, which has not
# served traffic since 2026-07-24. The live site's runtime settings —
# RESEND_API_KEY, HUBSPOT_TOKEN, CLASSIFY_QUEUE_SAS_URL, EMAIL_* — live on the
# STATIC WEB APP, not here. Running this changes nothing users can see.
#
# It is kept only because --seed-kv still populates the Key Vault that Phase 5
# has yet to tear down. Delete this script together with the Functions app; see
# docs/projects/API-CONSOLIDATION-PLAN-2026-07-24.md.
#
# Usage:
#   ./scripts/wire-functions-settings.sh           # Wire KV refs only
#   ./scripts/wire-functions-settings.sh --seed-kv # Also seed KV secrets
#
# Requires:
#   - az CLI (authenticated to the BTAI subscription)
#   - op CLI, with OP_VAULT and OP_SA_TOKEN_FILE set. Their values are in the
#     private runbook and must NOT be committed: this repo is public, and a
#     vault or item name narrows an attacker's search even though it is not
#     itself a secret.

set -euo pipefail

RG="BTAI-RG1"
FUNC="func-btai-site-prod"
KV="kv-btai-site-prod"

# Sourced from the environment so no 1Password identifier lands in this file.
OP_VAULT="${OP_VAULT:-}"
OP_SA_TOKEN_FILE="${OP_SA_TOKEN_FILE:-}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

# ─── Optional: Seed Key Vault secrets ─────────────────────────
if [[ "${1:-}" == "--seed-kv" ]]; then
  info "Seeding Key Vault secrets from 1Password..."

  [[ -n "$OP_VAULT" ]] || fail "OP_VAULT is not set (value is in the private runbook)"
  [[ -n "$OP_SA_TOKEN_FILE" ]] || fail "OP_SA_TOKEN_FILE is not set (path is in the private runbook)"
  [[ -r "$OP_SA_TOKEN_FILE" ]] || fail "Cannot read the service-account token at OP_SA_TOKEN_FILE"

  OP_SERVICE_ACCOUNT_TOKEN="$(cat "$OP_SA_TOKEN_FILE")"
  export OP_SERVICE_ACCOUNT_TOKEN

  RESEND_KEY=$(op item get "Resend" --vault "$OP_VAULT" --fields api-key --reveal 2>/dev/null || echo "")

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
