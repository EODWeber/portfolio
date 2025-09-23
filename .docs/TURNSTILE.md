# Cloudflare Turnstile Integration

This app uses Cloudflare Turnstile on the contact form to deter spam.

## Overview

- Client renders the Turnstile widget and writes the token to a hidden input via a global callback (`window.onTurnstileCallback`).
- Server action verifies the token against `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- On failures, the form preserves user-entered values and shows error messages.

## Environment Variables

Required for production/staging:

- `TURNSTILE_SITE_KEY` or `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (client widget)
- `TURNSTILE_SECRET_KEY` (server verification)

Dev-friendly toggles:

- `TURNSTILE_DISABLED` (server) — when `"true"` or `"1"`, server skips verification.
- `NEXT_PUBLIC_TURNSTILE_DISABLED` (client) — when `"true"` or `"1"`, client hides the widget.
- Additionally, when `NODE_ENV=development`, both client and server treat Turnstile as disabled by default.

## Implementation Notes

- Verification uses `application/x-www-form-urlencoded` body via `URLSearchParams` (recommended by Cloudflare).
- If the token is missing or invalid, the action returns `{ success: false, error, values }` so the client preserves inputs.
- Logs include the full Turnstile verification result server-side to aid debugging.
- Optionally, you can include the user IP (`remoteip`) if you capture it from headers.

## Local Development

Turnstile is disabled by default in development. If you want to test the widget locally:

1. Set `NEXT_PUBLIC_TURNSTILE_DISABLED=false` (or unset it).
2. Ensure your Turnstile site key allows `localhost` as an allowed domain.
3. Keep `TURNSTILE_SECRET_KEY` set for the server verification path.

## Troubleshooting

- `Captcha verification failed`:
  - Token expired, domain mismatch, or not completed; click the widget again.
- `Captcha verification error`:
  - Network error to the Turnstile API; check server logs.
- Common error codes from Cloudflare include `invalid-input-response`, `timeout-or-duplicate`, `invalid-input-secret`.

## Files

- Client form: `app/contact/contact-form.tsx`
- Server action: `app/contact/actions.ts`
- Schema: `app/contact/schema.ts`
