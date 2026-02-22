# Build Error Resolution Tracker

> **Goal**: Resolve all lint warnings and type errors so `ignoreBuildErrors` and `ignoreDuringBuilds` can be set to `false` in `next.config.js`.
> **Created**: 2026-02-22
> **Reference**: STANDARDS.md §5

## Current Status

### TypeScript (`npm run type-check`)
- **Status**: PASSING (zero errors)
- `typescript.ignoreBuildErrors` can be flipped to `false` once ESLint is also clean.

### ESLint (`npm run lint`)
- **Status**: 0 errors, ~90 warnings
- All warnings — no errors blocking the build.

## Warning Categories

### 1. `@typescript-eslint/no-explicit-any` (16 warnings)
| File | Lines |
|------|-------|
| `src/lib/logger.ts` | 7, 44, 91, 120, 124, 128, 132 |
| `src/lib/useAnalytics.tsx` | 9, 17, 30, 41, 55 |
| `src/uitests/utils/visual-regression.ts` | 58, 115, 123 |
| `src/components/common/LoadingSpinner.tsx` | (indirect via object injection) |

**Resolution**: Replace `any` with proper types. Logger needs a generic args type; analytics hooks need typed event payloads.

### 2. `@typescript-eslint/no-unused-vars` (14 warnings)
| File | Lines |
|------|-------|
| `src/uitests/components/accessibility.spec.ts` | 15 |
| `src/uitests/components/button.spec.ts` | 1, 2, 165, 457 |
| `src/uitests/components/component.spec.ts` | 309 |
| `src/uitests/components/navigation.spec.ts` | 1, 4, 91, 173 |
| `src/uitests/performance/lighthouse.spec.ts` | 73, 76, 180, 219 |
| `src/uitests/performance/performance.spec.ts` | 283 |
| `src/uitests/utils/visual-regression.ts` | 64 |
| `src/uitests/utils/test-utils.ts` | 209 |

**Resolution**: Remove unused imports/variables or prefix with `_` if intentional.

### 3. `no-console` (10 warnings)
| File | Lines |
|------|-------|
| `src/lib/analytics.tsx` | 66, 69, 72, 75, 78 |
| `src/lib/email.ts` | 121, 161 |
| `src/lib/logger.ts` | 103, 106 |
| `src/uitests/utils/visual-regression.ts` | 74, 77 |

**Resolution**: Replace with `logger` utility in production paths. Logger itself may need `eslint-disable` comments since it wraps console.

### 4. `security/detect-object-injection` (4 warnings)
| File | Lines |
|------|-------|
| `src/components/common/LoadingSpinner.tsx` | 41, 42 |
| `src/components/streaming/StreamingDashboard.tsx` | 169 |
| `src/lib/logger.ts` | 93 |

**Resolution**: Use Map or validate keys against allowed values.

### 5. `security/detect-non-literal-regexp` (1 warning)
| File | Lines |
|------|-------|
| `src/uitests/utils/test-utils.ts` | 211 |

**Resolution**: Validate/escape user input before passing to RegExp constructor.

## Resolution Plan

1. **Batch 1** (low risk): Fix all `no-unused-vars` in uitests — 14 warnings
2. **Batch 2**: Fix `no-console` — replace with logger or add targeted disable comments — 10 warnings
3. **Batch 3**: Fix `no-explicit-any` — type logger, analytics, and visual regression utils — 16 warnings
4. **Batch 4**: Fix security warnings — object injection sinks, non-literal regexp — 5 warnings
5. **Final**: Set `ignoreBuildErrors: false` and `ignoreDuringBuilds: false` in `next.config.js`

## Completion Criteria

- [ ] `npm run type-check` exits 0 (already passing)
- [ ] `npm run lint` exits 0 with zero warnings
- [ ] `next.config.js` has `ignoreBuildErrors: false` and `ignoreDuringBuilds: false`
