#!/usr/bin/env bash
# BTAI-Site — One-way Key Vault → 1Password backup escrow
#
# Runtime source of truth: Azure Key Vault
# This script: operator recovery backup only
#
# Requires:
#   - az CLI (authenticated to BTAI subscription)
#   - op CLI (with BTAI-CC-BTAI-Site vault access via btaisite-sa-token)
#
# Usage: ./scripts/escrow-kv-to-1p.sh

set -euo pipefail

KV="kv-btai-site-prod"
ITEM="Azure Key Vault Escrow"

export OP_SERVICE_ACCOUNT_TOKEN="$(cat ~/.config/op/btaisite-sa-token)"
VAULT="BTAI-CC-BTAI-Site"

SECRETS=(
  "resend-api-key"
)

echo "=== Key Vault → 1Password Escrow ==="
echo "Source: $KV"
echo "Target: $VAULT / $ITEM"
echo "Date:   $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

ESCROWED=0
SKIPPED=0

for secret in "${SECRETS[@]}"; do
  value=$(az keyvault secret show --vault-name "$KV" --name "$secret" --query value -o tsv 2>/dev/null || echo "__FETCH_FAILED__")

  if [ "$value" = "__FETCH_FAILED__" ]; then
    echo "  SKIP: $secret (not found or access denied)"
    SKIPPED=$((SKIPPED + 1))
  else
    if op item get "$ITEM" --vault "$VAULT" > /dev/null 2>&1; then
      op item edit "$ITEM" --vault "$VAULT" "${secret}[password]=${value}" > /dev/null 2>&1
    else
      op item create --category=SecureNote --vault "$VAULT" --title "$ITEM" \
        --tags "escrow,azure-keyvault" \
        "${secret}[password]=${value}" > /dev/null 2>&1
    fi
    echo "  OK:   $secret"
    ESCROWED=$((ESCROWED + 1))
  fi
done

echo ""
echo "Done. Escrowed: $ESCROWED, Skipped: $SKIPPED"
