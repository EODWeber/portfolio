# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript and TailwindCSS
- **Database & Auth**: Supabase (Postgres + RLS, Auth, Storage)
- **Content**: Contentlayer for MDX processing (articles, case studies, legal docs)
- **UI Components**: Radix UI primitives with custom styling
- **Package Manager**: pnpm
- **Environment Management**: Doppler CLI (wraps all commands to inject secrets)
- **Deployment**: Vercel

## Development Commands

All commands are wrapped with `doppler run --` to inject environment variables:

```bash
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build with Turbopack
pnpm start            # Start production server
pnpm lint             # Run ESLint (max-warnings=0)
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
pnpm typecheck        # TypeScript type checking
pnpm check            # Run lint, format:check, and typecheck via Turbo
pnpm test             # Run Vitest tests
```

### Running Tests

Tests are located in `tests/` and use Vitest. Run with `pnpm test` or `doppler run -- pnpm test` to ensure Supabase credentials are available for server actions.

## Architecture Overview

### Hybrid Content System

The project uses a **hybrid content approach** combining Supabase and Contentlayer:

- **Supabase tables** store metadata (title, slug, summary, tags, vertical, status, etc.) for projects, case studies, articles, and resumes
- **Contentlayer** processes MDX files from the `content/` directory for rich article/case study bodies
- Content is linked via `body_path` fields in Supabase pointing to MDX files

This allows:

- Dynamic filtering/querying via Supabase
- Rich MDX content with rehype plugins (code highlighting, autolink headings, etc.)
- Admin-managed metadata with filesystem-based content

### Key Directories

- `app/` - Next.js App Router pages and layouts
  - `app/(marketing)/` - Public-facing pages (home, portfolio, articles, etc.)
  - `app/admin/(dashboard)/` - Admin portal for content management
  - `app/api/` - API routes
- `lib/` - Shared utilities and data access
  - `lib/supabase/` - Supabase client factories (browser, server, admin)
  - `lib/admin/` - Admin auth helpers (`requireAdminUser()`)
  - `lib/analytics/` - Event logging
  - `lib/notifications/` - Email/webhook notifications
  - `lib/content/` - Content resolution utilities
- `components/` - React components
  - `components/ui/` - Radix UI-based primitives
  - `components/layout/` - Layout components
  - `components/admin/` - Admin-specific components
  - `components/mdx/` - MDX rendering components
- `content/` - MDX content files (articles, case studies, legal docs)
- `tests/` - Vitest test files

### Supabase Integration

**Client Types:**

- `createSupabaseClient()` - Browser client (from `@/lib/supabase/client`)
- `createSupabaseServerClient()` - Server client with cookie handling (from `@/lib/supabase/server`)
- `createSupabaseAdminClient()` - Admin client with service role key (from `@/lib/supabase/admin-client`)

**Core Tables:**

- `projects` - Portfolio projects with vertical, tags, tech stack, outcomes
- `case_studies` - Case studies with metrics, body_path to MDX
- `articles` - Blog articles with body_path to MDX
- `resumes` - Resume files in Supabase Storage (signed URLs)
- `contact_requests` - Contact form submissions with status workflow
- `events` - Analytics event logging
- `site_profile` - Profile settings (name, headline, highlights, etc.)
- `site_settings` - Site-wide settings (headings, CTAs, etc.)
- `notification_settings` - Email/Telegram/Slack/Discord notification config
- `mdx_documents` - MDX file metadata for admin management

**Storage Buckets:**

- `resumes/` - Private (signed URLs only)
- `images/` - Public
- `mdx/` - Private (admin-managed MDX content)

**Row Level Security (RLS):**

- All tables have RLS enabled
- Public read access for published content (`status = 'published'`)
- Admin operations require authenticated user via `requireAdminUser()`

### Verticals System

Content is organized by three career verticals:

- `ai-security` - AI Security focus
- `secure-devops` - Secure DevOps/Code focus
- `soc` - SOC (Security Operations Center) focus

Defined in `lib/verticals.ts`. Resumes, projects, and case studies are tagged by vertical for filtering.

### Admin Portal

Located at `app/admin/(dashboard)/`. Features:

- **Analytics** - Event summary and export
- **Content Management** - Projects, case studies, articles, social posts
- **Contact Inbox** - Review contact requests with status workflow
- **Notifications** - Configure email/webhook endpoints
- **Site Settings** - Headings, CTAs, profile info
- **MDX Documents** - Manage MDX files in Supabase Storage
- **Resume Management** - Upload/manage resume variants

All admin actions use `requireAdminUser()` from `lib/admin/auth.ts`.

## Environment Setup

This project uses **Doppler** for secrets management instead of `.env` files.

### First-time Setup

1. Install Doppler CLI: `brew install dopplerhq/cli/doppler`
2. Authenticate: `doppler login`
3. Setup project: `doppler setup` (select `portfolio` project and `dev` config)
4. Install dependencies: `pnpm install`
5. Run dev server: `pnpm dev` (already wrapped with Doppler)

See `.docs/DOPPLER.md` for detailed instructions.

### Required Environment Variables

Managed in Doppler:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (email notifications)
- `CONTACT_INBOX_EMAIL` (email recipient)
- `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` (Cloudflare Turnstile captcha)

## Integrations

### Cloudflare Turnstile (Captcha)

- Used on contact form to reduce spam
- Client widget + server validation
- Can be disabled in dev via `TURNSTILE_DISABLED="true"`
- See `.docs/TURNSTILE.md`

### Resend (Email)

- Sends notifications for new contact requests
- Configured via env vars or Admin → Notifications
- See `.docs/INTEGRATIONS.md`

### Vercel Analytics

- Integrated via `@vercel/analytics` and `@vercel/speed-insights`
- Custom events logged to Supabase `events` table

## Content Workflow

### Adding Content

**Projects/Case Studies/Articles:**

1. Add metadata via Admin portal or directly to Supabase
2. Create corresponding MDX file in `content/` directory (if needed)
3. Set `status = 'published'` to make visible

**MDX Documents:**

- Admin portal provides MDX editor with live preview
- Files stored in Supabase Storage `mdx/` bucket
- Metadata tracked in `mdx_documents` table

### Contentlayer Configuration

See `contentlayer.config.ts`:

- `ArticleDoc` - `content/articles/**/*.mdx`
- `CaseStudyDoc` - `content/case-studies/**/*.mdx`
- `LegalDoc` - `content/legal/**/*.mdx`

Rehype plugins: slug, autolink headings, pretty code (GitHub Dark theme)

## Security

### Headers

Security headers configured in `next.config.ts`:

- Content Security Policy (CSP) - restricts script/style sources
- HSTS with preload
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Permissions-Policy
- Referrer-Policy: strict-origin-when-cross-origin

### Authentication

- Supabase Auth for admin access
- `requireAdminUser()` guards all admin server actions
- RLS policies enforce data access controls

### Storage

- Resume files use signed URLs (60-120s expiry)
- Images bucket is public
- MDX documents are private, admin-only

## Code Patterns

### Server Actions

Always guard admin actions:

```typescript
"use server";
import { requireAdminUser } from "@/lib/admin/auth";

export async function updateProject(data: ProjectData) {
  await requireAdminUser();
  // ... implementation
}
```

### Event Logging

```typescript
import { logEvent } from "@/lib/analytics/log-event";

await logEvent("resume_download", { vertical: "ai-security" });
```

### Supabase Queries

Use appropriate client for context:

```typescript
// Server Component
import { createSupabaseServerClient } from "@/lib/supabase/server";
const supabase = await createSupabaseServerClient();

// Client Component
import { createSupabaseClient } from "@/lib/supabase/client";
const supabase = createSupabaseClient();

// Admin Action (service role)
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
const admin = createSupabaseAdminClient();
```

## Path Aliases

TypeScript paths configured in `tsconfig.json`:

- `@/*` - Root directory
- `contentlayer/generated` - Contentlayer output

## Testing

- Framework: Vitest
- Config: `vitest.config.ts`
- Test files: `tests/**/*.test.ts`
- Mocks: `tests/__mocks__/`
- Use `doppler run -- pnpm test` to inject environment variables

## Git Workflow

- Main branch: `main` (production)
- Feature branches: auto-preview on Vercel
- Husky + lint-staged configured for pre-commit hooks

## Documentation

Additional docs in `.docs/`:

- `ADMIN_V2.md` - Admin portal features
- `DOPPLER.md` - Environment setup guide
- `INTEGRATIONS.md` - External service integrations
- `TECHSPEC.md` - Original technical specification
- `TURNSTILE.md` - Captcha setup notes
