# PLAN-011: IaC completeness (queue in Bicep, missing wiring script, broken rollback)
**Status**: Ready
**Effort**: S–M · **Risk**: Low

## Context
The production environment cannot be rebuilt from this repo. Three gaps: (1) the Azure
Storage Queue `btai-lead-classify` — which the contact pipeline enqueues to — is not
declared in `infra/main.bicep`, nor is the "Storage Queue Data Message Sender" role
assignment or the `AzureWebJobsStorage__queueServiceUri` app setting the code path
depends on (all three are documented as live in CLAUDE.md, so they were provisioned by
hand); (2) `scripts/wire-functions-settings.sh` — the documented post-deploy step that
seeds Key Vault from 1Password and wires `@Microsoft.KeyVault()` references — **does not
exist** (CLAUDE.md and `infra/main.bicep:243-244` both reference it; only its sibling
`scripts/escrow-kv-to-1p.sh` is present); (3) `scripts/rollback.sh`'s default path is
broken — it queries a workflow file (`azure-static-web-apps.yml`) that doesn't exist, so
during an incident the no-arg rollback fails.

## Goal / Non-goals
**Goal**: `main.bicep` + `parameters.prod.json` + one documented script fully describe
the production environment; rollback script works.
**Non-goals**: Changing any live infrastructure (this plan brings IaC INTO SYNC with
reality — `what-if` must show only additions of already-manually-created resources being
adopted, or pure no-ops); alerting resources (PLAN-010); multi-environment support.

## Current state
- `infra/main.bicep` declares: Log Analytics, App Insights, StorageV2 account +
  `deploymentpackages` blob container (`:83-86`), Flex Consumption plan, Functions app
  (system-assigned identity, Node 22), **Storage Blob Data Owner** role (`:159-167`),
  Key Vault + **Key Vault Secrets User** role (`:171-198`), SWA linked backend
  (`:202-214`). App settings (`:115-128`): `AzureWebJobsStorage__accountName`,
  `APPLICATIONINSIGHTS_CONNECTION_STRING`, `FUNCTIONS_EXTENSION_VERSION` — **no**
  `AzureWebJobsStorage__queueServiceUri`.
- No `queueServices`/`queues` resource; no role `974c5e8b-45b9-4653-ba55-5f855dd0fb88`
  (Storage Queue Data Message Sender) — verified by grep for `queue` in the Bicep.
- Enqueue code: `api/src/lib/classify-queue.ts` (`buildClassifyMessage`, queue name
  `btai-lead-classify`), invoked from `api/src/functions/contact.ts:181-204`.
- `scripts/rollback.sh:47` and `:112` — `--workflow=azure-static-web-apps.yml`; actual
  deploy workflow is `cost-optimized-ci.yml`.
- Live resources (per CLAUDE.md): RG `BTAI-RG1`, storage `stbtaisiteprod`, KV
  `kv-btai-site-prod`, Functions `func-btai-site-prod`, secrets `RESEND_API_KEY`,
  `HUBSPOT_TOKEN`; 1Password vault `BTAI-CC-BTAI-Site`.

## Target state
Bicep declares queue + role + app setting matching live values; a working, idempotent
`scripts/wire-functions-settings.sh`; a rollback script whose default path succeeds.

## Steps
1. **Read live state first** (read-only; establishes exact names/casing so `what-if`
   converges instead of churning):
   ```bash
   az storage queue list --account-name stbtaisiteprod --auth-mode login -o table
   az functionapp config appsettings list -n func-btai-site-prod -g BTAI-RG1 \
     --query "[?contains(name,'AzureWebJobsStorage') || contains(name,'EMAIL') || contains(name,'RESEND') || contains(name,'HUBSPOT')].{n:name,v:value}" -o table
   az role assignment list --assignee-object-id $(az functionapp show -n func-btai-site-prod -g BTAI-RG1 --query identity.principalId -o tsv) -o table
   ```
   Record findings in the PR. If the queue name or setting differs from CLAUDE.md,
   the LIVE value wins.
2. Bicep: add to the storage account scope:
   ```bicep
   resource queueService 'Microsoft.Storage/storageAccounts/queueServices@2023-05-01' = {
     parent: storageAccount
     name: 'default'
   }
   resource classifyQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2023-05-01' = {
     parent: queueService
     name: 'btai-lead-classify'
   }
   ```
   (Match the API version already used for the storage account in this file.)
3. Bicep: role assignment — Storage Queue Data Message Sender
   (`974c5e8b-45b9-4653-ba55-5f855dd0fb88`) on the storage account scope to the
   Functions app's system-assigned principal, following the exact pattern of the
   existing Blob Data Owner assignment (`:159-167`), with a deterministic
   `guid(storageAccount.id, functionsApp.id, 'queue-sender')` name. NOTE: if step 1
   shows the manual assignment exists with a different GUID name, the Bicep one will
   ADD a duplicate — instead, delete the manual one after the deployment creates the
   managed one (record both IDs in the PR), or import by matching the guid seed if
   possible. Duplicates are harmless functionally but violate the one-source-of-truth
   goal.
4. Bicep: app setting `AzureWebJobsStorage__queueServiceUri` =
   `'https://${storageAccount.name}.queue.${environment().suffixes.storage}'` — but ONLY
   if step 1 shows this setting exists live (it should, per CLAUDE.md); match the live
   value's format exactly. Caution: the Bicep `appSettings` block REPLACES the app's
   settings on deploy for `siteConfig`-managed settings — verify how the existing
   template handles settings written post-deploy by the wiring script (KV references,
   EMAIL_*). If the template would clobber them, add ALL live settings to the template
   as parameters/KV-references now (preferred — that's the point of this plan) and make
   the wiring script only responsible for SEEDING Key Vault, not app settings.
5. Author `scripts/wire-functions-settings.sh` (bash, `set -euo pipefail`, idempotent):
   - `--seed-kv` flag: read `RESEND_API_KEY` and `HUBSPOT_TOKEN` from 1Password vault
     `BTAI-CC-BTAI-Site` via `op read`, `az keyvault secret set` into
     `kv-btai-site-prod` (skip unchanged values).
   - Default mode: `az functionapp config appsettings set` the
     `@Microsoft.KeyVault(SecretUri=...)` references + `EMAIL_FROM/EMAIL_TO/EMAIL_ADMIN`
     literals (take current values from step 1's output as the canonical defaults).
   - Mirror the style/conventions of `scripts/escrow-kv-to-1p.sh` (same vault naming,
     same op CLI usage). If step 4 moved app settings fully into Bicep, this script
     shrinks to seed-KV only — prefer that outcome and say so in its header.
6. Fix `scripts/rollback.sh:47,112`: `azure-static-web-apps.yml` → `cost-optimized-ci.yml`.
   Also add a first-line comment documenting that rollback = git-revert-and-redeploy
   (SWA native instant-revert is not used).

## Security & compliance notes
- Role assignment is least-privilege (Message Sender, not Contributor) — matches what
  the code needs (enqueue only).
- The wiring script handles secrets: it must never echo secret values (use
  `op read ... | az keyvault secret set --value @-`-style piping or var without `set -x`),
  and must not write them to disk. 1Password remains the escrow source of truth
  (`escrow-kv-to-1p.sh` the reverse direction).
- IaC-as-truth is direct SOC 2 change-management evidence.

## Validation
```bash
az deployment group what-if -g BTAI-RG1 --template-file infra/main.bicep \
  --parameters infra/parameters.prod.json
# Expected: Create for queue/role ONLY if they were hand-made with non-matching IDs
# (see step 3 note); NO Delete or Modify entries against the Functions app's live
# settings. Any Modify on appSettings must be reviewed line-by-line before deploying.
bash -n scripts/wire-functions-settings.sh && shellcheck scripts/wire-functions-settings.sh scripts/rollback.sh
scripts/rollback.sh --dry-run 2>/dev/null || true   # if no dry-run flag, verify the
# gh run list --workflow=cost-optimized-ci.yml query in it returns runs
```
After deploying: submit a test contact form entry and confirm a message lands in
`btai-lead-classify` (az storage message peek) — the enqueue path still works.

## Rollback
`git revert`; the deployment is additive (queue + role already existed functionally).
If step 4's appSettings consolidation clobbers a live setting, restore from step 1's
recorded output (that's why step 1 records everything first).
