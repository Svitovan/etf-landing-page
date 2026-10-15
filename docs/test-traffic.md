# Testovací provoz a konverzní statistika

Stav ověřený 15. 10. 2026. Testovací záznamy zůstávají v databázi, ale nepočítají se jako reklamní konverze.

## Pravidla

- Serverová pole `lead_submissions.is_test` a `analytics_sessions.is_test` nejsou ovladatelná veřejným lead/event API.
- Automaticky se označují adresy na přesných doménách `example.com`, `example.net`, `example.org`, `test`, `invalid` a doménách končících `.test` či `.invalid`. Prefix `qa` na běžné doméně nestačí.
- Označí se i související relace. `form_submit_attempted.properties.requestId` propojuje historicky rozdělené či pozdější události. Nová žádost v již označené relaci zdědí příznak.
- Celá testovací relace se vylučuje z čitatele i jmenovatele CVR, kroků cesty a UTM. Smíšená relace se konzervativně považuje za testovací celá.
- Kontakty se počítají jako různé lead IDs z ponechaných žádostí. Test kontaktu nevylučuje jeho samostatnou skutečnou konverzi v jiné relaci.
- Bez pozorovaných netestových relací je CVR **N/A**. UTM parametr sám neprokazuje zaplacenou reklamu.
- Report nečte emaily/IP. Používá stabilní stránkování po 1000 řádcích. Tři čtení nejsou jedna snapshot transakce; při aktivním provozu vyhodnocujte uzavřené konverzní okno a stabilitu výsledku.

## Skutečný výchozí stav

Autor potvrdil, že všechny dosavadní návštěvy byly testovací. Jednorázová administrativní klasifikace označila 9 žádostí a 23 relací s `created_at <= 2026-10-15 14:14:57.874269 UTC`. Cutoff není součástí obecné migrace a neoznačuje budoucí návštěvy.

Následný produkční HTTP průchod s adresou na example.com vytvořil testovací žádost i relaci, otevřel report s HTTP 200 a nezměnil netestovou statistiku. Poslední živý report **2026-10-15 14:22:26 UTC**: **10 testovacích žádostí / 24 testovacích relací**, netestové pozorované relace/žádosti/kontakty **0/0/0**, CVR **N/A**.

[Agregovaný protokol](../output/analytics/test-traffic-verification-2026-10-15.json). Jde o technickou demonstraci. Počty jsou časový snapshot; běžná retence je může změnit.

## Další demonstrace

Použijte `demo@example.com`, aby server automaticky vyloučil žádost i relaci. Při použití běžné adresy označte konkrétní QA relaci předem:

```sh
# Náhled bez změn
npm run analytics:mark-test -- --session-id=SESSION_ID
# Označení známé QA relace
npm run analytics:mark-test -- --session-id=SESSION_ID --apply
# Alternativně známá testovací žádost
npm run analytics:mark-test -- --request-id=REQUEST_ID --apply
npm run report:funnel
```

Příkaz používá serverovou `.env`, přijímá právě jednu cílovou hodnotu a standardně pouze náhled. RPC `mark_test_traffic` je atomická, dostupná pouze service_role. Chyba či neznámá hodnota vrací exit 1 bez soukromých detailů. Nic se nemaže. Nové relace nejsou automaticky testovací, dokud nesplní pravidlo nebo nejsou cíleně označeny.

Migrace `20261015141254_classify_test_traffic.sql` byla aplikována v živé DB. `tests/sql/test-traffic.sql` byl ověřen pod service_role a odvolán přes ROLLBACK. Automatické testy pokrývají obě části CVR, mixed lead, rozdělené/pozdní relace, náhled/chyby a druhou stránku z 1050 řádků. Publikace je zaznamenána v [QA](qa-report.md).
