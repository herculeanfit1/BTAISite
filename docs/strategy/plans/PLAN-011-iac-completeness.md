# PLAN-011: IaC completeness (queue in Bicep, missing wiring script, broken rollback)

**Status**: Executed 2026-07-27 — see "Execution notes"
**Effort**: S–M · **Risk**: Low

## Execution notes (2026-07-27)

**The plan's own validation step was the most dangerous instruction in it.** It ends with
"deploy" after a `what-if`. Deploying `infra/main.bicep` as it stood would have
**re-created the SWA linked backend** retired on 2026-07-24 — the one thing
`cost-optimized-ci.yml` explicitly warns is not the fix for a broken `/api/*`, and which
Microsoft documents as unsupported for hybrid Next.js. The plan's whole framing is
"bring IaC into sync with reality"; the template was describing the _pre-consolidation_
topology, so syncing in that direction would have pushed the retired architecture back
onto the live site.

Proven with `what-if`, not asserted:

| Template      | `staticSites/.../linkedBackends/functions-backend` |
| ------------- | -------------------------------------------------- |
| `origin/main` | **`Create`**                                       |
| This PR       | absent — no link would be created                  |

The SWA has no linked backend today (`az staticwebapp backends show` → `[]`), confirming
the removal matches reality rather than causing drift.

### What was done

- **Removed the `swaBackend` resource** — the live foot-gun above.
- **Declared the queue** (`queueServices` + `queues/btai-lead-classify`). It is live and
  in use, and was hand-created, so the environment genuinely could not be rebuilt from
  this repo. `what-if` reports it as **`NoChange`**, i.e. the declaration matches live
  exactly and causes no churn.
- **Fixed `scripts/rollback.sh`** — `azure-static-web-apps.yml` → `cost-optimized-ci.yml`
  at both sites (this claim was accurate). Documented that rollback here means
  git-revert-and-redeploy (~5 min), not SWA native instant revert, and quoted five
  unquoted variables shellcheck flagged in a script that only ever runs during incidents.

### Where the plan was wrong

- **Steps 3 and 4 would have granted a dead identity live access.** The queue is reached
  with a queue-scoped, add-only SAS URL held in the **Static Web App's**
  `CLASSIFY_QUEUE_SAS_URL`. The "Storage Queue Data Message Sender" role for the Functions
  identity and the `AzureWebJobsStorage__queueServiceUri` app setting are Functions-runtime
  mechanisms for an app that no longer serves traffic. Both deliberately omitted; the Bicep
  says why.
- **Step 5's premise is false — `scripts/wire-functions-settings.sh` exists** (69 lines).
  It is also inert: its default mode writes settings onto the retired Functions app, while
  every live runtime setting (`RESEND_API_KEY`, `HUBSPOT_TOKEN`, `CLASSIFY_QUEUE_SAS_URL`,
  `EMAIL_*`) sits on the Static Web App. Rather than rewrite it to target the SWA — a live
  infrastructure change this plan lists as a non-goal — it now carries a header saying it
  is inert and should be deleted with the Functions app in Phase 5.
- **The script leaked recon detail into a public repo**, which is the one thing CLAUDE.md
  says must never land here: it hard-coded the 1Password vault name and the
  service-account token filename. Both are now read from `OP_VAULT` /
  `OP_SA_TOKEN_FILE`, with the values documented as private-runbook material.
- **The real IaC gap is not where the plan says.** It is not that the Functions app's
  settings are unmanaged — it is that **the Static Web App's settings are entirely
  undeclared**, and those are the ones production actually reads. Not fixed here: writing
  live SWA settings from Bicep risks clobbering working production values and is squarely
  the "changing live infrastructure" non-goal. Recorded as follow-up work.

### Not deployed

Nothing was applied. `what-if` shows the template converges (queue `NoChange`, no link
created), so there is no drift left for a deployment to fix, and `Modify` still appears
against the retired Functions app's settings. Applying it is unnecessary and only carries
downside. The site was never touched.

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
- Live resources (names in `infra/main.bicep`, which is authoritative): resource group,
  storage account, Key Vault, Function App; secrets `RESEND_API_KEY`, `HUBSPOT_TOKEN`.
  The 1Password vault name is in the private runbook, not here — this repo is public.

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
   EMAIL\_\*). If the template would clobber them, add ALL live settings to the template
   as parameters/KV-references now (preferred — that's the point of this plan) and make
   the wiring script only responsible for SEEDING Key Vault, not app settings.
5. Author `scripts/wire-functions-settings.sh` (bash, `set -euo pipefail`, idempotent):
   - `--seed-kv` flag: read `RESEND_API_KEY` and `HUBSPOT_TOKEN` from the project's
     1Password vault (name in the private runbook) via `op read`, then
     `az keyvault secret set` into the Key Vault (skip unchanged values).
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
