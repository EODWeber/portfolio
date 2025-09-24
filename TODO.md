# Portfolio – Reorganization & Feature Tasks

This backlog captures the analysis and implementation plan for the requested changes. Items flagged as DB/Admin will require Supabase schema updates and admin UI work. I’ve made small, safe code changes now and left structural tasks here for follow‑up.

## Done (code-only quick fixes)

- Home: Social feed cards
  - Removed duplicate left date and the Featured badge on home only.
- Home: Hero metrics
  - Replace “Recent highlights” card with 3 metrics pulled from featured case studies.
  - Each metric links to its case study.
  - Fallback: If `featured_metric` not present, uses the first metric in the record.
- Metric label formatting
  - Case study and project metric names render in human-friendly format (underscores removed, words capitalized) on:
    - Home case studies section
    - Case Study detail
    - Vertical detail (projects + case studies lists)
    - Project detail outcomes
- Navigation
  - Added `Profile` link between `Home` and `Portfolio`.
- Public Profile page
  - Added `/profile` page showing name, headline, summary, location/availability, avatar, and default resume link.
- Admin: Site Profile
  - Removed “Highlights” UI (hero pulls metrics from featured case studies now).

## Completed – Profile & Settings Reorganization

1. New public “Profile” content model (DB + Admin)
   - Goal: Treat Profile as public-facing bio for recruiters/interviewers.
   - Added `hobbies` and `interests` to `site_profile` (SQL init + seed) and admin UI to edit them.
   - Site Settings now organized with tabs: Brand, Home, General. Home tab contains hero + CTA + availability fields.
   - Public `/profile` shows summary now and will render hobbies/interests content.

2. Move “hero” config to Site Settings (DB + Admin)
   - Goal: Site-wide Home configuration lives under Site Settings with tabs.
   - Tabs: `Brand`, `Home`, `General`.
   - Brand tab (existing + ensure inclusive):
     - `site_title`, `site_tagline`, `meta_description` (current)
     - Any other site-wide metadata fields in one place.
   - Home tab (Hero section):
     - CTA labels/URLs (move from Brand to Home tab)
     - Hero heading/subheading
     - Hiring status, Location/availability
     - Default resume vertical
   - General tab:
     - Keep remaining settings grouped to reduce clutter.
   - Implementation notes:
     - Introduce a simple tabs UI for `/admin/site-settings` and reorganize fields accordingly.
     - Deprecate hero-related fields from Site Profile once the Home tab is live.

## Completed – Case Studies Hero Metric

3. Case Study `featured_metric` (DB + Admin + Seed)
   - Added `featured_metric` column; required by admin when featured and must match a provided metric key.
   - Enforced max 3 featured case studies in admin action; seed updated with featured_metric.

## Completed – Related Content Relationships

4. Articles, Case Studies, Projects: multi-select related items (DB + Admin + Display)
   - DB join tables created with public read and seed examples.
   - Admin multi-selects added with search that does not clear selections.
   - Public views use explicit relations; vertical fallback remains when no relations set.

## Cleanup & Migration Notes

5. Remove legacy “Highlights”
   - Left in DB to avoid destructive change; UI references removed. Can be dropped later if desired.

6. Verify navigation and breadcrumbs
   - Ensure the new `Profile` link appears in all header variants (desktop/mobile) and active route styles behave.

7. Testing & validation
   - Typecheck + lint + prettier.
   - Manual validations:
     - Home hero metrics link correctly to case studies.
     - Social feed on Home shows a single date and no Featured badge; Social Feed page still shows Featured.
     - Metric labels display without underscores and with capitalization everywhere.
