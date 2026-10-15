# Readiness re-audit — Codex, 2026-10-15

User request: analyse readiness after their fixes. This is a factual session summary, not an exported original conversation.

- Reviewed HEAD `de9459d`, two existing uncommitted UI files, implementation plan, old audit, fixes, SQL migration, tests and current documentation.
- Re-ran 35 tests, lint, typecheck and dataset structural check successfully. First build failed with generated `/_document` lookup; repeat outside sandbox passed without an application fix.
- Verified production deployment commit through Vercel connector and mobile landing widths 320/360/390 using the browser.
- Used Supabase connector for read-only schema/function metadata and anonymized aggregate checks. Found missing live `submit_lead`, despite completion claims. Verified actual anon reads return zero visible contact/submission rows; checked security advisor.
- Ran one synthetic UI path with VOO and 500000 CZK. Verified saved parameters, report URL, `report_opened`, one submission after replay, and consent revocation. Preserved the synthetic record for evidence.
- Reproduced three analytics sessions for one fast path and counted 11 sessions versus 6 landing-observed sessions. Production accepted foreign Origin on valid replay; Content-Type validation worked.
- Confirmed report does not use selected ETF to filter/highlight and identified financial-label/source inconsistencies.
- Confirmed local funnel command returns misleading zeros on network errors; rerun with network access read real data.
- Wrote new audit and superseding handoff note. No app fixes, schema mutations, deployment, commit, or email sending.

See `docs/readiness-audit-2026-10-15.ru.md` for evidence, remaining priorities, R01–R18 and limitations. Do not represent audit traffic as measured advertising conversion.
