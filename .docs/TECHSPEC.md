# Project: Personal Portfolio (Next.js)

**Owner:** You

**Goal:** Impress recruiters & hiring managers with a security‑first portfolio showcasing AI Security (primary), Secure DevOps/Code (secondary), and SOC (tertiary).

**MVP Target:** Ship a polished, performant site with strong credibility signals (case studies, repos, resume variants, contact) in ≤2 weeks of focused effort.

---

## 1) Objectives & Success Criteria

- **Communicate seniority:** Clear positioning, deep technical credibility, measurable outcomes in case studies.
- **Conversion:** Recruiters can download the **right resume** (per vertical) and contact you in ≤2 clicks.
- **Trust & security posture:** Hardened configs, visible security guarantees, uptime/analytics.
- **Maintainability:** Supabase-backed content and assets for long-term flexibility.

**KPIs**

- Resume downloads per vertical; contact submissions; time on case‑study pages; outbound clicks to GitHub/LinkedIn; page performance (LCP <1.8s, TTI <2.5s on mid‑tier devices).

---

## 2) Architecture Overview

- **Frontend:** Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui.
- **Rendering:** SSG + ISR where useful; edge runtime eligible for fast geo delivery.
- **Content:** MDX + Contentlayer for case studies/articles; YAML/JSON for metadata (tags, verticals).
- **Database & Auth:** Supabase (Postgres + RLS, Auth, Storage).
- **Storage:** Supabase Storage for resumes, images, and private files.
- **Deployment:** Vercel (Preview per PR, Production on main).
- **Analytics:** Vercel Analytics + optional Umami/Plausible.
- **Email/Contact:** Supabase Functions or Vercel Edge Functions → Resend (email) + captcha.

---

## 3) Environments & Branching

- **Main:** production
- **Feature branches:** auto‑preview on Vercel
- **Staging:** optional, via Supabase project clone

---

## 4) Stack & Key Dependencies

- **Next.js** (App Router), **TypeScript**
- **TailwindCSS**, **tailwind-merge**, **clsx**
- **shadcn/ui** (accordion, badge, button, card, dropdown-menu, navigation-menu, tabs, tooltip)
- **Contentlayer** + **MDX** (remark/rehype plugins)
- **Zod** (schema validation); **react-hook-form** (forms)
- **Lucide-react** (icons)
- **next-seo** (SEO helpers)
- **Supabase JS Client** (Auth, DB, Storage)
- **@supabase/auth-helpers-nextjs** (session management)
- **@vercel/analytics**, **@vercel/speed-insights**
- **Helmet-equivalent via Next headers** (secure headers/CSP)
- **Optional:** Resend email, hCaptcha/Cloudflare Turnstile

---

## 5) Information Architecture (Routes)

- `/` — **Landing**: headline value prop; vertical quick‑nav; featured case study; featured repos; social proof; CTA buttons (Download Resume, Contact).
- `/verticals` — overview of three verticals with positioning and links.
    - `/verticals/ai-security`
    - `/verticals/secure-devops`
    - `/verticals/soc`
- `/portfolio` — filterable by **vertical** and **tags** (data from Supabase).
    - `/portfolio/[slug]` — project detail (Supabase metadata + MDX).
- `/case-studies` — index with filters, data from Supabase + MDX.
    - `/case-studies/[slug]`
- `/articles` — blog articles, Supabase + MDX.
- `/resume` — list of resume variants stored in Supabase Storage.
    - `/resume/[vertical]` — signed download links.
- `/contact` — socials list (MVP). Phase 2: secure contact form backed by Supabase.
- `/feed` — social hub.
- `/legal/privacy` & `/legal/security` — optional Supabase‑managed content.
- `/api/*` — Next API routes or Supabase Functions.

---

## 6) Content Model (Supabase + Contentlayer)

**Tables:**

- `projects` — id, title, slug, summary, vertical, tags[], tech_stack[], repo_url, hero_url, outcomes (json), created_at
- `case_studies` — id, title, slug, summary, vertical, tags[], body (MDX ref), hero_url, metrics json, created_at
- `articles` — id, title, slug, summary, body, tags[], created_at
- `resumes` — id, vertical, file_url (Supabase Storage), updated_at
- `social_posts` — id, platform, url, title, date, featured

**Storage Buckets:**

- `resumes/`
- `images/`
- `media/`

---

## 7) Theming & Design

- Dark‑mode default, accessible light mode.
- Supabase‑managed assets (resumes, images).
- Security‑first, outcome‑driven branding.

---

## 8) Components (MVP)

- Same set as before, now **data-driven from Supabase**:
    - Portfolio listing pulls projects from DB.
    - Case study detail page queries Supabase + loads MDX.
    - Resume page fetches signed file links from Supabase Storage.

---

## 9) Security Posture

**With Supabase:**

- RLS policies for all tables (public read‑only on case studies, private resumes with signed URLs).
- Supabase Auth for admin editing (email/social login).
- Storage policies: resumes require signed URLs; images can be public.
- Forms protected by captcha + rate limiting.

---

## 10) Performance & SEO

- ISR for DB‑backed pages; cache Supabase queries (revalidate tags).
- Same SEO/OG strategies.

---

## 11) Observability & Analytics

- Vercel Analytics + Supabase event logging (downloads, submissions).

---

## 12) CI/CD

- Same as before; add **Supabase CLI migrations** in pipeline.

---

## 13) File Structure (updated)

```
app/
  (marketing)/
  verticals/
  portfolio/
  case-studies/
  articles/
  resume/
  contact/
  feed/
  api/
components/
content/   # houses MDX bodies
lib/
  supabase/
  contentlayer/
  seo/
  analytics/
public/
styles/
```

---

## 14) Environment Variables

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

---

## 15) MVP Scope (Build Order)

1. **Scaffold** Next + Tailwind + shadcn; global layout.
2. **Supabase setup** (DB schema, RLS, storage, auth).
3. **Contentlayer integration** with Supabase.
4. **Landing page**.
5. **Vertical pages**.
6. **Portfolio (Supabase projects)**.
7. **Case studies (Supabase + MDX)**.
8. **Resume (Supabase Storage)**.
9. **Contact/socials**.
10. **Analytics + security headers**.

---

## 16) Risks & Mitigations

- **Supabase quota limits** → design queries efficiently, stay within free tier.
- **RLS misconfiguration** → test policies with Supabase CLI.
- **Time sink case studies** → use templates.

---

## 17) Resume Strategy

- Files in Supabase Storage, served via signed URLs.
- Three focused PDFs (AI‑Security, SecDevOps, SOC).

---

## 18) Implementation Notes

**Supabase Client (lib/supabase/client.ts)**

```tsx
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

**Signed Resume Download**

```tsx
import { createClient } from '@/lib/supabase/client'

export async function getSignedResume(vertical: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .storage.from('resumes')
    .createSignedUrl(`${vertical}.pdf`, 60)
  if (error) throw error
  return data.signedUrl
}
```

---

## 19) What to Prepare This Week

- Create Supabase project + schema.
- Upload resumes to Storage.
- Seed initial projects/case studies.
- Draft 2–3 case studies in MDX.
- Configure RLS policies.

---

## 20) Open Questions

- Which Supabase auth providers to enable (email only vs social)?
- Do we want admin panel for adding/editing content, or rely on DB + MDX edits for now?
- Should case studies have draft/publish states in DB?

---

## 21) Supabase Deep Dive (Schema, RLS, Storage, Migrations)

### 21.1 SQL Schema (DDL)

```sql
-- enums
create type publish_status as enum ('draft','published');
create type vertical as enum ('ai-security','secure-devops','soc');

-- projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text not null,
  vertical vertical not null,
  tags text[] default '{}',
  tech_stack text[] default '{}',
  repo_url text,
  hero_url text,
  outcomes jsonb default '[]',
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on projects (status, vertical);
create index on projects using gin (tags);

-- case studies
create table if not exists case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text not null,
  vertical vertical not null,
  tags text[] default '{}',
  body_path text not null,
  hero_url text,
  metrics jsonb default '{}',
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on case_studies (status, vertical);
create index on case_studies using gin (tags);

-- articles
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text,
  body_path text not null,
  tags text[] default '{}',
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on articles (status);

-- resumes
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  vertical vertical not null unique,
  file_path text not null, -- storage key like resumes/ai-security.pdf
  label text not null,
  updated_at timestamptz not null default now()
);

-- optional events table for analytics
create table if not exists events (
  id bigserial primary key,
  type text not null,
  metadata jsonb default '{}',
  ip inet,
  ua text,
  created_at timestamptz not null default now()
);
create index on events (type, created_at desc);
```

### 21.2 RLS Policies

```sql
alter table projects enable row level security;
alter table case_studies enable row level security;
alter table articles enable row level security;
alter table resumes enable row level security;

-- Public read only for published rows
create policy projects_public_read on projects for select using (status = 'published');
create policy case_public_read on case_studies for select using (status = 'published');
create policy articles_public_read on articles for select using (status = 'published');

-- Admin read resumes (for dashboard); public downloads via signed URLs only
create policy resumes_admin_read on resumes for select to authenticated using (true);
```

### 21.3 Storage Buckets & Policies

```sql
select storage.create_bucket('images', true, false);   -- public
select storage.create_bucket('resumes', false, true);  -- private

-- Public read for images
create policy allow_public_read on storage.objects
  for select using (bucket_id = 'images');
-- resumes: no public select policy → signed URLs only
```

### 21.4 Rate Limiting Table (for forms)

```sql
create table if not exists rate_limits (
  id bigserial primary key,
  ip inet not null,
  route text not null,
  window_start timestamptz not null default date_trunc('minute', now())
);
create unique index on rate_limits (ip, route, window_start);
```

### 21.5 Supabase CLI Workflow (Migrations)

```bash
npm i -D supabase
npx supabase init
npx supabase link --project-ref <your-ref>
# create a migration and paste DDL above
npx supabase migration new init
# push locally or to remote
npx supabase db push --remote
```

Add a CI step to run migrations against **staging** before building; on merge to main, run against **prod**, then deploy Vercel.

### 21.6 CSP & Headers (Supabase‑aware)

```tsx
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' vercel-insights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
].join('; ')
```

Apply with middleware and include HSTS, X‑Frame‑Options DENY, Referrer‑Policy, Permissions‑Policy, X‑Content‑Type‑Options.

### 21.7 Server Utilities (examples)

```tsx
// lib/data/projects.ts
import { unstable_cache as cache } from 'next/cache'
import { createServerClient } from '@supabase/ssr'

export const getPublishedProjects = cache(async () => {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { get: () => undefined }})
  const { data, error } = await supabase.from('projects').select('*').eq('status','published').order('created_at',{ ascending:false })
  if (error) throw error
  return data
}, ['projects'], { revalidate: 3600 })
```

```tsx
// server action: get signed resume URL
'use server'
import { createClient } from '@supabase/supabase-js'
export async function getSignedResume(vertical: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const { data, error } = await supabase.storage.from('resumes').createSignedUrl(`${vertical}.pdf`, 120)
  if (error) throw error
  await supabase.from('events').insert({ type:'resume_download', metadata:{ vertical } })
  return data.signedUrl
}
```