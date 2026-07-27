# ADR-0005: This repository is public; controls, not obscurity

**Status**: Accepted
**Date**: 2026-07-27
**Supersedes**: nothing. **Superseded by**: nothing.

## Context

`BTAI-Site` is a **public** repository, by decision. Its git history was deliberately not
purged, so the standard is "nothing new lands", not "the past is clean" — an accepted
residual risk.

That posture was applied inconsistently. Scrubbing effort went into prose while code
published the same facts by construction, and several categories of genuinely sensitive
detail had leaked into files nobody thought of as documentation:

- `infra/main.bicep` and two `scripts/*.sh` name every Azure resource by construction.
- Two operator scripts hard-coded the **1Password vault name** and the service-account
  token filename.
- `__tests__/api/rate-limit-ip.test.ts` carried **IP addresses captured from a production
  trace**, one of them in a residential range — personal data under GDPR, sitting in a
  test fixture.
- `src/lib/api/email/send-contact-email.ts` publishes anti-abuse tunables as literals.

## Decision

**Rely on actual controls. Treat topology as public. Keep four categories out.**

1. **Azure resource names are public.** IaC and scripts publish them by construction;
   scrubbing the prose while the Bicep names them would be theatre. The real controls are
   Key Vault plus managed identity, and a queue-scoped, add-only SAS for the queue.
2. **Never lands here**: credential values; Key Vault secret _values_; 1Password vault or
   item names; private LAN addresses; anti-abuse thresholds; and any real customer or
   personal data, including IP addresses.
3. **Operator scripts read identifiers from the environment** (`OP_VAULT`,
   `OP_SA_TOKEN_FILE`) with the values documented in the private runbook.
4. **Test fixtures use reserved ranges** — RFC 5737 (`192.0.2.0/24`, `198.51.100.0/24`,
   `203.0.113.0/24`) for addresses, `example.com` for mail. Captured production values
   reach public repos through the test suite, which nobody scrubs.
5. **No self-hosted runners.** Public-repo forks can propose workflow changes; a
   self-hosted runner would execute untrusted code on owned infrastructure. GitHub-hosted
   runners only. The PR preview deploy is additionally restricted to same-repo pull
   requests.

## Consequences

- Security depends on enforced controls rather than on what is hard to find, which is the
  only posture that survives a public repository.
- One item remains **open and knowingly unresolved**: the anti-abuse tunables in
  `send-contact-email.ts`. Moving them to configuration is a plumbing change with its own
  risk, so it is tracked in the roadmap rather than silently accepted. Tests deliberately
  avoid restating those numbers — the rate-limit and circuit-breaker tests loop until the
  behaviour flips instead of asserting a literal count.
- Verification sweeps must be **proven to work before an empty result is trusted**.
  `git grep -E` does not honour `\b`, and `git check-ignore` skips tracked files without
  `--no-index`. Both produced confident, meaningless "clean" results here.
