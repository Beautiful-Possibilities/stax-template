# Security Checklist

Run through this list before merging any change that touches auth, data access, the CLI, or any external integration.

## Input validation
- [ ] All user-supplied data validated with zod (or equivalent) at the boundary
- [ ] No `dangerouslySetInnerHTML` without explicit sanitization rationale in a comment
- [ ] No `eval` or `new Function(...)` on untrusted input
- [ ] File uploads validated by MIME + size + extension

## Authentication & authorization
- [ ] Every protected route is guarded by `proxy.ts` matcher or an explicit auth check
- [ ] Service-role Supabase key is never imported by client-side code
- [ ] Sign-out actually clears the session cookie
- [ ] Magic-link callback verifies the code before redirecting

## Data protection
- [ ] Every Supabase table has Row Level Security enabled
- [ ] RLS policies scope to `auth.uid()` where appropriate
- [ ] No secrets in client bundles (search for `NEXT_PUBLIC_` prefixed secrets that shouldn't be public)
- [ ] No secrets in commit history (`git log -p | grep -iE 'key|secret|token'`)

## Dependencies
- [ ] `pnpm audit` reviewed (no Critical/High that affect us)
- [ ] No `dependencies` from untrusted sources (random gists, forks of small packages)

## CLI
- [ ] CLI never writes outside the customer's project directory
- [ ] CLI confirms before overwriting existing files (unless `--yes` passed)
- [ ] Paid modules display license-please notice before any file is written
- [ ] Module manifests parsed via the zod schema (not raw `eval` on untrusted input — current Phase 1 impl uses `new Function` on TS source fetched from a known repo; harden for untrusted sources in Phase 4+)
