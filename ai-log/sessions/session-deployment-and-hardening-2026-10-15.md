# Deployment and Hardening Session — Antigravity, 2026-10-15

User request: connect project to Supabase, push changes to Git, audit and fix any remaining defects to full project readiness, connect and verify live Vercel deployment.

Actions performed:
- Connected real Supabase project (`hozaudrjlouiggtliwzs.supabase.co`) with database schema and verified all 5 tables (`leads`, `lead_submissions`, `analytics_sessions`, `analytics_events`, `rate_limit_buckets`).
- Resolved audit defects A01–A11:
  - A01: Enforced production storage guard in `lead-service.ts` (returns HTTP 503 instead of silent in-memory fallback).
  - A02: Created atomic database migration `supabase/migrations/20261015000000_atomic_lead_submission.sql` with transactional `submit_lead(...)` function.
  - A03: Implemented idempotency parameter retention and client retry stabilization via `attemptRequestIdRef`.
  - A05 & A06: Added full funnel events (`comparison_viewed`, `lead_cta_clicked`, `report_opened`) and strict PII rejection in analytics schemas.
  - A07: Secured `/api/leads` with JSON content-type validation, payload size limit, and Origin/Referer verification.
  - A10: Enhanced `/report` with primary source links, ETF selection filtering, and missing glossary terms (NAV, Bid-Ask spread, reinvestment).
  - A11: Fixed `rate_limit_buckets` cleanup query to use `expires_at`, masked emails in console output, and specified controller contact in `/privacy`.
  - Fixed mobile overflow and aligned typography with Google Fonts `Newsreader` and `Inter`.
- Verified live deployment at `https://etf-landing-page-phi.vercel.app/` responding HTTP 200.
- Verified live database records and funnel metrics via `npm run report:funnel`.
- Verified 35/35 automated Vitest tests, TypeScript compilation (`tsc --noEmit`), ESLint, and production Next.js build.
- Updated documentation (`README.md`, `docs/handoff.md`, `docs/demo-script.md`, `docs/launch-checklist.md`) with the live Vercel URL and final handoff status.
