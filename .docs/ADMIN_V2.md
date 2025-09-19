# Admin Portal V2 Additions

This document summarizes the planned and implemented enhancements for the admin portal.

## Implemented

- Analytics dashboard
  - Summary counts by event type (computed client-side)
  - Recent 20 events preview + copy-to-clipboard JSON export
- Articles
  - Bulk import form that accepts JSON exported from the list
- Contact inbox
  - Status filtering (new/in-review/replied/archived)
  - JSON copy and CSV download exports
- Notifications
  - Admin page to configure email recipient and message service (Telegram/Slack/Discord) endpoints

## Planned / Next Up

- Contact inbox
  - Inline status transitions (new → in-review → replied → archived)
  - Optional email notifications toggle and template customization
- Projects / Case studies / Articles
  - Bulk export/import parity and archive flags
- Site Settings
  - Feature toggles for analytics, notifications, captcha enforcement
- Admin QoL
  - Pagination for long lists, search, and CSV export buttons

## Conventions

- All server actions require `requireAdminUser()`.
- For bulk import, paste an array of JSON objects; any present `id` values upsert existing rows.
- Validate JSON strictly; throw errors so React surfaces them inline.
