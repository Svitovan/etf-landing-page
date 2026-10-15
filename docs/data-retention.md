# Automatická retence dat

## Aktivní nastavení a rozsah

Na Supabase projektu aplikována migrace `20261015104121_scheduled_atomic_retention.sql` (2026-10-15). `pg_cron` běží v GMT/UTC, nezávisle na Vercel deployi a bez HTTP endpointu nebo dalšího tajného klíče.

| Job | Rozvrh UTC | Úloha |
|---|---|---|
| `etf-retention-daily` | denně 03:15 | `public.cleanup_project_data(30, false, NULL)` |
| `etf-retention-history` | denně 03:30 | Odstranění historie těchto dvou jobů starší než 30 dní |

Odstavení/pozastavení databáze nebo technická chyba mohou běh odložit. Není nastaveno externí upozornění; správce musí kontrolovat historii a řešit selhání. Následující řádný denní běh po zavedení je 2026-10-16 03:15 UTC; jeho úspěch nelze předem tvrdit.

Věk se počítá podle serverového času a `created_at`, u událostí podle `server_timestamp`. Mažou se kontakty starší než 30 dní i jejich submissions, samostatně staré submissions, staré analytické události/relace a expirované rate-limit buckets. Smazání starého kontaktu zahrnuje i jeho novější submissions. Nové kontakty zůstávají; po odstranění staré session se vazba přeživší události nastaví na NULL podle FK. Aktivní DB není totéž co zálohy poskytovatele.

Denní běh znamená odstranění v prvním běhu po uplynutí 30 dní, za běžného provozu nejpozději do dalších 24 hodin. Privacy je upravena, aby neslibovala odstranění přesně na hranici 30 dní. Změna textu se na web dostane až po commit/push a deployi.

## Bezpečnost a chybový kontrakt

- Jediná SQL funkce provádí mazání transakčně. Chyba se nezachytává jako úspěch; transakce se vrátí zpět.
- `SECURITY INVOKER`, prázdný search_path, EXECUTE pouze pro service_role a vlastníka. `anon`/`authenticated` přístup nemají; nejsou přidány veřejné RLS politiky.
- Souběžné skutečné cleanup běhy serializuje advisory lock. Před mazáním potomků se zamknou rodičovské kontakty. Skutečné počty pocházejí z DELETE ROW_COUNT, ne z dřívějšího odhadu.
- `dryRun=true` neodstraňuje nic; vrací pouze kandidáty. Počty jsou odhad pro daný okamžik, nikoli příslib přesného budoucího výsledku.
- `targetEmail` odstraní pouze odpovídající kontakt a jeho submissions, nezávisle na stáří. Nemaže sdílenou analytiku ani rate-limit buckets. Prázdný email se odmítá, nepřepne se na globální mazání.
- Node skript při provider chybě nebo neplatné odpovědi vrací výjimku / exit 1 bez soukromých detailů. V produkci nepřechází na paměťové úložiště.

## Provozní příkazy

Předběžný náhled z checkoutu s nastaveným privátním Supabase připojením:

```bash
npm run cleanup:data -- --dry-run
```

Ruční běh používá stejné atomické RPC:

```bash
npm run cleanup:data
```

Zkontrolovat skutečné plánování a poslední běhy v Supabase SQL Editoru:

```sql
SELECT jobid, jobname, schedule, active FROM cron.job
WHERE jobname IN ('etf-retention-daily', 'etf-retention-history');

SELECT j.jobname, d.status, d.start_time, d.end_time, d.return_message
FROM cron.job_run_details d JOIN cron.job j ON j.jobid = d.jobid
WHERE j.jobname IN ('etf-retention-daily', 'etf-retention-history')
ORDER BY d.start_time DESC LIMIT 20;
```

Pokud je poslední běh neúspěšný nebo po více než dni chybí, prověřit dostupnost projektu a chybovou zprávu v chráněné historii. Nejprve náhled, po nápravě opakovat běh. Opakování nevrací již smazané záznamy a nemaže dosud neexpirované kontakty. Pro dočasné zastavení použít deaktivaci konkrétního jobu v Supabase Cron UI; neodinstalovávat pg_cron, což by odstranilo i ostatní úlohy.

## Skutečné ověření 2026-10-15

- Před změnou: 0 expirovaných kontaktů/submissions/events/sessions, 1 expirovaný bucket.
- SQL test `tests/sql/cleanup-retention.sql`: náhled, adresné smazání, skutečné počty, zachování čerstvého kontaktu, izolace analytiky, rollback po vynucené chybě a zákaz anonymního EXECUTE. Všechny fixtures i mazání byly odvolány přes ROLLBACK.
- Skutečný service_role provedl cleanup uvnitř transakce s ROLLBACK: 0 kontaktů a 1 bucket; bucket byl vrácen zpět. Reálné CLI `--dry-run` vrátilo odpovídající náhled.
- Bezpečná cron sonda skutečně spustila **pouze náhled** v `2026-10-15 10:46:00 UTC`, status `succeeded`, a sama se odregistrovala. Následná kontrola našla pouze dvě denní retenční úlohy. Tím je ověřen běh plánovače, nikoli první ostrý denní cleanup.
- 72/72 testů, lint, typecheck a production build prošly. Procesní testy ověřují exit 0/1 pro cleanup i funnel proti lokálnímu HTTP provideru. Security advisor vrátil pouze původních 5 INFO bez veřejných politik; nový bezpečnostní nález nevznikl.
- Automatická kontrola zamítla pokus dočasně změnit ostrý cleanup na minutový: četnost překračovala denní zadání a mohla opakovaně mazat data. Změna nebyla provedena. Použita byla výše popsaná neodstraňující sonda se samočinným odregistrováním.

Dokumentace: [Supabase Cron](https://supabase.com/docs/guides/cron/quickstart), [instalace](https://supabase.com/docs/guides/cron/install). Informační nález uzavřených tabulek vysvětluje [RLS Enabled No Policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
