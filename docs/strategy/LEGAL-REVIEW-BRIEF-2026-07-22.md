# Legal Review Brief — Terms of Service under the build-led repositioning

> **SUPERSEDED (2026-07-22)** — consolidated into
> [`COUNSEL-PACKET-2026-07-22.md`](./COUNSEL-PACKET-2026-07-22.md), which is the document
> to give counsel. This file is retained for history only.
>
> **It contains two errors corrected in the packet**: the Limitation of Liability cap was
> described as missing when it already exists (12 months of fees or $1,000, whichever is
> greater), and the dependency-manifest recommendation relied on an SBOM that is ~14 months
> stale. Do not act on this file directly.


**Date**: 2026-07-22
**Author**: Claude Opus 4.8 (drafted for operator review; **not legal advice**)
**Trigger**: The site repositioned from AI governance / Microsoft enablement advisory to a
custom AI solutions firm that designs and builds software. See PR #29.

**Status**: The *descriptive* copy in `app/terms/page.tsx` and `app/privacy/page.tsx` was
updated in the same PR. The *operative* clauses below were deliberately left untouched —
they govern software ownership and liability, and changing them is a lawyer's call.

**Scope note**: All four files exist twice — `app/<page>/page.tsx` and
`app/[locale]/<page>/page.tsx`. Their legal prose is byte-identical (they differ only by an
import line and a `Link`-vs-anchor element). **Any change must be applied to both copies**,
or they will drift.

---

## Why this is now urgent

The Terms were written for an advisory business that produces documents. The business now
produces **working software that runs in a client's production environment**. Three clauses
were written against the old model, and the homepage now makes a promise none of them
support.

The site's "How We Build" section states:

> **Built to be handed over** — Documented, tested, and owned by your team at the end. No
> black boxes and no dependency on us to keep it running.

That is a public commitment about ownership and post-engagement use. The Terms currently
contradict it.

---

## Finding 1 — Intellectual Property clause is incompatible with commissioned software

**Location**: `app/terms/page.tsx` §Intellectual Property (second paragraph, ~line 82)

**Current text**:

> Materials provided during the provision of our services are licensed to you **for the
> duration of our engagement**, unless otherwise specified in a separate agreement. You may
> not distribute, **modify**, transmit, reuse, download, repost, copy, or use such
> materials, whether in whole or in part, for commercial purposes or for personal gain,
> without express advance written permission from us.

**Problems**:

1. **The license expires with the engagement.** A client who commissions a production AI
   system cannot have its right to use that system lapse when the engagement ends. Read
   literally, every past client is running unlicensed software.
2. **"You may not modify"** is incoherent for delivered source code — maintaining it
   requires modifying it, which is precisely what "owned by your team" implies.
3. **"...or use such materials... for commercial purposes"** — a business system built for a
   commercial client is used for commercial purposes by definition.
4. It **contradicts the Deliverables clause** (Finding 2), which grants a license "for
   internal use upon full payment" with no duration limit and no modification bar. Two
   clauses in the same document state different licenses over the same subject matter.

**Question for counsel**: Should engagement deliverables be carved out of this clause
entirely, with ownership and license handled solely in the Deliverables clause (and the SOW)?
The current paragraph reads as though drafted for *site* materials and marketing collateral,
which the preceding paragraph already covers.

---

## Finding 2 — Deliverables clause never mentions software or source code

**Location**: `app/terms/page.tsx` §Deliverables and Work Product (~line 90)

**Current text**:

> Unless otherwise specified in a separate Statement of Work or engagement agreement,
> deliverables created during consulting engagements (**including governance frameworks,
> assessment reports, policy templates, and implementation documentation**) are licensed to
> the client for internal use upon full payment. Bridging Trust AI LLC retains the right to
> reuse methodologies, frameworks, and anonymized patterns across engagements.

**Problems**:

1. The enumerated deliverables are **all documents**. Source code, models, prompts,
   configurations, infrastructure-as-code and trained artifacts are absent.
2. **"Licensed to the client for internal use"** is a *license*, not an assignment. Many
   clients commissioning custom software expect to **own** it, or at minimum to have an
   irrevocable, perpetual, modifiable license. This should be a deliberate decision, not an
   accident of drafting.
3. **The reuse reservation is untested against code.** "Methodologies, frameworks, and
   anonymized patterns" is sensible for advisory. For software, the analogous question —
   may BTAI reuse libraries, scaffolding, or components built during a client engagement in
   other engagements? — is unanswered. This is normally handled with a background-IP /
   foreground-IP split, which the document does not have.
4. No treatment of **third-party and open-source components**, which any real AI build will
   include, nor of the license obligations they carry through to the client.
5. No treatment of **AI model output ownership**, or of the terms of the underlying model
   providers the system depends on.

**Questions for counsel**:
- Assignment or license for custom-built code? If license: perpetual, irrevocable,
  modifiable, sublicensable?
- Background IP vs foreground IP — what does BTAI retain and reuse?
- Who carries OSS license compliance obligations?
- What happens to delivered code on **non-payment**, and is a license-on-payment condition
  practically enforceable once a system is in production?

---

## Finding 3 — Warranty disclaimer is scoped to advisory output only

**Location**: `app/terms/page.tsx` §Disclaimer (~line 134)

**Current text**:

> Our **advisory services**, including AI governance frameworks, risk assessments, and
> compliance guidance, represent professional recommendations based on current best
> practices and available information. They do not constitute legal advice and should not be
> relied upon as a substitute for qualified legal counsel.

**Problems**:

The general "AS IS" / merchantability / fitness disclaimer in the preceding paragraphs does
cover services broadly, so this is **less severe than Findings 1 and 2**. But the only
*specific* disclaimer addresses advisory output. Nothing addresses:

1. **Software defects** and the absence of any warranty that delivered systems are
   error-free.
2. **AI-specific failure modes** — non-determinism, hallucination, model drift, degradation
   after provider model updates, and the fact that outputs require human review. For a firm
   selling AI systems this is the single most likely source of a client dispute.
3. **Dependency on third-party model providers** — availability, pricing changes,
   deprecation, and terms changes outside BTAI's control.
4. **Post-handover changes.** Once a client owns and modifies a system, BTAI's
   responsibility for its behavior should end explicitly.

**Question for counsel**: Add an AI-and-software-specific disclaimer paragraph alongside the
advisory one, rather than relying on the general "AS IS" language?

---

## Finding 4 — Secondary gaps worth raising in the same pass

Not blocking, but cheap to address while counsel is already in the document:

- **No acceptance / sign-off mechanism.** Nothing defines when a deliverable is accepted,
  how defects are reported, or how long a remediation window runs.
- **No support/maintenance boundary.** The site sells "Deployment & Ongoing Operations,"
  but the Terms do not distinguish project delivery from ongoing operations, nor state that
  operations are separately contracted.
- **Confidentiality clause exists but was written pre-build.** Worth confirming it reaches
  client production data and credentials that a build engagement necessarily touches.
- **Privacy §Information from service engagements** now names systems, source code
  repositories and cloud environments (updated in PR #29). Confirm this aligns with the DPA
  or engagement-agreement language actually used with clients.
- **No AI-specific data-handling statement.** The Privacy Policy does not say whether client
  data is used with third-party model providers, whether it is used for training, or how
  prompts and outputs are retained. For a firm whose homepage says "your data stays where it
  should," this is a visible gap.

---

## What was already changed (no review needed)

Descriptive copy only, landed in PR #29:

| File | Change |
|---|---|
| `terms` §Services | Offering description rewritten from governance advisory to custom AI design and build |
| `privacy` §Use of Information | Dropped the retired three-pillar service list; broadened "consulting and advisory" to include development and operations |
| `privacy` §Information from service engagements | Widened engagement access to name systems, source code repositories and cloud environments |
| both | `Last Updated` bumped to July 22, 2026 — records the copy pass, not a legal review |

No compliance claims ("SOC 2", "HIPAA", "certified") appear anywhere in the site or these
documents, and none were introduced.

---

## Suggested sequencing

1. **Findings 1 and 2 together** — they overlap and currently contradict each other; fixing
   one without the other risks deepening the inconsistency.
2. **Finding 3** — additive, low risk.
3. **Finding 4** — housekeeping in the same engagement.

Until Findings 1 and 2 are resolved, the safest operational posture is to ensure **every
build engagement has a signed SOW with explicit IP terms**, since both clauses defer to
"a separate Statement of Work or engagement agreement." The SOW is currently doing all the
real work; the Terms are not a reliable fallback.
