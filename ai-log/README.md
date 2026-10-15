# Práce s AI: metodika, záznamy a omezení

Projekt vznikal s asistenty Antigravity / Codex. Tento soubor je česky; historické rozhovory a citované pokyny zůstávají podle rozhodnutí autora v původním jazyce, včetně ruštiny.

## Jak byla práce řízena a kontrolována

- Pokyny stanovily cílovou skupinu českých drobných investorů, mobilní scénář, hodnotu před formulářem a zdrojovaná data. Nesměly vznikat smyšlené reference, výnosy ani konverze.
- Jednotlivé kroky oddělovaly data, UI, serverové uložení, analytiku a ověření. Agent měl popsat skutečný důkaz i to, co zatím neověřil.
- Finanční hodnoty pocházejí z data/etfs.json a primárních zdrojů. Testy výpočtů a renderů kontrolují i změnu sazeb a pořadí fondů v izolovaném fixture.
- Následovaly lint přes ESLint CLI, TypeScript, build, testy handlerů/RPC, živý SQL s rollbackem a vybrané produkční browser/HTTP scénáře. Poslední implementační sada má 118 testů v 17 souborech.
- Skutečné omyly a jejich opravy jsou v [mistakes](mistakes.md): například falešný úspěch bez DB, chybějící atomická RPC, přeceňování testů, ztracené části PDF, závody relace a započítávání demonstrací do CVR. Nejde o syntetické příklady.
- Aktuální výsledky a hranice důkazů shrnuje [QA](../docs/qa-report.md); starší odpovědi nebo souhrny mohou popisovat již opravený stav.

## Původní exporty

### Codex
- [Čitelný export Codex](exports/codex-project-conversation-2026-10-15.md)
- [Stejné zprávy v JSONL](exports/codex-project-conversation-2026-10-15.jsonl)
- [Manifest: zdroje, SHA-256, počty a redakce](exports/codex-project-conversation-2026-10-15.manifest.json)

Export má **56 skutečných viditelných zpráv**, od 2026-10-11 19:22:04 UTC do 2026-10-15 10:24:28 UTC. Text zůstává původní kromě označené redakce; není překladem ani shrnutím.

### Antigravity IDE
- [Přehled a jednotlivé relace Antigravity](exports/antigravity/README.md)
- [Společný export vybraných relací v jediném Markdownu](exports/antigravity/all-antigravity-sessions-combined.md)
- [Manifest Antigravity: zdroje, SHA-256 a redakce](exports/antigravity/manifest.json)

Export zahrnuje **8 vybraných projektových relací Antigravity a 49 dostupných zpráv** (11.–15. 10. 2026). U **10 zpráv** už zdroj uvádí zkrácený obsah; chybějící text nebyl doplněn. Hlavičky jsou redakční metadata. Žádná umělá odpověď se nevkládá; zahrnutí všech relací IDE se netvrdí.

Vynechává system/developer obsah, interní reasoning, nástroje a jejich výstupy, automatický kontext prostředí a binární obrázky. Rozpoznané klíče, emaily, IP, lokální cesty a identifikátory jsou redigovány. Bez obrázků může být okolní text neúplný. Obrázky tabulek mohly obsahovat kontakty a nejsou přiloženy. Není to úplná raw trajektorie ani nativní Claude /export. Tato mez není nahrazována vymyšlenou historií.

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
- [Kontrola exportu Antigravity](sessions/session-antigravity-export-2026-10-15.md)

Reprodukční nástroje: `node scripts/export-ai-conversation.mjs <source.jsonl> [continuation.jsonl ...]` pro Codex a `node scripts/export-antigravity-sessions.mjs` pro Antigravity IDE. Přijímají pouze logy tohoto projektu, nic samy nepublikují. Nový výstup musí před zařazením do Git projít kontrolou citlivých dat. Původní lokální logy se nekopírují. Původní Codex export nebyl změněn. Antigravity export byl při přidání znovu vytvořen ze stejných osmi explicitních zdrojů po odstranění větve, která mohla vložit neexistující odpověď; manifest zaznamenává aktuální zdrojové i výsledné hashe a omezení.
