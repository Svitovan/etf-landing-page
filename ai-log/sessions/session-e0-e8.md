# Záznam vývojových sezení s AI (Sessions Log)

Tento dokument zachycuje sled vývojových fází, zadané systémové a operační instrukce, použité nástroje a způsob jejich verifikace v souladu se sekcemi 9.3, 17 a 18 implementačního plánu.

---

## Fáze E0: Příprava prostředí a řízení projektu
- **Cíl:** Inicializace repozitáře, nastavení pravidel v `AGENTS.md`, audit nástrojů a vytvoření architektonických rozhodnutí (`docs/decisions.md`, `docs/product-brief.md`, `docs/handoff.md`).
- **Zadání pro AI:** Přečíst výchozí dopis zadavatele a implementační plán. Nepřidávat žádné chatboti, placená API ani fiktivní data. Zafixovat výběr fondů VOO, IVV, SPY a interpretaci NYSE Arca.
- **Použité nástroje:** `list_dir`, `view_file`, `write_to_file`, `git commit`.
- **Způsob kontroly:** Kontrola verze Node.js (v24.19.0), čistoty stromu Git a existence klíčových konfiguračních souborů.

---

## Fáze E1: Sběr dat a metodika (Dataset & Evidence)
- **Cíl:** Vytvořit auditovaný dataset `data/etfs.json` s primárními prospekty a factsheety emitentů (Vanguard, BlackRock iShares, State Street Global Advisors) a burzy NYSE Arca.
- **Zadání pro AI:** Žádné halucinace ani odhady. Každá hodnota musí mít `url`, `asOf`, `checkedAt`. Zaznamenat rozdíl mezi Gross a Net Expense Ratio u SPY (0,0945 % Gross) vs. VOO/IVV (0,03 % Net).
- **Použité nástroje:** `search_web`, `read_url_content`, `write_to_file`, `validate-data.ts`.
- **Zachycené chyby AI:**
  1. AI původně předpokládala 0,09 % u SPY a standardní parket NYSE. Opraveno na 0,0945 % (0,000945) a burzu NYSE Arca.
  2. Pokus o prostý GET webu iShares narazil na SPA – ověřeno z oficiálního factsheet PDF.

---

## Fáze E2: UX a český copywriting
- **Cíl:** Vytvořit český text pro mobilního investora, vysvětlit PRIIPs/KID regulaci a připravit message-match pro reklamní varianty `ad_a` a `ad_b`.
- **Zadání pro AI:** Vytvořit soubor `src/data/campaign-copy.ts` s bezpečným allowlistem variant bez rizika XSS. Formulovat jasné editorial texty bez marketingových klišé.
- **Použité nástroje:** `write_to_file`, `view_file`.
- **Způsob kontroly:** Jazyková korektura češtiny a kontrola shody slibu v reklamě s prvním zobrazením na mobilu (320px–390px).

---

## Fáze E3: Frontendová realizace a kalkulačka
- **Cíl:** Implementace Next.js App Router stránek a komponent (`Hero`, `EtfComparison`, `CostCalculator`, `CzechContext`, `LeadMagnet`).
- **Zadání pro AI:** Žádný Tailwind (použity čisté CSS custom properties a CSS utility), responzivní mobilní rozvržení, minimální výška interaktivních prvků 44–48 px, vstupy 16 px pro zabránění iOS Safari auto-zoomu.
- **Zachycená chyba AI:** Floating-point IEEE 754 nepřesnost při násobení `100 000 * 0.0003` (výsledek `29.999999999999996`). Opraveno zaokrouhlením na 4 desetinná místa v `src/lib/calculations.ts`.
- **Způsob kontroly:** 14 testů v `tests/calculations.test.ts`.

---

## Fáze E4: Serverový backend, perzistence a report
- **Cíl:** Vytvoření Route Handlerů `POST /api/leads`, perzistence do Supabase / paměťového fallbacku, rate limitingu (HMAC IP), honeypotu a okamžitého zobrazení `/report` s tiskem do PDF.
- **Zadání pro AI:** Zajistit atomicitu zápisu leadu a submission, idempotenci přes `requestId` (ochrana proti double-clicku), RLS ochranu (anonymní klienti nesmí číst ani psát). Žádné PII v URL `/report`.
- **Použité nástroje:** `write_to_file`, `vitest`.
- **Způsob kontroly:** Testy T04, T05, T06, T08 v `tests/backend.test.ts`.

---

## Fáze E5: GDPR měření a analýza trychtýře
- **Cíl:** Implementace souhlasové cookie lišty (GDPR / ÚOOÚ), 30minutové pseudonymní relace, zabezpečení proti podvržení `lead_saved` (T14) a skript pro anonymizovaný report `scripts/funnel-report.ts`.
- **Zadání pro AI:** Žádné cookies ani sledovací události před aktivním souhlasem. Kanonický stav konverze vzniká na serveru z potvrzené submission, nikoliv z klientského prohlížeče.
- **Použité nástroje:** `write_to_file`, `run_command`.
- **Způsob kontroly:** Testy T10, T11, T12, T13, T14 a spuštění `npm run report:funnel`.

---

## Fáze E6: Reklamní koncepty a A/B hypotézy
- **Cíl:** Vytvoření dvou reklamních variant pro Meta Ads (`ads/ad-a.md`, `ads/ad-b.md`, `ads/ad-a.html`, `ads/ad-b.html`), UTM struktury a 3 seřazených hypotéz v `docs/experiments.md`.
- **Zadání pro AI:** Zpracovat reálné HTML/CSS vizuály s poměrem 4:5 (1080×1350 px), explicitně uvést omezení cold trafficu a odhad CVR 3–7 % se jmenovatelem.
- **Použité nástroje:** `write_to_file`, `view_file`.
- **Způsob kontroly:** Kontrola shody textu reklamy s prvním zobrazením Hero sekce.

---

## Fáze E7: QA a eliminace defektů
- **Cíl:** Spuštění kompletní testovací matice T01–T17, test čisté instalace, kontrola linteru a produkčního sestavení.
- **Zadání pro AI:** Opravit interaktivní dotaz ESLintu vytvořením `.eslintrc.json`, doplnit skript pro mazání dat dle GDPR `scripts/cleanup-data.ts`, ověřit testy RLS politik.
- **Použité nástroje:** `run_command` (`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run validate:data`, `npm run cleanup:data`).
- **Výsledek:** 31/31 unit testů úspěšných, 0 chyb TypeScriptu, 0 chyb ESLintu, čistý build Next.js (87.2 kB First Load JS).

---

## Fáze E8: Finální dokumentace a handoff
- **Cíl:** Aktualizace `README.md`, `docs/handoff.md`, `docs/qa-report.md` a příprava e-mailového konceptu pro odeslání zadavateli.
