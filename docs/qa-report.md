# QA a důkazy ověření projektu (Zadání B)

Aktualizováno 2026-10-15 po opravě bodu 2 z [verifikace 4465301](readiness-verification-4465301.ru.md). Tento přehled nahrazuje dřívější jednotné značky „PROŠLO“, které nerozlišovaly úroveň důkazu.

## Aktuální automatické kontroly

| Kontrola | Výsledek a rozsah |
|---|---|
| `npm test` | **87/87**, 10 souborů: předchozích 78 + 9 regresí UI při změně datasetu |
| `npm run lint` | Bez chyb a varování |
| `npm run typecheck` | Bez chyb |
| `npm run build` | Prošlo; Next.js 14.2.35, vygenerováno 9 stránek, shared JS 87,2 kB |
| `node scripts/experiment-sample-size.mjs` | 8 158 relací / rameno; plánovací zaokrouhlení 8 200 |

HTTP test CLI spouští samostatný proces proti lokálnímu serveru. V omezeném sandboxu spojení selhalo i při simulaci úspěchu; po povolení localhost spojení prošly oba scénáře. Nejde o výpadek Supabase ani opravu produkční sítě.

## Úrovně důkazů

- **Unit / memory:** výpočet, schéma nebo služba v paměti; neprokazuje zápis do Postgres.
- **Handler + mock:** skutečný Next.js handler, ale řízená odpověď databázového klienta nebo jiné závislosti; ověřuje HTTP kontrakt, ne dostupnost externí služby.
- **CLI + lokální HTTP:** skutečný proces a Supabase klient proti řízenému HTTP serveru; ověřuje návratový kód programu a čtení, nikoli živou DB.
- **SQL s rollbackem:** skutečná funkce v Postgres v testovací transakci; změny nejsou trvalým nasazením.
- **Historické live / browser:** konkrétní dříve zaznamenaný průchod publikovanou verzí. Není automaticky důkazem novějšího commitu.
- **Kontrola zdroje:** ověřuje přítomnost konfigurace/kódu, ne jeho runtime účinek.

## Matice T01–T20

| ID | Požadované chování | Dostupný důkaz | Stav / hranice důkazu |
|---|---|---|---|
| T01 | Integrita datasetu a zdrojů | Nynější `validate:data`, provenance testy a ověření primárních regulačních/daňových zdrojů | Prošlo v uvedeném rozsahu; snapshot sazeb ETF zůstává 2026-10-11, nebyl vydáván za dnešní nové měření |
| T02 | Přesné kontrolní náklady | `tests/calculations.test.ts`, unit | Prošlo; 30 Kč, 94,50 Kč a rozdíl 64,50 Kč |
| T03 | Parsování českého vstupu a rozsah | `tests/calculations.test.ts`, unit | Prošlo; neprokazuje samo o sobě mobilní ovládání |
| T04 | Email, tickery a honeypot | Zod v `tests/backend.test.ts`, unit | Prošlo; schema test, ne browser test |
| T05 | Uložení kontaktu + submission | Memory test; historický production průchod a read-only SQL ve verifikaci 4465301 | Memory prošlo nyní; live platí pro tehdy ověřený commit |
| T06 | Stejný request ID nevytvoří duplicitu | Memory; historické dva souběžné live POST; SQL rollback z opravy identity | Prošlo v uvedeném rozsahu; nejde o úplný zátěžový test |
| T07 | Selhání úložiště nevrátí úspěch/report | `tests/lead-storage-handler.test.ts`: skutečný handler, mock `submit_lead` a povolený rate limiter | Prošlo: provider error, chybějící výsledek i `success:false` → 503, bez PII a memory zápisu. Skutečný produkční výpadek není vyvoláván |
| T08 | Stejný email sdílí lead | `tests/backend.test.ts`, memory | Prošlo; není to nový live test |
| T09 | Bezpečné parametry reportu | Unit parser v backend testu; vybraný IVV v historickém browser průchodu | Parser prošel; současný handler `/report` není tímto unit testem celý pokryt |
| T10 | Bez souhlasu se neměří | Memory kontrola chybějící session, kontrola klienta; dřívější browser pozorování | Částečné; unit test nedokazuje všechny síťové požadavky prohlížeče |
| T11 | Souhlasná session a UTM | Memory + historický live průchod se sedmi událostmi v jedné session | Prošlo pro popsaný průchod; ne všechny souběhy/expiry |
| T12 | Odvolání souhlasu | Memory deaktivace + historická live session `is_active=false` | Prošlo pro uvedené scénáře |
| T13 | Deduplikace event ID | `tests/backend.test.ts`, memory | Prošlo; není to test unikátního omezení živé DB |
| T14 | Klient nesmí vytvořit `lead_saved` | Skutečný `/api/events` handler v backend testu, lokální session | Prošlo: HTTP 400 |
| T15 | Uzavřené tabulky a práva | Test textu počáteční migrace; historický live security advisor a kontrola EXECUTE; SQL rollback nové funkce | Test souboru sám neprokazuje RLS živé DB. Anonymní REST pokusy proti všem tabulkám touto sadou pokryty nejsou |
| T16 | Rate limit / ochrana payloadu | Memory rate limiter; historický SQL rollback `check_rate_limit` | Limit v testovaných scénářích prošel. Úplná matice velkých payloadů není doložena tímto testem |
| T17 | Reprodukovatelné spuštění | Nynější test/lint/typecheck/build; historický skutečný `npm ci` v oddělené kopii + 36/36 | Čistá instalace novější verze v tomto kroku neopakována; dry-run se za ni nevydává |
| T18 | Změněný obsah stejného ID → 409 | Memory/handler, mock RPC `PT409`, skutečný SQL rollback; [protokol](qa-idempotency-2026-10-15.md) | Prošlo v těchto vrstvách. Aktivace nové migrace a live HTTP 409 nebyly tímto krokem ověřeny |
| T19 | Správný jmenovatel a selhání reportu | Memory funnel test; historický live srovnávací řez; nyní CLI proti lokálnímu HTTP | Prošlo: distinct `landing_observed`; chyba čtení → exit 1 bez statistik, úspěch → exit 0. Paginace velkých dat není řešena |
| T20 | Nepovolený Origin → 403 | Skutečný lead handler v backend testu + historické live 403 | Prošlo v uvedených scénářích |

Původní test pod názvem T07 pouze předával poškozený vstup; nyní je pojmenován jako kontrola neplatného vstupu. Za test výpadku storage se již nevydává. T15 zůstává kontrolou zdrojového souboru, nikoli testem skutečného anonymního přístupu do databáze.

## Mobil, PDF a produkční nasazení

- [Verifikace 4465301](readiness-verification-4465301.ru.md) zaznamenala landing na 320/360/390 px bez globálního overflow a bez error/warn v kontrolovaných stavech. Neobsahuje aktuální Lighthouse mobile skóre.
- PDF dříve otevřel/uložil uživatel. Vizuální kontrola nového PDF po posledních obsahových změnách zůstává nedoložená. Přítomnost `@media print` není důkazem kvality výsledného PDF.
- Live kontrola SHA v historickém protokolu platí pro `4465301`. V tomto kroku nedošlo k deployi ani novému porovnání production SHA; stav novějších změn na webu z toho nelze odvodit.
- Atomická původní RPC a limiter byly v 4465301 ověřeny v živé DB. Nová migrace identity byla v předchozím kroku ověřena s rollbackem. Trvalé nasazení nelze odvozovat z existence SQL souboru.

## Co tímto krokem není uzavřeno

Lighthouse, nové PDF, bezpečnost celé Git historie/závislostí a případné finální nasazení. Jde o zbývající práci z širšího auditu, ne o důvod označit všechny automatické testy jako live evidence.

### Dodatečné ověření změny finančního datasetu

`tests/dataset-driven-ui.test.ts` mění pouze izolovaný fixture: číselné sazby a pořadí nákladovosti, Gross/Net, emitenta, burzu, měnu a dividendy. Ponechává zastaralé displayPercent a potvrzuje, že Hero, comparison, kalkulačka, FAQ i report ukazují správné nové sazby; obě kalkulace mají nové částky a desetiletý rozdíl. Vyšší sazba je zvýrazněna u nově nejdražšího VOO. Původní finanční snapshot a kontrolní výpočty zůstávají beze změny.

Lokální browser: landing na 320 a 390 px bez globálního overflow (scrollWidth 305/375); Hero grid na 320 px má viditelnou i celkovou šířku 279 px. Report na 320 px: document width 305, tabulka 412 uvnitř scroll kontejneru 215 px, nikoli přesah celého dokumentu. Kalkulačka při 250000 CZK a report s IVV: 75 / 75 / 236,25 CZK. V kontrolovaných stavech žádné console error/warn, oba GET 200. Nejde o nové produkční měření Lighthouse ani PDF kontrolu.

### Dodatečné ověření regulačních a daňových zdrojů

PRIIPs/KID a americká srážka/W-8BEN mají společné podmíněné formulace, primární zdroje a lokátory v datasetu. Odkazy se skutečně renderují v českém kontextu i reportu; odmítá se chybějící evidence a vydávání blogu za primární zdroj. Kontrola proběhla 2026-10-15; [rozsah a přístupové omezení EUR-Lex](data-methodology.md). Kategorická broker-specific a žebříčková tvrzení odstraněna. Nejde o individuální daňové posouzení ani nové ověření aktuálních sazeb všech fondů. Tyto změny dosud nejsou publikovány.

### Dodatečné ověření retence

Cleanup scheduler je nyní aktivní v Supabase: 03:15 UTC denně; skutečná neodstraňující cron sonda prošla 2026-10-15 v 10:46 UTC a odregistrovala se. SQL a service_role mazání ověřeny s rollbackem; CLI úspěch/chyba mají procesní testy. První ostrý denní běh ještě neproběhl. [Přesný provozní protokol](data-retention.md). Dřívější tvrzení o chybějícím scheduleru je tímto překonáno; související změna Privacy zatím vyžaduje publikaci.
