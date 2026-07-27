# Lead Classifier Taxonomy Remap — plan (2026-07-24)

**Status: prep only. No code in this document is shipped.** This is the execution plan for
punch-list §7. It documents the current (deliberately positional) mapping, the target
Strategy / Build / Operate framing, every system in the chain, and an ordered migration that
does **not** re-introduce the lead-loss bug §7 was created to stop. Nothing here changes
runtime behaviour until it is executed as its own coordinated change.

---

## Why this exists

On 2026-07-22 three of the five contact-form `interest` options were sending values the
backend's Zod enum rejected, so those submissions returned `400` and the lead was silently
lost. The emergency fix repointed the form's option **values** to the enum's existing accepted
strings. That stopped the loss, but it left a **positional, not semantic** mapping: the form
**labels** are the current service pillars while the **values** — and the HubSpot
`inquiry_topic` each maps to — still carry the retired taxonomy. So `inquiry_topic` currently
cannot be trusted for routing or reporting.

---

## Current state (what ships today)

| Form label (user sees)          | Submitted `value`       | Zod enum accepts? | → HubSpot `inquiry_topic` |
| ------------------------------- | ----------------------- | ----------------- | ------------------------- |
| AI Strategy & Solution Design   | `governance-assessment` | ✅                | `ai_governance_readiness` |
| Custom AI Development           | `data-readiness`        | ✅                | `data_governance_ai`      |
| Deployment & Ongoing Operations | `copilot-readiness`     | ✅                | `microsoft_ai_enablement` |
| General Inquiry                 | `general`               | ✅                | `general_inquiry`         |
| _(Select an option)_            | `""`                    | ✅                | _(none — omitted)_        |

The mismatch, made explicit:

- "Custom AI Development" is tagged `data_governance_ai` — a data-governance topic, not custom
  development.
- "Deployment & Ongoing Operations" is tagged `microsoft_ai_enablement` (a Copilot-enablement
  topic), not deployment/ops.
- Only `general` and `""` are semantically honest.

So a report grouped by `inquiry_topic`, or an n8n routing rule keyed on it, is wrong for two of
the four real buckets.

---

## The chain — every system that carries `interest` / `inquiry_topic`

1. **Form** — `app/components/home/ContactSection.tsx`, `INTEREST_OPTIONS[]` (the `value`s).
   Also `InterestFromQuery` preselects from a `?interest=<value>` query param, so any marketing
   deep-links use these same slugs.
2. **Validation** — `src/lib/api/contact-schema.ts`, the `interest` `z.enum([...])`.
3. **Mapping** — `src/lib/api/hubspot.ts`, `INTEREST_TO_INQUIRY_TOPIC` (slug → topic) and the
   unmapped-value warning path.
4. **Queue contract** — `src/lib/api/classify-queue.ts`, `ClassifyMessage` (`schemaVersion: 1`).
   It carries **both** `inquiry.interestRaw` (the raw form value) **and** `inquiry.inquiryTopic`
   (the mapped topic). The header comment is explicit: _"do not change its shape without updating
   the consumer."_ The shape does **not** change here — only the string values flowing through
   `inquiryTopic` (and `interestRaw`) do — but the consumer still must accept the new values.
5. **n8n classifier** (HerculeanInfra) — the workflow that drains the Azure Storage `classify`
   queue and reads `inquiry.inquiryTopic` (and possibly `interestRaw`). **Its accepted-topic set
   and any routing/branching keyed on those values must be inventoried and updated in lockstep.**
   This is the reason §7 cannot ship from BTAI-Site alone.
6. **HubSpot property** — `inquiry_topic` is an enumeration contact property (created by
   `scripts/hubspot/bootstrap-contact-properties.ts` in HerculeanInfra). **A write of a value not
   in its option set is rejected**, so the new topic values must be **added to the property first**
   (additive — do not remove the old options until after cutover).

---

## Target taxonomy (Strategy / Build / Operate)

Proposed — **pending TK approval of the exact slugs/labels before execution.** Slugs are new,
semantically honest, and stable:

| Form label                      | New `value` slug        | New `inquiry_topic`             |
| ------------------------------- | ----------------------- | ------------------------------- |
| AI Strategy & Solution Design   | `strategy-design`       | `ai_strategy_design`            |
| Custom AI Development           | `custom-development`    | `custom_ai_development`         |
| Deployment & Ongoing Operations | `deployment-operations` | `deployment_operations`         |
| General Inquiry                 | `general`               | `general_inquiry` _(unchanged)_ |

`general` and `""` stay exactly as they are.

---

## Migration order — additive first, so no lead is ever lost mid-flight

The hazard: the BTAI-Site form + Zod + mapping all deploy together (one repo, atomic), but the
**consumers** (n8n, HubSpot) are separate systems. If BTAI-Site starts emitting new values
before the consumers accept them, HubSpot rejects the property write and/or n8n mis-routes.
Therefore the consumers must accept the new values **before** BTAI-Site emits them.

1. **HubSpot (additive).** Add the three new `inquiry_topic` options to the property. Leave the
   old options in place. No BTAI-Site change yet.
2. **n8n (additive).** Update the classifier to accept and route the new `inquiry_topic` values
   (and/or key off `interestRaw`). Keep handling the old values. Deploy via the normal
   HerculeanInfra n8n path. No BTAI-Site change yet.
3. **BTAI-Site (the cutover).** In one PR: new `value` slugs in `INTEREST_OPTIONS`, the Zod enum,
   and `INTEREST_TO_INQUIRY_TOPIC` (new keys → new topics). Update the four preview/production
   tests that assert on interest values. Verify on a preview, then merge. From this deploy on,
   the form emits the new, honest values; consumers already accept them.
4. **Soak** (~1 week). Confirm real submissions land with the new `inquiry_topic` in HubSpot and
   n8n routes them correctly.
5. **Cleanup (additive-removal).** Remove the retired options from the HubSpot property, the old
   branches from n8n, and (already gone from BTAI-Site after step 3) the old slugs. Update any
   marketing `?interest=` deep-links that used the old slugs.

Doing it in this order means at every instant, **both** old and new values are accepted by every
consumer, so there is no window where a submission can 400 or mis-route.

---

## Open decisions for TK (before execution)

- **Approve the slug/topic strings** in the target table (or adjust). Everything downstream keys
  off these exact strings.
- **Marketing deep-links:** are there live `?interest=governance-assessment` (etc.) URLs in ads,
  email, or docs? If so they need updating at step 5; if not, one less thing.
- **Historical rows:** do we backfill existing HubSpot contacts' `inquiry_topic` from the old
  values to the new ones, or leave history as-is and only fix new submissions? (Recommendation:
  leave history; note the cutover date in the property description.)

## Verification (at cutover)

- Preview: each of the four options submits `200` (preview gate blocks real side effects).
- Post-merge prod: one real submission per bucket → HubSpot shows the **matching** new
  `inquiry_topic`; n8n routes each to the correct branch; the `classify` queue drains clean.
- Reporting: a HubSpot report grouped by `inquiry_topic` now reflects Strategy / Build / Operate.

---

_Cross-reference: punch-list §7 (`docs/strategy/POST-ROLLUP-PUNCHLIST-2026-07-22.md`). The n8n
classifier and HubSpot property live in the HerculeanInfra repo._

---

## Execution status & handoff — 2026-07-24 (IN PROGRESS)

Slugs **approved** by TK: `strategy-design` / `custom-development` / `deployment-operations` (+ `general` unchanged).

### Classifier reality (reviewed live via n8n direct-IP access)

The taxonomy is enforced by a **live LLM classifier**, not just the form enum:

- Workflow **`btai.lead-intake.schedule.v1`** (id `WgaVq7QEek9OfOk7`), active, on the self-hosted n8n host (see private runbook).
- Access: direct LAN address + the "n8n External API" key header. **Host, port and key are in the private runbook — this repo is public and the LAN address bypasses the Cloudflare Access gate on the public hostname.** Guide: HerculeanInfra `docs/N8N_UNRAID_API_ACCESS_GUIDE.md`.
- Pipeline: schedule (5 min) → dequeue the classification queue → Build LLM Prompt → **Classify & Draft (self-hosted llama-server)** → Process LLM Result → Update HubSpot Contact → ack → gate/note/task.
  - ⚠️ An earlier revision of this line claimed this node called Ollama `llama3.1:8b` and needed migrating. **That was wrong** — see the correction in the transparency report below.
- The LLM **overwrites** the form's `inquiry_topic` seed with its own classification into 6 buckets. The 3 topic buckets live in **exactly 2 nodes**: `Build LLM Prompt` (descriptions) + `Process LLM Result` (`validTopics` allow-list). Operational buckets kept: `partnership_vendor_pitch`, `general_inquiry`, `spam_or_junk`.

### New bucket descriptions (approved)

- `ai_strategy_design`: AI strategy, roadmap, solution/architecture design, use-case scoping, Responsible-AI & governance strategy
- `custom_ai_development`: Custom AI builds — bespoke agents, integrations, RAG, data pipelines, model/app development
- `deployment_operations`: Deploying & operating AI — Copilot/M365 rollout, Entra/tenant controls, monitoring, managed ongoing ops

### Execution split & ORDER (additive-first — critical)

1. **HubSpot (TK)** — add the 3 new options to the `inquiry_topic` property (keep the 6 existing). **Must be first**: the classifier writes `inquiry_topic` to HubSpot, so missing options = rejected write = lead-intake jams.
2. **n8n (n8nbuilder CC — TK kicks off)** — Part A: swap the 3 old topic buckets → 3 new in the 2 nodes above, then **STOP** for TK's go. ~~Part B: migrate `Classify & Draft` off Ollama~~ — **Part B was moot; the workflow was already on the self-hosted llama-server (migrated 2026-05-01, PR #53 / commit `6eeecbb`).** Brief handed to TK 2026-07-24.
3. **BTAI-Site cutover (this repo — assistant)** — branch `feat/lead-taxonomy-cutover` (created, **not yet edited**). 6 edit sites: `app/components/home/ContactSection.tsx` (INTEREST_OPTIONS + doc comment), `src/lib/api/contact-schema.ts` (Zod enum), `src/lib/api/hubspot.ts` (`INTEREST_TO_INQUIRY_TOPIC`), `src/lib/api/email/templates/admin-notification.ts` (label map), `app/services/{governance,data-governance,enablement}/page.tsx` (`ctaInterest`), `__tests__/api/contact-schema.test.ts` (enum test). Held → merged last.
4. **e2e test (assistant)** — enqueue a test lead, watch the classifier bucket it into a new topic, verify the HubSpot write, delete the test contact.
5. **Cleanup (post-soak)** — remove the 3 retired options from HubSpot + n8n + BTAI-Site once the new taxonomy is confirmed.

Old → new mapping (form value → inquiry_topic):
`governance-assessment` → `strategy-design` → `ai_strategy_design` · `data-readiness` → `custom-development` → `custom_ai_development` · `copilot-readiness` → `deployment-operations` → `deployment_operations`.

### Checklist

- [x] HubSpot options (TK) — **done**, verified 9 options present 2026-07-25
- [x] n8n Part A prompt update (n8nbuilder CC) — **done + live** 2026-07-25 03:58Z
- [x] BTAI-Site cutover (assistant) — **PR #65**, all checks green, awaiting TK's merge
- [ ] prod e2e test (assistant) — blocked on #65 merging
- [x] ~~n8n Part B Ollama→self-hosted migration~~ — **moot**, already on the self-hosted llama-server since 2026-05-01
- [x] prod e2e — **passed 2026-07-25**, 3/3 correct via the LLM path
- [x] cleanup old options — **done 2026-07-25**: TK archived the 3 HubSpot options; BTAI-Site
      remapped (not removed) the retired slugs. See "Cleanup did not go the way this plan
      assumed" below — archiving hides an option, it does not stop API writes to it.

---

# Full transparency report — 2026-07-25

Written for whoever picks this up next, including a future Claude session with no memory of
this work. It records what happened, what was wrong, and what is still open — not just the
happy path.

## Who did what

| Actor                                                              | Work                                                                                                                                                                                   |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TK**                                                             | Added the three new `inquiry_topic` options in the HubSpot UI. Kicked off the n8n work in a separate Claude Code session. Owns every merge.                                            |
| **n8nbuilder CC** (separate session, HerculeanN8NBuilder codebase) | Swapped the three old buckets → three new in `Build LLM Prompt` + `Process LLM Result`. Deployed live. Found and reported the poison-message hazard below. Corrected the Ollama claim. |
| **This session** (HerculeanInfra CC)                               | Verified all upstream preconditions independently. Shipped the BTAI-Site cutover as PR #65. Ran the preview verification. Corrected this tracker.                                      |

Three-way split across two repos and a UI, so nothing here is verifiable from one repo's
git history alone. That is why this section exists.

## Sequence as actually executed

1. **HubSpot options added** (TK) — additive; the three retired options were left in place.
2. **n8n Part A** (n8nbuilder CC) — deployed 2026-07-25 03:58Z, workflow active, first
   post-deploy run succeeded.
3. **BTAI-Site cutover** (this session) — PR #65 opened, 7/7 checks green, `mergeState=CLEAN`.
4. **Prod e2e** — NOT DONE. Structurally cannot run before #65 merges (see below).
5. **Cleanup** — NOT DONE, and deliberately gated.

The ordering was the whole point and it held: at no instant was a value emitted that a
downstream consumer did not already accept.

## Correction: this workflow never needed an Ollama migration

An earlier revision of this tracker (and the matching Open Brain thought) stated that
`Classify & Draft` called Ollama and that migrating it to the self-hosted llama-server
was outstanding work — "Part B". **That was wrong.**

Verified against the deployed workflow JSON: `Classify & Draft` POSTs to
`{{ $json._llamaBaseUrl }}/v1/chat/completions`, where `_llamaBaseUrl` and `_llamaModel` are
injected by the `Inject Config` node from `$env.LLAMA_BASE_URL` and `$env.LLAMA_MODEL`,
each with a fallback default (host, port and model name are in the private runbook — this
repo is public). Already on the self-hosted llama-server, migrated 2026-05-01
(PR #53 / commit `6eeecbb`). Zero Ollama references anywhere in the workflow.

**The lesson, because this cost real planning effort:** an inference backend must be read
off the _deployed node parameters_, not off a tracker's prose or a node's display name. The
env-var indirection (`_llamaBaseUrl`) means the endpoint is not visible in the node's own
config at a glance — you have to follow it to `Inject Config`. Both the tracker and the OB
thought have been corrected; the Part B checklist item is struck through rather than deleted
so the error stays legible.

## The hazard that makes the ordering non-negotiable

Found by the n8nbuilder CC, independently confirmed here against the live workflow JSON.
This is the single most important thing on this page.

`Process LLM Result` initialises `classification.inquiryTopic` to
`original.inquiry.inquiryTopic` — **the website form's value** — and overrides it only when
the LLM returns a topic present in `validTopics`. So the form is a **second, independent
write path** into HubSpot whenever inference is unavailable or returns junk. `validTopics`
does not protect that path; it is bypassed entirely.

Now the geometry that makes a mismatch expensive rather than merely noisy:

- `Update Contact` (HubSpot PATCH) has **no `onError` override**, so it takes n8n's default:
  **stop the workflow**. It also has `retryOnFail: true`.
- It sits **before** `Ack Queue Message`, which is the Azure Queue `DELETE`.
- `Dequeue Message` uses `visibilitytimeout=120` on a **5-minute** schedule.

A HubSpot write that gets rejected therefore halts the run _before_ the ack. The message's
120-second invisibility has always expired by the next 5-minute tick, so it is redelivered,
fails again, and **loops forever — alerting every 5 minutes until a human intervenes.**

Concretely: pulling the three retired HubSpot options before the form stops emitting them
converts the LLM-unavailable fallback into a permanent alert storm. None of this is visible
in the workflow diagram, which is why it is written down here.

## Deliberate deviation from the migration plan

The plan (step 3, above) said to swap the Zod enum to the new slugs. **PR #65 does not do
that.** The enum, `INTEREST_TO_INQUIRY_TOPIC`, and the admin-notification label map all
**still accept the three retired slugs**.

Reason: a visitor holding a pre-cutover JS bundle in an open tab will POST an old slug to
the new route handler. Rejecting it returns `400` and silently loses the lead — which is
_precisely_ the failure this whole item was opened to eliminate (see "Why this exists").
Deploying the plan as literally written would have re-created it in a narrower window.

This is additive-first applied _inside_ the repo, not just across systems. Net effect:
nothing **emits** a retired slug anymore; retired slugs are only **accepted**. The
transitional keys come out at step 5 alongside the HubSpot options.

## Verification evidence

**Upstream preconditions, checked independently rather than taken on report:**

- HubSpot `inquiry_topic` queried directly → **9 options**: all 3 new present, all 3 retired
  still present, 3 operational unchanged. Every value the form can emit is already accepted.
- Live workflow `WgaVq7QEek9OfOk7` → active, `updatedAt 2026-07-25T03:58Z`, both taxonomy
  nodes on the new buckets only, `validTopics` = the 3 new + 3 operational.

**PR #65:**

- `npm run validate` → **6/6 gates** (79s). `vitest` on the touched suite → **8/8**.
- Preview functional matrix → **9/9**: 4 current slugs + empty → `200`; 3 retired slugs →
  `200` (the stale-bundle guard); `training` → `400`. The `400` body echoed the deployed
  enum, confirming it matches source.
- Rendered preview HTML → exactly the 4 new option values, **zero** retired slugs, 43,385
  bytes (so the route still fully prerenders — no regression of the `useSearchParams`
  loading-shell bug).
- **Side-effect containment**, which mattered because previews inherit real production
  credentials: HubSpot search for `taxonomy-cutover-preview@bridgingtrust.ai` → **0
  matches**. Both preview-gate signals fire for that host (`PREVIEW_BUILD: "true"` baked at
  `cost-optimized-ci.yml:172`, and `x-forwarded-host` matching the `-65.` +
  `.azurestaticapps.net` pattern).

## What is still open

**All of the below closed on 2026-07-25 — retained for the record.**

1. ~~**Merge PR #65**~~ — merged Fri Jul 24, 11:50 PM CDT, with #64 and #63.
2. ~~**Prod e2e**~~ — passed. Three real leads classified correctly (`ai_strategy_design` 0.95,
   `custom_ai_development` 0.90, `deployment_operations` 0.95), all via the LLM path on
   the self-hosted llama-server, queue acked cleanly. It also surfaced an unrelated defect — `Create Task`
   sending an invalid `hs_due_date` — fixed and deployed the same day (n8nbuilder #106).
   Test contacts deleted by TK.
3. ~~**Cleanup**~~ — TK archived the 3 retired HubSpot options. Verified afterwards: 6
   selectable options (the correct set) and **zero** contacts holding a retired value.

### Cleanup did not go the way this plan assumed — read this before repeating the pattern

The plan said "remove the retired options." **HubSpot does not remove them.** Archiving an
enumeration option sets `hidden: true` and leaves it in the property — confirmed by reading the
property back: 9 options in the array, 3 with `hidden: true`. Hidden options are dropped from
the UI picker but **remain writable through the API**.

That inverts the risk. The expectation was that archiving would make a stale write fail loudly.
Instead a stale pre-cutover browser bundle would have kept writing retired topics _successfully_,
silently repopulating the taxonomy §7 existed to retire, with no error anywhere to alert on.
A loud failure would genuinely have been safer.

So the BTAI-Site half of the cleanup became a **remap, not a removal**: the retired slugs stay
accepted by the Zod enum (still preventing the 400-and-lose-the-lead failure) but now point at
their current-taxonomy equivalents — `governance-assessment` → `ai_strategy_design`,
`data-readiness` → `custom_ai_development`, `copilot-readiness` → `deployment_operations`. Two
tests encode the invariant, because nothing else fails when it breaks.

Nothing was required on the n8n side: `validTopics` already lists only current buckets, and the
fallback path seeds from the form, which can no longer emit a retired value.

The transitional slugs can be dropped from the enum entirely once no pre-cutover bundle can
plausibly still be in a browser tab. There is no longer any urgency or hazard in leaving them.

## Notes, caveats, and limitations for the next session

- **`api/` is untouched on purpose.** The retired Azure Function App tree
  (`api/src/functions/contact.ts`, `api/src/lib/hubspot.ts`,
  `api/src/lib/email-templates/admin-notification.ts`) still carries the old-only enum and
  mapping. It is dead code pending Phase 5 deletion (~2026-08-07); editing it would imply it
  is live. Do not "fix" it — delete it with the rest of Phase 5.
- **`?interest=` deep-links are a public contract.** `InterestFromQuery` validates the param
  against `INTEREST_OPTIONS`, so a link using a retired slug degrades to "Select an option"
  rather than erroring. Still worth auditing live marketing links / ads / email templates for
  `?interest=governance-assessment` etc. — they will silently stop preselecting.
- **Retired service pages got a straight slug rename only.**
  `app/services/{governance,data-governance,enablement}` each preselect the same form option
  they did before. `data-governance` → "Custom AI Development" is pre-existing oddness on a
  `noindex` page; repointing those CTAs at semantically better pillars is a content decision,
  not part of this remap.
- **Queue depth is not readable with TK's current Azure identity.** `az storage message peek`
  on `stbtaisiteprod` / `btai-lead-classify` fails with an RBAC error — the signed-in
  identity lacks _Storage Queue Data Reader_. The leak check was therefore done via the
  HubSpot API instead, which is arguably the better signal anyway. If a future session needs
  actual queue depth, that role has to be granted first (or use `--auth-mode key`).
- **n8n API access:** direct LAN address + the "n8n External API" key header. **Host, port
  and 1Password item are in the private runbook, not here** — this repo is public and that
  address bypasses the Cloudflare Access gate that 302s the public `n8n.bridgingtrust.ai`
  hostname. A different key in `.env` is a separate, empty user scope that returns 0
  workflows.
  The access guide lives in **HerculeanInfra** (`docs/N8N_UNRAID_API_ACCESS_GUIDE.md`), not
  HerculeanN8NBuilder — the n8nbuilder CC asked, and that is the answer.
- **New regression guard worth keeping.** PR #65 adds a test asserting every accepted
  non-empty `interest` has an `INTEREST_TO_INQUIRY_TOPIC` entry, derived from the schema so
  the two cannot drift, with an anti-vacuity assertion. An accepted form value with no
  mapping never sets `inquiry_topic` — the exact defect class behind this whole item. If the
  cleanup step removes enum values, that test keeps the map honest.
