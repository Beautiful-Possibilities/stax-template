# Getting Started with Stax

> Welcome. By the end of this guide you'll have your own admin running on your own infrastructure — and, more importantly, you'll have had your first real conversation with Claude Code about your own code. **That second thing is the actual point.**

This is a living document. As new modules ship, new sections get added. If something is unclear, that's a bug — open an issue or ask Claude Code to help you rewrite it.

---

## Table of Contents

1. [What Stax actually is](#1-what-stax-actually-is)
2. [The big mental shift](#2-the-big-mental-shift)
3. [Before you start](#3-before-you-start)
4. [Step 1 — Get the code](#step-1--get-the-code)
5. [Step 2 — Set up Supabase](#step-2--set-up-supabase-your-database--auth)
6. [Step 3 — Boot it up locally](#step-3--boot-it-up-locally)
7. [Step 4 — Deploy to Vercel](#step-4--deploy-to-vercel)
8. [Step 5 — Meet Claude Code](#step-5--meet-claude-code)
9. [Step 6 — Install your first module](#step-6--install-your-first-module)
10. [Step 7 — Your first real customization](#step-7--your-first-real-customization)
11. [When things break](#when-things-break)
12. [The mindset](#the-mindset)
13. [What's coming](#whats-coming)
14. [For teachers — how to use this document](#for-teachers--how-to-use-this-document)

---

## 1. What Stax actually is

Stax is a **template** for the admin area of a solo-entrepreneur business — CRM, email, content, tasks, projects, sales pipelines, courses, etc. — that you deploy on your own Vercel and Supabase accounts.

It's a template, not a SaaS. That means:

- **You own the code.** You can read it, change it, delete parts you don't want, add parts nobody else has thought of.
- **You own the data.** It lives in your Supabase, not someone else's "platform."
- **You can't be deplatformed.** No vendor can decide to raise your price 4× or kill your account.
- **You can keep using it forever.** No subscription required to run it.

The features arrive as **modules** — small, focused, code-copy installable packages. You install only what you need:

```bash
npx stax add contacts          # CRM contacts (Phase 2 — coming soon)
npx stax add emails-resend     # Email sending (Phase 3 — coming soon)
npx stax add content-gen       # AI content pipeline (Phase 4 — coming soon)
```

The free tier ships with: the admin shell + contacts + email-via-Resend. Everything else is a paid one-time module (no subscriptions; you buy what you need).

## 2. The big mental shift

This is the most important section. If you only read one part of this document, read this one.

> **Stax is not the product. The way you work with Claude Code on top of Stax is the product.**

Other "all-in-one" platforms (Go High Level, Kajabi, Podia, Teachable) work like this: they decide what your admin looks like; you adapt your business to their UI. Want a custom field? Hope they support it. Want a different workflow? Hope they prioritize it. Want to leave? Hope you can export everything.

Stax works like this:

1. You install the modules you need.
2. The features land as **code in your own repo**.
3. When you want to change something, you open Claude Code and **describe what you want in plain English**. Claude proposes the change. You say yes or no.
4. Every change is a git commit you can undo.

So instead of "shopping for software," you become a **business owner who shapes their own admin.** Claude Code is your craftsman; you're the architect. You don't need to learn to code — you need to learn to *describe what you want* and *read what Claude proposes.*

That's it. That's the whole shift.

## 3. Before you start

**Time:** Plan ~30 minutes for the first run-through.

**You'll need:**

1. A computer (Mac, Windows, or Linux — all fine)
2. Two free accounts:
   - [Supabase](https://supabase.com) — database + login
   - [Vercel](https://vercel.com) — hosting
3. [Node.js](https://nodejs.org) 22+ installed (check with `node --version`)
4. [pnpm](https://pnpm.io) installed (`npm install -g pnpm`)
5. [Git](https://git-scm.com) installed (check with `git --version`)
6. A text editor — anything works, but [VS Code](https://code.visualstudio.com) is the friendly default
7. [Claude Code](https://claude.com/claude-code) — you'll install this in Step 5

**You will NOT need:**

- To know how to code. Really. You'll read code, but you won't write it (Claude does that).
- A paid plan on anything. Free tiers on Vercel + Supabase are enough to run a real business for months.
- Permission from anyone.

---

## Step 1 — Get the code

The fast path: click the **Deploy with Vercel** button in the project README. Vercel will clone the template into a new GitHub repo under your account and start deploying. You'll come back to that deploy in Step 4.

The manual path (recommended your first time so you can see what's happening):

```bash
git clone https://github.com/ozluv/stax-template.git my-business
cd my-business
pnpm install
```

> **What just happened?**
> You made a copy of the Stax template on your machine, into a folder called `my-business`. `pnpm install` downloaded all the libraries the project needs. Took ~30 seconds and used about 500 MB of disk.

---

## Step 2 — Set up Supabase (your database + auth)

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**. Pick any name (e.g. "my-business").
3. Set a database password (save it somewhere — you won't need it day-to-day).
4. Pick a region close to you.
5. Wait ~2 minutes for the project to provision.

Once it's ready:

6. In the left sidebar, click **Settings** → **API**.
7. You'll see three things you need to copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ…`)
   - **service_role** key (another long string — **keep this one secret**)

Now back in your project folder:

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and paste:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ…the-anon-key…
SUPABASE_SERVICE_ROLE_KEY=eyJ…the-service-role-key…
```

> **What just happened?**
> You created a database and an authentication system in your Supabase account, then told your local code where to find them. `.env.local` is on your machine only; it never gets committed to git (it's in `.gitignore`). Your secrets stay yours.

---

## Step 3 — Boot it up locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to `/login`.

Type your email. Click **Send magic link**.

Go to your inbox. Click the link. You're in.

**You just logged into your own admin, running on your own machine.** Nobody else knows it exists. Nobody else can see your data. You own all of this.

> **Troubleshooting**
> - "Could not send magic link." → Double-check the keys in `.env.local`. They have to match Supabase exactly (no quotes, no trailing spaces).
> - The email never arrives. → Check spam. Also check Supabase → Authentication → Logs to see if the send went through.
> - You get a 500 page. → Stop the server (`Ctrl-C`), run `pnpm install` again, then `pnpm dev` again.

---

## Step 4 — Deploy to Vercel

Now let's make it live on the internet.

If you used the **Deploy with Vercel** button in Step 1, your project is already on Vercel — you just need to add the environment variables:

1. Go to your project in [vercel.com/dashboard](https://vercel.com/dashboard).
2. Settings → Environment Variables.
3. Add the same three keys you put in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Redeploy** to apply the new env vars.

If you cloned manually in Step 1:

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your project (you'll need to push it to GitHub first — `git remote add origin …` and `git push`).
3. Add the three env vars as above.
4. Deploy.

When the deploy finishes, you'll get a URL like `my-business.vercel.app`. Visit it. Log in. **You now have a live business admin on the internet.**

---

## Step 5 — Meet Claude Code

This is the moment everything changes.

1. Install [Claude Code](https://claude.com/claude-code) (follow the install link for your OS).
2. In your terminal, go into your project:
   ```bash
   cd my-business
   ```
3. Start Claude:
   ```bash
   claude
   ```

You'll see a prompt. Now type:

```
Read the README and tell me what this project is.
```

Hit enter. Claude will read the README and explain it back to you in plain English. **That's the whole interaction model:** you describe; Claude does; you confirm.

### Your first real change

Type:

```
Change the welcome message on the dashboard to say "Welcome to MY business" instead of "Welcome to Stax".
```

Claude will:
1. Find the relevant file (`app/(app)/dashboard/page.tsx`).
2. Show you the change it wants to make.
3. Ask if it should apply it.

Say yes. Then go check `localhost:3000/dashboard` — the message changed.

Commit it:

```bash
git add . && git commit -m "personalize dashboard welcome"
```

**That's it. That's the loop.** Describe → review → accept → commit. Repeat forever.

---

## Step 6 — Install your first module

Modules are how Stax grows. They're code packages you install one at a time, each adding a specific capability.

Right now the only available module is `_test-stub` — it exists to let you practice the install flow before real modules arrive.

```bash
npx stax add _test-stub
```

You'll see output like:

```
Fetching manifest for "_test-stub"…
Listing files under modules/_test-stub…
  + modules/_test-stub/manifest.ts
  + modules/_test-stub/README.md
  + app/_test-stub/page.tsx

Done. 3 written, 0 skipped.
```

> **What just happened?**
> The CLI fetched the `_test-stub` module's code from GitHub and **copied it into your repo.** It's not a runtime dependency. It's not a black box. It's just files. You can read them, edit them, ask Claude to change them, delete them. They're yours.

Now visit `/_test-stub` in your running app. You'll see a page that says **"_test-stub installed"**.

You also installed a sidebar nav item ("Test Stub") and an entry in `installed-modules.json`. Look at it:

```bash
cat installed-modules.json
```

That file is the registry of what you have installed. The settings page reads from it. So does the sidebar.

When real modules ship (Phase 2: `contacts`, Phase 3: `emails-resend`), you'll install them exactly the same way.

---

## Step 7 — Your first real customization

This is where Stax stops being "a template" and becomes "your admin."

Open Claude Code if it's not already running. Try one of these:

- **Change the look:** *"Change the sidebar background color to dark blue."*
- **Add a field:** *"On the test-stub page, add a 'Created at' field that shows today's date."*
- **Reword something:** *"Change every 'Stax' on the dashboard to 'BeautifulPossibilities'."*
- **Ask a question:** *"How does the login flow work?"*

Notice the pattern:

1. **You describe what you want in your own words.** You don't need to know component names or file paths.
2. **Claude reads the relevant code** and tells you what it'd change.
3. **You read the proposal.** Things you don't recognize are an invitation to ask "what is this?"
4. **You accept the change** or redirect ("no, do it this way instead").
5. **You commit** when you like the result.

> **A worked example, in full**
>
> **You:** Add a "Total spend" field to the contacts list when we get one.
>
> **Claude:** The contacts module isn't installed yet — that's coming in Phase 2. Want me to make a note in the dashboard for when it arrives, or wait?
>
> **You:** Wait. But add a note to my README that I want this when contacts ships.
>
> **Claude:** I'll add a "Custom requests" section to README.md with that note. Here's the diff. [shows diff]
>
> **You:** yes
>
> **Claude:** [writes file]
>
> **You:** `git add README.md && git commit -m "note: total-spend wish for contacts"`

That conversation took maybe 30 seconds. You documented a feature request in your own codebase, in your own words. When `contacts` ships, you'll know exactly what you wanted.

---

## When things break

They will. Here's what to do.

### Read the error first

Errors look scary but they're usually informative. The first line is the most useful. Read it. Copy it.

### Ask Claude to explain

Paste the error into Claude:

> "I just got this error. What does it mean? `[paste]`"

Claude will explain in plain English and usually suggest a fix.

### Revert when in doubt

If you tried something and the app broke:

```bash
git status                # see what changed
git diff                  # see the actual edits
git reset --hard HEAD     # throw away all uncommitted changes
git log --oneline         # see your commit history
git reset --hard HEAD~1   # go back one commit
```

Worst case, you lose 5 minutes of work. Your data in Supabase is safe; your old commits are safe; the deployed version on Vercel is safe.

### The "I have no idea what's happening" move

Open Claude Code and type:

> "Something broke and I don't understand. Help me figure out what happened. The last thing I did was [describe]."

Claude will look at your recent commits, the current state of your files, and any errors. It'll walk you through what's wrong.

---

## The mindset

Three things to keep in mind. These matter more than any specific command.

### 1. You own your code. Act like it.

You are not asking permission from a vendor. You are not waiting for a feature roadmap. If you want something, you ask Claude. If Claude can build it, it does. If Claude can't, you ask why — and the answer is usually "because the constraint is X" and now you understand X.

### 2. Claude is your craftsman, not your replacement

You're the one with the business knowledge. Claude doesn't know what "good" looks like for *your* coaching practice. You direct; Claude executes. The judgment is yours. The taste is yours. The decisions are yours.

If Claude proposes something that doesn't feel right, say so. "That works but it's overkill — can you do it simpler?" or "I don't want a new field; I want a tag." Push back. Claude is *very* good at adjusting.

### 3. Commit often. Iterate fearlessly.

The single biggest mindset shift from "regular software user" to "code owner" is realizing that **you can break things and undo them in 5 seconds.** That's git. That's the whole secret.

Before any change you're not sure about:

```bash
git add . && git commit -m "before trying X"
```

Now you have a checkpoint. Try the wild thing. If it works, great — commit it. If it doesn't, `git reset --hard HEAD` and you're back where you were.

This is the freedom you don't get on Go High Level, Kajabi, or any SaaS. **Use it.**

---

## What's coming

Stax ships in phases. Here's where we are:

| Phase | Status | What it adds |
|---|---|---|
| 1 | ✅ Shipped | Scaffold + auth + CLI + `_test-stub` |
| 2 | Next | `contacts` module — CRUD CRM with notes, tags, activity log |
| 3 | After | `emails-resend` module — templates + sending — **completes the free tier** |
| 4 | After | `content-gen` module — first paid; AI content pipeline |
| 5+ | Then | `pipelines`, `calendar`, `telegram`, `tasks`, `projects`, `ideas`, `courses`, `stripe-checkout`, `automations` |

As each phase ships, this guide gets a new section walking through the new module, with worked examples for the most common customizations.

---

## For teachers — how to use this document

If you're using Stax to teach others (workshops, courses, content):

- **Each top-level Step (1–7) is a lesson.** They're sized roughly equally: 5–10 minutes of teaching + 5–15 minutes of hands-on.
- **Steps 5–7 (Claude Code) are the meat.** Steps 1–4 are infrastructure setup; once your students are past them, they don't repeat. The Claude Code conversation skill is what you're really teaching.
- **The worked examples are reproducible.** Every example in this doc was either run or can be run. When a student says "but what if I try X," you can run it together.
- **Update this doc as you learn what trips people up.** PRs welcome. The most useful additions are: better wording of confusing parts, more worked examples, and student-asked questions with their answers.
- **The "mindset" section is the curriculum's emotional core.** Students who internalize that section succeed. Students who don't, struggle. Spend time on it.

### Suggested workshop structure

A 90-minute hands-on workshop:

| Time | Activity |
|---|---|
| 0:00 — 0:10 | Intro: "What Stax actually is" + "The big mental shift" (Sections 1–2) |
| 0:10 — 0:35 | Hands-on: Steps 1–3 (clone, Supabase, local boot) — instructor walks alongside |
| 0:35 — 0:50 | Hands-on: Step 4 (Vercel deploy) — runs while students take a break |
| 0:50 — 1:15 | Hands-on: Step 5 + 6 (Claude Code, first customization, install `_test-stub`) |
| 1:15 — 1:30 | Open lab: Step 7 — students try their own customization; instructor floats |

### Suggested video series structure

Single-topic videos, ~5 minutes each:

1. Why I built Stax (the philosophy)
2. Zero to logged-in admin in 10 minutes
3. The 5-minute Claude Code tour
4. Your first customization
5. Installing your first module
6. When things break (and how to recover)
7. The mindset that makes this work

---

## Final note

If you read this top to bottom, ran the steps, and made it to "Step 7 worked," **you are now a code owner.** That's a real thing. There's no certificate, but the capability is permanent.

Welcome.
