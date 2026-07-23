# Post-Rollup Punch List — 2026-07-22

Everything below is **owned by the operator** and cannot be closed from inside this
repository. Each item states what "done" means, so none of them stay open by ambiguity.

Context: a six-PR sequence landed on `main` today — static-prerender fix, repositioning,
shared legal source, legal restructure, dead-code cleanup, and security headers — plus a
founder-photo update. `main` is at `b5bcde3`. All are deployed and verified in production
(see §Verification at the end).

---

## 0. RESOLVED 2026-07-22 — contact form was down for ~1 month

**Recorded here because it is the third instance of the same root cause, and the pattern
matters more than the fix.**

Symptom: submitting the contact form returned "There was a problem connecting to our
servers." Cause: the Static Web App's **linked backend** pointed at
`/subscriptions/cd461b28-.../sites/func-btai-site-prod` — the pre-evacuation subscription.
That resource ID no longer resolves (`ResourceNotFound`), so SWA could not proxy `/api/*`
to the Function App. Requests fell through to the static site and returned the Next.js 404
page. The browser's `fetch` received HTML where it expected JSON, threw, and hit the
network-level catch.

The Function App itself was healthy throughout — hitting
`func-btai-site-prod.azurewebsites.net/api/health` directly returned `200 {"status":"ok"}`.

Broken since roughly **2026-06-23**, when the subscription evacuation moved the resources.
The linked backend was created 2026-04-18 against the old subscription and never cut over.

Fix (no code change, no deploy):

```
az staticwebapp backends unlink --name bridgingtrust-website --resource-group BTAI-RG1
az staticwebapp backends link   --name bridgingtrust-website --resource-group BTAI-RG1 \
  --backend-resource-id "/subscriptions/9d3c1bcc-.../sites/func-btai-site-prod" \
  --backend-region eastus2
```

Verified: `/api/health` returns `{"status":"ok"}` through the apex, and a real form
submission returns `{"success":true}` with HTTP 200.

**Three stale references to the evacuated subscription have now surfaced, in three
different systems:**

| # | Artifact | Effect | Found |
|---|---|---|---|
| 1 | `AZURE_SUBSCRIPTION_ID` GitHub secret | Functions deploy failed silently for 7 weeks | 2026-07-22 |
| 2 | SWA linked-backend `backendResourceId` | Contact form down ~1 month | 2026-07-22 |
| 3 | n8n IP-updater, `scripts/azure` (per evacuation tracker) | still listed as outstanding | 2026-06-24 |

**Action: audit every remaining reference to `cd461b28` across all systems.** The evacuation
tracker's "external-ref cutover" item is not finished, and each undiscovered instance is a
silently broken capability. Sweep infrastructure repos, Azure resource configs, GitHub
secrets across all repos, n8n credentials, and hardcoded subscription IDs in scripts.

**Verification lesson:** the Phase D production sweep run earlier the same day checked
routes, headers, redirects, titles, photos and sitemap — and passed every one — while the
site's single most important interactive feature was dead. **Page checks are not feature
checks.** Any future verification of this site must POST to `/api/contact` and assert
`success: true`, not merely confirm that pages render.

---

## 1. Alert on `deploy-functions` failure — near-term, not someday

**The single most important item here.**

The Azure Functions deploy — which serves the contact form, the revenue front door — failed
silently on **every** `main` run from **2026-06-17 to 2026-07-22**. Seven weeks.

Root cause: the `AZURE_SUBSCRIPTION_ID` GitHub secret still pointed at the pre-evacuation
subscription. The OIDC principal (`BTAI-Site-GitHubDeploy`) had migrated correctly and held
Website Contributor on `func-btai-site-prod` in the new subscription the whole time; only the
secret was stale. Rotating it to `9d3c1bcc-…` fixed it immediately, and it has been green on
five consecutive runs since.

**Why it went unnoticed is the real problem.** `deploy-functions` failing does not fail the
site deploy, and nothing watches it. The previously-deployed Functions build kept serving, so
the contact form never broke — but no API change could have shipped in that window, and
nobody would have known.

This is the same failure shape as the HubSpot non-blocking-catch pattern already documented
in the strategic review: **a non-blocking failure masking a broken capability.**

Options, roughly in order of effort:
- Add a failure-notification step to the `deploy-functions` job (cheapest).
- Make `deploy-functions` a required check so a failure is visible on the PR.
- Azure Monitor alert on Function App deployment failures.

**Done when:** a deliberately failed `deploy-functions` run produces a notification the
operator actually receives.

---

## 2. Analytics — deliberately deferred, with a documented re-entry path

Nothing about analytics currently works, and that is now a known state rather than a silent
one:

- **There is no GA read path at all.** No layout references Google Analytics; the
  `GoogleAnalytics` component took its measurement ID as a prop nothing supplied and has been
  deleted. No GA4 property is known to exist.
- **App Insights is silently dead too.** `NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING`
  is set in the SWA portal, but `NEXT_PUBLIC_*` values are inlined at `next build` and the CI
  build env sets only `NODE_VERSION`. Proven: the instrumentation key appears **zero times**
  across the shipped HTML and all six JS chunks.
- The Privacy Policy still discloses Google Analytics, and the cookie banner still asks for
  analytics consent. That disclosure is currently **over-disclosure** — it describes a
  tracker that does not run. It was left in place deliberately: the fix is almost certainly
  to make the disclosure true, not to delete it.

**Re-entry recipe when this is picked up:**

1. Create the GA4 property (~5 min, manual): analytics.google.com → Admin → Create Property →
   "Bridging Trust AI" → create a **Web** data stream for `https://bridgingtrust.ai` → copy
   the Measurement ID (`G-XXXXXXXXXX`). Leave **Google signals / ads personalization off** —
   the privacy policy discloses anonymized traffic analysis only.
2. Put the GA measurement ID **and** the App Insights connection string in the **GitHub
   Actions build environment** as **variables, not secrets** — both appear in page source by
   design, and portal app settings demonstrably do not reach `next build`.
3. Build a deliberate consent-gated read path. Do not resurrect the deleted prop-drilled
   component.
4. Verify three consent states against production: no consent → zero GA requests; consent
   granted → gtag loads and `page_view` fires; consent declined → zero.
5. **No CSP change will be needed** — `script-src` already allows the two Google hosts and
   `connect-src` already allows the GA and App Insights ingestion endpoints.

**Done when:** consented sessions show GA traffic and App Insights ingests; non-consented
sessions show zero requests to either.

---

## 3. `www` subdomain returns 526

`https://bridgingtrust.ai` is healthy (200). `https://www.bridgingtrust.ai` returns **526** —
Cloudflare cannot validate the origin certificate for that hostname. Both resolve to
Cloudflare IPs; this is a dashboard fix, not a repo fix.

Recommendation: **301 `www` → apex**, which also settles canonical-host policy rather than
maintaining two live hostnames.

**Done when:** `https://www.bridgingtrust.ai` returns 200, or 301s to the apex.

---

## 4. HSTS posture

The platform serves `max-age=31536000; includeSubDomains` with no `preload`. The old
`staticwebapp.config.json` claimed `63072000` — that config was never applied, so the
discrepancy was theoretical, and the file no longer asserts it.

`next.config.js` deliberately does **not** emit HSTS: two differing HSTS headers is worse
than one. If a longer max-age or `preload` is wanted, that is now a platform/Cloudflare
decision.

**Done when:** the current value is confirmed deliberate, or changed at the platform layer.

---

## 5. Google Search Console

The sitemap and indexing surface changed materially today: three retired service pages are
now `noindex, nofollow`, two phantom URLs (`/about`, `/solutions`) now 301 instead of serving
duplicate homepages, and two new legal pages exist.

Actions: verify the property, submit the cleaned sitemap, and request re-crawl / removal of
the three retired `/services/*` URLs and the phantom entries.

**Done when:** GSC shows the five canonical sitemap URLs indexed and the retired URLs
dropped.

---

## 6. Counsel packet handoff

Send `docs/strategy/COUNSEL-PACKET-2026-07-22.md` to counsel. It supersedes two earlier memos
and corrects two errors they contained.

Agenda items to raise explicitly:
- The **two withheld numbers**: incident-notification window and decommission window. Both
  are qualitative on the live `/product-terms` page by design, pending counsel setting them.
- **Identity-model confirmation** across products, before any per-product license schedule is
  drafted. The published clause is written conditionally so it holds either way.
- The **analytics and consent posture** (§2), given the privacy policy currently
  over-discloses.
- The **one-directional indemnity** — client→BTAI only, no BTAI IP-infringement indemnity.
  Expect enterprise procurement to reject this first.

**Done when:** an engagement is scoped.

---

## 7. Lead classifier taxonomy remap

The contact form's `interest` values were repointed to the backend's existing accepted enum
to stop a live lead-loss bug (three of five options were returning 400 and silently
discarding submissions). **The pairing is positional, not semantic** — the HubSpot
`inquiry_topic` values still reflect the retired service taxonomy.

Needs an end-to-end remap: form → Zod enum → `INTEREST_TO_INQUIRY_TOPIC` → n8n classifier.
Until then, do not trust `inquiry_topic` for routing or reporting.

**Done when:** classification buckets match the live Strategy / Build / Operate framing.

---

## 8. PLAN-004 — the dead `src/` tree

~115 unimported files. Deleting into it **cascades**: removing
`src/components/CookieConsent.tsx` immediately broke `ClientLayout.tsx` and
`CookieBanner.tsx`. Today's cleanup deliberately stopped at that boundary rather than
half-unravelling it.

Also in scope when this is picked up: the tracked `middleware.ts.bak` and
`middleware.ts.bak-hybrid` files, and `SafeHtml`'s `ALLOWED_COMPONENTS` union, which still
lists `'GoogleAnalytics'` and `'SchemaOrg'` as string literals for components that no longer
exist (harmless — they are not imports).

**Done when:** the tree is removed and `tsconfig.json`'s `@/components/*` and `@/lib/*`
aliases no longer point into it.

---

## 9. Reported, not fixed — smaller items

- **`app/[locale]` renders English for all locales.** `es` and `fr` variants of every page
  return 200 and serve English content. `next-intl` is installed but never imported. This is
  pre-existing and was explicitly out of scope; it is now more visible because the locale
  segment is validated and the legal pages exist in locale variants.
- **`/contact` is no longer in the sitemap** — it is a 301, and sitemaps should list
  destinations. The sitemap now carries five canonical URLs, not six.
- **Coverage floors.** The suite went 126 → 105 + 5 new = 110 across two cleanup PRs, purely
  from deleting tests whose subjects were deleted. If a coverage ratchet is ever made real,
  baseline it after this settles, not before.

---

## Verification — production state at time of writing

All checks run against `https://bridgingtrust.ai` after the final deploy.

| Check | Result |
|---|---|
| `/`, `/terms`, `/privacy`, `/engagement-terms`, `/product-terms` | 200 |
| All `en` / `es` / `fr` variants of the above | 200 |
| `/banana`, `/xyzzy`, `/nope` | 404 |
| `/about`, `/solutions`, `/contact` | 301 → correct anchor |
| CSP + `X-Content-Type-Options` + `Referrer-Policy` + `Permissions-Policy` | 4/4 on every route checked |
| HSTS | exactly one value, no duplication |
| GA / gtag / App Insights requests | zero (correct — deferred) |
| Retired `/services/*` pages | `noindex, nofollow` |
| Titles | single brand suffix |
| Founder photos | both 200; Terence first, Bill second |
| Sitemap | five canonical URLs |
| SOC 2 / HIPAA / ISO 27001 strings on legal pages | zero |
| Conditional identity clause on `/product-terms` | present |
| Withheld numeric windows on `/product-terms` | zero |
