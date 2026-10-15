# Záznam architektonických a produktových rozhodnutí (ADR)

## ADR-001: Výběr ETF (VOO, IVV, SPY) a burzy (NYSE Arca)
- **Kontext:** Zadání specifikuje ETF obchodované na NYSE pro českého retailového investora. Většina velkých amerických ETF je primárně kotována a obchodována na NYSE Arca (plně elektronická součást skupiny NYSE).
- **Rozhodnutí:** Jako srovnávané fondy volíme tři největší a nejlikvidnější americké ETF na stejný benchmark (S&P 500 Index): Vanguard S&P 500 ETF (VOO), iShares Core S&P 500 ETF (IVV) a SPDR S&P 500 ETF Trust (SPY).
- **Důvod:** Srovnání na identický index odstraňuje matoucí rozdíly ve strategiích a umožňuje srozumitelně ukázat rozdíl v nákladech fondu (Expense Ratio) a likviditě.
- **Burza:** Explicitně uvádíme a zobrazujeme „NYSE Arca“, což splňuje zadání a je fakticky přesné.

## ADR-002: Technický stack (Next.js App Router, TypeScript, CSS)
- **Kontext:** Potřebujeme mobilní web s rychlým načtením, bezpečnými serverovými Route Handlery pro zápis leadů a analytických událostí bez vystavení databáze do prohlížeče.
- **Rozhodnutí:** Next.js (App Router), TypeScript, CSS custom properties / CSS Modules, Zod pro validaci schémat.
- **Důvod:** Jednotný kód pro frontend i backend, jednoduché nasazení na Vercel, vysoký výkon a nulový runtime overhead CSS knihoven.

## ADR-003: Model vydání materiálu (Okamžitý HTML přehled s tiskem / PDF v prohlížeči)
- **Kontext:** MVP vyžaduje předání slíbené hodnoty po odeslání formuláře. Odesílání e-mailů třetí stranou (např. Resend) bez ověřené produkční domény omezuje příjemce pouze na registrovaného vývojáře a vytváří selhání pro libovolného recenzenta.
- **Rozhodnutí:** Primární MVP model: po uložení e-mailu na serveru vracíme přesměrování/odkaz na `/report` s vybranými parametry (bezpečně a bez PII v URL). Zde se zobrazí interaktivní přehled s checklistem a optimalizovaným tiskovým stylem (`@media print` pro uložení do PDF).
- **Dopad na texty:** Stránka poctivě slibuje: „Po odeslání si přehled otevřete a uložíte přímo na této stránce.“ E-mailové doručování je vedeno jako vylepšení P1 při existující doméně.

## ADR-004: Ukládání dat (Supabase Postgres s RLS)
- **Kontext:** Je nutné reálně ukládat kontakty na serveru a evidovat cestu uživatele.
- **Rozhodnutí:** Supabase Postgres s Row Level Security. Veškeré čtení i zápis kontaktů jdou výhradně přes serverový backend s privátním klíčem. Klientský anonymní přístup k tabulce leadů je zcela zakázán.
- **Záložní řešení:** Pokud uživatel / prostředí nemá zadané Supabase credentials, backend hlásí kontrolovanou chybu 503 s možností opakování a nabízí lokální souborový/emulační režim pro testování.

## ADR-005: Soukromí, GDPR a analytika
- **Kontext:** Český ÚOOÚ a evropská legislativa vyžadují aktivní souhlas pro ne-technické cookies a sledování.
- **Rozhodnutí:** Analytické sledování se spouští výhradně po aktivním souhlasu uživatele v liště soukromí. Bez souhlasu se neposílají žádné behaviorální události. Samotný formulář funguje nezávisle na analytice. Kanonický stav konverze (`lead_saved`) vzniká na serveru z potvrzené transakce, nikoliv z nespolehlivého požadavku z prohlížeče.

## ADR-006: Sladění s Google Stitch (Serene Editorial Finance, mobilní stacked cards a odstranění overflow)
- **Kontext:** Původní implementace srovnání a kalkulačky používala rigidní 3-sloupcové mřížky, což na úzkých mobilních zařízeních (320px–390px) vedlo k horizontálnímu přetečení dokumentu na 413 px. Současně nebyl načten redakční serif font navržený v designovém systému Google Stitch.
- **Rozhodnutí:**
  1. Zavedení `Newsreader` (serif pro H1, H2) a `Inter` (sans & tabular-nums) přes `next/font/google`.
  2. Přestavba srovnání ETF v `EtfComparison.tsx` na responzivní rozvržení (vertikálně skládané karty na mobile < 768px a 3 sloupce na desktopu) s akordeony pro právní formu a zdroje.
  3. Přestavba výsledků kalkulačky v `CostCalculator.tsx` z pevného 3-sloupcového gridu na řádkový přehled fondů v souladu s mobilním screenem Stitch.
  4. Odstranění pevných šířek v `ConsentBanner.tsx` a `Header.tsx`, zabránění horizontálnímu přetečení na viewportech 320 px a 390 px.

## ADR-007: Atomická persistence, ochrana produkčního úložiště a striktní analytika (Audit closure)
- **Kontext:** Nezávislý audit `docs/readiness-audit-2026-10-11.ru.md` identifikoval riziko tichého ukládání do paměti v produkci (A01), neatomické zápisy kontaktů (A02), ztrátu původních parametrů při retry (A03) a možnost podvržení PII do analytiky (A06).
- **Rozhodnutí:**
  1. Zaveden produkční guard: při `NODE_ENV === "production"` a chybějícím / neplatném Supabase backendu vrací API kontrolovanou chybu 503, čímž brání falešnému dojmu úspěšného uložení do dočasné paměti.
  2. Vytvořena atomická PostgreSQL RPC procedura `submit_lead(...)` (`supabase/migrations/20261015000000_atomic_lead_submission.sql`), která provádí idempotenci, upsert kontaktu a vložení submission v jediné transakci.
  3. Stabilní `requestId` přes pokusy o odeslání na klientovi (`LeadForm.tsx`) a návrat původních parametrů submission při duplikaci.
  4. Striktní `AnalyticsPropertiesSchema` zakazující jakákoliv PII pole (email, rawUrl, ip) a serverová validace platnosti relace před asociací s kontaktem.


