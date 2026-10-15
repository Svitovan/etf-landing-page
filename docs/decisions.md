# Záznam architektonických a produktových rozhodnutí (ADR)

## ADR-015: Testovací kohorta mimo reklamní konverze (2026-10-15)
- **Rozhodnutí:** Serverové `is_test` na submission/session, automaticky jen pro rezervované email domény nebo předem označenou session; ostatní QA přes service_role-only preview/apply RPC. Žádná veřejná klientská přepínací property, žádné heuristiky typu qa-prefix osobní pošty, žádné mazání kontaktů.
- **Statistika:** Celá test session vyloučena z obou částí CVR, kroků i UTM. Request ID spojuje staré split/late attempts. Kontakty jsou distinct z ponechaných odeslání; bez pozorovaných netestových relací je CVR N/A. UTM nevydáváme za důkaz placeného provozu.
- **Baseline:** Uživatel potvrdil, že veškeré dosavadní návštěvy byly testy; jednorázová administrativní klasifikace má přesný cutoff a není součástí obecné migrace. Důkazy a limity: [test traffic](test-traffic.ru.md).

## ADR-014: Podporované závislosti a přesně omezený bezpečnostní review (2026-10-15)
- **Rozhodnutí:** Next 15.5.28 jako nejmenší podporovaná opravená větev místo plošného upgrade na 16; zachován React 18 podporovaný peer kontraktem balíčku. Async searchParams, Next Link a render testy přizpůsobeny; bez změny finančních dat/API. Vitest 4.1.11, Node 24.x a přesný PostCSS 8.5.30 override.
- **Mez:** Production npm audit čistý; úplný audit má jeden neopravený braces advisory v pěti dev uzlech. CI toleruje jen přesnou dev-only advisory/řetězec do 2026-11-15; nové problémy a audit chyby blokuje. Pravidla lintingu se nevypínají kvůli dosažení nuly.
- **Secrets:** Gitleaks full history + current tree a lokální exact/base64 kontrola Git blobs/client assets. Pouze jeden konkrétní historický falešný příklad má fingerprint výjimku; žádná globální allowlist. Podrobnosti: [audit](security-audit-2026-10-15.ru.md).

## ADR-013: Tisk dokumentu a omezená koordinace analytiky (2026-10-15)
- **Rozhodnutí:** Print CSS rozlišuje navigační header/footer a vlastní záhlaví/zdroje reportu. Výstup je A4 se zachováním všech informací a nezalamovanými krátkými bloky.
- **Souhlas a formulář:** Před lead POST čeká klient nejvýše dvě sekundy na zaznamenání pokusu, včetně případného vytvoření session cookie. Bez souhlasu nic neměří; timeout či chyba analytiky nebrání uložení kontaktu. Při timeoutu není asociace garantována.
- **Pozdní 403:** Počítadlo úspěšných inicializací rozliší odpověď na požadavek odeslaný před nastavením nové cookie. Pokud mezitím session vznikla, retry ji znovu použije; nezaloží další a nerozdělí attempt a submission mezi dvě session. Ověřeno regresí a production browser/SQL na bf9c207.
- **Důkaz:** Production reprodukce NULL session a neúplného PDF; čtyři unit regrese, lokální browser se skutečnou Supabase a vizuální kontrola všech tří A4 stran. Viz [finální QA](final-qa-2026-10-15.ru.md).

## ADR-012: Jedna číselná sazba pro popisek i výpočet (2026-10-15)
- **Rozhodnutí:** Veškeré UI procentní sazby se odvozují z `expenseRatio.value.rate` přes sdílené formátování, nikoli z ručních JSX hodnot ani z uloženého displayPercent. Typ sazby je `kind`; původní displayPercent ponechán pro kompatibilitu datasetu, ale UI jej nepoužívá.
- **Prezentace:** Hero dostává stejná ETF props jako kalkulačka. Tabulka reportu se generuje z datových polí včetně emitenta, formy a dividend. Výsledek/varovná barva se nepřipisuje napevno tickeru SPY a text rozdílu nepředpokládá rovnost VOO a IVV.
- **Ověření:** Test mění numeric rates a další metadata pouze v odděleném fixture, ponechává zastaralý displayPercent a ověřuje render pěti bloků, přepočet nákladů i změnu pořadí. 87 testů a lokální mobilní kontrola prošly; dataset nebyl kvůli testu upraven.

## ADR-011: Sdílené a dohledatelné regulační/daňové texty (2026-10-15)
- **Rozhodnutí:** Podmíněná obecná tvrzení o PRIIPs/KID a americké srážce/W-8BEN jsou v `investorContext` uvnitř `data/etfs.json` s primárními zdroji, datem kontroly a lokátorem. Server je předává jako typované props; nevkládá se celý dataset navíc do klientského bundle. Stránka i report zobrazují tytéž formulace a přímé zdroje.
- **Hranice:** Smluvní limit není automatická sazba každé ETF distribuce, W-8BEN nedokládá nárok sám podpisem a nenahrazuje posouzení českých povinností. Jazyk KID závisí na čl. 7 a podmínkách ČNB, ne na univerzálním pravidle „vždy česky“. Bez prověření brokera se jeho nabídka nedeklaruje.
- **Poctivý původ:** Finanční snapshot fondů se touto kontrolou nemění. Měsíc revize W-8BEN neproměňujeme ve vymyšlený přesný den. EUR-Lex anti-bot omezení se přiznává; obecné pořadí fondů/spreadů bez aktuálního měření se odstraňuje.
- **Verifikace:** Validátor kontroluje kontrakt evidence, nikoli pravdivost internetu. 78 testů zahrnuje chybějící/sekundární evidence a viditelné zdrojové odkazy na landing i v reportu.

## ADR-010: Retence přímo v Postgres a atomický cleanup (2026-10-15)
- **Rozhodnutí:** Supabase pg_cron spouští denně v 03:15 UTC jednu transakční SQL funkci. Vercel ani externí HTTP plánovač nejsou potřeba. Uchování je 30 dní + prodleva do nejbližšího denního běhu; Privacy tuto mez výslovně uvádí.
- **Chyby a oprávnění:** SECURITY INVOKER bez veřejného EXECUTE, service_role pro CLI. Chyba vede k rollbacku; Node ověřuje odpověď RPC a vrací exit 1 bez provider PII. Skutečné mazání se serializuje, rodičovské kontakty se předem zamknou.
- **Rozsah:** Adresné odstranění kontaktu se nedotkne nesouvisejících analytických relací. Prázdná cílová adresa a neplatná retence se odmítají. Náhled neprovádí změny. Historie dvou projektových jobů se čistí samostatně.
- **Ověření:** 72 testů, reálné SQL a service_role s rollbackem, CLI náhled a skutečná neodstraňující cron sonda. První ostrý denní běh se neoznačuje předem za úspěšný. Provozní postup a limity v `docs/data-retention.md`.

## ADR-009: Důkazy místo jednotného „prošlo“ a přenositelný AI export (2026-10-15)
- **Kontext:** Dokumentace směšovala unit testy s produkčními kontrolami; odhad vzorku neměl MDE a AI shrnutí nebylo exportem skutečných zpráv.
- **Rozhodnutí:** QA uvádí pro každý scénář úroveň důkazu a omezení. Selhání storage se testuje skutečným handlerem s řízenou odpovědí providera; chyba reportu také samostatným CLI procesem. Produkční outage se kvůli testu nevyvolává.
- **Experimenty:** Baseline 5 % a MDE +1 procentní bod jsou plánovací předpoklady; α 0,05 / síla 0,80 vychází na 8 158 relací v každém rameni normální aproximací, zaokrouhlený cíl 8 200. Nejde o naměřenou konverzi ani spuštěný randomizovaný experiment. Přesný návrh a podmínky jsou v `docs/experiments.md`.
- **AI artefakty:** Z dostupných projektových Codex JSONL se exportují pouze skutečné viditelné zprávy s redakcí a manifestem zdrojových hashů. Bez system/developer instrukcí, reasoning, nástrojů a obrázků; souhrny zůstávají oddělené. Úplnost historie Antigravity se neslibuje a omezení je uvedeno v emailovém návrhu.
- **CLI:** Chyba čtení funnelu nastaví `process.exitCode = 1`; žádné nulové výsledky a žádné soukromé detaily providera. Vnější automatizace tak může chybu rozpoznat.

## ADR-008: Neměnný obsah jedné žádosti a bezpečný konflikt při retry (2026-10-15)
- **Kontext:** Opakování stejného `requestId` s jinými daty vracelo původní report jako úspěch; implementační plán vyžaduje odmítnutí změněného obsahu.
- **Rozhodnutí:** Identita žádosti obsahuje normalizovaný e-mail, množinu ETF, částku, verzi zásad soukromí a verzi datasetu. Pořadí / duplicity ETF ani velikost písmen a okolní mezery e-mailu nevytvářejí konflikt. Analytická relace není součástí identity a při retry se původní vazba nepřepisuje.
- **Databáze:** Nová migrace `20261015101054_enforce_lead_request_identity.sql` zamyká request ID pomocí transakčního advisory locku ještě před prvním zápisem a porovnává původní obsah. Konflikt vyvolá SQLSTATE `PT409`; role `anon` a `authenticated` nemají EXECUTE. Nezavádí se další sloupec s PII ani uložený otisk e-mailu.
- **API a formulář:** API vrací HTTP 409 a obecný kód `IDEMPOTENCY_CONFLICT` bez původních dat. Klient drží otisk pouze v paměti komponenty, neposílá jej do analytiky. Stejný obsah ponechá ID; explicitní odeslání změněných údajů vytvoří nové ID. Po 409 se nová žádost vytvoří až dalším odesláním uživatele, bez automatického opakování.
- **Ověření a stav:** 52 testů, lint, typecheck a build prošly; SQL chování ověřeno na Postgres s rollbackem. Trvalé nasazení migrace a aplikace zatím neproběhlo; viz `docs/qa-idempotency-2026-10-15.md`.

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


