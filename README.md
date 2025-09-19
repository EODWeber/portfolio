Personal portfolio built with Next.js, Supabase, and Contentlayer.

## Quick start

This repo uses pnpm and Doppler for environment variables.

Dev server:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

Format & lint:

```bash
pnpm format
pnpm lint
```

Typecheck:

```bash
pnpm typecheck
```

## Environment

See `.docs/DOPPLER.md` for the list of environment keys and recommended setup. Key integrations:

- Supabase (auth, db, storage)
- Cloudflare Turnstile (captcha) — see `.docs/TURNSTILE.md`
- Resend (email notifications)

## Admin portal

The admin app (under `app/admin`) includes analytics, content management, and import tools. See `.docs/ADMIN_V2.md`.

Notifications can be configured under `Admin → Notifications` (email recipient and Telegram/Slack/Discord endpoints). See `.docs/INTEGRATIONS.md` for env fallbacks and `.docs/TURNSTILE.md` for captcha notes.

## Integrations

Overview of external services and wiring can be found in `.docs/INTEGRATIONS.md`.
