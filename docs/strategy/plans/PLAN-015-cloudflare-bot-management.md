# PLAN-015 — Cloudflare Bot Management (JS Detections): the decision

**Status**: decision document. **No change is proposed in this repo, because none is
possible from this repo.** Everything actionable lives in the Cloudflare dashboard, for
which there are no credentials here.

**Measured**: 2026-07-30, against `main` at `1de7983`, apex vs SWA origin serving the
identical build.

**Who decides**: the owner. This document's job is to make that decision precise — what
exactly to toggle, what it costs in protection, and how to prove the gain afterwards.

---

## 1. What is actually true, measured today

`RUNS=3 ./scripts/measure-cloudflare-cost.sh`:

| category | apex (Cloudflare) | origin (bare SWA) | edge cost |
| --- | --- | --- | --- |
| performance | **81** (81–86) | 97 (96–97) | **−16** |
| accessibility | 100 | 100 | 0 |
| best-practices | **81** (81–81) | 100 (96–100) | **−19** |
| seo | 92 | 100 | −8 |
| TBT | 293 ms (163–306) | 0 ms | **+293 ms** |

Both targets serve the same build and a **byte-identical** CSP header, verified with
`curl`. Accessibility scoring 100 on both is the control: it establishes that the code is
the same and the difference is the edge.

## 2. Attribution — which audit, caused by what

The tracker previously said "15 performance + 19 best-practices", attributing all of it to
Bot Management. Reading Lighthouse's per-audit source locations rather than the category
scores splits that differently, and one part of it should not be attributed to Bot
Management at all.

### best-practices: −19 is two audits, not one

Best-practices is scored out of a total weight of 27, so each weight point is 3.7 score
points.

| audit | weight | = points | fails | cause |
| --- | --- | --- | --- | --- |
| `deprecations` | 5 | **18.5** | **6 of 6 runs** | all three entries carry a `sourceCodeLocation` of `/cdn-cgi/challenge-platform/scripts/jsd/main.js` — `SharedStorage`, `StorageType.persistent`, `Fledge` |
| `inspector-issues` | 1 | 3.7 | **1 of 6 runs** | **not established** — see below |

So the durable, reproducible best-practices cost of JS Detections is **18.5 points**, not
19, and it is proven by source location rather than inferred from timing.

### The remaining ~3.7 points are not attributed, deliberately

Lighthouse's `inspector-issues` reports a "Content security policy" issue listing 19 URLs —
our own `_next` chunks alongside the Cloudflare beacon and `jsd/main.js`. The obvious
reading is a CSP gap, and there was a plausible specific candidate: `connect-src` allows
`https://cloudflareinsights.com` but **not** `https://static.cloudflareinsights.com`.

That hypothesis is **refuted**. Six fresh browser loads of the apex, listening on both
`securitypolicyviolation` events and CDP `Audits.issueAdded`, recorded **zero** CSP
violations and zero failed requests. A positive control — injecting a script from a
non-allow-listed host into the live page — fired both channels, so the probe demonstrably
sees violations when they exist.

The audit fails in 1 run of 6 and does not correspond to any violation a real browser
reports. It is edge-related (the origin scores it clean, under the same CSP), but **which**
edge feature causes it is unknown, and this document does not claim otherwise. It is worth
~3.7 points and is not worth further hunting.

### performance: −16 is one script

| | apex | origin |
| --- | --- | --- |
| script evaluation, `jsd/main.js` | **750 ms** | absent |
| longest long task | **375 ms**, attributed to `jsd/main.js` | none recorded |
| TBT | 284–312 ms | 0 ms |

No other script on the page evaluates for more than 25 ms. The performance deficit is this
one file.

### seo: −8 is a different item entirely

The `robots-txt` audit, failing on the `Content-Signal:` directive Cloudflare prepends.
**Out of scope here and recommended for keeping** — it is a deliberate AI-crawler policy.
Tracked as its own row.

## 3. The cost recurs about every 15 minutes — not once per browser, not once per page view

| load, same browser profile throughout | requests to `/cdn-cgi/challenge-platform/` |
| --- | --- |
| cold (fresh profile) | **3** |
| warm, +10 s | **0** |
| warm, **+17 min** | **5** |

**This was measured because two sources disagreed, and the wrong one was more convenient.**
Cloudflare's docs say the JSD session lasts 15 minutes and "the code is injected again
before the session expires" — i.e. the cost recurs. But the `cf_clearance` cookie this zone
actually issues carries a **365-day** expiry, which invited the much rosier conclusion that
JSD is a once-per-browser cost.

A reload seconds later is consistent with *both* stories, so it settles nothing. Waiting
past the documented session settles it: **the docs are right and the cookie expiry is a red
herring.** The cookie's lifetime answers "how long is this cookie valid", not "how long
until JSD re-injects" — a true fact about a neighbouring question, and it would have
understated the cost by orders of magnitude had it gone in unmeasured.

What this means in practice:

- Additional page views **within** a session are free. It is not a per-page-view tax.
- But a typical marketing-site visit is a few page views over a few minutes, so a visitor
  pays it on **the first page load of essentially every visit** — and again if they come
  back later the same day.
- **Lighthouse always runs cold**, so it always pays full price. The §1 scores describe
  that first page load, which is also the one that decides whether a visitor stays.

## 4. Core Web Vitals still pass at the apex

Worth stating plainly before recommending anything, because it bounds how much the 34
points are actually worth:

| metric | apex | passes CWV threshold? |
| --- | --- | --- |
| LCP | 1.2 s | ✅ (≤ 2.5 s) |
| CLS | 0 | ✅ (≤ 0.1) |
| FCP | 0.6 s | ✅ |
| TBT | 320 ms | lab-only metric; the field metric it proxies (INP) is not measured here |

The damage is concentrated in **TBT**, which is a lab metric and the heaviest single
contributor to the Lighthouse performance score (weight 30). The user-visible experience at
the apex is worse than the origin's, but it is not failing — **the score is worse than the
experience**. Any decision that trades security for these points should be made knowing
that.

This is the main thing holding the recommendation in §7 where it is. It is a genuine
counterweight, not a dismissal: §3 establishes the cost lands on the first page load of
essentially every visit, which is not nothing.

## 5. What can actually be toggled — and it depends on the plan

**This is step one, and it cannot be answered from here.** The available levers differ
completely by Cloudflare plan, and the plan is visible on the zone's Overview page in the
dashboard.

| plan | JS Detections | can it be scoped or skipped? |
| --- | --- | --- |
| **Free** — Bot Fight Mode | **Mandatory. Cannot be disabled.** | **No.** BFM runs *outside* the Ruleset Engine, so Skip/Bypass/Allow do not apply — Cloudflare's docs state you cannot bypass it with WAF custom rules or Page Rules, and it cannot be limited to specific paths. |
| **Pro / Business** — Super Bot Fight Mode | **Optional, separate toggle** | Yes — SBFM runs on the Ruleset Engine and supports Skip rules |
| **Enterprise** — Bot Management | Optional, off by default | Yes, plus a JS Detections API script for path-scoped injection |

So:

- **On Pro/Business/Enterprise** there is a surgical fix: Security → Bots → Configure Bot
  Management → **JavaScript Detections → Off**. Bot challenges continue; only the JS
  fingerprinting stops.
- **On Free the only lever is turning Bot Fight Mode off entirely**, which removes the
  whole Cloudflare bot layer, not just its slow part.

## 6. What it costs in protection

Cloudflare's own documentation is unusually direct here:

> You must enable JavaScript Detections and then create a custom WAF rule using the
> `cf.bot_management.js_detection.passed` field to block or challenge a failed request.
> Enforcement against bots does **not** occur even if the cookie is flagged false.

So JSD's signal is only *enforced* if a rule consumes it. Whether such a rule exists on
this zone **cannot be determined from here** — that requires dashboard access. On Free,
Bot Fight Mode consumes the signal internally for its own challenge decisions; there is no
rule to inspect.

What the site keeps regardless of this decision:

- **Server-side anti-abuse in the contact handler** (`src/lib/api/contact-handler.ts`) —
  validation, rate limiting and the rest, tunables in the private runbook. This is the
  actual defence for `/api/contact`, which is the **only state-changing endpoint on the
  site**. It does not depend on Cloudflare.
- CSP and the rest of the security headers, from `next.config.js`.
- Any WAF managed rules, which are separate from Bot Fight Mode.
- The site has no login, no accounts, and stores no user data in the browser.

Verified as part of this work: `https://bridgingtrust.ai/api/health` returns **200
`{"status":"ok"}`** through Cloudflare, so Bot Fight Mode is not currently challenging the
API path the deploy gate polls. Turning it off cannot break that gate.

## 7. Recommendation

**If the zone is Pro, Business or Enterprise — turn JavaScript Detections off.** It is
optional by Cloudflare's own design, the bot challenges themselves continue, and the only
capability lost is headless-browser fingerprinting. Recovers ~18.5 best-practices points
and ~16 performance points on first visits, at close to no security cost. Do it.

**If the zone is Free — leave Bot Fight Mode alone, but it is a closer call than it looks.**
The only available lever is far larger than the problem: it removes the entire Cloudflare
bot layer to recover points on a lab metric, on a site whose Core Web Vitals already pass
and whose one writable endpoint is defended server-side regardless. That still reads as a
bad trade — but §3 removed the comfortable version of this argument. The cost is **not** a
one-off per browser; it lands on the first page load of essentially every visit, which is
the load that decides whether a visitor stays.

If the score itself matters — for marketing or SEO reporting — the proportionate fix is
**upgrading the plan to get the surgical toggle**, not removing bot protection. That is the
option to weigh against a monthly fee, and it is the one this document would push toward if
the deficit is judged to actually matter.

**Either way, do not point the Lighthouse CI gate at the apex.** It measures the edge, not
this codebase, and the apex is not deterministic.

## 8. How to prove the gain afterwards

Run this **before** touching anything, and again after:

```bash
JSD_ONLY=1 ./scripts/measure-cloudflare-cost.sh   # deterministic, ~1 second
RUNS=5   ./scripts/measure-cloudflare-cost.sh     # the scores, ~4 minutes
```

**Check the deterministic result first.** JSD injection is a byte in the HTML, so it
answers yes/no in one request; the Lighthouse scores are noisy enough that a single
before/after pair proves nothing. `JSD_ONLY=1` exits `0` when JSD is present, `1` when it
is absent, and **`2` when it could not tell** — a fetch failure and a wrong-looking
response are reported as distinct from "not present", because "the query failed" and "the
answer is no" are different states and conflating them has already cost this repo a day.

Success criteria, in order of how much they are worth trusting:

1. `JSD_ONLY=1` reports **NOT injected** at the apex. Binary; this is the real proof.
2. The apex `deprecations` audit **passes** (it fails 6 of 6 runs today).
3. Apex best-practices ≥ **96**, versus 81 today.
4. Apex performance within ~3 points of the origin, and apex TBT under 50 ms versus ~293 ms
   today.

**Compare ranges, not points.** The apex is not deterministic — it has swung 64 → 86 on
unchanged code. Use `RUNS=5` and treat any difference that falls inside the observed ranges
as noise.

## 9. What this document does not establish

- **The zone's plan**, and therefore which branch of §5 applies. One look at the dashboard.
- **Whether any WAF rule consumes the JSD signal**, and so whether it is enforced at all.
- **The cause of the intermittent `inspector-issues` failure** (~3.7 points). Edge-related,
  not a real CSP violation, otherwise unattributed.
- **Real-user impact.** Every number here is lab data from one machine and one network.
  There is no RUM in place to say what visitors actually experience.
