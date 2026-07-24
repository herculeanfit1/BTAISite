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

| Form label (user sees) | Submitted `value` | Zod enum accepts? | → HubSpot `inquiry_topic` |
|---|---|---|---|
| AI Strategy & Solution Design | `governance-assessment` | ✅ | `ai_governance_readiness` |
| Custom AI Development | `data-readiness` | ✅ | `data_governance_ai` |
| Deployment & Ongoing Operations | `copilot-readiness` | ✅ | `microsoft_ai_enablement` |
| General Inquiry | `general` | ✅ | `general_inquiry` |
| _(Select an option)_ | `""` | ✅ | _(none — omitted)_ |

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
   (the mapped topic). The header comment is explicit: *"do not change its shape without updating
   the consumer."* The shape does **not** change here — only the string values flowing through
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

| Form label | New `value` slug | New `inquiry_topic` |
|---|---|---|
| AI Strategy & Solution Design | `strategy-design` | `ai_strategy_design` |
| Custom AI Development | `custom-development` | `custom_ai_development` |
| Deployment & Ongoing Operations | `deployment-operations` | `deployment_operations` |
| General Inquiry | `general` | `general_inquiry` _(unchanged)_ |

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
