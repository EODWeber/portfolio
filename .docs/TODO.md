# TODO

- Convert Projects, Case Studies, Social Accounts, and Contact Methods to data table + modal UI with search, inline featured toggles, and delete/archive in modal.
- Add admin featured toggles for Social Accounts and Contact Methods; enforce per-section max (6) in actions.
- Resumes admin: finish primary/archived UX by moving archive/delete into modal (done) and removing non-modal actions (done); add Show archived filter (done).
- Legal pages: manage via MDX Documents (done); verify overrides in production.
- Seed: ensure idempotent resume inserts without ON CONFLICT on vertical (done).
- Home: show skeletons if no featured items (done).
- Exclude legal-\* from Articles listing and vertical listings (done).
- Social feed: home card layout with date/icon under title (done); full color icons on /social-feed (done).

# V3

- Virtual resume builder with auto-PDF generation; mark as primary per vertical on save.
- Global featured management dashboard; bulk re-order and section capping.
- Background social ingestion + admin featured pinning for feed.
- Server-side MDX hardening with preview snapshots and diffing.

# Completed

- Portfolio: resumes at top; cards clickable; consistent image aspect ratios with fallback default.
- Contact: removed duplicate resume section; added contact form at top.
- Articles: feed-style listing; home shows cover images; /articles uses left thumbnails.
- Hero: balanced avatar with gradient mask.
- Nav: auth-aware header/footer.
- Admin: removed user card; renamed menus; analytics data table; contact inbox data table with page size and JSON export.
- MDX: server-side rendering; MDX Documents admin with manual preview and scroll; preview fixed height; overrides for legal.
- Resumes admin: upload PDF input themed; version-safe (removed unique vertical); primary per vertical; published date; table + modal with delete confirm; show archived filter and sort.
- Featured: schema for featured across projects/case studies/articles and resumes; featured queries wired for home.
- Seed: added default featured items for each section; fixed resumes seed idempotency.

- Portfolio: Resumes moved to top; project cards are fully clickable with optional hero images and 3-col layout.
- Contact: Removed duplicate resumes block; compacted resume cards site‑wide.
- Hero: Enlarged avatar with organic blob/gradient mask for better balance.
- Articles: Listing converted to a feed style with full‑row links.
- Navigation: Header hides Admin unless authenticated; footer shows Sign in when unauthenticated, Admin otherwise.
- Case studies/articles/legal: Server‑rendered MDX to remove client eval; CSP no longer needs 'unsafe-eval'.
- Clickable cards: Unified across home, verticals, portfolio details, and related lists.
- Admin: Removed Overview user card; renamed menu items; analytics events display as a data table; contact inbox uses a filterable table and hides archived by default.
- Resumes admin: Implemented PDF upload to Supabase with generated key; preserves existing file on update.
- Cleanup: Removed unused MDX client renderer and admin user card component.

# TODO (Now)

- Portfolio
  - Consider adding consistent thumbnails for more items; ensure alt text and aspect ratios are unified.
- Social feed
  - Route renamed to `/social-feed`; update any external links if present.
- Admin
  - Analytics: add pagination for the events table if needed; export CSV.
  - Contact Inbox: add multi-select bulk status change; CSV export from table view.
- Cleanup
  - Remove any remaining dead code after a quick pass post-deploy; verify unused exports.

# V2 Status (Consolidated)

- Completed
  - Scaffolded Next.js App Router app with pnpm/Tailwind, turbopack, ESLint/Prettier, Turbo, Husky/lint‑staged.
  - shadcn/ui base components wired with shared utilities.
  - Supabase client/admin/server helpers; auth‑gated admin with login/sign‑out.
  - Core pages: landing, verticals, portfolio, case studies, articles, resume, feed, legal.
  - Seed/migrations: `.docs/SUPABASE_INIT.sql`, `.docs/SUPABASE_SEED.sql`.
  - Contentlayer/MDX integration for articles/case studies/legal.
  - Contact form with Turnstile, Supabase persistence, Resend notifications; event logging pipeline.
  - Admin: projects, case studies, articles, resumes, social posts, site settings/profile, contact links; bulk import for articles.
  - Analytics dashboard: summary counts, recent events JSON export.
  - Security headers (CSP/HSTS/Permissions‑Policy) and Vercel analytics.
- Remaining polish for V2 (tracked above in TODO)
  - Portfolio/Contact/Articles presentation tweaks and clickable cards.
  - Header/Footer auth‑aware links.
  - Case study MDX + CSP resolution.
  - Admin naming, overview cleanup, analytics table, contact inbox data table.

# V3 Ideas (Next Iteration)

- Social Signal Feed v3
  - Link social accounts in admin; background ingestion of posts (GitHub, LinkedIn, X, YouTube).
  - Admin: searchable list with "featured" toggles; pin top 3 as cards; remainder as feed.
  - Post cards support text + images; truncate long text; "Open link →" button.
  - Optional per‑platform webhooks or scheduled pulls; minimal rate‑limit handling.
- MDX Rendering Hardening
  - Move to server‑side MDX rendering to avoid `unsafe-eval`; remove CSP exception.
- Content Ops
  - Bulk import/export parity for projects/case studies/resumes; archive flags.
  - Draft previews with share tokens.
- Design
  - Portfolio item imagery (optional thumbnails) and richer case study templates.
  - Testimonials/client logos blocks and subtle animations.
- Telemetry
  - Event schema enrichment (referrer, UTM), dashboards, and alerting for key actions.

# Completed (Historic)

- Document Doppler workflow (env keys and setup).
- Add unit/integration tests for contact form and import parsers.
- All items listed under V2 Status → Completed.
