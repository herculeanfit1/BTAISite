# ADR-0003: Defer real i18n; redirect locale paths to canonical English

**Status**: Accepted
**Date**: 2026-07-25 (recorded 2026-07-27, backfilled by PLAN-012)
**Supersedes**: nothing. **Superseded by**: nothing.

## Context

`next-intl` was installed and a `[locale]` route segment existed for `en`, `es` and `fr`,
with a genuine Spanish translation sitting in `messages/es.json`. None of it was wired up:
`next-intl` was never imported, so no message file was ever consumed.

The result was that **every locale served identical English at HTTP 200**. `/es` looked
like a Spanish page to a crawler and to a link-sharer; it was English. `/fr` was worse —
it prerendered English at a French URL with no French content in the repository at all.

That is a correctness and SEO problem, not a cosmetic one: duplicate content across three
URL families, and a promise of localisation the site could not keep.

## Decision

**Defer real internationalisation, and make the URL space honest in the meantime.**

1. Every `/{locale}` path **301s to its canonical top-level equivalent** —
   `/en/privacy → /privacy`, `/es → /`, and so on. The redirects live in
   `staticwebapp.config.json`, which is the only place the SWA hybrid adapter honours them.
2. Canonical content lives at top-level paths: `/`, `/privacy`, `/terms`,
   `/product-terms`, `/engagement-terms`.
3. `next-intl`, `messages/en.json` and `messages/es.json` are **kept**. The Spanish
   translation is real work and should not be thrown away for a decision that may reverse.
4. Supported locales are reduced to what could plausibly be served (`en`, `es`); `fr` was
   removed rather than left prerendering English.

## Consequences

- One canonical URL per page. No duplicate-content ambiguity.
- The `app/[locale]/` tree still exists but is **unreachable in production**, because the
  edge redirect resolves before routing reaches the segment. It is retained for now
  because `CLAUDE.md` ties it to Oryx static prerendering of the legal pages — a claim
  that needs verifying on a preview deploy before the tree is deleted.
- Reversing this decision means removing the redirects and wiring `next-intl` properly.
  The translation assets are still in place, so the cost is the wiring, not the content.
- **The canonical direction is load-bearing and easy to invert by accident.** PLAN-008 was
  written before this decision and specifies the opposite — pointing `/privacy` at
  `/en/privacy` — which, against the redirects above, is an infinite loop on the privacy
  policy. `__tests__/routing/redirect-map.test.ts` exists to make that failure loud.

## Trigger for revisiting

A business decision to market in Spanish, with someone accountable for keeping the
translation current. Absent that, serving one honest language beats serving three
identical ones.
