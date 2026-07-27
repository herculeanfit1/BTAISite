# docs/

**`CLAUDE.md` at the repo root is the authoritative engineering reference.** Architecture,
gotchas, commands, and the environment contract live there and nowhere else. Anything here
that appears to restate them is a bug — a restated fact goes stale the moment the original
changes, and that has been this repo's single largest source of documentation drift.

## Living docs

These seven are current. Each is durable by nature — product intent, design intent, or
policy — rather than a description of how the system works today, which is exactly why
they do not rot the way the archived operational guides did.

| File                           | What it is                                 |
| ------------------------------ | ------------------------------------------ |
| `prd.md`                       | Product requirements                       |
| `uxdesign.md`                  | Design intent and visual language          |
| `webstrategy.md`               | Positioning and content strategy           |
| `github-guidelines.md`         | Contribution and branch conventions        |
| `dependency-locking-policy.md` | Why dependencies are pinned, and the rules |
| `dependency-maintenance.md`    | The upgrade cadence                        |
| `security-automation.md`       | Dependabot configuration and handling      |

Adding a file to this directory means committing to keeping it true. Prefer extending
`CLAUDE.md`, or writing an ADR under `docs/adr/` if you are recording a decision.

`__tests__/docs/docs-manifest.test.ts` fails if this table and the directory disagree, so
a new doc cannot land here unlisted.

## Subdirectories

- **`adr/`** — architecture decision records. Numbered, append-only; supersede rather than
  edit.
- **`archive/`** — dated point-in-time records. **Nothing there describes the current
  system.** See its own README.
- **`projects/`** — active multi-phase project plans.
- **`strategy/`** — the roadmap, strategic review, and the per-plan execution documents
  with their execution notes and transparency report.
