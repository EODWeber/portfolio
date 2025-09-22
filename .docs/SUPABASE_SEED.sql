-- -----------------------------------------------------------------------------
-- Sample seed data for the portfolio project. Run after executing SUPABASE_INIT
-- to populate reference content for local development and demos.
-- -----------------------------------------------------------------------------

-- Projects --------------------------------------------------------------------
insert into public.projects (slug, title, summary, vertical, tags, tech_stack, repo_url, hero_url, outcomes, status)
values
  (
    'ai-threat-monitoring',
    'AI Threat Monitoring Platform',
    'Built a real-time anomaly detection pipeline for LLM misuse across enterprise chat interfaces.',
    'ai-security',
    '{"ai-security","mlops","threat-detection"}',
    '{"Next.js","Supabase","LangChain","OpenSearch"}',
    'https://github.com/example/ai-threat-monitoring',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600',
    '[{"metric":"Incident response time","value":"-40%"},{"metric":"Detection coverage","value":"98% across LLM endpoints"}]'::jsonb,
    'published'
  ),
  (
    'secure-pipeline-as-code',
    'Secure Pipeline as Code',
    'Codified a hardened CI/CD pipeline with supply chain validation, SBOM attestation, and policy-as-code gates.',
    'secure-devops',
    '{"secure-devops","cicd","sbom"}',
    '{"Terraform","GitHub Actions","Cosign","OPA"}',
    'https://github.com/example/secure-pipeline-as-code',
    'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1600',
    '[{"metric":"Change failure rate","value":"<1%"},{"metric":"Deployment frequency","value":"+350%"}]'::jsonb,
    'published'
  ),
  (
    'soc-automation-playbooks',
    'SOC Automation Playbooks',
    'Automated tier-1 SOC runbooks using graph-based enrichment and risk scoring to reduce alert fatigue.',
    'soc',
    '{"soc","automation","siem"}',
    '{"Python","TimescaleDB","Cortex XSOAR"}',
    'https://github.com/example/soc-automation-playbooks',
    'https://images.unsplash.com/photo-1526378722370-6c2d76c60558?q=80&w=1600',
    '[{"metric":"Mean time to acknowledge","value":"-63%"},{"metric":"Analyst throughput","value":"+2.4x"}]'::jsonb,
    'published'
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    vertical = excluded.vertical,
    tags = excluded.tags,
    tech_stack = excluded.tech_stack,
    repo_url = excluded.repo_url,
    hero_url = excluded.hero_url,
    outcomes = excluded.outcomes,
    status = excluded.status,
    updated_at = now();

-- Case studies ----------------------------------------------------------------
insert into public.case_studies (slug, title, summary, vertical, tags, body_path, hero_url, metrics, status)
values
  (
    'llm-supply-chain-hardening',
    'Hardening the LLM Supply Chain',
    'Implemented provenance tracking and secret scanning across the LLM lifecycle for a Fortune 100 fintech.',
    'ai-security',
    '{"ai-security","supply-chain","governance"}',
    'https://YOUR-SUPABASE-PROJECT.supabase.co/storage/v1/object/public/content/case-studies/llm-supply-chain-hardening.mdx',
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1600',
    '{"roi":"7.3x tooling ROI","blocked_leaks":"14 leaked prompts contained before production","compliance":"SOC2 Type II + internal AI risk controls"}'::jsonb,
    'published'
  ),
  (
    'zero-downtime-delivery',
    'Zero-Downtime Delivery for Regulated Deployments',
    'Redesigned a financial compliance platform to ship daily while satisfying strict change-management policy.',
    'secure-devops',
    '{"secure-devops","cicd","compliance"}',
    'https://YOUR-SUPABASE-PROJECT.supabase.co/storage/v1/object/public/content/case-studies/zero-downtime-delivery.mdx',
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600',
    '{"deployments_per_week":"28 automated releases","audit_findings":"0 repeat findings across 3 audits","mean_time_recovery":"<7 minutes"}'::jsonb,
    'published'
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    vertical = excluded.vertical,
    tags = excluded.tags,
    body_path = excluded.body_path,
    hero_url = excluded.hero_url,
    metrics = excluded.metrics,
    status = excluded.status,
    updated_at = now();

-- Articles --------------------------------------------------------------------
insert into public.articles (slug, title, summary, body_path, tags, status)
values
  (
    'ai-security-blueprint',
    'Blueprint for AI Security Operations',
    'A pragmatic roadmap for building AI abuse detection, model telemetry, and red/blue teaming workflows.',
    'https://YOUR-SUPABASE-PROJECT.supabase.co/storage/v1/object/public/content/articles/ai-security-blueprint.mdx',
    '{"ai-security","operations"}',
    'published'
  ),
  (
    'defending-llms-from-prompt-injection',
    'Defending LLMs from Prompt Injection',
    'Red vs. blue techniques for hardening generative AI interfaces in enterprise applications.',
    'https://YOUR-SUPABASE-PROJECT.supabase.co/storage/v1/object/public/content/articles/defending-llms-from-prompt-injection.mdx',
    '{"prompt-security","llm"}',
    'published'
  ),
  (
    'legal-privacy',
    'Privacy Notice',
    'How user data is processed, retained, and protected across analytics and contact tooling.',
    'https://YOUR-SUPABASE-PROJECT.supabase.co/storage/v1/object/public/content/legal/privacy.mdx',
    '{"legal","policy"}',
    'published'
  ),
  (
    'legal-security',
    'Security Overview',
    'Security posture, vulnerability disclosure policy, and assurances for prospective clients.',
    'https://YOUR-SUPABASE-PROJECT.supabase.co/storage/v1/object/public/content/legal/security.mdx',
    '{"legal","security"}',
    'published'
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    body_path = excluded.body_path,
    tags = excluded.tags,
    status = excluded.status,
    updated_at = now();

-- MDX documents --------------------------------------------------------------
insert into public.mdx_documents (key, storage_path, deleted)
values
  ('case-studies/llm-supply-chain-hardening.mdx', 'case-studies/llm-supply-chain-hardening.mdx', false),
  ('case-studies/zero-downtime-delivery.mdx', 'case-studies/zero-downtime-delivery.mdx', false),
  ('articles/ai-security-blueprint.mdx', 'articles/ai-security-blueprint.mdx', false),
  ('articles/defending-llms-from-prompt-injection.mdx', 'articles/defending-llms-from-prompt-injection.mdx', false),
  ('legal/privacy.mdx', 'legal/privacy.mdx', false),
  ('legal/security.mdx', 'legal/security.mdx', false)
on conflict (key) do update set
  storage_path = excluded.storage_path,
  deleted = excluded.deleted,
  updated_at = now();

-- Resumes ---------------------------------------------------------------------
-- Seed resumes idempotently: delete by label then insert
delete from public.resumes where label in ('AI Security Lead Resume','Secure DevOps Resume','SOC Leadership Resume');
insert into public.resumes (vertical, file_path, label, featured, published_at)
values
  ('ai-security', 'resumes/ai-security.pdf', 'AI Security Lead Resume', true, now() - interval '60 days'),
  ('secure-devops', 'resumes/secure-devops.pdf', 'Secure DevOps Resume', true, now() - interval '45 days'),
  ('soc', 'resumes/soc.pdf', 'SOC Leadership Resume', true, now() - interval '30 days');

-- Social feed -----------------------------------------------------------------
insert into public.social_posts (platform, title, url, summary, posted_at, featured)
values
  (
    'LinkedIn',
    'Implementing RAG Threat Detection at Scale',
    'https://linkedin.com/posts/example_rag-threat-detection',
    'A deep dive into telemetry patterns for spotting malicious prompt chaining across enterprise agents.',
    now() - interval '5 days',
    true
  ),
  (
    'GitHub',
    'Secure Pipeline as Code Starter',
    'https://github.com/example/secure-pipeline-starter',
    'Open-source reference for setting up attestations, SBOM ingestion, and runtime policy enforcement.',
    now() - interval '12 days',
    false
  ),
  (
    'Conference',
    'Defending LLMs in Production',
    'https://conf.example.com/talks/defending-llms',
    'Slides + recording from my Bsides keynote on adversarial testing methodologies for generative AI.',
    now() - interval '21 days',
    false
  )
  on conflict (url) do update set
    title = excluded.title,
    summary = excluded.summary,
    posted_at = excluded.posted_at,
    featured = excluded.featured,
    updated_at = now();

-- Site settings ---------------------------------------------------------------
insert into public.site_settings (id, site_title, site_tagline, meta_description, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url)
values (
  '11111111-1111-1111-1111-111111111111',
  'Jeff Weber · Security Engineering Leader',
  'Security-first portfolio showcasing AI security, secure DevOps, and SOC leadership.',
  'Jeff Weber unites AI security, secure DevOps, and SOC automation to help engineering teams ship fast with confidence.',
  'View portfolio',
  '/portfolio',
  'Contact',
  '/contact'
)
on conflict (id) do update set
  site_title = excluded.site_title,
  site_tagline = excluded.site_tagline,
  meta_description = excluded.meta_description,
  primary_cta_label = excluded.primary_cta_label,
  primary_cta_url = excluded.primary_cta_url,
  secondary_cta_label = excluded.secondary_cta_label,
  secondary_cta_url = excluded.secondary_cta_url,
  updated_at = now();

-- Site profile ---------------------------------------------------------------
insert into public.site_profile (id, full_name, headline, subheadline, summary, avatar_url, location, hiring_status, resume_preference, highlights)
values (
  '22222222-2222-2222-2222-222222222222',
  'Jeff Weber',
  'Security-first engineering leader for AI-driven platforms.',
  'Operationalizing AI security, secure delivery, and SOC automation.',
  'Trusted advisor helping CTO/CISO teams ship boldly without compromising trust.',
  'https://jkonghamlxbaoeytefvs.supabase.co/storage/v1/object/public/images/profile_photo.jpg',
  'San Francisco Bay Area · Remote-friendly',
  'Open to Director/Principal security platform roles',
  'ai-security',
  '[{"label":"7.3x reduction in AI risk remediation","value":"Fortune 100 fintech"},{"label":"0 critical audit findings","value":"After secure DevOps transformation"},{"label":"2.4x analyst throughput","value":"SOC automation program"}]'::jsonb
)
on conflict (id) do update set
  full_name = excluded.full_name,
  headline = excluded.headline,
  subheadline = excluded.subheadline,
  summary = excluded.summary,
  avatar_url = excluded.avatar_url,
  location = excluded.location,
  hiring_status = excluded.hiring_status,
  resume_preference = excluded.resume_preference,
  highlights = excluded.highlights,
  updated_at = now();

-- Contact links --------------------------------------------------------------
insert into public.contact_links (label, url, category, icon, order_index)
values
  ('Email', 'mailto:jeff@example.com', 'primary', 'mail', 0),
  ('LinkedIn', 'https://linkedin.com/in/example', 'social', 'linkedin', 1),
  ('GitHub', 'https://github.com/example', 'social', 'github', 2),
  ('Calendly', 'https://calendly.com/example/intro-chat', 'primary', 'calendar', 3)
on conflict (url) do update set
  label = excluded.label,
  category = excluded.category,
  icon = excluded.icon,
  order_index = excluded.order_index,
  updated_at = now();

-- Contact requests (sample)
insert into public.contact_requests (name, email, company, message, origin, status)
values
  ('Alex Recruiter', 'alex@example.com', 'RecruitCo', 'We would love to discuss a Director of Platform Security role with you.', 'seed', 'new')
on conflict (id) do nothing;
-- Mark default featured items for home (idempotent best-effort)
-- Projects: latest 3 published
update public.projects set featured = true
where id in (
  select id from public.projects where status = 'published' order by created_at desc limit 3
);
-- Case studies: latest 2 published
update public.case_studies set featured = true
where id in (
  select id from public.case_studies where status = 'published' order by created_at desc limit 2
);
-- Articles: latest 3 published excluding legal-
update public.articles set featured = true
where id in (
  select id from public.articles where status = 'published' and slug not ilike 'legal-%' order by created_at desc limit 3
);
