# Verification of commit 4465301 — Codex, 2026-10-15

User request: fixes were made and sent to Git; verify them. This file is a factual summary, not an original exported conversation.

- Confirmed clean starting tree and matching local/remote-tracking/production commit 4465301.
- Read the updated source, SQL and documentation; verified both RPC functions and their permissions in live database metadata.
- Ran 36 passing tests, data validation, lint, typecheck and successful production build.
- Performed actual npm ci in a temporary copy without .env. The first copy omitted migration files (auditor setup mistake); after copying the existing SQL migrations, tests passed 36/36. No project source repair was needed.
- Browser path with synthetic IVV / 250000 CZK lead saved successfully, highlighted the chosen ETF in report and persisted all seven analytics events in one ad_b session.
- Checked foreign Origin 403 and Content-Type 415; two parallel synthetic POSTs with the same requestId returned new/duplicate success and created one submission. Checked rate-limit threshold using an isolated transaction rolled back afterward.
- Confirmed one remaining contract discrepancy: changed payload under the same requestId still returns 200 and original parameters; QA says it is rejected.
- Confirmed mobile landing without global overflow at 320/360/390, and revoked audit consent.
- Added a verification report and continuity note. No app fixes, schema changes, commits, deployment or employer email.

Evidence and limits: `docs/readiness-verification-4465301.ru.md`.
