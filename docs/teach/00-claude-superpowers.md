# Step 0 — Wire up Claude Code's superpowers

> Before you do anything else, connect Claude Code to GitHub, Vercel, and Supabase via MCPs. This step turns 30 minutes of dashboard-clicking into 30 seconds of conversation.

**Time:** ~15 minutes. **Difficulty:** beginner. **Prerequisites:** Claude Code installed.

If you only have time for one Stax lesson this week, make it this one. Everything else in Stax gets easier — sometimes 10× easier — once these three MCPs are connected. Skip it and you'll do everything the slow way.

---

## What's an MCP, in plain English?

MCP stands for **Model Context Protocol**. It's how Claude Code talks directly to external services. Without an MCP, Claude can only read/write files on your computer. **With an MCP, Claude can also:**

- Create a GitHub repo (so you don't open github.com)
- Deploy a project to Vercel (so you don't open vercel.com)
- Create a Supabase project and a database table (so you don't open supabase.com)

You give Claude permission once. After that, you just talk to Claude — "create a repo called X, push the code, deploy it" — and Claude does the whole chain.

**Analogy:** without MCPs, Claude is a chef who can only work in the kitchen you give it. With MCPs, you've also given it keys to the pantry, the fridge, and the grocery store.

## Why this matters specifically for Stax

The whole point of Stax is *you describe what you want; Claude makes it happen*. The MCPs make that real across the entire stack:

| Without MCPs | With MCPs |
|---|---|
| Open github.com, log in, click "New repository," fill in name, click create, copy SSH URL, switch to terminal, paste into `git remote add`, push | Tell Claude: "Create a GitHub repo called X under my org and push my local code." Done. |
| Open vercel.com, log in, click "Add new project," select the GitHub repo, configure build settings, paste env vars one by one, click deploy | Tell Claude: "Deploy this repo to Vercel with these env vars." Done. |
| Open supabase.com, log in, click "New project," wait 2 minutes, navigate to API settings, copy three keys one at a time, switch to your editor, paste them in | Tell Claude: "Create a Supabase project for me, set up the contacts table, and put the keys in my .env.local." Done. |

You're not bypassing anything. You're not "letting Claude do whatever it wants." You're using the same APIs those dashboards use — you've just delegated the clicking.

## The three MCPs you'll connect

| MCP | What Claude can do once connected |
|---|---|
| **GitHub** | Create/list/edit repos, branches, PRs, issues, files. Push your local code. Configure repo settings. |
| **Vercel** | Create projects, link them to GitHub, set env vars, trigger deploys, view logs, manage domains. |
| **Supabase** | Create projects, run SQL migrations, query tables, manage auth users, deploy edge functions, view logs. |

You'll do all three in this lesson.

---

## Setup

### Install Claude Code

If you don't already have it: https://claude.com/claude-code. It's a terminal program — once installed, you run `claude` in any directory and you're chatting.

### Connect the GitHub MCP

Open Claude Code:

```bash
claude
```

Ask Claude to check the GitHub MCP:

```
Are you connected to GitHub? Run get_me to confirm.
```

**If yes** — Claude returns your GitHub username and account info. Done, skip to Vercel.

**If no** — Claude tells you the MCP needs to be enabled. Open Claude Code's settings (Cmd/Ctrl-, or `/config`) → MCP servers → toggle GitHub. You'll be prompted to authorize via OAuth in your browser. Click through. Come back to Claude Code; re-run the test.

**Verify the wow:** ask Claude:

```
List my last 3 GitHub repos.
```

If Claude responds with real repo names from your account — you're in.

### Connect the Vercel MCP

In Claude Code:

```
Are you connected to Vercel? List my Vercel teams.
```

**If yes** — Claude returns your team list. Done.

**If no** — Same dance: open `/config` → MCP servers → Vercel → OAuth flow. Authorize in browser. Come back.

**Verify the wow:** ask Claude:

```
What Vercel projects do I currently have deployed?
```

If Claude lists them — you're in.

### Connect the Supabase MCP

This one usually needs explicit setup. In Claude Code:

```
Are you connected to Supabase? List my organizations.
```

If Claude reports the MCP isn't authenticated, ask Claude to start the OAuth flow:

```
Start the Supabase MCP authentication flow.
```

Claude prints a URL. Open it in your browser. Click "Authorize" — Supabase will ask which scopes to grant (read/write on projects, database, edge functions, env vars, storage). Click confirm. The browser redirects to a localhost URL that says "Authorized."

Come back to Claude Code. Re-run the org list:

```
List my Supabase organizations.
```

**Verify the wow:** ask Claude:

```
List the tables in my Supabase project.
```

If Claude returns your tables (or "no tables yet" for a brand-new project) — you're in.

---

## What just changed

You can now have conversations like this:

> **You:** I want a new project called "client-tracker." Create a GitHub repo under my Beautiful-Possibilities org, then create a Supabase project for it, then create a Vercel project that pulls from that GitHub repo with the Supabase keys as env vars.
>
> **Claude:** I'll do all of that. Confirming: GitHub repo `Beautiful-Possibilities/client-tracker` (public), new Supabase project in your QRC org, Vercel project linked. Ready?
>
> **You:** yes
>
> **Claude:** [creates GitHub repo] [creates Supabase project] [waits for it to provision] [creates Vercel project, sets env vars, links to GitHub] [triggers deploy]
>
> Done. GitHub: https://github.com/Beautiful-Possibilities/client-tracker. Supabase: pipnsrfk… Vercel deploy URL: client-tracker-xyz.vercel.app — live in ~30 seconds.

You opened zero dashboards. You typed one paragraph in English. That's the workflow.

## Safety + what Claude can and can't do

A few important things to understand before you give Claude this much capability:

1. **Claude only acts when you ask.** The MCPs are passive — Claude has the *ability* to do these things, but only when you tell it to. It doesn't go create projects in the background.

2. **You can revoke any MCP at any time.** Each provider (GitHub, Vercel, Supabase) has a settings page where you can revoke the OAuth token. Claude immediately loses access.

3. **Claude can't see your passwords.** OAuth gives Claude scoped tokens, not credentials. The tokens have a list of *exact actions* allowed (e.g. "create repos" but not "delete the org").

4. **You should always read what Claude proposes before saying yes.** Especially the first few times. If Claude says "I'll delete the contacts table" and that's not what you meant, say no and clarify. *Claude defaults to confirming destructive actions, but you still want to read.*

5. **Commits are your safety net.** If Claude changes code on your computer, every change is a git commit you can undo with `git reset --hard HEAD~1`.

## The mindset shift this enables

Up to now, software has worked like this: *the platform decides what's possible; you adapt.* Want a custom field in HubSpot? Hope they support it. Want a custom deploy hook in Vercel? Hope they ship that feature.

With Claude Code + MCPs, software works like this: *you decide what you want; Claude implements it across all the platforms at once.* You stop being a consumer of pre-baked tools and start being a director of your own stack.

This isn't hypothetical. This is what every step of the Stax tutorial assumes. From this point forward, the lessons are written *as if* you have these three MCPs connected. If you skip this step, every later lesson takes 5-10× longer.

## Troubleshooting

**Claude says "I'm not sure how to connect to X."** Some Claude Code versions don't surface MCP commands directly. Open `/config`, find MCP servers, and configure manually.

**OAuth flow opens but doesn't redirect back.** Some browsers block the localhost redirect for security. Try Chrome or Firefox; allow the popup; or paste the redirect URL back into Claude Code manually when prompted.

**"Permission denied" when Claude tries to act.** The OAuth token might have insufficient scopes. Revoke the token and re-do the OAuth flow, this time accepting all requested scopes.

**Supabase OAuth lands on a connection-error page.** Don't worry — copy the *full URL* from the address bar (it has the auth code) and paste it back to Claude. Tell Claude: "complete the Supabase authentication with this URL: [paste]."

---

## What's next

Step 1 — deploy Stax for the first time. You'll do it in Claude Code, in a single conversation. (Coming next.)

---

## For teachers

This is the **most-important single lesson** in the Stax curriculum. If a student doesn't internalize MCPs, every later lesson feels harder than it should.

**Suggested teaching approach:**
- 5 min: explain MCPs with the kitchen-keys analogy
- 5 min: do the three connections live, on a projector — students follow on their own machines
- 5 min: the "what just changed" wow — run the multi-service chain example live
- 5 min: safety + mindset — set expectations for what you can/can't do

**Common student questions:**
- *"Is this safe?"* — Yes, scoped OAuth tokens, revocable, no passwords given to Claude.
- *"Why three different MCPs instead of one?"* — Each service publishes its own. Anthropic's MCP standard is what lets them all coexist in one Claude session.
- *"What if a service doesn't have an MCP?"* — You can use Claude's web-fetch tools, or write a small script Claude runs. MCPs are the easy path, not the only path.
