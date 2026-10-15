# Co lze odstranit před odevzdáním

Stav k 15. 10. 2026. **Všech 10 souborů v doporučené části níže bylo odstraněno na výslovný pokyn autora. Volitelné kandidáty jsme ponechali.** Cílem je přehledná aktuální verze repozitáře. Průběžnou Git historii zachovat; smazání souboru z aktuálního stromu neodstraňuje starší kopie z historie.

## Provedeno: odstraněné doporučené soubory

Tyto pracovní dokumenty nejsou nutné pro spuštění ani doložení požadavků zadání. Nepřekládají se. Aktuální shrnutí je v README, submission, QA, security a test-traffic.

| Soubor | Důvod |
|---|---|
| `assignment-b-implementation-plan.ru.md` | Interní etapový plán; hotové řešení a důvody popisují README, produktový brief a rozhodnutí. |
| `google-stitch-requirements.ru.md` | Pracovní návrhový brief; není výsledkem zadání. |
| `docs/readiness-audit-2026-10-11.ru.md` | Starý audit s již opravenými problémy. |
| `docs/readiness-audit-2026-10-15.ru.md` | Mezilehlý audit, nikoli aktuální stav. |
| `docs/readiness-verification-4465301.ru.md` | Ověření starého commitu; důležité hranice zachovává aktuální QA. |
| `docs/final-qa-2026-10-15.ru.md` | Dlouhý průběžný protokol; relevantní závěry/verze jsou konsolidovány v QA, datované artefakty zůstávají. |
| `docs/security-audit-2026-10-15.ru.md` | Pracovní security protokol; aktuální výsledek a dev riziko uvádí security.md, JSON důkazy zůstávají. |
| `docs/test-traffic.ru.md` | Průběžná pracovní zpráva; provozní pravidla a poslední ověřený snapshot jsou v test-traffic.md. |
| `docs/qa-idempotency-2026-10-15.md` | Rusky psaný mezilehlý protokol, který ještě uvádí čekající deploy. Oprava i live 409 jsou nyní doloženy v QA; SQL test zůstává. |
| `output/pdf/report-production-f6b4bf1-ivv-250000.pdf` | Starý vadný PDF vzorek bez části záhlaví/zdrojů; nemá být ukázkou hotového řešení. |

## Volitelně zmenšit repozitář

- `output/pdf/report-fixed-ivv-250000.pdf`: lokální meziverze; ponechat produkční třístránkový vzorek `report-production-f1d0982-ivv-250000.pdf`.
- Dvojice `.report.html` / `.report.json` v output/qa/ se základy `lighthouse-local-fixed`, `lighthouse-production-f6b4bf1`, `lighthouse-production-f1d0982`, `lighthouse-production-bf9c207`: starší měření. Ponechat oba `lighthouse-security-99cebb1` soubory jako poslední doložené měření na Next 15.
- `output/security/npm-audit-before-2026-10-15.json`: výchozí audit před opravou. Ponechat audit-after a security-evidence s rozlišením zbývajícího rizika.
- `.agents/` a `skills-lock.json`: lokální instrukce a instalované AI skills, nikoli runtime. Lze vynechat z odevzdání společně, pokud už nejsou potřebné pro další práci agenta. Nejde o package-lock.json.
- `AGENTS.md`: vývojové pokyny s osobním profilem a lokálními cestami. Při pokračování práce s agentem ponechat; pro samotné spuštění webu není potřeba. Odstranění nemění už přijaté pokyny této relace.
- Původní soubor emailu `Junior AI Developer – postup do ďalšieho kola a praktická úloha - Matej Lorinc (matej@clientelo.cz) - 2026-10-08 1921.txt`: soukromá korespondence, nikoli dodávaná aplikace. Lze archivovat mimo aktuální strom; požadavky a termín shrnuje komplet odevzdání.

Starší kurátorské AI souhrny mohou obsahovat historické názvy odstraněných protokolů. Jsou záznamem tehdejší práce; neznamenají, že se starý audit musí obnovit. Navigační odkazy v aktuálních dokumentech směřují na současné shrnutí.

## Zachovat

- README, docs/submission.md, produktový brief, odůvodnění/rozhodnutí, experiments, demo, aktuální QA, security, test-traffic, data-methodology, data-retention a handoff.
- `src/`, `public/`, `data/etfs.json`, všechny databázové migrace, testy, skripty, oba reklamní koncepty a HTML náhledy.
- `package.json`, **package-lock.json**, konfiguraci Next/TypeScript/Vitest/ESLint, `.env.example`, `.gitignore`, `.gitleaksignore` a bezpečnostní CI workflow. Skutečné `.env` do Git nepřidávat.
- `ai-log/README.md`, mistakes, souhrny etap a **původní exporty .md/.jsonl s manifestem**. Export AI rozhovorů je požadavek zadání; podle autora zůstává rusky. Nepřekládat, nepřepisovat a neodstraňovat z důvodu jazyka.
- Aktuálně odkazované důkazy: analytics/test-traffic-verification, security/audit-after, security-evidence, production-smoke, Lighthouse security HTML/JSON a produkční PDF f1d0982.
- Průběžnou historii commitů. Neprovádět squash nebo force push kvůli tomuto úklidu.

## Opakovatelná kontrola

Přesné cesty a výjimky jsou v [rozsahu odevzdání](submission-scope.json). `npm run check:submission` kontroluje cyrilici a místní Markdown odkazy v navrženém ponechaném obsahu. Historické AI záznamy jsou výslovné jazykové výjimky; kandidáti k odstranění se kontrolují jako vynechaní. Výsledek proto **netvrdí, že v celém dnešním repozitáři není ruština**. Kontrola byla po odstranění zopakována. Příznak recommendedCleanupCompleted v rozsahu navíc vyžaduje nepřítomnost všech 10 odstraněných cest. Nástroj sám nic nemaže.
