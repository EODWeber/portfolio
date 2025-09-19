# Doppler Operations Guide

This project uses [Doppler](https://www.doppler.com/) to manage environment secrets instead of a `.env` file. The CLI injects the secrets at runtime so local development, tests, and builds stay in sync with production values.

## 1. Install the Doppler CLI

Choose one of the official installation paths:

- **Homebrew (macOS / Linux):** `brew install dopplerhq/cli/doppler`
- **Shell script:** `curl -sLf https://cli.doppler.com/install.sh | sh`
- **Manual binaries:** download from the [Doppler releases](https://github.com/DopplerHQ/cli/releases)

Verify the CLI once installed:

```bash
doppler --version
```

## 2. Authenticate the CLI

Log in to Doppler so the CLI can access the project configuration:

```bash
doppler login
```

Follow the browser-based flow and authorize the CLI session.

## 3. Configure Project & Environment

Run the setup wizard from the repository root to select the Doppler project and environment (config):

```bash
doppler setup
```

When prompted:

1. Pick the `portfolio` Doppler project (or the project you created for this site).
2. Select the configuration you want for local development (e.g. `dev`).
3. Accept the option to create a service token if you want to share access across machines.

To switch configs later without re-running the wizard:

```bash
doppler configure set project <project>
doppler configure set config <config>
```

## 4. Running Local Commands

The `package.json` scripts already wrap critical commands with `doppler run --` so secrets are injected automatically:

```json
{
  "scripts": {
    "dev": "doppler run -- next dev --turbopack",
    "build": "doppler run -- next build --turbopack",
    "start": "doppler run -- next start"
  }
}
```

Use `pnpm dev`, `pnpm build`, or `pnpm start` as usual and Doppler will provide variables such as `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` at runtime.

For ad-hoc commands (tests, scripts, etc.) prefix them with `doppler run --`:

```bash
doppler run -- pnpm lint
doppler run -- pnpm check
doppler run -- pnpm test
```

### 4.1 Local development quick start

1. Clone the repository and run `pnpm install`.
2. Execute `doppler setup` and select the `dev` config when prompted.
3. Start the dev server with `pnpm dev` (already wrapped with Doppler).
4. Run validation commands such as `pnpm test` or `pnpm typecheck` through `doppler run --` so server actions receive Supabase credentials.

### 4.2 Service tokens & deployments

- Create a Doppler service token for each environment (`staging`, `prod`).
- Store the token as `DOPPLER_TOKEN` in your CI/CD provider (e.g., Vercel, GitHub Actions).
- Wrap build commands with Doppler: `doppler run -- vercel build` or `doppler run -- pnpm build` to keep Contentlayer builds and Supabase migrations hydrated with secrets.

## 5. Environment Variables Reference

The secrets stored in Doppler should match the keys defined in `.env.example`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `CONTACT_INBOX_EMAIL`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

## 6. Code Adjustments for Doppler

- `package.json` wraps Next.js commands with `doppler run --` to automatically inject secrets for dev, build, and production servers.
- `lib/supabase/client.ts` and `lib/supabase/server.ts` guard against missing Supabase environment variables so misconfigured Doppler sessions fail loudly.
- The admin authentication flow assumes Doppler is providing Supabase credentials. Without Doppler or a populated `.env` file, the login screen will surface configuration errors.

## 7. Continuous Integration

If CI pipelines are added, configure Doppler service tokens or environment-specific secrets in the runner. Typical options:

- Use `doppler setup --no-prompt` in CI with environment variables `DOPPLER_TOKEN`.
- Or export secrets via `doppler secrets download --format env > .env` for the pipeline lifetime (do not commit the file).

Refer to Doppler documentation for the preferred workflow in your CI provider.

## 8. Rotating secrets

- Rotate keys with `doppler secrets rotate --project <project> --config <config> <secret>`.
- After rotating Supabase keys, update both Doppler and Supabase to keep credentials in sync, then redeploy the site.
