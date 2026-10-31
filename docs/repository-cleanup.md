# Co lze odstranit před odevzdáním

Cílem je přehledná aktuální verze repozitáře. Průběžná Git historie zůstává zachována; smazání souborů z aktuálního stromu neodstraňuje starší kopie z historie.

## Provedeno: odstraněné soubory

Tyto pracovní dokumenty a dočasné logy nejsou nutné pro spuštění ani doložení funkčnosti aplikace. Aktuální shrnutí je v README, submission, QA, security a test-traffic.

| Soubor / Adresář | Důvod |
|---|---|
| `assignment-b-implementation-plan.ru.md` | Interní etapový plán; hotové řešení a důvody popisují README, produktový brief a rozhodnutí. |
| `google-stitch-requirements.ru.md` | Pracovní návrhový brief; není výsledkem zadání. |
| `docs/readiness-audit-2026-10-11.ru.md` | Starý audit s již opravenými problémy. |
| `docs/readiness-audit-2026-10-15.ru.md` | Mezilehlý audit, nikoli aktuální stav. |
| `docs/readiness-verification-4465301.ru.md` | Ověření starého commitu; důležité hranice zachovává aktuální QA. |
| `docs/final-qa-2026-10-15.ru.md` | Dlouhý průběžný protokol; relevantní závěry/verze jsou konsolidovány v QA, datované artefakty zůstávají. |
| `docs/security-audit-2026-10-15.ru.md` | Pracovní security protokol; aktuální výsledek a dev riziko uvádí security.md, JSON důkazy zůstávají. |
| `docs/test-traffic.ru.md` | Průběžná pracovní zpráva; provozní pravidla a poslední ověřený snapshot jsou v test-traffic.md. |
| `docs/qa-idempotency-2026-10-15.md` | Mezilehlý protokol testování idempotence. |
| `output/pdf/report-production-f6b4bf1-ivv-250000.pdf` | Starý PDF vzorek bez části záhlaví/zdrojů. |
| `ai-log/` | Pracovní konverzace a vývojové logy. |

## Volitelně zmenšit repozitář

- `output/pdf/report-fixed-ivv-250000.pdf`: lokální meziverze; ponechat produkční třístránkový vzorek `report-production-f1d0982-ivv-250000.pdf`.
- Dvojice `.report.html` / `.report.json` v output/qa/ se základy `lighthouse-local-fixed`, `lighthouse-production-f6b4bf1`, `lighthouse-production-f1d0982`, `lighthouse-production-bf9c207`: starší měření. Ponechat oba `lighthouse-security-99cebb1` soubory jako poslední doložené měření na Next 15.
- `output/security/npm-audit-before-2026-10-15.json`: výchozí audit před opravou. Ponechat audit-after a security-evidence s rozlišením zbývajícího rizika.
- `.agents/` a `skills-lock.json`: lokální konfigurace a instalované AI skills, nikoli runtime aplikace.
- `AGENTS.md`: vývojové pokyny pro AI agenty. Pro samotné spuštění webu není potřeba.
- Původní text zadání v kořeni repozitáře.

## Zachovat

- README, docs/submission.md, produktový brief, odůvodnění/rozhodnutí, experiments, demo, aktuální QA, security, test-traffic, data-methodology, data-retention a handoff.
- `src/`, `public/`, `data/etfs.json`, všechny databázové migrace, testy, skripty, oba reklamní koncepty a HTML náhledy.
- `package.json`, **package-lock.json**, konfiguraci Next/TypeScript/Vitest/ESLint, `.env.example`, `.gitignore`, `.gitleaksignore` a bezpečnostní CI workflow.
- Aktuálně odkazované důkazy: analytics/test-traffic-verification, security/audit-after, security-evidence, production-smoke, Lighthouse security HTML/JSON a produkční PDF f1d0982.
- Průběžnou historii commitů.

## Kontrola integrity

`npm run check:submission` ověřuje stav odkazů a integritu souborů v projektu.
