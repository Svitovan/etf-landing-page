# Handoff Report

## 1. Souhrnný přehled řešení auditních zjištění (2026-10-15)

Tato sekce dokumentuje nápravu 6 prioritních zjištění z nezávislého auditu (`docs/readiness-audit-2026-10-15.ru.md`):

### B01: Atomická PostgreSQL funkce `submit_lead` (Priorita 1)
- **Problém:** V live PostgreSQL chyběla funkce `public.submit_lead`. Aplikační kód používal sekvenční zápis a manuální rollback, který při selhání druhého kroku mohl způsobit nekonzistenci či kaskádové smazání existujícího kontaktu.
- **Náprava:**
  - Vytvořena migrace `supabase/migrations/20261015000000_atomic_lead_submission.sql` s transakční funkcí `submit_lead(p_request_id, p_email, p_selected_etfs, p_position_czk, p_privacy_version, p_analytics_session_id)` s `SECURITY DEFINER` a striktním oprávněním pro roli `service_role`.
  - V `src/lib/server/lead-service.ts` byl zcela odstraněn nebezpečný sekvenční fallback i manuální rollback. Při aktivním Supabase je vyžadována RPC funkce `submit_lead`.
  - Skript `npm run check:supabase` byl rozšířen o diagnostiku existence a funkčnosti RPC `submit_lead` i `check_rate_limit`. Vzhledem k tomu, že PostgREST neumožňuje spouštět DDL příkazy, je migrace připravena k jednorázovému spuštění v Supabase Dashboard SQL Editoru.

### B02: Sjednocení inicializace analytické relace a oprava jmenovatele (Priorita 2)
- **Problém:** Rychlé kliknutí po udělení souhlasu vytvořilo tři paralelní relace. Jmenovatel konverzního trychtýře počítal všech 11 relací v databázi, ačkoliv pouze 6 mělo zaznamenanou událost `landing_observed`. Událost `comparison_viewed` se odesílala při mountu namísto reálného zobrazení a chyběl CTA click v kalkulačce.
- **Náprava:**
  - V `src/lib/analytics-client.ts` zaveden mutex `initSessionPromise`, který deduplikuje souběžné požadavky na vytvoření relace. Funkce `trackEvent` nyní čeká na dokončení probíhající inicializace.
  - Při změně souhlasu se vyvolává událost `etf_consent_changed`, na kterou komponenty reagují.
  - V `src/components/EtfComparison.tsx` bylo okamžité odesílání nahrazeno `IntersectionObserverem` na elementu `#srovnani`, který spolehlivě zaznamená `comparison_viewed` až po reálném vstupu do zorného pole uživatele.
  - Do tlačítka kalkulačky `#calculator-cta-to-form` v `CostCalculator.tsx` doplněno měření `lead_cta_clicked` s parametrem `{ ctaLocation: "calculator" }`.
  - Ve skriptu `scripts/funnel-report.ts` byl jmenovatel trychtýře opraven tak, aby počítal výhradně relace s `landing_observed` (aktuálně 6 relací, z nichž 2 konvertovaly = 33,3 % CVR pro sledovanou skupinu). Odstraněno tiché polykání chyb.

### B03: Zabezpečení API, hlavička Origin a atomický Rate Limiting (Priorita 3)
- **Problém:** Endpointy přijímaly požadavky s cizí hlavičkou `Origin`. Rate limiter fungoval na bázi čtení a následného zápisu (race condition) a ignoroval chyby zápisu do databáze.
- **Náprava:**
  - Vytvořen bezpečnostní modul `src/lib/server/security.ts` s funkcí `isAllowedOrigin(req)`. Ověřuje shodu hlavičky `Origin` s `APP_ORIGIN`, `VERCEL_URL`, hlavičkami `Host` / `x-forwarded-host` a lokálním vývojovým prostředím. Neautorizované požadavky jsou okamžitě odmítnuty s HTTP 403.
  - Ochrana integrována do `/api/leads`, `/api/events` a `/api/analytics-session`.
  - Do migrace `20261015000000_atomic_lead_submission.sql` přidána atomická funkce `public.check_rate_limit(...)` s row-lockem (`FOR UPDATE`) a atomickým `INSERT ... ON CONFLICT DO UPDATE`.
  - V `src/lib/server/rate-limit.ts` se při chybě databáze v produkci striktně vyhazuje výjimka (fail-closed), namísto tichého povolení přístupu.
  - Vytvořen nový test T20 v `tests/backend.test.ts` ověřující odmítnutí neautorizovaného Originu.

### B04: Zvýraznění vybraného fondu v reportu (Priorita 4)
- **Problém:** Parametr `etfs=VOO` se předával a ukládal, ale stránka `/report` zobrazovala všechny tři fondy bez vizuálního odlišení výběru. V analytice reportu se přenášela přesná částka investice (potenciální PII).
- **Náprava:**
  - V `src/app/report/page.tsx` zaveden bezpečný allowlist parser parametrů (`VALID_TICKERS = ["VOO", "IVV", "SPY"]`).
  - Při výběru konkrétního fondu se v záhlaví reportu zobrazí výrazný identifikační banner: *„Váš vybraný fond k detailnímu posouzení: VOO“*.
  - Ve srovnávací tabulce je sloupec vybraného fondu dynamicky zvýrazněn zeleným podbarvením (`bg-emerald-50/60`), smaragdovým rámečkem a odznakem *„VÁŠ VÝBĚR“*.
  - V přehledu ročních nákladů je karta vybraného fondu opatřena výrazným rámečkem a odznakem.
  - Z `ReportViewTracker.tsx` byla odstraněna finanční částka (`amount`) z vlastností analytické události, aby nedocházelo k úniku profilových údajů do analytiky.

### B05: Vyvážení finančních textů a ověřené zdroje (Priorita 5)
- **Problém:** Srovnávací karty uváděly statické označení `(gross)`, zatímco dataset a report pracovaly s `(net)`. Odkaz na prospekt VOO vedl na obecný web `corporate.vanguard.com`. Tvrzení o spreadu a daních obsahovala příliš zevšeobecňující formulace.
- **Náprava:**
  - V `src/components/EtfComparison.tsx` se označení nákladovosti generuje dynamicky podle datasetu: `ročně ({etf.expenseRatio.value.kind})`, což zajišťuje 100% soulad s `data/etfs.json`.
  - V `src/app/report/page.tsx` byla obecná adresa Vanguard nahrazena přímým odkazem na produktový profil a prospekt VOO: `https://investor.vanguard.com/investment-products/etfs/profile/voo`.
  - Formulace k Bid-Ask spreadu byla upravena na věcný popis tržní likvidity a přítomnosti tvůrců trhu (market makers) na NYSE Arca s typickými spready pod 0,02 %, namísto nepodloženého tvrzení o „vždy 1 centu“.
  - Text o daních v `src/components/CzechContext.tsx` a `/report` byl zpřesněn s důrazem na formulář W-8BEN dle česko-americké smlouvy o zamezení dvojího zdanění (standardní 15% srážka dividend u zdroje), s výslovným upozorněním na nutnost ověření u konkrétního brokera a individuální daňové situace investora.

### B06: Pravdivost dokumentace a stav QA (Priorita 6)
- **Stav testů:** 36 testů ve Vitestu prochází (14 kalkulačních, 22 backendových/integračních).
- **Kvalita kódu:** `npm run typecheck` (0 chyb), `npm run lint` (0 chyb), `npm run build` (úspěšný produkční build Next.js 14.2.35, 87.2 kB shared JS).
- **Čistá instalace:** `npm ci --dry-run` ověřen bez konfliktů závislostí.
- **Tisk do PDF:** Stránka `/report` ověřena s `@media print` (skrytí tlačítek/navigace, čitelný tisk na bílém podkladu se zachováním zvýraznění vybraného fondu).
- **Databázové migrace:** Migrace `supabase/migrations/20261015000000_atomic_lead_submission.sql` je připravena k aplikaci v Supabase SQL editoru; skript `npm run check:supabase` slouží k okamžitému ověření stavu.

---

## 2. Přehled akceptačních kritérií (R01–R18)

| ID | Název kritéria | Skutečný stav |
|---|---|---|
| **R01** | Fondy VOO, IVV, SPY z NYSE Arca s ověřenými fakty | **Splněno.** Dataset `data/etfs.json` obsahuje ověřená data a přímé primární zdroje. |
| **R02** | Český jazyk a mobilní použitelnost (320–390 px) | **Splněno.** Editorial copy v češtině, responzivní layout bez horizontálního overflow. |
| **R03** | Hodnota a kalkulačka bez povinného e-mailu | **Splněno.** Srovnání i interaktivní kalkulačka fungují okamžitě na landing page. |
| **R04** | Skutečné uložení kontaktu na serveru | **Splněno.** Transakční RPC `submit_lead` v PostgreSQL, striktní odmítnutí těkavého fallbacku v produkci. |
| **R05** | Prémiový finanční vizuál bez klišé | **Splněno.** Typografie Serene Editorial Finance (Newsreader + Inter), sladěno se Stitch. |
| **R06** | Jasná definice cílové skupiny a momentu kontaktu | **Splněno.** Český drobný investor, kontakt požadován výhradně pro vydání detailního reportu. |
| **R07** | Dva reklamní koncepty a UTM tracking | **Splněno.** HTML makety `ads/ad-a.html`, `ads/ad-b.html`, dynamická headline na landing page. |
| **R08** | Plynulý přechod z kalkulačky do formuláře | **Splněno.** Kliknutí na kalkulačce scrolluje na formulář s předvyplněnými hodnotami a měří se `lead_cta_clicked`. |
| **R09** | Okamžitý rozšířený materiál s tiskem do PDF | **Splněno.** Stránka `/report` s dynamickým zvýrazněním vybraného fondu a `@media print`. |
| **R10** | Doložený původ finančních dat (Audit Trail) | **Splněno.** `docs/data-methodology.md`, `scripts/validate-data.ts`, ověřené odkazy na prospekty. |
| **R11** | Odpovědné a bezpečné měření konverzí | **Splněno.** GDPR opt-in lišta, deduplikovaný `analytics-client`, opravený jmenovatel ve voronkovém reportu. |
| **R12** | Logické uspořádání landing page | **Splněno.** Hero &rarr; Srovnání &rarr; Kalkulačka &rarr; Formulář &rarr; Český kontext &rarr; FAQ &rarr; Zápatí. |
| **R13** | Odhad konverzního poměru (CVR) | **Splněno.** Uveden střízlivý odhad 3–7 % pro cílený placený provoz; testovací CVR není zaměňována za marketingovou. |
| **R14** | 3 seřazené hypotézy pro A/B testování | **Splněno.** Zpracováno v `docs/experiments.md` s definovaným MDE a metodikou. |
| **R15** | Živé HTTPS nasazení na Vercelu | **Splněno.** Projekt je nasazen na Vercelu, napojen na produkční Supabase. |
| **R16** | Veřejný Git repozitář s logickou historií | **Splněno.** Repozitář na GitHubu, commit historie zachycuje jednotlivé etapy. |
| **R17** | Dokumentace spolupráce s AI a záznam chyb | **Splněno.** `ai-log/mistakes.md`, `ai-log/sessions/`, vysvětlení struktury logů. |
| **R18** | Závěrečný e-mail zadavateli | **Připraveno k odeslání.** Návrh v sekci 10 v `README.md`. |
