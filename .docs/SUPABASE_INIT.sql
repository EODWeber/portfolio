-- ===================================================================
-- Supabase initialization (idempotent, SQL-editor friendly)
-- ===================================================================

-- Extensions ---------------------------------------------------------
create extension if not exists pgcrypto     with schema extensions;
create extension if not exists moddatetime  with schema extensions;  -- auto-updates updated_at

-- Custom types -------------------------------------------------------
do $plpgsql$
begin
  if not exists (select 1 from pg_type where typname = 'publish_status') then
    create type publish_status as enum ('draft', 'published');
  end if;

  if not exists (select 1 from pg_type where typname = 'vertical') then
    create type vertical as enum ('ai-security', 'secure-devops', 'soc');
  end if;
end
$plpgsql$;

-- Tables -------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  summary     text not null,
  vertical    vertical not null,
  tags        text[] default '{}'::text[],
  tech_stack  text[] default '{}'::text[],
  repo_url    text,
  hero_url    text,
  outcomes    jsonb default '[]'::jsonb,
  status      publish_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- featured flags for home curation
alter table public.projects add column if not exists featured boolean not null default false;
create index if not exists projects_status_vertical_idx on public.projects (status, vertical);
create index if not exists projects_tags_idx on public.projects using gin (tags);
create index if not exists projects_featured_idx on public.projects (featured, created_at desc);

create table if not exists public.case_studies (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  summary     text not null,
  vertical    vertical not null,
  tags        text[] default '{}'::text[],
  body_path   text not null,
  hero_url    text,
  metrics     jsonb default '{}'::jsonb,
  status      publish_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.case_studies add column if not exists featured boolean not null default false;
-- Surface a preferred metric for homepage hero when featured
alter table public.case_studies add column if not exists featured_metric text;
create index if not exists case_studies_status_vertical_idx on public.case_studies (status, vertical);
create index if not exists case_studies_tags_idx on public.case_studies using gin (tags);
create index if not exists case_studies_featured_idx on public.case_studies (featured, created_at desc);

create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  summary     text,
  body_path   text not null,
  tags        text[] default '{}'::text[],
  status      publish_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists articles_status_idx on public.articles (status);
-- Add optional hero image URL for articles
alter table public.articles add column if not exists hero_url text;
alter table public.articles add column if not exists featured boolean not null default false;
create index if not exists articles_featured_idx on public.articles (featured, created_at desc);

-- MDX documents (Supabase-managed content bodies)
create table if not exists public.mdx_documents (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique, -- e.g., articles/my-post.mdx, case-studies/my-study.mdx
  storage_path text not null,
  deleted      boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.mdx_documents enable row level security;

do
$$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mdx_documents' and column_name = 'content'
  ) then
    alter table public.mdx_documents drop column if exists content;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mdx_documents' and column_name = 'storage_path'
  ) then
    alter table public.mdx_documents add column storage_path text;
    update public.mdx_documents set storage_path = key where storage_path is null;
    alter table public.mdx_documents alter column storage_path set not null;
  end if;
end
$$;

create table if not exists public.resumes (
  id          uuid primary key default gen_random_uuid(),
  vertical    vertical not null,
  file_path   text not null,
  label       text not null,
  updated_at  timestamptz not null default now()
);
-- resume versioning + curation
alter table public.resumes add column if not exists archived boolean not null default false;
alter table public.resumes add column if not exists featured boolean not null default false;
alter table public.resumes add column if not exists created_at timestamptz not null default now();
alter table public.resumes add column if not exists published_at timestamptz;
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'resumes_vertical_key') then
    alter table public.resumes drop constraint if exists resumes_vertical_key;
  end if;
end $$;
create index if not exists resumes_vertical_idx on public.resumes (vertical);
create index if not exists resumes_featured_idx on public.resumes (featured, updated_at desc);

create table if not exists public.social_posts (
  id          uuid primary key default gen_random_uuid(),
  platform    text not null,
  title       text not null,
  url         text not null,
  summary     text,
  posted_at   timestamptz not null,
  featured    boolean default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index if not exists social_posts_url_key on public.social_posts (url);
create index if not exists social_posts_featured_idx on public.social_posts (featured, posted_at desc);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_title text not null,
  site_tagline text,
  meta_description text,
  -- Home > Hero configuration
  hero_heading text,
  hero_subheading text,
  hiring_status text,
  location text,
  resume_preference vertical,
  -- Calls to action (shown on home hero)
  primary_cta_label text,
  primary_cta_url text,
  secondary_cta_label text,
  secondary_cta_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Ensure new columns exist when table pre-existed
alter table public.site_settings add column if not exists hero_heading text;
alter table public.site_settings add column if not exists hero_subheading text;
alter table public.site_settings add column if not exists hiring_status text;
alter table public.site_settings add column if not exists location text;
do $$
begin
  if exists (select 1 from pg_type where typname = 'vertical') then
    alter table public.site_settings add column if not exists resume_preference vertical;
  else
    alter table public.site_settings add column if not exists resume_preference text;
  end if;
end $$;

-- Additional per‑page headings/subheadings
alter table public.site_settings add column if not exists home_heading text;
alter table public.site_settings add column if not exists home_subheading text;
alter table public.site_settings add column if not exists home_projects_heading text;
alter table public.site_settings add column if not exists home_projects_subheading text;
alter table public.site_settings add column if not exists home_studies_heading text;
alter table public.site_settings add column if not exists home_studies_subheading text;
alter table public.site_settings add column if not exists home_articles_heading text;
alter table public.site_settings add column if not exists home_articles_subheading text;
alter table public.site_settings add column if not exists home_social_heading text;
alter table public.site_settings add column if not exists home_social_subheading text;
alter table public.site_settings add column if not exists portfolio_heading text;
alter table public.site_settings add column if not exists portfolio_subheading text;
alter table public.site_settings add column if not exists studies_heading text;
alter table public.site_settings add column if not exists studies_subheading text;
alter table public.site_settings add column if not exists articles_heading text;
alter table public.site_settings add column if not exists articles_subheading text;
alter table public.site_settings add column if not exists social_heading text;
alter table public.site_settings add column if not exists social_subheading text;
alter table public.site_settings add column if not exists contact_heading text;
alter table public.site_settings add column if not exists contact_subheading text;

create table if not exists public.site_profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  headline text not null,
  subheadline text,
  summary text,
  avatar_url text,
  location text,
  hiring_status text,
  resume_preference vertical default 'ai-security',
  highlights jsonb default '[]',
  -- Public profile specific fields
  hobbies jsonb default '[]',
  interests jsonb default '[]',
  speaking jsonb default '[]',
  certifications jsonb default '[]',
  awards jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Ensure new columns exist when table pre-existed
alter table public.site_profile add column if not exists hobbies jsonb default '[]';
alter table public.site_profile add column if not exists interests jsonb default '[]';
alter table public.site_profile add column if not exists speaking jsonb default '[]';
alter table public.site_profile add column if not exists certifications jsonb default '[]';
alter table public.site_profile add column if not exists awards jsonb default '[]';

-- Relationship tables for explicit related content ------------------
create table if not exists public.article_related_projects (
  article_id uuid not null references public.articles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, project_id)
);
alter table public.article_related_projects enable row level security;

create table if not exists public.article_related_case_studies (
  article_id uuid not null references public.articles(id) on delete cascade,
  case_study_id uuid not null references public.case_studies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, case_study_id)
);
alter table public.article_related_case_studies enable row level security;

create table if not exists public.project_related_case_studies (
  project_id uuid not null references public.projects(id) on delete cascade,
  case_study_id uuid not null references public.case_studies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, case_study_id)
);
alter table public.project_related_case_studies enable row level security;

create table if not exists public.contact_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  category text default 'general',
  icon text,
  order_index integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_links_order_idx on public.contact_links (order_index, created_at desc);
create unique index if not exists contact_links_url_key on public.contact_links (url);

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  origin text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- Optional analytics -------------------------------------------------
create table if not exists public.events (
  id          bigserial primary key,
  type        text not null,
  metadata    jsonb default '{}'::jsonb,
  ip          inet,
  ua          text,
  created_at  timestamptz not null default now()
);
create index if not exists events_type_created_at_idx on public.events (type, created_at desc);

-- Simple rate limiting ----------------------------------------------
create table if not exists public.rate_limits (
  id            bigserial primary key,
  ip            inet not null,
  route         text not null,
  window_start  timestamptz not null default date_trunc('minute', now())
);
create unique index if not exists rate_limits_ip_route_window_idx
  on public.rate_limits (ip, route, window_start);

alter table public.projects     enable row level security;
alter table public.case_studies enable row level security;
alter table public.articles     enable row level security;
alter table public.resumes      enable row level security;
alter table public.social_posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_profile  enable row level security;
alter table public.contact_links enable row level security;
alter table public.contact_requests enable row level security;

-- Notifications ------------------------------------------------------
-- Ensure settings table exists (add template columns if missing)
create table if not exists public.notification_settings (
  id text primary key default 'singleton',
  email_enabled boolean not null default true,
  email_to text,
  email_from text,
  email_subject_template text,
  email_header_html text,
  email_footer_html text,
  telegram_enabled boolean not null default false,
  telegram_bot_token text,
  telegram_chat_id text,
  slack_enabled boolean not null default false,
  slack_webhook_url text,
  discord_enabled boolean not null default false,
  discord_webhook_url text,
  updated_at timestamptz not null default now()
);
alter table public.notification_settings enable row level security;
-- Add new columns idempotently in case table pre-existed
alter table public.notification_settings add column if not exists email_subject_template text;
alter table public.notification_settings add column if not exists email_header_html text;
alter table public.notification_settings add column if not exists email_footer_html text;

-- Notifications log (for last N messages/errors)
create table if not exists public.notifications_log (
  id bigserial primary key,
  channel text not null, -- email|telegram|slack|discord
  status text not null,  -- sent|error
  detail text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.notifications_log enable row level security;

-- Idempotent policies for notifications tables
do $plpgsql$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='notification_settings' and policyname='Anon no access notifications'
  ) then
    execute 'create policy "Anon no access notifications" on public.notification_settings for all using (false)';
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='notification_settings' and policyname='Service role full access notifications'
  ) then
    execute 'create policy "Service role full access notifications" on public.notification_settings for all to service_role using (true) with check (true)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='notifications_log' and policyname='Anon no access notifications log'
  ) then
    execute 'create policy "Anon no access notifications log" on public.notifications_log for all using (false)';
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='notifications_log' and policyname='Service role full access notifications log'
  ) then
    execute 'create policy "Service role full access notifications log" on public.notifications_log for all to service_role using (true) with check (true)';
  end if;
end
$plpgsql$;

-- Public read of published rows for content tables -------------------
do $plpgsql$
declare
  r record;
begin
  for r in
    select * from (values
      ('projects',     'projects_public_read'::text),
      ('case_studies', 'case_studies_public_read'),
      ('articles',     'articles_public_read'),
      ('social_posts', 'social_posts_public_read')
    ) as t(tbl, pol)
  loop
    if not exists (
      select 1
      from pg_policies
      where schemaname='public' and tablename=r.tbl and policyname=r.pol
    ) then
      execute format(
        case r.tbl
          when 'social_posts' then 'create policy %I on public.%I for select to public using (true);'
          else 'create policy %I on public.%I for select to public using (status = ''published''::publish_status);'
        end,
        r.pol, r.tbl
      );
    end if;
  end loop;

  -- Resumes: restrict to authenticated (no public access)
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='resumes' and policyname='resumes_admin_read'
  ) then
    execute 'create policy "resumes_admin_read" on public.resumes
             for select to authenticated using (true);';
  end if;
end
$plpgsql$;

-- Public read for settings/profile/contact links
do $plpgsql$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='site_settings' and policyname='site_settings_public_read'
  ) then
    execute 'create policy "site_settings_public_read" on public.site_settings for select to public using (true);';
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='site_profile' and policyname='site_profile_public_read'
  ) then
    execute 'create policy "site_profile_public_read" on public.site_profile for select to public using (true);';
  end if;

  -- Public read of relation link tables
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='article_related_projects' and policyname='article_related_projects_public_read'
  ) then
    execute 'create policy "article_related_projects_public_read" on public.article_related_projects for select to public using (true)';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='article_related_case_studies' and policyname='article_related_case_studies_public_read'
  ) then
    execute 'create policy "article_related_case_studies_public_read" on public.article_related_case_studies for select to public using (true)';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='project_related_case_studies' and policyname='project_related_case_studies_public_read'
  ) then
    execute 'create policy "project_related_case_studies_public_read" on public.project_related_case_studies for select to public using (true)';
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='contact_links' and policyname='contact_links_public_read'
  ) then
    execute 'create policy "contact_links_public_read" on public.contact_links for select to public using (true);';
  end if;

  -- mdx_documents: public read of non-deleted docs; service role full access
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='mdx_documents' and policyname='mdx_documents_public_read'
  ) then
    execute 'create policy "mdx_documents_public_read" on public.mdx_documents for select to public using (deleted = false)';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='mdx_documents' and policyname='mdx_documents_service_full'
  ) then
    execute 'create policy "mdx_documents_service_full" on public.mdx_documents for all to service_role using (true) with check (true)';
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='contact_requests' and policyname='contact_requests_public_insert'
  ) then
    execute 'create policy "contact_requests_public_insert" on public.contact_requests for insert to public with check (true);';
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='contact_requests' and policyname='contact_requests_admin_read'
  ) then
    execute 'create policy "contact_requests_admin_read" on public.contact_requests for select to authenticated using (true);';
  end if;
end
$plpgsql$;

-- updated_at triggers (moddatetime) ---------------------------------
do $plpgsql$
declare
  r record;
begin
  for r in
    select unnest( array['projects','case_studies','articles','resumes','social_posts','site_settings','site_profile','contact_links','contact_requests','mdx_documents'] ) as tbl
  loop
    if not exists (
      select 1
      from pg_trigger
      where tgname = format('set_%s_updated_at', r.tbl)
    ) then
      execute format(
        'create trigger %I before update on public.%I
           for each row execute function extensions.moddatetime (updated_at);',
        format('set_%s_updated_at', r.tbl),
        r.tbl
      );
    end if;
  end loop;
end
$plpgsql$;

-- Storage buckets (seed) --------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('images',  'images',  true),
  ('resumes', 'resumes', false),
  ('content', 'content', true)
on conflict (id) do update
  set name = excluded.name,
      public = excluded.public;

-- Storage RLS: allow public reads from images bucket only -----------
do $plpgsql$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'storage_images_public_read'
  ) then
    execute 'create policy "storage_images_public_read"
               on storage.objects
               for select to public
               using (bucket_id = ''images'');';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'storage_content_public_read'
  ) then
    execute 'create policy "storage_content_public_read"
               on storage.objects
               for select to public
               using (bucket_id = ''content'');';
  end if;
end
$plpgsql$;

-- (No public access for 'resumes' bucket; use signed URLs.)
