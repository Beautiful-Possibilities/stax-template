# QA Checklist

Run through this list before merging any change that touches user-facing code, the CLI, or the module SDK.

## Code quality
- [ ] Typecheck passes (`pnpm typecheck`)
- [ ] Lint passes (`pnpm lint`)
- [ ] No `// TODO`, `// FIXME`, or `console.log` left in shipped code
- [ ] Files modified do not exceed ~300 lines unless splitting is clearly worse
- [ ] Each new function/component has one clear responsibility

## Error handling
- [ ] User input goes through validation (zod or similar) before hitting the DB or external services
- [ ] Network calls have a sensible failure mode (toast / inline error / redirect — not a crash)
- [ ] Server actions return typed errors, not stack traces

## Database
- [ ] Migrations are additive — no `DROP` of another module's tables
- [ ] Every new table has an RLS policy
- [ ] N+1 query patterns avoided in list views
- [ ] Indexes added for any new query path that scans by non-PK column

## Performance
- [ ] Server components used by default; `'use client'` only where interactivity requires it
- [ ] Large lists paginated, infinite-scrolled, or virtualized
- [ ] No images >200KB shipped without `<Image>` optimization

## Accessibility (minimum bar)
- [ ] Every interactive element is reachable by keyboard
- [ ] Inputs have associated labels
- [ ] Focus rings are visible
- [ ] Sufficient color contrast for text

## Tests
- [ ] Smoke tests pass
- [ ] Functional tests pass
- [ ] Integration tests pass (when env available)
