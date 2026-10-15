# QA a důkazy ověření projektu (Zadání B)

Aktualizováno 2026-10-15. Nejnovější production a lokální důkazy: [finální QA bodu 4](final-qa-2026-10-15.ru.md). Historická matice níže popisuje původní rozsah jednotlivých testů; novější protokol ji doplňuje.

## Aktuální automatické kontroly

**Novější security krok:** Next 15.5.28, Vitest 4.1.11, Node 24.x; skutečný clean install, **101/101 testů (14 souborů)**, lint/typecheck/build prošly. Production npm audit 0; úplný audit má výslovně popsanou neopravenou dev-only braces advisory. [Audit bodu 5](security-audit-2026-10-15.ru.md) má aktuální rozsah a stav publikace. Starší počty/metriky níže patří k předchozímu QA commitu, nikoli novému frameworku.

Security kód `99cebb1` je nyní publikovaný a ověřený READY; GitHub CI success. Nový production mobile Lighthouse **90/100/100/100**; production security/browser smoke prošel v doloženém rozsahu. Celý form/DB/PDF scénář bodu 4 se tímto nevydává za opakovaný na Next 15; jeho historický protokol zůstává zachován.

| Kontrola | Výsledek a rozsah |
|---|---|
| `npm test` | **92/92**, 11 souborů: 87 předchozích + 5 regresí koordinace session při odeslání včetně pozdního 403 |
| `npm run lint` | Bez chyb a varování |
| `npm run typecheck` | Bez chyb |
| `npm run build` | Prošlo; Next.js 14.2.35, vygenerováno 10 stránek včetně app icon, shared JS 87,2 kB |
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

**Aktuální stav bodu 4:** production kód `bf9c207` ověřen READY; Lighthouse mobile **91/100/100/100**, production PDF všechny tři A4 strany vizuálně zkontrolovány. Reálný browser → DB → report, společná session/UTM, duplicate 200 a conflict 409 potvrzeny. [Úplný protokol](final-qa-2026-10-15.ru.md) včetně přesného SHA, podmínek, synthetic request IDs a mezí důkazu. Níže uvedené starší body jsou historickým kontextem, nikoli zbývající prací bodu 4.

- [Verifikace 4465301](readiness-verification-4465301.ru.md) zaznamenala landing na 320/360/390 px bez globálního overflow a bez error/warn v kontrolovaných stavech. Neobsahuje aktuální Lighthouse mobile skóre.
- PDF dříve otevřel/uložil uživatel. Vizuální kontrola nového PDF po posledních obsahových změnách zůstává nedoložená. Přítomnost `@media print` není důkazem kvality výsledného PDF.
- Live kontrola SHA v historickém protokolu platí pro `4465301`. V tomto kroku nedošlo k deployi ani novému porovnání production SHA; stav novějších změn na webu z toho nelze odvodit.
- Atomická původní RPC a limiter byly v 4465301 ověřeny v živé DB. Nová migrace identity byla v předchozím kroku ověřena s rollbackem. Trvalé nasazení nelze odvozovat z existence SQL souboru.

## Co tímto krokem není uzavřeno

Bezpečnost celé Git historie/závislostí je samostatný zbývající bod. Nový Lighthouse, PDF, live 409 a stav publikace oprav jsou doloženy v [protokolu bodu 4](final-qa-2026-10-15.ru.md); starší tvrzení o chybějících měřeních nejsou aktuálním stavem.

### Dodatečné ověření změny finančního datasetu

`tests/dataset-driven-ui.test.ts` mění pouze izolovaný fixture: číselné sazby a pořadí nákladovosti, Gross/Net, emitenta, burzu, měnu a dividendy. Ponechává zastaralé displayPercent a potvrzuje, že Hero, comparison, kalkulačka, FAQ i report ukazují správné nové sazby; obě kalkulace mají nové částky a desetiletý rozdíl. Vyšší sazba je zvýrazněna u nově nejdražšího VOO. Původní finanční snapshot a kontrolní výpočty zůstávají beze změny.

Lokální browser: landing na 320 a 390 px bez globálního overflow (scrollWidth 305/375); Hero grid na 320 px má viditelnou i celkovou šířku 279 px. Report na 320 px: document width 305, tabulka 412 uvnitř scroll kontejneru 215 px, nikoli přesah celého dokumentu. Kalkulačka při 250000 CZK a report s IVV: 75 / 75 / 236,25 CZK. V kontrolovaných stavech žádné console error/warn, oba GET 200. Nejde o nové produkční měření Lighthouse ani PDF kontrolu.

### Dodatečné ověření regulačních a daňových zdrojů

PRIIPs/KID a americká srážka/W-8BEN mají společné podmíněné formulace, primární zdroje a lokátory v datasetu. Odkazy se skutečně renderují v českém kontextu i reportu; odmítá se chybějící evidence a vydávání blogu za primární zdroj. Kontrola proběhla 2026-10-15; [rozsah a přístupové omezení EUR-Lex](data-methodology.md). Kategorická broker-specific a žebříčková tvrzení odstraněna. Nejde o individuální daňové posouzení ani nové ověření aktuálních sazeb všech fondů. Tyto změny dosud nejsou publikovány.

### Dodatečné ověření retence

Cleanup scheduler je nyní aktivní v Supabase: 03:15 UTC denně; skutečná neodstraňující cron sonda prošla 2026-10-15 v 10:46 UTC a odregistrovala se. SQL a service_role mazání ověřeny s rollbackem; CLI úspěch/chyba mají procesní testy. První ostrý denní běh ještě neproběhl. [Přesný provozní protokol](data-retention.md). Dřívější tvrzení o chybějícím scheduleru je tímto překonáno; související změna Privacy zatím vyžaduje publikaci.
