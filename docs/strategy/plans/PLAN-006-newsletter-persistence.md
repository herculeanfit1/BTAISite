# PLAN-006: Newsletter persistence (stop discarding signups)
**Status**: Blocked (by PLAN-001)
**Effort**: S–M · **Risk**: Low

## Context
The newsletter endpoint (`api/src/functions/newsletter.ts`) validates input, rate-limits,
checks honeypots — and then does nothing. It logs the subscriber's PII to console
(`newsletter.ts:67`) and returns *"You have been successfully subscribed to our
newsletter!"* (`newsletter.ts:73`) without persisting anything anywhere. Every genuine
signup since launch has been silently discarded. This is both lost business (leads
volunteering contact permission) and an integrity problem (the site lies to users).

The repo already has a well-built HubSpot module (`api/src/lib/hubspot.ts`) used by the
contact flow, with `hubspotFetch` (timeout-guarded), `findContactByEmail`, and note
creation. `HUBSPOT_TOKEN` is already available to the Function App via Key Vault
reference (CLAUDE.md, `kv-btai-site-prod`). Blocked by PLAN-001 only because PLAN-001
seeds the `api/` Vitest harness this plan's tests need.

## Goal / Non-goals
**Goal**: A newsletter signup creates-or-updates a HubSpot contact and attaches a
"Newsletter signup" note; the success message is returned only after persistence
succeeds; failures return an honest 503.
**Non-goals**: A mailing-list provider, double-opt-in flows, unsubscribe management, or
marketing-consent property modeling in HubSpot (do NOT invent custom properties — notes
are sufficient until a marketing tool is chosen). No frontend changes (the existing
`Newsletter` component already posts to `/api/newsletter`).

## Current state
- `api/src/functions/newsletter.ts:62-81` — after building `sanitizedData`
  (`{email, name?}`), logs it and returns success. Honeypot (`:36-48`) returns fake
  success to bots — keep that behavior.
- `api/src/lib/hubspot.ts`:
  - `escapeHtml` (moved to `html.ts` by PLAN-001), `hubspotFetch(method, path, token, body?)`,
    `findContactByEmail(email, token)` — module-private helpers.
  - `upsertContactAndLogInquiry(submission: ContactSubmission, log: Logger)` at `:156` —
    requires `firstName`, `lastName`, `message` (contact-form shape); NOT reusable as-is
    for newsletter's `{email, name?}`.
  - Note-creation logic lives inline inside `upsertContactAndLogInquiry` (after the
    upsert) — extract it for reuse.
- The `context.log` binding trap applies (CLAUDE.md: never pass `context.log` bare;
  arrow-wrap it).

## Target state
`hubspot.ts` exports a second entry point `upsertNewsletterContact(email, name, log)`;
`newsletter.ts` calls it and reports honestly.

## Steps
1. In `api/src/lib/hubspot.ts`, extract the existing note-creation block from
   `upsertContactAndLogInquiry` into a private helper
   `createNoteForContact(contactId: string, noteHtml: string, token: string, log: Logger): Promise<string | null>`
   (returns noteId or null on failure, never throws — preserve current non-blocking
   semantics exactly). Refactor `upsertContactAndLogInquiry` to call it; behavior must be
   byte-identical (same log events, same return shape).
2. Add and export:
   ```ts
   export async function upsertNewsletterContact(
     email: string,
     name: string | undefined,
     log: Logger,
   ): Promise<HubSpotUpsertResult>
   ```
   Logic (mirror the contact upsert's create→409→search→patch pattern):
   - Missing `HUBSPOT_TOKEN` → `{ success: false, error: "missing token" }` + `log("hubspot.token.missing")`.
   - Split `name` on the first space: `firstname` = first token, `lastname` = remainder
     (may be empty); omit properties entirely when `name` is undefined.
   - Properties for create/patch: `email`, `firstname?`, `lastname?` — standard HubSpot
     properties only; do NOT touch the `btai_lead_intake` custom property group (those
     fields are contact-form semantics).
   - On success, call `createNoteForContact(contactId, "Newsletter signup via bridgingtrust.ai (" + new Date().toISOString() + ")", token, log)`.
   - Log events: `hubspot.newsletter.created` / `hubspot.newsletter.updated` /
     `hubspot.newsletter.failed` with `{contactId}` only — no email/name in logs.
3. In `api/src/functions/newsletter.ts`:
   - Change the handler signature to accept `context: InvocationContext` (second
     parameter, matching `contact.ts`'s pattern) and build the logger as
     `(msg, meta) => context.log(msg, meta)` (arrow-wrap — the binding trap).
   - Replace `console.log("Newsletter subscription:", sanitizedData)` (`:67`) with the
     HubSpot call:
     ```ts
     const result = await upsertNewsletterContact(sanitizedData.email, sanitizedData.name, log);
     if (!result.success) {
       context.log("newsletter.persist.failed", { error: result.error });
       return { status: 503, jsonBody: { success: false,
         message: "We couldn't process your subscription right now. Please try again shortly." } };
     }
     ```
     Success path returns the existing 200 body unchanged. Honeypot path unchanged.
   - Remove the PII log line entirely (log `"newsletter.subscribed"` with
     `{contactId: result.contactId}` only).
4. Tests (harness from PLAN-001), `api/src/functions/newsletter.test.ts` +
   `api/src/lib/hubspot.newsletter.test.ts`, mocking `global.fetch` with `vi.stubGlobal`:
   - create 201 → 200 response, note POST fired.
   - create 409 (category CONFLICT) → search → patch → 200.
   - HubSpot 5xx / missing token → handler returns 503 with honest message.
   - honeypot field set → 200 fake success, `fetch` never called.
   - name splitting: `"Ada Lovelace"` → firstname Ada, lastname Lovelace; `"Cher"` →
     firstname only; undefined → email-only properties.
   - assert no log call contains the raw email string.

## Security & compliance notes
- Removes PII (email/name) from plaintext logs — a GDPR improvement.
- `HUBSPOT_TOKEN` continues to come from Key Vault via managed identity; no new secrets.
- Data flow change: newsletter PII now stored in HubSpot CRM (same lawful basis as the
  contact form — user-initiated submission). Note this in the privacy policy if it
  enumerates processors (check `app/[locale]/privacy/page.tsx`; if HubSpot is already
  listed for contact, no change needed).

## Validation
```bash
cd api && npm run typecheck && npm run build && npm test
```
Manual, after deploy to prod (or via SWA preview with prod-linked backend — note preview
shares the prod Function App): submit a signup with a test address you control, verify
the contact + note appear in HubSpot, verify the browser receives success only after.
Then check App Insights traces contain `newsletter.subscribed` with a contactId and no
email address.

## Rollback
Revert the PR. Worst case during incident: the endpoint returns 503 to real users —
which is still more honest than the current silent discard; frontend already displays
error states.
