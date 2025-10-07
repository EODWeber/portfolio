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
insert into public.case_studies (slug, title, summary, vertical, tags, body_path, hero_url, metrics, status, featured_metric)
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
    'published',
    'roi'
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
    'published',
    'deployments_per_week'
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
    featured_metric = excluded.featured_metric,
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
-- NOTE: featured is set to false for placeholders to avoid conflicts with UI logic
-- that enforces one primary resume per vertical. Mark as featured via admin UI.
delete from public.resumes where label in ('AI Security Lead Resume','Secure DevOps Resume','SOC Leadership Resume');
insert into public.resumes (vertical, file_path, label, featured, published_at)
values
  ('ai-security', 'resumes/ai-security.pdf', 'AI Security Lead Resume', false, now() - interval '60 days'),
  ('secure-devops', 'resumes/secure-devops.pdf', 'Secure DevOps Resume', false, now() - interval '45 days'),
  ('soc', 'resumes/soc.pdf', 'SOC Leadership Resume', false, now() - interval '30 days');

-- Site settings ---------------------------------------------------------------
insert into public.site_settings (
  id,
  site_title,
  site_tagline,
  meta_description,
  hero_heading,
  hero_subheading,
  hiring_status,
  location,
  resume_preference,
  primary_cta_label,
  primary_cta_url,
  secondary_cta_label,
  secondary_cta_url,
  home_heading,
  home_subheading,
  home_projects_heading,
  home_projects_subheading,
  home_studies_heading,
  home_studies_subheading,
  home_articles_heading,
  home_articles_subheading,
  portfolio_heading,
  portfolio_subheading,
  studies_heading,
  studies_subheading,
  articles_heading,
  articles_subheading,
  contact_heading,
  contact_subheading,
  github_url,
  linkedin_url
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Jeff Weber · Security Engineering Leader',
  'Security-first portfolio showcasing AI security, secure DevOps, and SOC leadership.',
  'Jeff Weber unites AI security, secure DevOps, and SOC automation to help engineering teams ship fast with confidence.',
  'Security-first engineering leader.', -- hero_heading
  'Operationalizing AI security, secure delivery, and SOC automation.', -- hero_subheading
  'Open to impactful security leadership roles', -- hiring_status
  'Remote-first', -- location
  'ai-security', -- resume_preference
  'View portfolio', -- primary_cta_label
  '/portfolio', -- primary_cta_url
  'Contact', -- secondary_cta_label
  '/contact', -- secondary_cta_url
  'Security-led engineering for AI & cloud', -- home_heading
  'Partnership between product, platform, and security.', -- home_subheading
  'Featured projects', -- home_projects_heading
  'Casework demonstrating measurable outcomes.', -- home_projects_subheading
  'Recent case studies', -- home_studies_heading
  'Deep dives into secure delivery, AI governance, and SOC automation.', -- home_studies_subheading
  'Articles', -- home_articles_heading
  'Research, playbooks, and frameworks for security-first delivery.', -- home_articles_subheading
  'Portfolio', -- portfolio_heading
  'Curated projects from AI security, secure DevOps, and SOC.', -- portfolio_subheading
  'Case studies', -- studies_heading
  'Detailed outcomes and evidence from recent engagements.', -- studies_subheading
  'Articles', -- articles_heading
  'Research, playbooks, and frameworks.', -- articles_subheading
  'Contact', -- contact_heading
  'Connect and get tailored resumes.', -- contact_subheading
  null, -- github_url (set via admin UI)
  null  -- linkedin_url (set via admin UI)
)
on conflict (id) do update set
  site_title = excluded.site_title,
  site_tagline = excluded.site_tagline,
  meta_description = excluded.meta_description,
  hero_heading = excluded.hero_heading,
  hero_subheading = excluded.hero_subheading,
  hiring_status = excluded.hiring_status,
  location = excluded.location,
  resume_preference = excluded.resume_preference,
  primary_cta_label = excluded.primary_cta_label,
  primary_cta_url = excluded.primary_cta_url,
  secondary_cta_label = excluded.secondary_cta_label,
  secondary_cta_url = excluded.secondary_cta_url,
  home_heading = excluded.home_heading,
  home_subheading = excluded.home_subheading,
  home_projects_heading = excluded.home_projects_heading,
  home_projects_subheading = excluded.home_projects_subheading,
  home_studies_heading = excluded.home_studies_heading,
  home_studies_subheading = excluded.home_studies_subheading,
  home_articles_heading = excluded.home_articles_heading,
  home_articles_subheading = excluded.home_articles_subheading,
  portfolio_heading = excluded.portfolio_heading,
  portfolio_subheading = excluded.portfolio_subheading,
  studies_heading = excluded.studies_heading,
  studies_subheading = excluded.studies_subheading,
  articles_heading = excluded.articles_heading,
  articles_subheading = excluded.articles_subheading,
  contact_heading = excluded.contact_heading,
  contact_subheading = excluded.contact_subheading,
  github_url = excluded.github_url,
  linkedin_url = excluded.linkedin_url,
  updated_at = now();

-- Site profile ---------------------------------------------------------------
insert into public.site_profile (
  id,
  full_name,
  headline,
  subheadline,
  summary,
  philosophy,
  avatar_url,
  location,
  hiring_status,
  resume_preference,
  highlights,
  hobbies,
  interests,
  speaking,
  certifications,
  awards,
  pronouns,
  phonetic_name,
  languages,
  access_notes,
  cta_primary_label,
  cta_primary_url,
  cta_secondary_label,
  cta_secondary_url,
  career_cta_label,
  career_cta_url,
  tech_skills_title,
  tech_skills_subtitle
)
values (
  '22222222-2222-2222-2222-222222222222',
  'Jeff Weber',
  'Security-first engineering leader for AI-driven platforms.',
  'Operationalizing AI security, secure delivery, and SOC automation.',
  'Trusted advisor helping CTO/CISO teams ship boldly without compromising trust.',
  'I believe security is a growth lever. I design guardrails that make experimentation safer, faster, and more accountable.',
  'https://jkonghamlxbaoeytefvs.supabase.co/storage/v1/object/public/images/profile_photo.jpg',
  'San Francisco Bay Area · Remote-friendly',
  'Open to Director/Principal security platform roles',
  'ai-security',
  '[]'::jsonb,
  '["Cycling","Climbing","Maker projects"]'::jsonb,
  '["AI safety","Developer experience","Cloud governance"]'::jsonb,
  '["BSides SF 2024 keynote","OWASP AppSec 2023"]'::jsonb,
  '["CISSP","OSCP"]'::jsonb,
  '["DEF CON CTF finalist","Supabase Launch Week award"]'::jsonb,
  'he/him',
  'JEFF WEE-bur',
  '["English (native)","Spanish (conversational)"]'::jsonb,
  'Happy to accommodate ASL interpreters and flexible meeting hours across time zones.',
  'Explore my work',
  '/portfolio',
  'Contact me',
  'mailto:jeff@example.com',
  'Read full case studies →',
  '/case-studies',
  'Technical Skills Summary',
  'Core technologies and tools across security, development, and operations.'
)
on conflict (id) do update set
  full_name = excluded.full_name,
  headline = excluded.headline,
  subheadline = excluded.subheadline,
  summary = excluded.summary,
  philosophy = excluded.philosophy,
  avatar_url = excluded.avatar_url,
  location = excluded.location,
  hiring_status = excluded.hiring_status,
  resume_preference = excluded.resume_preference,
  highlights = excluded.highlights,
  hobbies = excluded.hobbies,
  interests = excluded.interests,
  speaking = excluded.speaking,
  certifications = excluded.certifications,
  awards = excluded.awards,
  pronouns = excluded.pronouns,
  phonetic_name = excluded.phonetic_name,
  languages = excluded.languages,
  access_notes = excluded.access_notes,
  cta_primary_label = excluded.cta_primary_label,
  cta_primary_url = excluded.cta_primary_url,
  cta_secondary_label = excluded.cta_secondary_label,
  cta_secondary_url = excluded.cta_secondary_url,
  career_cta_label = excluded.career_cta_label,
  career_cta_url = excluded.career_cta_url,
  tech_skills_title = excluded.tech_skills_title,
  tech_skills_subtitle = excluded.tech_skills_subtitle,
  updated_at = now();

-- Profile pillars -------------------------------------------------------------
insert into public.profile_pillars (id, title, description, icon_slug, link_label, link_url, order_index)
values
  (
    '33333333-3333-4333-8333-333333333331',
    'AI Security',
    'Emerging risks, access governance, and securing self-hosted models for enterprises.',
    'openai',
    'View AI security work',
    '/portfolio?tag=ai-security',
    0
  ),
  (
    '33333333-3333-4333-8333-333333333332',
    'DevSecOps & Supply Chain',
    'SLSA-aligned pipelines, SBOM automation, CodeQL/GHAS adoption, and developer enablement.',
    'githubactions',
    'See secure delivery wins',
    '/portfolio?tag=secure-devops',
    1
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'SOC Automation & Detection',
    'Python/Splunk automation, enrichment pipelines, and MTTR cuts without extra headcount.',
    'splunk',
    'Explore SOC outcomes',
    '/portfolio?tag=soc',
    2
  ),
  (
    '33333333-3333-4333-8333-333333333334',
    'Zero Trust & IAM',
    'Privileged access, BeyondCorp patterns, and removing shared accounts at scale.',
    'okta',
    'Dive into IAM transformations',
    '/case-studies',
    3
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  icon_slug = excluded.icon_slug,
  link_label = excluded.link_label,
  link_url = excluded.link_url,
  order_index = excluded.order_index,
  updated_at = now();

-- Career highlights -----------------------------------------------------------
insert into public.profile_career_highlights (id, title, description, link_label, link_url, order_index)
values
  (
    '44444444-4444-4444-8444-444444444441',
    'SAIC',
    'SOC automation program cut MTTR and returned 20 analyst hours weekly.',
    null,
    null,
    0
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    'Atmosera',
    'Global IAM re-architecture introducing PAM, RBAC, and audit-ready controls.',
    null,
    null,
    1
  ),
  (
    '44444444-4444-4444-8444-444444444443',
    'SheppTech',
    'Founded consulting practice leading cloud security and client delivery.',
    null,
    null,
    2
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Mastery',
    'SOC 2 remediation, Sentinel automations, and resilient IR playbooks.',
    null,
    null,
    3
  ),
  (
    '44444444-4444-4444-8444-444444444445',
    'Army',
    'High-stakes security discipline across presidential mission support.',
    null,
    null,
    4
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  link_label = excluded.link_label,
  link_url = excluded.link_url,
  order_index = excluded.order_index,
  updated_at = now();

-- Speaking -------------------------------------------------------------------
insert into public.profile_speaking_engagements (id, event, title, year, link_url, order_index)
values
  (
    '55555555-5555-4555-8555-555555555551',
    'DEF CON Workshop',
    'SOC automation strategies for hybrid cloud',
    '2024',
    'https://defcon.org/workshops/soc-automation',
    0
  ),
  (
    '55555555-5555-4555-8555-555555555552',
    'BSides Seattle',
    'Zero Trust adoption lessons from regulated teams',
    '2023',
    'https://bsidesseattle.com/talks/zero-trust-lessons',
    1
  )
on conflict (id) do update set
  event = excluded.event,
  title = excluded.title,
  year = excluded.year,
  link_url = excluded.link_url,
  order_index = excluded.order_index,
  updated_at = now();

-- Recognition ----------------------------------------------------------------
insert into public.profile_recognitions (id, title, issuer, year, link_url, order_index)
values
  (
    '66666666-6666-4666-8666-666666666661',
    'CISSP',
    'ISC²',
    '2015',
    'https://www.isc2.org/certifications/cissp',
    0
  ),
  (
    '66666666-6666-4666-8666-666666666662',
    'OSCP',
    'OffSec',
    '2017',
    'https://www.offsec.com/courses/pen-200/',
    1
  ),
  (
    '66666666-6666-4666-8666-666666666663',
    'Featured in Supabase Launch Week',
    'Supabase',
    '2024',
    'https://supabase.com/blog',
    2
  )
on conflict (id) do update set
  title = excluded.title,
  issuer = excluded.issuer,
  year = excluded.year,
  link_url = excluded.link_url,
  order_index = excluded.order_index,
  updated_at = now();

-- Testimonials ---------------------------------------------------------------
insert into public.profile_testimonials (id, quote, attribution, role, link_url, order_index)
values
  (
    '77777777-7777-4777-8777-777777777771',
    '“Jeff’s automation work fundamentally changed our SOC efficiency.”',
    'Manager, SAIC',
    'Security Operations Leader',
    null,
    0
  ),
  (
    '77777777-7777-4777-8777-777777777772',
    '“He led PAM re-architecture that exceeded audit requirements across a global enterprise.”',
    'Senior Consultant, Atmosera',
    'PAM Program Lead',
    null,
    1
  ),
  (
    '77777777-7777-4777-8777-777777777773',
    '“Hands-down the most pragmatic partner we’ve had for AI security.”',
    'Head of Platform, Mastery',
    null,
    null,
    2
  )
on conflict (id) do update set
  quote = excluded.quote,
  attribution = excluded.attribution,
  role = excluded.role,
  link_url = excluded.link_url,
  order_index = excluded.order_index,
  updated_at = now();

-- Beyond security ------------------------------------------------------------
insert into public.profile_personal_entries (id, title, description, icon_slug, order_index)
values
  (
    '88888888-8888-4888-8888-888888888881',
    'Interests',
    'AI safety, homelab engineering, security research.',
    'homeassistant',
    0
  ),
  (
    '88888888-8888-4888-8888-888888888882',
    'Languages',
    'English (native), Spanish (conversational).',
    'googletranslate',
    1
  ),
  (
    '88888888-8888-4888-8888-888888888883',
    'Hobbies',
    'Fitness, gourmet mushroom cultivation, woodworking.',
    'strava',
    2
  ),
  (
    '88888888-8888-4888-8888-888888888884',
    'Collaboration Style',
    'Direct, pragmatic, outcome-driven partner with crisp communication.',
    'slack',
    3
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  icon_slug = excluded.icon_slug,
  order_index = excluded.order_index,
  updated_at = now();

-- Technical skills ------------------------------------------------------------
insert into public.profile_technical_skills (id, category, skills, order_index)
values
  (
    '99999999-9999-4999-8999-999999999991',
    'Security & Compliance',
    '{"Microsoft Sentinel","Splunk","SentinelOne","Microsoft Defender","CrowdStrike","Wiz","Prisma Cloud","Tenable"}',
    0
  ),
  (
    '99999999-9999-4999-8999-999999999992',
    'Cloud & Infrastructure',
    '{"AWS","Azure","GCP","Kubernetes","Docker","Terraform","CloudFormation","Ansible"}',
    1
  ),
  (
    '99999999-9999-4999-8999-999999999993',
    'Development & Automation',
    '{"Python","TypeScript","Go","Bash","PowerShell","GitHub Actions","GitLab CI","Jenkins"}',
    2
  )
on conflict (id) do update set
  category = excluded.category,
  skills = excluded.skills,
  order_index = excluded.order_index,
  updated_at = now();

-- Contact links --------------------------------------------------------------
-- Seed contact links idempotently: delete existing seed data then insert
delete from public.contact_links where url in (
  'mailto:jeff@example.com',
  'https://linkedin.com/in/example',
  'https://github.com/example',
  'https://calendly.com/example/intro-chat'
);
insert into public.contact_links (label, url, category, icon, order_index)
values
  ('Email', 'mailto:jeff@example.com', 'primary', 'mail', 0),
  ('LinkedIn', 'https://linkedin.com/in/example', 'social', 'linkedin', 1),
  ('GitHub', 'https://github.com/example', 'social', 'github', 2),
  ('Calendly', 'https://calendly.com/example/intro-chat', 'primary', 'calendar', 3);

-- Contact requests (sample) - optional, safe to skip if data exists
-- Delete existing seed contact requests, then insert fresh sample
delete from public.contact_requests where origin = 'seed';
insert into public.contact_requests (name, email, company, message, origin, status)
values
  ('Alex Recruiter', 'alex@example.com', 'RecruitCo', 'We would love to discuss a Director of Platform Security role with you.', 'seed', 'new');
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
-- Ensure featured_metric set for featured examples
update public.case_studies
set featured_metric = coalesce(featured_metric, (
  select (jsonb_object_keys(metrics)) from public.case_studies s where s.id = public.case_studies.id limit 1
))
where featured = true;

-- Relationship seeds ---------------------------------------------------------
insert into public.article_related_projects (article_id, project_id)
select a.id, p.id from public.articles a, public.projects p
where a.slug = 'ai-security-blueprint' and p.slug = 'ai-threat-monitoring'
on conflict do nothing;

insert into public.article_related_case_studies (article_id, case_study_id)
select a.id, s.id from public.articles a, public.case_studies s
where a.slug = 'defending-llms-from-prompt-injection' and s.slug = 'llm-supply-chain-hardening'
on conflict do nothing;

insert into public.project_related_case_studies (project_id, case_study_id)
select p.id, s.id from public.projects p, public.case_studies s
where p.slug = 'secure-pipeline-as-code' and s.slug = 'zero-downtime-delivery'
on conflict do nothing;
-- Articles: latest 3 published excluding legal-
update public.articles set featured = true
where id in (
  select id from public.articles where status = 'published' and slug not ilike 'legal-%' order by created_at desc limit 3
);
