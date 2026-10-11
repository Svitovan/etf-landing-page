# QA a verifikační report projektu (Zadání B)

**Datum provedení:** 2026-10-11  
**Prostředí:** Node.js v24.19.0, npm 11.17.0, Next.js 14.2.35 (Production Build), Vitest 2.1.9  
**Verze datasetu:** `2026-10-11`

---

## 1. Matice akceptačních testů (T01–T17)

| ID | Název testu | Očekávaný výsledek | Skutečný výsledek | Status |
|---|---|---|---|---|
| **T01** | Schéma datasetu a integrita | 3 fondy, NYSE Arca, platné URL, asOf/checkedAt | Skript `scripts/validate-data.ts` potvrdil 100% shodu | **PROŠLO** |
| **T02** | Kontrolní výpočty (sekce 6.3) | 100 000 Kč $\times$ 0,0003 = 30 Kč; SPY = 94,50 Kč; Rozdíl = 64,50 Kč | Vitest potvrdil přesné hodnoty s ošetřením IEEE 754 | **PROŠLO** |
| **T03** | Parsování vstupu, české čárky, mezery | Akceptuje mezery a čárku; odmítá záporná čísla a extrémy | 100 000 i 250 000 Kč parsováno správně; záporná čísla odmítnuta | **PROŠLO** |
| **T04** | Validace e-mailu a honeypotu | Odmítnutí neplatných e-mailů a vyplněného honeypotu | Zod schéma `LeadSubmissionSchema` zachytilo chyby | **PROŠLO** |
| **T05** | Uložení kontaktu na serveru | Vytvoření záznamu leadu i submission | Serverový `saveLeadSubmission` vytvořil oba záznamy | **PROŠLO** |
| **T06** | Dvojklik / opakovaný requestId | Žádná duplicitní submission ani falešná konverze | Idempotence zachována, vrácen stejný existující záznam | **PROŠLO** |
| **T07** | Ošetření chyb úložiště | Žádný únik stacktrace, status 503 s možností opakování | Kontrolovaná chybová hláška v češtině | **PROŠLO** |
| **T08** | Opakované odeslání stejného e-mailu | Uživatelský úspěch, ale počet unikátních kontaktů neroste | Submission přiřazena k existujícímu `lead_id` | **PROŠLO** |
| **T09** | Report a neplatné query parametry | Bezpečné sanitizování na výchozí hodnoty (100 000 Kč) | Report funguje i při chybných či chybějících parametrech | **PROŠLO** |
| **T10** | Analytika před souhlasem a po odmítnutí | Žádné požadavky na události ani sledovací cookies | Klient neposílá žádné události před kliknutím na souhlas | **PROŠLO** |
| **T11** | Analytika po souhlasu | Relace vytvořena, cookie nastavena, UTM zachyceno | Úspěšně zaznamenáno v session i událostech | **PROŠLO** |
| **T12** | Odvolání souhlasu (Opt-out) | Ukončení relace, zablokování dalších událostí | Relace deaktivována, endpoint událostí vrací 403 | **PROŠLO** |
| **T13** | Deduplikace událostí (Event Replay) | Identické `eventId` není vloženo dvakrát | Idempotence ověřena v testu | **PROŠLO** |
| **T14** | Zákaz podvržení `lead_saved` | Klientský pokus o odeslání `lead_saved` je odmítnut | Endpoint `/api/events` vrací HTTP 400 | **PROŠLO** |
| **T15** | Ochrana databáze (RLS) | Žádný anonymní přístup ke kontaktům | Všechny tabulky mají RLS bez anonymních politik | **PROŠLO** |
| **T16** | Rate limiting a omezení velikosti těla | Nadlimitní požadavky vrací 429/413 bez úniku dat | HMAC bucket zablokoval nadlimitní pokusy | **PROŠLO** |
| **T17** | Čistá instalace a build | `typecheck`, `test` a `next build` projdou bez chyb | Všechny 3 příkazy skončily s exit code 0 | **PROŠLO** |

---

## 2. Mobilní responzivita a testování layoutu

- **320 px (nejmenší podporovaný mobilní displej):**
  - Žádné horizontální přetékání (overflow-x).
  - Tlačítka a vstupy zachovávají minimální výšku 44–48 px.
  - Vstup pro e-mail má font-size 16 px (zabraňuje nechtěnému přiblížení v iOS Safari).
- **390 px (standardní moderní smartphone – iPhone 14/15):**
  - Optimální čitelnost typografie s link-height 1.55.
  - Srovnávací karty se adaptují do vertikálního toku se záložkami.
- **768 px a 1440 px (tablet a desktop):**
  - Obsah je zarovnán do čitelného editorial sloupce (max-width 840 px).
  - Tři fondy se přehledně zobrazují vedle sebe.

---

## 3. Tisk a export do PDF (`/report`)
- Stránka `/report` obsahuje vyhrazená pravidla `@media print`:
  - Skrytí navigace, tlačítek a lišty cookies.
  - Čisté bílé pozadí a černý text pro úsporný a kontrastní tisk.
  - Automatické vypsání cílových URL odkazů za jejich textem.
  - Tlačítko *„🖨️ Vytisknout / Uložit do PDF“* vyvolává nativní dialog prohlížeče.
