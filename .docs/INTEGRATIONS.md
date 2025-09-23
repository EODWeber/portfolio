# Integrations

This project connects a few external services for V2 features.

## Cloudflare Turnstile (Captcha)

Used on the contact form to reduce spam. The client renders the Turnstile widget and the server action validates the token.

Environment variables:

- `TURNSTILE_SITE_KEY` or `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (client)
- `TURNSTILE_SECRET_KEY` (server)

Dev toggles:

- `TURNSTILE_DISABLED` (server): `"true"|"1"` skips verification
- `NEXT_PUBLIC_TURNSTILE_DISABLED` (client): `"true"|"1"` hides widget
- `NODE_ENV=development`: treated as disabled by default

Notes:

- Site key is passed from the server page to the client form.
- Verification uses `application/x-www-form-urlencoded` to `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- On failure, user input is preserved and a friendly error is shown.

## Resend (Email notifications)

Sends an inbox notification when a new contact request is stored.

Environment variables:

- RESEND_API_KEY
- CONTACT_INBOX_EMAIL

Notes:

- If these env vars are set, the server action attempts to send an email. Errors are logged but do not fail the request.

Admin settings override:

- Email notifications and target addresses can be configured under Admin → Notifications.
  - If settings exist, they override env defaults; if missing, env vars are used as fallback.

## Supabase (Events)

Custom events are stored in `events`. The admin Analytics dashboard shows a summary and last 20 events with an export button.

- Event summary is computed in the app by fetching recent events and counting by type.
- Recent events are fetched via `fetchRecentEvents(limit)`.
