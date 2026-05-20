# Customizing Stax with Claude Code

> This is the workflow Stax is built around. Stax gives you a clean, modular admin. Claude Code is how you make it yours.

## You are six grades into a new craft

If this is your first time using Claude Code, none of what's below is hard. Take it one step at a time. There's no rush. You can't break anything — every change happens in a git commit you can undo with one command.

## What is Claude Code?

A terminal program that lets you talk to Claude about your code, and Claude can read, write, and run things in your project. You describe what you want; Claude proposes changes; you say yes or no.

## Five-minute first session

1. Install Claude Code if you haven't: https://claude.com/claude-code
2. In your terminal, navigate into your Stax project:
   ```bash
   cd ~/my-business
   ```
3. Run:
   ```bash
   claude
   ```
4. Tell Claude what you want. Try one of these to start:
   - *"Change the sidebar background to dark blue."*
   - *"Add a 'Notes' field to the contact form."*
   - *"Show me how the login page works."*

That's it. Read what Claude proposes. If it makes sense, say yes. If something feels off, ask why.

## What to use Claude Code for

### Yes
- Tweaking colors, copy, spacing
- Adding fields to forms
- Adding new pages
- Renaming things
- Writing tests
- Explaining how something works
- Asking "what's the simplest way to…"

### Maybe
- Wiring up a new third-party API (Claude can do it, but read the changes carefully)
- Database schema changes (always make a backup first — Supabase has one-click backups)

### No
- Anything where you don't understand what's happening and aren't willing to roll it back

## The safety rules

1. **Commit often.** Before any big change: `git add . && git commit -m "before <change>"`. Now you can always go back with `git reset --hard HEAD~1`.
2. **Read the diff.** Claude will show you what it wants to change. Skim it. Things you don't recognize are an opportunity to ask "what is this?"
3. **Test before you deploy.** `pnpm test:smoke` and `pnpm dev` to click around.

## Recommended companion workflow

See [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) for a structured workflow (init → discuss → plan → execute → verify → ship) that prevents you from getting tangled. Highly recommended for any change that takes more than 30 minutes.

## Worked example: "Add a 'Source' dropdown to the contact form"

```
you: I want a dropdown on the contact form so I can pick where the lead came from. Options: Website, Referral, Cold outreach, Other.

claude: I'll add a `source` column to the contacts table, then add a Select component to the form. Want me to use the values you listed?

you: yes

claude: [shows the migration, the form change, and a test]

you: looks good

claude: [applies changes]

you: pnpm test:smoke
[all tests pass]

you: pnpm dev
[opens browser, sees the new field, fills it in, saves a contact, looks at Supabase]
```

That's the loop.
