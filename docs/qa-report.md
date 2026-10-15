# QA: výsledky a hranice ověření

Konsolidováno 15. 10. 2026 z provedených kontrol a uložených artefaktů. Starší průběžné stavy nejsou otevřené úkoly. Dokumentační změna sama není novým testem produkce.

## Poslední ověřená aplikační verze

`e2353e9521edb3cb168222749cf3cd85bdae5d22`, Vercel production alias READY, deployment `dpl_HNrm5SPzqWVJpUeUC1zhTap7DN8P`. [GitHub CI 38750577133](https://github.com/Svitovan/etf-landing-page/actions/runs/38750577133): success.

| Kontrola při posledním implementačním kroku | Výsledek |
|---|---|
| Vitest | 118/118 testů, 17 souborů |
| Lint / typecheck / build | Prošlo; Next 15.5.28, Node 24.x |
| Linux CI | Čistá instalace, oba audit příkazy, testy, lint, full-history Gitleaks prošly |
| Production audit | 0 nálezů při zaznamenané kontrole |
| Úplný audit | Jedna dev-only advisory v pěti high uzlech, výjimka do 2026-11-15; [rozsah](security.md) |
| Dataset | ETF snapshot 2026-10-11; regulační/daňové zdroje kontrolovány 2026-10-15; [metodika](data-methodology.md) |

## Rozsah jednotlivých důkazů

| Oblast | Co bylo ověřeno a co z toho neplyne |
|---|---|
| Výpočty a data | Unit a render testy; izolované fixtures mění sazby i pořadí fondů napříč UI/reportem. Skutečný snapshot nemění. Validátor ověřuje strukturu/provenienci, ne pravdivost internetu. |
| Uložení a chyba DB | Memory testy a skutečný handler s mockem RPC: chyba/missing/success:false → 503, bez reportu a tichého memory fallbacku. Produkční výpadek se nevyvolával. |
| Idempotence | Stejný obsah vrací původní výsledek; změna emailu, ETF, částky či privacy/dataset → 409. Unit/RPC, skutečný SQL s rollbackem a live HTTP na bf9c207: 200 duplicate → 409 conflict → 200 duplicate; v DB jedna původní žádost. Nejde o plný zátěžový test. |
| Analytika | Souhlas, vypršení/odvolání relace, allowlist vlastností a zákaz klientského lead_saved. Production průchod na bf9c207 po rychlém souhlasu měl submission, attempt a report v jedné relaci s ad_b. Timeout měření neblokuje materiál; při něm asociace není garantována. |
| Testovací kohorta | Živý SQL s rollbackem; poté production HTTP demo, read-only DB a skutečný funnel report. Poslední snapshot 10/24 vyloučených žádostí/relací, netestový CVR N/A. [Podrobnosti](test-traffic.md). |
| CLI a stránkování | Proces proti lokálnímu HTTP provideru: úspěch exit 0, chyba exit 1 bez falešných nul. Paginace na 1050 řádcích. Mock provider není živá DB. |
| Oprávnění a API | Dřívější živé kontroly RPC a uzavřených tabulek; SQL práv pod service_role s rollbackem. Production smoke na 99cebb1: neplatné tělo 400, cizí Origin 403, citlivé soubory 404. Test textu migrace není důkaz živého RLS. |
| Retence | Aktivní denní Cron 03:15 UTC, SQL/service_role s rollbackem a skutečná neodstraňující cron sonda. První ostrý denní běh se neoznačuje předem za úspěšný. [Provozní postup](data-retention.md). |

## Mobil a tisk

- Browser kontroly 320/360/390 px prokázaly odstranění globálního overflow. Pozdější datasetové UI bylo lokálně kontrolováno na 320/390 px; tabulka reportu scrolluje uvnitř kontejneru.
- Production mobile Lighthouse na **99cebb1 / Next 15**, 2026-10-15 14:00:44 UTC: **90 performance / 100 accessibility / 100 best practices / 100 SEO**, LCP 3,5 s, CLS 0. [HTML](../output/qa/lighthouse-security-99cebb1.report.html), [JSON](../output/qa/lighthouse-security-99cebb1.report.json). Jde o laboratoř, nikoli field Core Web Vitals ani INP skutečných návštěvníků.
- [Production PDF z f1d0982](../output/pdf/report-production-f1d0982-ivv-250000.pdf): všechny tři A4 strany vizuálně zkontrolovány, obsahují název, verzi, IVV/250000, výpočty, checklist, slovník, zdroje a upozornění. Jde o datovaný vzorek, nikoli nový tisk z e2353e9. Pozdější analytická oprava obsah reportu neměnila; při přechodu na Next 15 byl ověřen browser reportu, celý PDF scénář znovu proveden nebyl.
- Next 15 browser smoke ověřil ad_b, report IVV/250000, navigaci, kalkulačku a absenci pozorovaných console warn/error. Nejde o úplnou matici zařízení, čteček obrazovky ani skutečné mobilní klávesnice.

## Omezení

CVR 3–7 % je odhad, nikoli marketingový výsledek. Randomizované A/B testy nejsou spuštěny. AI export má pevný časový konec a nepokrývá všechny původní relace. Production audit není nulový bezpečnostní problém všech nástrojů. [Checklist](launch-checklist.md) odděluje odevzdání od skutečné kampaně.
