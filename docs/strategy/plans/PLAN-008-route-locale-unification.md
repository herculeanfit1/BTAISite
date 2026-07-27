# PLAN-008: Route & locale unification (one homepage, canonical privacy/terms, honest locales)

**Status**: Executed 2026-07-27 (partially — steps 6/7 **rejected as harmful**)
**Effort**: M · **Risk**: Med

## Execution notes (2026-07-27)

**This plan's canonical direction is the reverse of production's, and following steps 6
and 7 literally would have made the privacy policy unreachable.**

PR #61 (2026-07-25) settled the direction: top-level paths are canonical and every
`/{locale}` path 301s to them. Verified live, not inferred:

```
/privacy      200
/en/privacy   301 -> https://bridgingtrust.ai/privacy
/es/terms     301 -> https://bridgingtrust.ai/terms
/fr           301 -> https://bridgingtrust.ai/
```

Step 6 asks to **delete `app/privacy/`** (the page currently serving 200) and add
`/privacy → /en/privacy`. Since `/en/privacy → /privacy` already ships, that is an
**infinite redirect loop on a compliance-critical page**. Step 7 compounds it by pointing
the cookie banner and footer at the looping URL. Both rejected.

The guard that now exists reproduces it exactly. Applying step 6 verbatim:

```
× redirect loop: /privacy -> /en/privacy -> /privacy
```

### Premises that no longer hold

- **"Two divergent homepages"** — false. `app/page.tsx` and `HomePageContent.tsx` rendered
  the **identical** eight sections. `GlobeOverlaySection` no longer exists anywhere, and
  both included `MethodologySection`. Step 1's production check ("Globe present,
  Methodology absent") could not have resolved either way.
- The real divergence was a single `pt-20` — the padding clearing the fixed navbar —
  present in one copy and not the other, under a comment asking the next person to keep
  them in sync. Since `/en` 301s to `/`, only `app/page.tsx` was reachable, so `pt-20` is
  the live behaviour and is what the unified component keeps.
- **Step 7's internal links already point at the canonical paths.** Rewriting them to
  `/en/privacy` would have added a redirect hop to every click even without step 6.

### What was done

- **One `HomeSections` component**, used by `app/page.tsx` and `app/[locale]/page.tsx`.
  `HomePageContent.tsx` deleted — a duplicate that survived on a comment rather than a
  mechanism.
- **`supportedLocales` → `["en", "es"]`.** `fr` prerendered a page of English at a French
  URL. Invisible to users: `/fr*` 301s at the edge before routing reaches the segment, so
  this is not the 404-behaviour change the plan's validation section warns about.
- **`__tests__/routing/redirect-map.test.ts`** — the durable artifact. Asserts no loops, no
  chained redirects, 301 everywhere, that top-level legal pages never redirect, and that no
  internal link targets a redirected path. It carries the reason in its failure message so
  the next person to try step 6 is told why it fails.

### Deliberately NOT done

`app/[locale]/` was **not deleted**, despite now being unreachable. CLAUDE.md ties it to
Oryx static prerendering for the legal pages, and that claim needs verification on a real
preview deploy before acting — this is the highest-availability-risk plan and the
`next.config.js redirects()` incident of 2026-07-23 is the precedent for what a confident
routing assumption costs here. Recorded as follow-up, not silently dropped.

The SEO `alternates.canonical` work (step 8) is also deferred: with `/en` 301ing to `/`,
a canonical tag on an unreachable page consolidates nothing. It becomes meaningful only if
locales are ever really served.

## Context

The site currently has two divergent homepages: `/` (`app/page.tsx`) renders Hero,
Leveling, Features, **GlobeOverlay**, About, Contact, while `/en` (`app/[locale]/page.tsx`
→ `app/components/HomePageContent.tsx`) renders Hero, Leveling, **Methodology**,
Features, About, Contact. `privacy` and `terms` exist in both locale
(`app/[locale]/privacy/`) and non-locale (`app/privacy/`) forms. The locale layout
declares `["en","es","fr"]` (`app/[locale]/layout.tsx:2`) and pre-renders `/fr` — but no
French translations exist anywhere, and in fact **no** translations are consumed:
`next-intl` is installed but never imported, so `/es` renders hardcoded English while a
genuine Spanish translation sits unused in `messages/es.json`.

Hard-won constraint (project memory + CLAUDE.md): pages that need static HTML on Azure
SWA's Oryx hybrid build (privacy, terms) must live under `app/[locale]/` with
`generateStaticParams`. Do not undo that.

## Goal / Non-goals

**Goal**: `/` and `/{locale}` render identical homepage content from one shared
component; exactly one canonical URL each for privacy and terms (locale form), with
redirects from the legacy paths; supported locales = what we can actually serve.
**Non-goals**: Wiring next-intl / translating anything (explicit Later roadmap item with
a business trigger — keep `messages/es.json` and the `[locale]` scaffold); deleting the
`[locale]` tree; SEO work beyond canonical tags/redirects.

## Current state

- `app/page.tsx:1-6` — imports `./components/home/*` sections directly (incl.
  `GlobeOverlaySection`).
- `app/components/HomePageContent.tsx:1-6` — the `[locale]` composition (incl.
  Methodology, no Globe).
- `app/[locale]/layout.tsx:2` — `supportedLocales = ["en", "es", "fr"]`;
  `generateStaticParams` at `:4-6`; pass-through layout `:20-31` (must STAY a
  pass-through — nested `<html>` breaks hydration, see CLAUDE.md).
- `app/privacy/page.tsx`, `app/terms/page.tsx` — non-locale duplicates.
- `staticwebapp.config.json` — routes/headers config (authoritative at the edge);
  supports `redirect` route rules.
- `messages/` — `en.json`, `es.json` (real translation, unused). No `fr.json`.

## Target state

One `HomeSections` component used by both entry points; `/privacy` → 301 → `/en/privacy`
(same for terms); Footer links point at canonical URLs; `supportedLocales = ["en","es"]`;
`/en` carries `rel=canonical` → `/`.

## Steps

1. **Determine the canonical homepage content — check production first**:
   ```bash
   curl -s https://bridgingtrust.ai/ | grep -c -i "methodology"
   curl -s https://bridgingtrust.ai/ | grep -c -i "globe"
   ```
   Assumption (verify, don't trust): production serves `app/page.tsx`'s tree (Next.js
   serves `/` from `app/page.tsx`), i.e. Globe present, Methodology absent. **The live
   tree wins** — visitors and founders have implicitly approved it. If the live page
   shows Methodology instead, invert the choice below. Record the observed answer in the
   PR description. If both markers appear or neither, STOP and ask the operator which
   composition is intended.
2. Create `app/components/home/HomeSections.tsx` — a server component (no `"use client"`)
   that renders the canonical section sequence exactly as `app/page.tsx` does today
   (same imports, same order, same props).
3. Reduce `app/page.tsx` to rendering `<HomeSections />` (keep its metadata export
   as-is). Change `app/components/HomePageContent.tsx` to render `<HomeSections />`
   (or delete it and update `app/[locale]/page.tsx` to import `HomeSections` directly —
   prefer deletion; fewer indirections).
4. The now-orphaned divergent sections: if `MethodologySection` (or whichever section is
   dropped) has no remaining importer, delete the component file; note it in the PR (it
   is recoverable from git if the founders want it back).
5. Locale honesty: `app/[locale]/layout.tsx:2` → `["en", "es"]`. Grep for other `"fr"`
   references (`grep -rn '"fr"' app/ lib/ middleware.ts staticwebapp.config.json`) and
   remove them. Keep `messages/es.json` and `messages/en.json` untouched.
6. Canonical privacy/terms: keep `app/[locale]/privacy` + `app/[locale]/terms` (SWA
   static constraint). Delete `app/privacy/` and `app/terms/`. Add to
   `staticwebapp.config.json` `routes` (BEFORE any catch-all route entries):
   ```json
   { "route": "/privacy", "redirect": "/en/privacy", "statusCode": 301 },
   { "route": "/terms",   "redirect": "/en/terms",   "statusCode": 301 }
   ```
7. Update internal links: `grep -rn '"/privacy"\|"/terms"' app/ lib/` (expect Footer and
   CookieConsent) → change to `/en/privacy`, `/en/terms`.
8. SEO canonical: in `app/[locale]/page.tsx`, add `generateMetadata` returning
   `alternates: { canonical: params.locale === "en" ? "https://bridgingtrust.ai/" : \`https://bridgingtrust.ai/${params.locale}\` }`so`/en`consolidates to`/`.
9. Verify the `[locale]` layout remains a pass-through and only `app/layout.tsx` renders
   `<html>/<body>` (CLAUDE.md Critical rule #4).

## Security & compliance notes

Privacy-policy URL changes: 301s preserve inbound links (email footers, cookie banners).
Confirm the cookie-consent component's policy link is updated (step 7) — a broken privacy
link is a compliance defect. No secrets/permissions involved.

## Validation

```bash
npm run build   # confirm /en, /es static params generate; no /fr in build output
npx vitest run  # suite green (NavBar/Footer tests may assert link hrefs — update them)
```

On the PR's SWA preview environment:

```bash
for p in / /en /es /privacy /terms /en/privacy /en/terms; do
  curl -s -o /dev/null -w "%{http_code} %{redirect_url} $p\n" "https://<preview-host>$p"; done
# expect: 200 / ; 200 /en ; 200 /es ; 301→/en/privacy ; 301→/en/terms ; 200 ; 200
curl -s https://<preview-host>/ > a.html; curl -s https://<preview-host>/en > b.html
# diff the visible section markers — must show the SAME section set
curl -s -o /dev/null -w "%{http_code}\n" https://<preview-host>/fr   # 404 expected
```

`/fr` returning 404 is a **behavior change** — check Search Console/analytics for any
`/fr` traffic first; if real users hit it (unlikely), add a `/fr/*` → `/` redirect in
`staticwebapp.config.json` instead of letting it 404.

## Rollback

Revert the PR and redeploy (push to main). The 301s are edge config — reverting
`staticwebapp.config.json` removes them on next deploy; 301 caching in browsers is
bounded and the old URLs will function again immediately server-side.
