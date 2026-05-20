# Stax

> A self-hosted, modular admin template for solo entrepreneurs. Deploy your own copy on your own Vercel + Supabase, install modules with one command, customize everything with Claude Code.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fozluv%2Fstax-template)

## What you get on Day 1

- A working Next.js 16 admin shell with magic-link login
- A sidebar layout ready for modules to plug into
- A CLI (`npx stax add <module>`) for installing free + paid modules
- 5 layers of tests (smoke, functional, integration, QA + Security checklists)
- A 5-minute deploy to Vercel

## New here? Start with the guide

👉 **[Read `docs/getting-started.md`](docs/getting-started.md)** — a complete walkthrough from zero to your-own-deployed-admin, plus your first conversation with Claude Code. ~30 minutes.

If you've done this before, the 5-minute quick start is below.

## Quick start (5 minutes)

### 1. Click the Vercel button above (or clone manually)

```bash
git clone https://github.com/Beautiful-Possibilities/stax-template.git my-business
cd my-business
pnpm install
```

### 2. Create a Supabase project

Go to https://supabase.com → New project. Once it's ready, grab the API keys.

### 3. Set env vars

```bash
cp .env.example .env.local
```

Open `.env.local` and paste:
- `NEXT_PUBLIC_SUPABASE_URL` (Supabase → Settings → API → Project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same page → anon public)
- `SUPABASE_SERVICE_ROLE_KEY` (same page → service_role — keep secret)

### 4. Boot

```bash
pnpm dev
```

Visit http://localhost:3000. You'll be redirected to `/login`. Sign in with your email; check your inbox; click the magic link; you're in.

### 5. Add a module

```bash
npx stax add _test-stub
```

Then visit `/_test-stub` — if you see the test page, the install path works end-to-end.

## Installing modules

```bash
npx stax list                # show available modules
npx stax add contacts        # install the contacts module (Phase 2+)
npx stax add emails-resend   # install email sending (Phase 3+)
npx stax doctor              # health-check
```

Free modules install silently. Paid modules show a license link first; you confirm and install.

## Customizing

Stax is built to be modified. The interface is the surface area; Claude Code is the customization engine. See [docs/customizing-with-claude-code.md](docs/customizing-with-claude-code.md) for the workflow.

## Docs

- **[Getting started](docs/getting-started.md)** — the canonical walkthrough + teaching guide (start here)
- [Module SDK reference](docs/module-sdk.md) — for module authors
- [Customizing with Claude Code](docs/customizing-with-claude-code.md) — the short version of the customization workflow
- [QA checklist](docs/qa-checklist.md)
- [Security checklist](docs/security-checklist.md)

## License

MIT (this template). Individual modules carry their own license — see each module's README.
