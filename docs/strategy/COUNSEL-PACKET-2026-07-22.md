# Counsel Packet — Bridging Trust AI LLC contract restructuring

**Date**: 2026-07-22
**Prepared by**: Claude Opus 4.8 for Terence Kolstad. **Not a lawyer; this is not legal
advice.** It is an engineering-and-operations read of the current documents, assembled so
counsel can price and draft without doing discovery first.

**Supersedes** `LEGAL-REVIEW-BRIEF-2026-07-22.md` and
`TERMS-RESTRUCTURE-PROPOSAL-2026-07-22.md`. Both remain in git history and carry pointers
here. **Where they disagree with this packet, this packet is correct** — see §1.

Every clause quoted below was verified by grep against the source file at commit `7a8e746~1`
(the last state before the interim publish).

---

## 0. Why now

Bridging Trust AI repositioned from an AI governance and Microsoft enablement advisory to a
firm that **designs and builds custom AI systems**, sells **productized solutions deployed
into customer tenants**, and is developing a **reseller channel**. The contracts were written
for the first of those and never updated for the other two.

An interim set of corrections has already been published under a strict gate (§7). This
packet covers what was deliberately **not** published because it requires counsel.

---

## 1. Corrections to the prior memos — read before the rest

Two claims in the superseded documents were wrong. They are corrected here so counsel does
not act on them.

**1.1 — The liability cap exists.** `TERMS-RESTRUCTURE-PROPOSAL` listed "liability cap that
actually names a number" as *missing* and recommended a cap of fees paid in the preceding 12
months. The clause already says exactly that:

> "Our liability shall be limited to the maximum extent permitted by law, and shall not
> exceed the amount you paid to us over the **12 months preceding the claim or $1,000,
> whichever is greater**."

The recommendation was redundant. What the clause actually needs is a **review**, not a
drafting exercise: whether the floor and the "whichever is greater" construction are right,
and whether carve-outs (confidentiality breach, IP indemnity, gross negligence) should sit
above the cap.

**1.2 — The SBOM is stale, so the dependency-manifest recommendation is conditional.**
`TERMS-RESTRUCTURE-PROPOSAL` suggested promising clients a dependency manifest "because you
already generate SBOMs — cheap to promise." `sbom.json` is dated **September 3 2025** and was
last changed in git on **2025-05-26**, roughly fourteen months stale. It is produced by
`cdxgen` via `npm run generate-sbom`, invoked only from a pre-commit script. **Do not promise
a dependency manifest in any contract until that generation is revived and wired into the
release path.**

---

## 2. Three revenue lines, three IP regimes

This is the frame for everything else. Applying one IP default across all three would either
give away the product line or make the custom-build promise undeliverable.

| Line | What is delivered | IP default | Status |
|---|---|---|---|
| **Custom builds** | Bespoke systems built for one client | **Hybrid** — foreground work product assigns to client on full payment; BTAI retains background IP | Published (§7) |
| **Productized solutions** | AppRegGovernance, PIMLite, GuestLifecycle, OAuthConsentWatchdog, Power Pack, Admin Console, QBR Dashboard — deployed into customer tenants | **BTAI retains title**; limited, non-transferable, non-sublicensable license | Published (§7) |
| **Reseller channel** | Partner sells / bundles the above | **Undrafted** | **Counsel — never published** |

### 2.1 Custom builds — what counsel must settle

The published position is that foreground work product assigns to the client on full payment,
and background IP (tooling, scaffolding, libraries, methodologies, general-purpose
components) remains BTAI's with a perpetual license where embedded. Counsel to confirm:

- Whether **assignment** or a **perpetual irrevocable license** is the right instrument.
- How the foreground/background boundary is defined in operative language — this is where
  disputes actually happen.
- What happens to the assignment on **non-payment**, and whether a license-on-payment
  condition is enforceable once a system is in production.
- Open-source and third-party components: who carries compliance obligations.
- **AI model output ownership**, and flow-through of model-provider terms.

### 2.2 Productized solutions

Published terms retain title and grant a limited license scoped to the identified
environment, with no redistribution, resale, sublicensing, hosting-for-third-parties, or
derivative works. Counsel to add: term and renewal, fees, acceptance, warranty, support
boundary, termination, and what happens to deployed artifacts on termination.

### 2.3 Reseller channel — the undrafted one

Nothing exists. Questions counsel should frame:

- **Who contracts the end customer** — BTAI directly, or the reseller?
- **Flow-down**: how do the product license terms bind an end customer the reseller signs?
- **Liability**: who carries it when a reseller-sold solution fails in an end customer tenant?
- Whether the reseller may **bundle** BTAI solutions into its own offering, and under whose
  brand.
- Support and escalation path, and who holds the customer relationship on renewal.

Channel terms are partner-facing commercial contracts and should **never** be published on
the website.

---

## 3. Persistent privileged identity in customer tenants

**This is the highest-exposure item in the packet and it is not covered by any current
contract.**

Some BTAI solutions require an application identity operating inside a customer tenant, with
delegated Microsoft Graph scopes — including, for the transcript product, access to meeting
transcripts. Credentials for that identity are held and rotated by BTAI.

The published Product License Terms commit BTAI to scoped access, **annual credential
rotation with a 60-day overlap window**, prompt notification on confirming a security
incident affecting that identity, and a defined decommission process at termination. Those
are obligations BTAI takes on itself, which is why they could publish under the gate.

**What counsel must supply:**

- **Incident notification window.** Published language says "promptly." A number was
  deliberately withheld pending counsel. Recommend setting it alongside the liability review,
  since notification timing and liability interact.
- **Decommission window.** Published language commits to a defined process; the timeframe was
  withheld for the same reason.
- Whether the identity commitments should be **contractual** (in the signed agreement) rather
  than only in published terms.
- Insurance implications of holding privileged credentials in customer environments — see §6.

### 3.1 Identity-model confirmation — action required

The published clause is written **conditionally** — *"Where Bridging Trust AI operates an
application identity within your environment…"* — and defers per-product specifics to
deployment documentation. This was deliberate: it is accurate whether the app registration is
BTAI-owned or customer-owned.

**Confirm identity model uniformity across products before any per-product license schedule
is drafted.** Operator records indicate the transcript product uses a BTAI-owned registration
per customer tenant with delegated scopes only, chosen 2026-05-30 to satisfy a customer CISO
mandate. If any product uses a different model, the conditional language holds but a
per-product schedule must state which.

---

## 4. DPA requirement — a blocker, not a nice-to-have

BTAI processes personal data on behalf of customers, including **meeting transcripts**, which
are sensitive personal data about identifiable individuals who are not BTAI's customers.
That is a **processor** role.

**No DPA exists.** Verified: no data processing agreement or addendum in the repository. The
only references are aspirational notes in a September 2025 strategy document
(*"We should ensure we've accepted the DPA with Google"*) — a to-do list, not an artifact.

**No subprocessor list exists.** A DPA will require one, and it must include **which model
providers** customer data may reach.

This blocks enterprise and regulated-industry sales independently of everything else in this
packet.

---

## 5. Gaps in the current Terms — clause by clause

Verified section inventory of the pre-publish document. **Present**: Introduction, Services,
User Obligations, User Content, Intellectual Property, Deliverables and Work Product,
Payments and Billing, Confidentiality, Limitation of Liability, Disclaimer, Indemnification,
Governing Law, Severability, Changes to These Terms, Contact Us. **Absent**: Termination,
Acceptance, scope Change Control, express Warranty, Insurance, Publicity, Client
Dependencies, Subprocessors/Data Protection.

### 5.1 Indemnification is one-directional — expect procurement to reject this first

> "**You** agree to indemnify and hold harmless Bridging Trust AI LLC, its officers,
> directors, employees, and agents…"

There is **no BTAI → client indemnity**, in particular no IP-infringement indemnity. For
custom software delivered to an enterprise, a mutual indemnity — or at minimum a BTAI IP
indemnity — is standard and is usually a hard requirement in procurement review. Of
everything in this packet, this is the clause most likely to stop a deal.

### 5.2 Absent entirely

| Gap | Why it matters for a build business |
|---|---|
| **Acceptance / rejection** | No moment where risk transfers, no trigger for final payment, no bound on rework |
| **Scope change control** | Every scope conversation becomes a renegotiation. (The existing "Changes to These Terms" section is about amending the Terms document, not scope — similar name, different thing) |
| **Express warranty** | Only a blanket "AS IS". A narrow, time-boxed conformance warranty with repair as sole remedy is usually easier to sell and caps exposure more predictably than silence |
| **Termination** | No termination clause at all: no convenience, no cause, no cure period, nothing on what is owed or what happens to delivered code and licenses — including on non-payment |
| **Client dependencies** | Builds fail when access, data, environments or decisions do not arrive. No relief mechanism exists |
| **Insurance** | See §6 |
| **Publicity** | BTAI cannot publish case studies without it — and case studies are the largest credibility gap on a build-led site |

### 5.3 Warranty disclaimer is scoped to advisory output

> "Our **advisory services**, including AI governance frameworks, risk assessments, and
> compliance guidance, represent professional recommendations based on current best practices
> and available information."

The general "AS IS" language does cover services broadly, so this is less severe than §5.1.
But the only *specific* disclaimer addresses advisory work. Nothing addresses software
defects, or AI-specific failure modes — non-determinism, fabricated output, model drift,
provider deprecation. For a firm selling AI systems, that is the likeliest dispute. Interim
disclosure of those limitations *has* been published (§7), but as disclosure, not as a
warranty disclaimer.

### 5.4 Confidentiality — review, do not rewrite

> "…both parties may share confidential information. Each party agrees to maintain the
> confidentiality of the other party's confidential information… This obligation survives the
> termination of any engagement."

Mutual and surviving, which is good. It does not explicitly reach **client production data,
credentials, or system access**, which a build engagement necessarily touches. Confirm scope
and add a duration.

---

## 6. Open facts counsel needs — unknown, not assumed

Everything below was searched for in the repository and **not found**. None of it is
inferred.

| Fact | Status |
|---|---|
| **State of registration** | Governing Law names the **State of Minnesota** with exclusive venue there. Counsel to confirm against formation documents |
| **Operating agreement** | Not in repo. Existence and terms unknown |
| **E&O / tech professional liability insurance** | No reference anywhere. Coverage status unknown — material given §3 |
| **DPA** | Absent (§4) |
| **Subprocessor list** | Absent |
| **SOW template** | Absent, despite both key clauses deferring to one |
| **Prior engagements under current Terms** | Unknown. If clients have already been served under these Terms, there is retroactive exposure on the §2.1 and §5 gaps |
| **Employment agreement IP terms** | See §6.1 |

### 6.1 Ownership risks outside the contracts — flagged, not analyzed

Two items counsel should examine that sit outside the four corners of these documents:

1. Whether an **employer IP assignment clause** could cloud BTAI's ownership of work product,
   particularly where that same employer appears in the reseller path. A conflict there would
   undermine BTAI's ability to assign foreground IP at all.
2. Whether **co-founder IP decision rights are papered**. BTAI is co-owned; a prior business
   decision required the co-owner's ratification, which suggests the operating agreement may
   not be settled on decision rights.

---

## 7. Interim publish ledger — what shipped and what did not

Published under a gate permitting only: removing or narrowing an overreach; resolving a
contradiction; plainly factual description; obligations binding BTAI itself; honest limitation
disclosures; and license terms for a product BTAI sells.

### Shipped

| Change | Gate basis |
|---|---|
| `/terms` retitled **Website Terms of Use**, scoped to site visitors | Narrowing an overreach |
| IP clause carved back to **website materials only** — it previously licensed engagement materials "for the duration of our engagement" and forbade modification | Overreach + contradiction with the site's handover promise |
| **Deliverables and Work Product** removed from the website terms | Belongs in a signed agreement |
| **Payments and Billing** removed, including a paragraph about payment cards for "purchases made through our website" — there is no commerce on the site | Overreach; described something that does not exist |
| New **`/engagement-terms`**: hybrid IP default, third-party/OSS pass-through, AI limitation disclosures | Contradiction resolution + factual + honest disclosure |
| New **`/product-terms`**: license grant, BTAI retains title, credential-custody commitments | License terms for a product BTAI sells + BTAI-binding obligations |
| **Privacy**: disclosed HubSpot CRM storage and automated classification of inquiries by an AI model on BTAI infrastructure | Factual — the policy was inaccurate, not merely stale |
| Framework claim narrowed from "SOC 2, NIST AI RMF, ISO 27001" to "established security and AI risk frameworks" | Narrowing a claim |
| Retired service pages noindexed; sitemap cleaned | Contradiction with live positioning |

### Deliberately withheld

Liability caps or any change to the existing one · indemnification in either direction ·
termination, cure periods, and what is owed on termination · express warranties · acceptance
and rejection mechanics · governing law, venue and dispute resolution · **any new obligation
binding the client** · all reseller/channel terms · the incident-notification and
decommission **numbers**.

Both published pages state on their face that they are **supplemental, not complete
agreements, not offers**, and take effect only on execution or express acceptance. Neither is
titled "Master Services Agreement" — a document lacking liability, termination and governing
law should not carry that name.

---

## 8. Interim posture — the honest statement

Both clauses that matter defer to a separate agreement, and with different wording:
Deliverables says *"Unless otherwise specified in a separate Statement of Work or engagement
agreement"*; Intellectual Property says only *"unless otherwise specified in a separate
agreement"* — vaguer, and it does not even name an SOW.

**The SOW is currently carrying the legal terms, and no SOW template exists.** Until an MSA
is drafted, every build engagement needs a signed SOW that explicitly states IP ownership,
acceptance, and liability. That is exactly the dependency this work is meant to remove, but
it is today's reality and should be a deliberate practice rather than a discovery made
mid-engagement.

---

## 9. Suggested sequencing for counsel

1. **§2.1 IP instrument** — assignment vs perpetual license, and the foreground/background
   boundary. A business decision that everything else drafts around.
2. **§5.1 indemnity** and **§1.1 liability review** together — they are the pair procurement
   reads first.
3. **§4 DPA** and the §6 subprocessor list — blocks regulated-industry sales independently.
4. **§3 identity commitments**, including the two withheld numbers.
5. **§5.2 absent clauses** — acceptance, change control, warranty, termination, client
   dependencies, publicity.
6. **§2.3 reseller agreement** — once 1–5 exist to flow down from.
7. **SOW template** reduced to scope, price, schedule, and a line incorporating the MSA.

## 10. One constraint

Do not add compliance claims to any document. No "SOC 2", "HIPAA", "ISO 27001", "certified"
or "compliant with" language appears anywhere in the site source today — verified repo-wide —
and none should be added until it is true and evidenced. Overstating what can be enforced or
demonstrated is worse than the gaps this packet documents.
