# Práce s AI: metodika, záznamy a omezení

Projekt vznikal s asistenty Antigravity / Codex. Tento soubor je česky; historické rozhovory a citované pokyny zůstávají podle rozhodnutí autora v původním jazyce, včetně ruštiny.

## Jak byla práce řízena a kontrolována

- Pokyny stanovily cílovou skupinu českých drobných investorů, mobilní scénář, hodnotu před formulářem a zdrojovaná data. Nesměly vznikat smyšlené reference, výnosy ani konverze.
- Jednotlivé kroky oddělovaly data, UI, serverové uložení, analytiku a ověření. Agent měl popsat skutečný důkaz i to, co zatím neověřil.
- Finanční hodnoty pocházejí z data/etfs.json a primárních zdrojů. Testy výpočtů a renderů kontrolují i změnu sazeb a pořadí fondů v izolovaném fixture.
- Následovaly lint přes ESLint CLI, TypeScript, build, testy handlerů/RPC, živý SQL s rollbackem a vybrané produkční browser/HTTP scénáře. Poslední implementační sada má 118 testů v 17 souborech.
- Skutečné omyly a jejich opravy jsou v [mistakes](mistakes.md): například falešný úspěch bez DB, chybějící atomická RPC, přeceňování testů, ztracené části PDF, závody relace a započítávání demonstrací do CVR. Nejde o syntetické příklady.
- Aktuální výsledky a hranice důkazů shrnuje [QA](../docs/qa-report.md); starší odpovědi nebo souhrny mohou popisovat již opravený stav.

## Původní export

- [Čitelný export](exports/codex-project-conversation-2026-10-15.md)
- [Stejné zprávy v JSONL](exports/codex-project-conversation-2026-10-15.jsonl)
- [Manifest: zdroje, SHA-256, počty a redakce](exports/codex-project-conversation-2026-10-15.manifest.json)

Export má **56 skutečných viditelných zpráv**, od 2026-10-11 19:22:04 UTC do 2026-10-15 10:24:28 UTC. Text zůstává původní kromě označené redakce; není překladem ani shrnutím.

Vynechává system/developer obsah, interní reasoning, nástroje a jejich výstupy, automatický kontext prostředí a binární obrázky. Rozpoznané klíče, emaily, IP, lokální cesty a identifikátory jsou redigovány. Bez obrázků může být okolní text neúplný. Obrázky tabulek mohly obsahovat kontakty a nejsou přiloženy.

**Není to úplná raw trajektorie ani nativní Claude /export. Nepokrývá všechny původní relace Antigravity ani zprávy po uvedeném časovém konci.** Tato mez není nahrazována vymyšlenou historií; uvádí ji i návrh emailu.

## Kurátorské souhrny

Složka sessions/ obsahuje záznamy jednotlivých etap, nikoli doslovný export. Číselné výsledky v nich patří k tehdejší verzi. Dokončené následné opravy nemažou dřívější zjištění z historie.

- [Základní etapy](sessions/session-e0-e8.md)
- [Nasazení a ochrana API](sessions/session-deployment-and-hardening-2026-10-15.md)
- [Dokumentace a export](sessions/session-documentation-evidence-2026-10-15.md)
- [Retence](sessions/session-retention-2026-10-15.md)
- [Finanční kontext](sessions/session-financial-context-2026-10-15.md)
- [Dataset v UI](sessions/session-dataset-ui-2026-10-15.md)
- [PDF a relace](sessions/session-final-qa-2026-10-15.md)
- [Bezpečnost](sessions/session-security-2026-10-15.md)
- [Testovací kohorta](sessions/session-test-traffic-2026-10-15.md)
- [Příprava odevzdání](sessions/session-submission-2026-10-15.md)

Reprodukční nástroj: `node scripts/export-ai-conversation.mjs <source.jsonl> [continuation.jsonl ...]`. Přijímá pouze logy tohoto projektu, nic sám nepublikuje. Nový výstup musí před zařazením do Git projít kontrolou citlivých dat. Původní lokální logy se nekopírují. Při úpravě kompletu odevzdání nebyly existující exporty přegenerovány ani změněny.
