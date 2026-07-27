# PLAN-001: Escape user input in Resend email templates

**Status**: Executed 2026-07-27 — see "Execution notes"
**Effort**: S · **Risk**: Low

## Execution notes (2026-07-27)

The vulnerability was **real and live**, exactly as diagnosed. Every file path in this
plan was **wrong**, and following it literally would have produced a green PR that fixed
nothing.

**The plan targets `api/`, which has not been deployed since 2026-07-24.** The live code
is `src/lib/api/email/templates/`. Patching `api/src/lib/email-templates/` would have left
the injection running in production while closing the ticket. This is the fourth
consecutive plan whose stated target contradicted the tree.

Other corrections, each verified against the code:

| Plan says                                                 | Reality                                                                                                                                                                                                                                              |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `escapeHtml` is private at `api/src/lib/hubspot.ts:31-38` | Live twin at `src/lib/api/hubspot.ts:59-66`; now shared from `src/lib/api/html.ts`                                                                                                                                                                   |
| Import with a `.js` extension                             | The live tree imports **extensionless** (`from "../../html"`); `.js` is an `api/`-only ESM convention                                                                                                                                                |
| Seed a new Vitest harness inside `api/`                   | The root repo already has Vitest and seven API tests in `__tests__/api/`. A second harness in a tree scheduled for deletion is waste — tests went to `__tests__/api/`                                                                                |
| Use `escapeHtmlMultiline` for the admin message           | **Wrong.** `.message-content` in the admin template is `white-space: pre-wrap`, so newlines already render; `<br />` would double every line break. Only the confirmation template needs it                                                          |
| Assert output `not.toContain("onerror=")`                 | **This assertion fails against a correct fix.** The payload survives as inert _text_, and also appears harmlessly inside the escaped `mailto:` href. Tests parse the HTML and assert structurally instead: no `script`, no `img`, no `on*` attribute |

**Sinks the plan missed**: `interestLabel` (falls through to the raw `data.interest` when
unmapped — Zod-constrained via the live route, but the function signature permits any
string), and the fact that `ipAddress`/`userAgent` are **header-derived and never touch
the Zod schema**, making them the most directly attacker-controlled strings in the
template.

**`api/` was deliberately left vulnerable.** It is undeployed and slated for deletion in
API-consolidation Phase 5; CLAUDE.md forbids porting changes into it. It is unreachable,
so this is not residual exposure.

**Every test was proven to fail against the pre-fix code** before being accepted — the
templates were reverted to `origin/main` and the suite re-run. Two assertions passed
pre-fix (so proved nothing) and were rewritten until they failed: the `mailto:` guard now
detects the attribute truncation a raw `"` causes (`expected 'mailto:' to contain
'@example.com'`).

Result: **158 tests across 23 files, all green.** Coverage moved 23.05 → 24.22 lines and
76.03 → 77.04 functions, branches flat at 80.67. `type-check`, `next build`, and ESLint
all clean.

## Context

BTAI-Site's contact form (public, anonymous) posts to an Azure Functions backend
(`api/src/functions/contact.ts`) that sends two HTML emails via Resend: an admin
notification and a user confirmation. User-controlled fields (`firstName`, `lastName`,
`email`, `company`, `message`) are interpolated **raw** into the HTML templates. Zod
validation caps lengths but does not sanitize content, so an attacker can submit
`<img src=x onerror=...>` or arbitrary HTML in `message`/`company` and have it render
live in the founders' inboxes (stored HTML injection), including attribute breakout in a
`mailto:` href. An `escapeHtml()` helper already exists in the codebase
(`api/src/lib/hubspot.ts:31-38`) and is correctly applied to HubSpot note bodies — it was
simply never applied to the email templates.

`api/` is a standalone npm project (own `package.json`, `package-lock.json`, esbuild
bundle to `dist/index.js`, ESM with `.js` import extensions). It currently has **no test
setup**; this plan seeds a minimal Vitest harness that PLAN-007 later expands.

## Goal / Non-goals

**Goal**: No user-controlled string reaches email HTML unescaped; regression tests prove it.
**Non-goals**: Redesigning the templates; changing Zod schemas; touching the frontend
form; full API test coverage (PLAN-007); fixing rate limiting (PLAN-009).

## Current state

- `api/src/lib/email-templates/admin-notification.ts` — `generateAdminNotificationEmail()`
  (exported at line 10) interpolates raw: `${data.firstName} ${data.lastName}` (~line 151),
  `mailto:${data.email}` + `${data.email}` display (~line 156), `${data.company}` (~line 162),
  `${data.message}` inside `<div class="message-content">` (~line 179), and a reply link
  `mailto:${data.email}?subject=...&body=Dear ${data.firstName},...` plus
  `Reply to ${data.firstName}` (~line 193). Also `${data.ipAddress}` / `${data.userAgent}`
  in the technical-details block (~lines 197-199).
- `api/src/lib/email-templates/contact-confirmation.ts` — `generateConfirmationEmail()`
  (exported at line 3) interpolates raw: `${data.firstName}` (~line 117) and
  `"${data.message}"` (~line 123).
- `escapeHtml` is a **private** function in `api/src/lib/hubspot.ts:31-38` (escapes
  `& < > " '`), used at hubspot.ts:106.
- `ContactFormData` is defined at `api/src/lib/email.ts:32`.
- `api/package.json` scripts: `dev`, `build` (esbuild), `typecheck` only. Deps:
  `@azure/functions ^4.6.0`, `resend ^6.11.0`, `zod ^3.25.0`.

## Target state

- A shared `api/src/lib/html.ts` module exports `escapeHtml`; both templates and
  `hubspot.ts` import it. Every user-controlled interpolation in both templates is
  escaped; `message` preserves line breaks via `<br />` after escaping; `mailto:` URL
  parameters are `encodeURIComponent`-encoded.
- `api/` has a working `vitest` setup with injection regression tests; `npm test` passes
  in `api/`.

## Steps

1. Create `api/src/lib/html.ts`:

   ```ts
   export function escapeHtml(s: string): string {
     return s
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#39;");
   }

   /** Escape + convert newlines for multi-line user text rendered in HTML. */
   export function escapeHtmlMultiline(s: string): string {
     return escapeHtml(s).replace(/\r?\n/g, "<br />");
   }
   ```

2. In `api/src/lib/hubspot.ts`: delete the local `escapeHtml` (lines 31-38) and add
   `import { escapeHtml } from "./html.js";` (note the `.js` extension — ESM convention
   used throughout `api/src/`). Behavior unchanged.
3. In `api/src/lib/email-templates/admin-notification.ts`: at the top,
   `import { escapeHtml, escapeHtmlMultiline } from "../html.js";` then:
   - Name display → `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`
   - Email row → `<a href="mailto:${encodeURIComponent(data.email)}" ...>${escapeHtml(data.email)}</a>`
   - Company → `${escapeHtml(data.company)}` (inside the existing conditional)
   - Message → `${escapeHtmlMultiline(data.message)}`
   - Reply button → `href="mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent("Re: Your inquiry to Bridging Trust AI")}&body=${encodeURIComponent(`Dear ${data.firstName},\r\n\r\nThank you for reaching out to Bridging Trust AI...`)}"` and label `Reply to ${escapeHtml(data.firstName)}`
   - Technical details → `${escapeHtml(data.ipAddress || "Not available")}` and same for `userAgent`.
     Do not restructure the template otherwise; keep all CSS/markup identical.
4. In `api/src/lib/email-templates/contact-confirmation.ts`: import from `"../html.js"`;
   escape `firstName`; message → `"${escapeHtmlMultiline(data.message)}"`.
5. Seed the test harness in `api/`:
   - `npm install -D vitest` (in `api/`; keep `^` range, this project uses ranges).
   - Add `"test": "vitest run"` to `api/package.json` scripts.
   - Create `api/vitest.config.ts`:
     ```ts
     import { defineConfig } from "vitest/config";
     export default defineConfig({
       test: { environment: "node", include: ["src/**/*.test.ts"] },
     });
     ```
6. Create `api/src/lib/html.test.ts` covering: each of the 5 escaped characters;
   multiline conversion; idempotence not required (document that double-escaping is
   acceptable and not performed).
7. Create `api/src/lib/email-templates/templates.test.ts`: build a `ContactFormData`
   payload where every field is `<script>alert(1)</script>` plus
   `"><img src=x onerror=alert(1)>` in `message`, call both generators, assert the output
   (a) does not contain `<script>` or `onerror=` and (b) does contain `&lt;script&gt;`.
   Assert a message containing `line1\nline2` renders `line1<br />line2`.

## Security & compliance notes

This closes the only known active injection vulnerability. No secrets involved; no data
handling changes; no new permissions. Escaping is output-encoding at the sink, which is
the correct layer (do NOT add input sanitization to Zod schemas — that mangles legitimate
messages).

## Validation

```bash
cd api
npm install
npm run typecheck        # passes
npm run build            # esbuild bundle succeeds
npm test                 # all new tests green
```

Then send one manual test submission with `RESEND_TEST_MODE=true` locally (see CLAUDE.md
"Local Environment Setup") or via the deployed preview, using a message containing
`<b>bold</b>` and a newline, and confirm the received/logged email shows the literal
`<b>bold</b>` text and a line break.

## Rollback

Single revert of the PR commit. Templates are pure functions with no persisted state.
