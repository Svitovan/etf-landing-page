# Bod 2 — ověřitelnost dokumentace, Codex, 2026-10-15

## Skutečný požadavek

Uživatel: „помоги со 2 пунктом“. Vyloženo podle bodu 2 dokumentu `docs/readiness-verification-4465301.ru.md`: MDE, README odkazy, AI export, poctivá úroveň QA důkazů a návratový kód funnel reportu.

## Změny

- Explicitní baseline 5 %, MDE +1 procentní bod / +20 % relativně, dvoustranné α 0,05 a síla 80 %. Výpočet `scripts/experiment-sample-size.mjs`: 8 158 na rameno, plán zaokrouhlen na 8 200. Ověřena oficiální dokumentace statsmodels k normální aproximaci podílů. Vyjasněno, že UTM varianty nejsou randomizovaný experiment.
- Opraveny místní file URI v README na relativní odkazy; upřesněn emailový návrh a AI metodika.
- Ze dvou dostupných JSONL tohoto projektového Codex rozhovoru vytvořeny skutečné redigované zprávy, nikoli syntetický rozhovor. Přiložen MD, JSONL a manifest s časovým rozsahem, počty, SHA-256 zdrojů a omezeními. Původní logy, interní instrukce, reasoning, nástroje a obrázky nejsou součástí exportu. Úplný Antigravity export není dodán a omezení je přiznáno.
- QA matice nyní odlišuje unit/memory, handler s mockem, CLI proti lokálnímu HTTP, SQL rollback a historické live výsledky.
- Přidány tři handler testy skutečně simulující selhání save RPC (503 bez reportu, PII a memory zápisu). Původní poškozený vstup přejmenován, aby se nevydával za selhání storage.
- CLI vrací 1 při chybě čtení bez výpisu privátních provider detailů; dva procesní testy pro úspěch a chybu používají lokální HTTP server, nikoli skutečný výpadek produkce. Použita Supabase skill a dokumentace JS select/error.

## Ověření a skutečné potíže

- 57/57 testů, lint, typecheck a produkční build prošly.
- První procesní test „úspěch“ selhal, protože sandbox blokoval HTTP mezi testovacími procesy (server nezaznamenal požadavek). Stejný test s povoleným localhost připojením prošel; nešlo o chybu funkce funnelu. Nesprávný počáteční předpoklad dostupné sítě je zaznamenán v mistakes logu.
- Export byl zkontrolován na role/fáze, redakční vzory a případnou přítomnost lokálních hodnot prostředí; rozsah určuje manifest. Historické zprávy zůstávají historickými výroky, nikoli novou QA verifikací.

Databázová migrace, změna produkčních dat, commit/push, deploy ani odeslání emailu v tomto kroku neproběhly. Ostatní zjištění auditu zůstávají otevřená podle aktuální QA matice.
