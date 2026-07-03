# PLAN-001: Escape user input in Resend email templates
**Status**: Ready
**Effort**: S · **Risk**: Low

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
     export default defineConfig({ test: { environment: "node", include: ["src/**/*.test.ts"] } });
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
