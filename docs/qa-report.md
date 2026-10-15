# QA a verifikační report projektu (Zadání B)

**Datum provedení:** 2026-10-15  
**Prostředí:** Node.js v24.19.0, npm 11.17.0, Next.js 14.2.35 (Production Build), Vitest 2.1.9  
**Verze datasetu:** `2026-10-11`  
**Testovací pokrytí po opravě idempotence:** 52 testů (14 kalkulačních, 28 backendových, 7 klientské identity žádosti, 3 RPC)

**Aktualizace 2026-10-15:** Oprava T18 je ověřena v lokálním kódu a v SQL transakci s rollbackem; dosud není nasazena na produkci. [Podrobný protokol a aktivace](qa-idempotency-2026-10-15.md). Ostatní řádky níže tato dílčí kontrola znovu neověřovala; aktuální omezení jejich důkazů popisuje [nezávislá verifikace](readiness-verification-4465301.ru.md).

---

## 1. Matice akceptačních testů (T01–T20)

| ID | Název testu | Očekávaný výsledek | Skutečný výsledek | Status |
|---|---|---|---|---|
| **T01** | Schéma datasetu a integrita | 3 fondy, NYSE Arca, platné URL, asOf/checkedAt | Skript `scripts/validate-data.ts` potvrdil 100% shodu | **PROŠLO** |
| **T02** | Kontrolní výpočty (sekce 6.3) | 100 000 Kč $\times$ 0,0003 = 30 Kč; SPY = 94,50 Kč; Rozdíl = 64,50 Kč | Vitest potvrdil přesné hodnoty s ošetřením IEEE 754 | **PROŠLO** |
| **T03** | Parsování vstupu, české čárky, mezery | Akceptuje mezery a čárku; odmítá záporná čísla a extrémy | 100 000 i 250 000 Kč parsováno správně; záporná čísla odmítnuta | **PROŠLO** |
| **T04** | Validace e-mailu a honeypotu | Odmítnutí neplatných e-mailů a vyplněného honeypotu | Zod schéma `LeadSubmissionSchema` zachytilo chyby | **PROŠLO** |
| **T05** | Uložení kontaktu na serveru | Vytvoření záznamu leadu i submission přes transakční logiku | Serverový `saveLeadSubmission` vytvořil oba záznamy | **PROŠLO** |
| **T06** | Dvojklik / opakovaný requestId | Žádná duplicitní submission ani falešná konverze | Idempotence zachována, vrácen stejný existující záznam | **PROŠLO** |
| **T07** | Ošetření chyb úložiště | Žádný únik stacktrace, kontrolovaná chyba bez falešného úspěchu | Kontrolovaná chyba, zákaz tichého in-memory zápisu v produkci | **PROŠLO** |
| **T08** | Opakované odeslání stejného e-mailu | Uživatelský úspěch, ale počet unikátních kontaktů neroste | Submission přiřazena k existujícímu `lead_id` | **PROŠLO** |
| **T09** | Report a neplatné query parametry | Bezpečné sanitizování na výchozí hodnoty (100 000 Kč) | Report funguje i při chybných či chybějících parametrech | **PROŠLO** |
| **T10** | Analytika před souhlasem a po odmítnutí | Žádné požadavky na události ani sledovací cookies | Klient neposílá žádné události před kliknutím na souhlas | **PROŠLO** |
| **T11** | Analytika po souhlasu | Relace vytvořena, cookie nastavena, UTM zachyceno | Úspěšně zaznamenáno v session i událostech | **PROŠLO** |
| **T12** | Odvolání souhlasu (Opt-out) | Ukončení relace, zablokování dalších událostí | Relace deaktivována, endpoint událostí vrací 403 | **PROŠLO** |
| **T13** | Deduplikace událostí (Event Replay) | Identické `eventId` není vloženo dvakrát | Idempotence ověřena v testu | **PROŠLO** |
| **T14** | Zákaz podvržení `lead_saved` | Klientský pokus o odeslání `lead_saved` je odmítnut | Endpoint `/api/events` vrací HTTP 400 | **PROŠLO** |
| **T15** | Ochrana databáze (RLS) | Žádný anonymní přístup ke kontaktům | Všechny tabulky mají RLS bez anonymních politik | **PROŠLO** |
| **T16** | Atomický Rate Limiting na serveru | Nadlimitní požadavky vrací 429; atomický čítač | Atomická RPC `check_rate_limit` blokuje nadlimitní pokusy | **PROŠLO** |
| **T17** | Čistá instalace, lint a build | `typecheck`, `next lint`, `test` (36/36) a `next build` projdou bez chyb | Všechny příkazy skončily s exit code 0 | **PROŠLO** |
| **T18** | Odmítnutí změněného payloadu při shodném requestId | HTTP 409 bez změny původní žádosti | Handler test vrací 409; SQL test odmítá změnu všech 5 polí, shodný retry přijme | **PROŠLO lokálně a SQL s rollbackem; nasazení čeká** |
| **T19** | Výpočet konverzního trychtýře | Jmenovatel počítá pouze relace s `landing_observed` | Skript `scripts/funnel-report.ts` filtruje nepozorované relace | **PROŠLO** |
| **T20** | Ochrana proti podvrženému Origin hlavičce | Blokování cross-origin požadavků z neautorizovaných domén | Endpoint `/api/leads` vrací HTTP 403 při cizím Origin | **PROŠLO** |

---

## 2. Mobilní responzivita a testování layoutu

- **320 px (nejmenší podporovaný mobilní displej):**
  - Žádné globální horizontální přetékání (overflow-x).
  - Tlačítka a vstupy zachovávají minimální doporučenou dotykovou výšku 44–48 px.
  - Vstup pro e-mail má font-size 16 px (zabraňuje nechtěnému přiblížení v iOS Safari).
- **390 px (standardní moderní smartphone – iPhone 14/15):**
  - Optimální čitelnost typografie s link-height 1.55–1.6.
  - Srovnávací karty se adaptují do vertikálního toku s detailními akordeony pro právní formu a zdroje.
- **768 px a 1440 px (tablet a desktop):**
  - Hero i obsah jsou zarovnány do čitelného editorial sloupce s centrovaným rozvržením.
  - Tři fondy se přehledně zobrazují vedle sebe s jasným vyznačením parametrů.

---

## 3. Tisk a export do PDF (`/report`)

- Stránka `/report` obsahuje vyhrazená pravidla `@media print`:
  - Skrytí navigace, tlačítek (včetně samotného tlačítka pro tisk) a lišty cookies (`.no-print`, `button`, `.consent-banner`).
  - Čisté bílé pozadí a vysoce kontrastní černý text pro úsporný a čitelný tisk.
  - Automatické vypsání cílových URL odkazů za jejich textem (`a::after { content: " (" attr(href) ")" }`).
  - Vizuální zvýraznění zvoleného fondu (např. VOO) i v tisku bez ztráty čitelnosti.
  - Tlačítko *„🖨️ Vytisknout / Uložit do PDF“* (`#print-report-button`) vyvolává nativní dialog prohlížeče `window.print()`.

---

## 4. Stav externích závislostí a PostgreSQL migrací

- **Supabase připojení:** Ověřeno skriptem `npm run check:supabase`.
  - Všech 5 základních tabulek (`leads`, `lead_submissions`, `analytics_sessions`, `analytics_events`, `rate_limit_buckets`) existuje v databázi s aktivním RLS.
  - Vytvořena migrace `supabase/migrations/20261015000000_atomic_lead_submission.sql` obsahující:
    1. Transakční funkci `public.submit_lead(...)` (atomický upsert kontaktu a submission).
    2. Atomickou funkci `public.check_rate_limit(...)` (atomický přírůstek bucketu s expirací).
  - Skript `npm run check:supabase` automaticky detekuje, zda jsou tyto RPC funkce nainstalovány, a poskytuje přesný návod pro spuštění v Supabase Dashboard SQL Editoru.
