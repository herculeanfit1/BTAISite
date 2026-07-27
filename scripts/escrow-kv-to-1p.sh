#!/usr/bin/env bash
# BTAI-Site — One-way Key Vault → 1Password backup escrow
#
# Runtime source of truth: Azure Key Vault
# This script: operator recovery backup only
#
# Requires:
#   - az CLI (authenticated to the BTAI subscription)
#   - op CLI, with OP_VAULT and OP_SA_TOKEN_FILE set. Their values are in the
#     private runbook and must NOT be committed: this repo is public, and a
#     vault or item name narrows an attacker's search even though it is not
#     itself a secret.
#
# Usage: OP_VAULT=... OP_SA_TOKEN_FILE=... ./scripts/escrow-kv-to-1p.sh

set -euo pipefail

KV="kv-btai-site-prod"
ITEM="Azure Key Vault Escrow"

# Sourced from the environment so no 1Password identifier lands in this file.
VAULT="${OP_VAULT:?OP_VAULT is not set (value is in the private runbook)}"
OP_SA_TOKEN_FILE="${OP_SA_TOKEN_FILE:?OP_SA_TOKEN_FILE is not set (path is in the private runbook)}"
[ -r "$OP_SA_TOKEN_FILE" ] || { echo "Cannot read the service-account token at OP_SA_TOKEN_FILE" >&2; exit 1; }

OP_SERVICE_ACCOUNT_TOKEN="$(cat "$OP_SA_TOKEN_FILE")"
export OP_SERVICE_ACCOUNT_TOKEN

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
