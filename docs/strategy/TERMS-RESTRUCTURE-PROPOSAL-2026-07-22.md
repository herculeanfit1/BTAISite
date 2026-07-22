# Making the Terms Self-Sufficient — a restructuring proposal

> **SUPERSEDED (2026-07-22)** — consolidated into
> [`COUNSEL-PACKET-2026-07-22.md`](./COUNSEL-PACKET-2026-07-22.md), which is the document
> to give counsel. This file is retained for history only.
>
> **It contains two errors corrected in the packet**: the Limitation of Liability cap was
> described as missing when it already exists (12 months of fees or $1,000, whichever is
> greater), and the dependency-manifest recommendation relied on an SBOM that is ~14 months
> stale. Do not act on this file directly.


**Date**: 2026-07-22
**Author**: Claude Opus 4.8 — **not a lawyer, and this is not legal advice.** This is an
engineering-and-operations read of where the current document leaves you exposed, written so
counsel can price and scope the work quickly instead of starting from a blank page.
**Companion to**: `LEGAL-REVIEW-BRIEF-2026-07-22.md`

---

## The core diagnosis

The current document has a structural problem underneath the clause-level ones: **it is
trying to be two different contracts at once.**

A website Terms of Service governs *visitors* — people browsing, submitting a contact form,
reading content. It is accepted passively by use. A services agreement governs *clients* —
people paying you to build software. It needs actual assent, and it carries IP, liability,
payment and confidentiality terms that a browsewrap can't credibly bind anyone to.

Today's document mixes both, and then hands the hard parts off to a separate agreement — in
the two clauses that matter most, and with *different* wording in each:

- **Deliverables**: *"Unless otherwise specified in a separate Statement of Work or
  engagement agreement…"*
- **Intellectual Property**: *"…unless otherwise specified in a separate agreement."*

The IP clause is the vaguer of the two — it doesn't even name a Statement of Work, just
"a separate agreement." The result: **the Terms don't state a complete default — they state a
placeholder.** If an engagement ever runs without a signed SOW, or the SOW is silent on a
point, there is no reliable fallback.

## The honest answer to "can we stop relying on SOWs?"

**Partly.** You cannot eliminate SOWs for custom development, and shouldn't want to. Three
things are irreducibly per-engagement:

1. **Scope** — what specifically is being built.
2. **Price and payment schedule.**
3. **Timeline, milestones, and named acceptance criteria.**

Those are commercial terms; they change every time. What you *can* eliminate is the SOW
carrying **legal** terms. Right now IP ownership, liability caps, confidentiality, warranty
and termination all effectively live in the SOW because the Terms defer to it. That is
backwards, and it means every SOW has to be legally reviewed rather than being a one-page
scope-and-price document.

**The target state**: a complete Master Services Agreement that stands alone, plus thin SOWs
that reference it and carry only scope, price and schedule. An engagement with a missing or
sloppy SOW still lands on complete legal terms.

## Recommended structure

Split the single document into three:

| Document | Governs | Accepted by | Changes |
|---|---|---|---|
| **Website Terms of Use** | Site visitors | Browsing (passive) | Rarely |
| **Master Services Agreement (MSA)** | Clients | Signature, or click-accept at engagement start | Rarely |
| **Statement of Work** | One engagement | Signature | Every engagement |

The MSA can still be published at `/msa` for transparency — several consultancies do this,
and it shortens sales cycles because procurement can read your terms before the first call.
But it must be **signed or expressly accepted**, not merely posted. Posting a services
agreement and hoping browsewrap binds a client on IP ownership is the weakest part of the
current setup.

The Website Terms of Use then shrinks dramatically — site use, acceptable use, site IP,
disclaimers about site content, contact-form terms. Most of the current document's hard
clauses move to the MSA.

---

## What the MSA has to cover to stand alone

Grouped by what's **missing entirely** today versus what exists but defers.

### A. Missing entirely — these are the gaps that force SOW reliance

**1. Acceptance and rejection.**
Nothing defines when a deliverable is accepted. Without this there is no moment where
risk transfers, no trigger for final payment, and no bound on rework. Needs: a review window
(e.g. 10 business days), a default of deemed-acceptance on silence, a written-rejection
mechanism naming the specific failed criteria, and a bounded remediation cycle.

**2. Change control.**
Custom software scope moves. Without a change mechanism, every scope conversation is a
renegotiation. Needs: a written change-request process, an explicit statement that work
outside the SOW is not owed until a change order is signed, and how changes affect price and
schedule. (Note: the existing *"Changes to These Terms"* section is about amending the Terms
document itself — it is not scope change control, despite the similar name.)

**3. Warranty on delivered software.**
Currently only a blanket "AS IS". Consider instead a *narrow, time-boxed* warranty — e.g.
the deliverable will materially conform to the SOW's acceptance criteria for 30–90 days, sole
remedy being repair — with everything else disclaimed. A narrow express warranty is usually
easier to sell than pure "AS IS," and it caps exposure more predictably than silence.

**4. AI-specific limitations.** *(This is the one most specific to your business.)*
No document currently says AI systems are non-deterministic, that outputs may be inaccurate
and require human review, that third-party model providers may change, deprecate, reprice or
degrade models outside your control, or that model behavior may drift after handover. For a
firm selling AI systems this is the likeliest source of a real dispute.

**5. Client dependencies.**
Builds fail when access, data, environments or decisions don't arrive. Needs: an explicit
client-obligations clause (timely access, data, approvals, a named decision-maker), and
relief — schedule extension, cost recovery — when they don't.

**6. Termination.**
No termination clause exists. Needs: termination for convenience with notice, termination
for cause with a cure period, what is owed for work performed, and **what happens to
delivered code and licenses on termination** — including in a non-payment scenario.

**7. Liability cap that actually names a number.**
Review the existing Limitation of Liability against a stated cap — commonly fees paid in the
preceding 12 months — with carve-outs (confidentiality breach, IP indemnity, gross
negligence). An uncapped or vaguely-capped agreement is what makes enterprise procurement
slow.

**8. Insurance, subprocessors, and data protection.**
If you touch client production data: a DPA or equivalent, a list of subprocessors (including
which model providers), and a statement on whether client data is used for training. Your
homepage says *"your data stays where it should"* — the contract should say the same thing
in operative language.

**9. Publicity.**
Whether you may name the client or describe the work. Relevant now: your biggest remaining
credibility gap is case studies, and you can't publish them without this.

### B. Exists but defers — make these self-executing

**10. IP ownership.** See Finding 1 and 2 in the companion brief. The decision to make is:
**assignment or license** for custom-built code, and a **background-vs-foreground IP split**
so you can reuse your own scaffolding, libraries and internal tooling across engagements
without a per-SOW carve-out. My read of your positioning — *"owned by your team at the end,
no dependency on us"* — is that clients should get ownership or a perpetual irrevocable
license to the foreground work, while you retain everything pre-existing and general-purpose.
Write that as the default so the SOW never has to.

**11. Third-party and open-source components.** State that deliverables may include OSS,
that it comes under its own licenses, and who carries compliance. Add whether you'll provide
a dependency manifest — you already generate SBOMs in this repo, which makes this cheap to
promise and is a genuine differentiator.

**12. Confidentiality.** A clause exists; confirm it reaches production data, credentials
and system access, is mutual, and has a defined duration.

---

## Suggested sequencing

1. **Decide the IP default first** (assignment vs perpetual license; background vs
   foreground). Everything else drafts around that answer, and it's a business decision, not
   a legal one.
2. **Split website terms from the MSA.** Mostly a cut-and-paste plus a new short Terms of
   Use — cheap, and it makes the MSA reviewable on its own.
3. **Have counsel draft the MSA** with items 1–12 above. Handing them this list should
   meaningfully reduce billable discovery time.
4. **Reduce the SOW to a template**: scope, deliverables, acceptance criteria, price,
   schedule, named personnel, and a single line incorporating the MSA by reference.
5. **Re-check the site copy against the final MSA** — specifically "owned by your team at the
   end," "your data stays where it should," and "auditable by design," which are all
   contractual-sounding promises that should have operative language behind them.

## Interim posture, until that work lands

Both clauses that matter defer to a separate agreement. Until the MSA exists, **that deferral
is the only thing protecting either side** — so in the interim, every build engagement needs a
signed SOW that explicitly states IP ownership, acceptance, and liability. That is exactly the
dependency you want to remove, but it is the current reality and worth being deliberate about
rather than discovering mid-engagement.

**Verified section inventory** (`app/terms/page.tsx`, 2026-07-22) — present: Introduction,
Services, User Obligations, User Content, Intellectual Property, Deliverables and Work
Product, Payments and Billing, Confidentiality, Limitation of Liability, Disclaimer,
Indemnification, Governing Law, Severability, Changes to These Terms, Contact Us.
**Absent**: Termination, Acceptance, scope Change Control, express Warranty, Insurance,
Publicity, Client Dependencies, Subprocessors/Data Protection.

## One thing to avoid

Do not publish a more assertive-sounding Terms document without counsel review just because
it reads better. Overstating what you can enforce is worse than the current gap — and given
the repositioning already makes capability claims ("secure by default," "auditable by
design"), the contract is exactly the wrong place to add unbacked assertions. No compliance
claims ("SOC 2," "HIPAA," "certified") should appear in any of these documents unless and
until they are true and evidenced.
