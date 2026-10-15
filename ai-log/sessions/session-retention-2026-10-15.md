# Retence a automatická očista — Codex, 2026-10-15

Uživatel požádal: „Сделай 1 пункт“ — zajistit automatické odstranění starých dat a opravit nekontrolované chyby cleanup skriptu.

Použity lokální Supabase a Postgres best-practices skills a oficiální Supabase Cron dokumentace. Preflight živé DB našel 0 starých kontaktů, submissions, sessions a events a jeden expirovaný technický bucket.

CLI Supabase vytvořilo novou migraci `20261015104121_scheduled_atomic_retention.sql`. Ta byla úspěšně aplikována na živý projekt: invoker RPC s uzavřeným EXECUTE, transakční cleanup a dva denní pg_cron joby. Scheduler je GMT/UTC. Nejbližší řádné mazání bude 2026-10-16 03:15 UTC; nezaměňujeme instalaci za dokončený první běh.

Node cleanup nyní používá jedno RPC, validuje parametry i výsledek a neoznamuje úspěch při chybě. Náhled je výslovně označen, cílový email nevymaže cizí analytiku, produkční paměťový fallback je zakázán. Privacy upřesňuje denní prodlevu a rozsah aktivní DB oproti zálohám.

Ověření: 72/72 testů, lint, typecheck, build; skutečné SQL fixtures a vynucený rollback po cleanupu; ověření write práv service_role s rollbackem; skutečný CLI náhled. Žádný kontakt nebyl během ověřování trvale odstraněn. Advisor vrátil pouze očekávaných 5 INFO k uzavřeným RLS tabulkám.

Automatická bezpečnostní kontrola zamítla dočasné minutové spouštění ostrého cleanupu jako příliš časté destruktivní zadání bez doprovodného odstranění. Změna neproběhla a nebyla obcházena. Bezpečná alternativa spouštěla pouze `dryRun=true` a sama se odregistrovala; cron historie potvrdila `succeeded` 2026-10-15 10:46 UTC. Poté zůstaly pouze dvě denní úlohy.

První běh nových unit testů odhalil nepodporovaný matcher `toHaveBeenCalledExactlyOnceWith` ve zdejším Vitest 2.1.9. Nahrazen podporovanými dvěma kontrolami a testy znovu prošly. Do evidence nejsou doplňovány smyšlené chyby.

Provozní postup a přesné meze: `docs/data-retention.md`. Git commit/push ani deploy webu nebyly provedeny; scheduler v DB je již aktivní, lokální skript a text Privacy čekají na publikaci.
