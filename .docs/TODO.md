# TODO

- None — all items completed in this pass.

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
- Document Doppler workflow (env keys and setup).
- Add unit/integration tests for contact form and import parsers.
- All items listed under V2 Status → Completed.
- General
  - Prevented MDX front‑matter from rendering on public pages; it remains visible in the MDX editor preview only.
  - Added related content to article pages rendered as cards; uses front‑matter when available (contentlayer), with a tag‑overlap fallback for Supabase MDX.
- Home
  - Replaced dev placeholders with production‑friendly copy.
  - Ensured Admin link is clearly visible in the main nav when authenticated.
  - Made Recent highlights items link to Case Studies filtered by tag.
- Portfolio
  - Removed duplicate Resume section (kept on Contact page).
  - Added filter search bar (title/tags/stack).
  - Verified cards are fully clickable and normalized card spec.
- Case Studies
  - Listing cards display up to 3 outcome bullets, vertical label, and a Related strip (projects by tag overlap).
  - Detail page shows metrics and a Related projects section (tags + vertical).
- Articles
  - Added a TL;DR callout at the top (uses summary). Updated admin label to “TL;DR”.
  - Article modal: added Load current content and Preview with matched heights.
- Contact
  - Entire resume card is clickable; added a batch download page for the three primary resumes.
- Admin
  - Standardized delete confirmations and fixed nested forms so deletions execute reliably (Contact Methods, Social Feed, Case Studies).
  - MDX Documents editor and preview panes now share the same default height.

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
  - Virtual resume builder with auto-PDF generation; mark as primary per vertical on save.
- Global featured management dashboard; bulk re-order and section capping.
- Background social ingestion + admin featured pinning for feed.
- Server-side MDX hardening with preview snapshots and diffing.
