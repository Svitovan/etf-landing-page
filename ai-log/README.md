# AI Log a transparentní dokumentace spolupráce s LLM

Tato složka obsahuje záznamy o tom, jak byl projekt realizován ve spolupráci s AI asistenty (Antigravity / Codex) v souladu s požadavky zadání B:
- Jaké pokyny agenti dostali a jaké prompty řídily jednotlivé fáze,
- Jak byly deterministicky kontrolovány výstupy modelů (testy, linter, validace datasetu),
- Kde se AI pomýlila a jak byla chyba reálně odhalena a napravena.

## Struktura a umístění záznamů

- `ai-log/README.md`: Tento přehled metodiky řízení a struktury logů.
- `ai-log/mistakes.md`: Skutečný log zachycených nepřesností a chyb modelu během realizace projektu (žádné syntetické příklady).
- `ai-log/sessions/`: Záznamy klíčových fází vývoje a promptů:
  - `session-e0-e8.md`: Fáze E0 až E8 (inicializace, dataset, UI, backend, analytika, testy).
  - `session-readiness-audit-2026-10-11.md`: První audit připravenosti projektu.
  - `session-deployment-and-hardening-2026-10-15.md`: Nasazení na produkci, integrace Supabase a bezpečnostní hardenování.
  - `session-readiness-reaudit-2026-10-15.md`: Nezávislý re-audit a identifikace priorit B01–B06.
  - `session-request-identity-2026-10-15.md`: Oprava konfliktu při opakování request ID, 52 testů a SQL ověření s rollbackem; nasazení čeká.
  - `session-documentation-evidence-2026-10-15.md`: Oprava bodu 2: MDE, přenositelné odkazy, skutečný redigovaný export, QA důkazy a exit code reportu; 57 testů.

### Export skutečných zpráv a jeho omezení

- [Čitelný export Codex](exports/codex-project-conversation-2026-10-15.md), [JSONL](exports/codex-project-conversation-2026-10-15.jsonl) a [manifest](exports/codex-project-conversation-2026-10-15.manifest.json) obsahují skutečné viditelné zprávy projektového rozhovoru z dostupných lokálních Codex JSONL. Text je zachován kromě označené redakce; nejde o přepsání z paměti ani shrnutí.
- Manifest určuje období, počet zpráv, názvy zdrojových souborů, jejich SHA-256 a počty redakcí. Export má pevný časový konec, neobsahuje automaticky budoucí zprávy. Starší výroky mohou být překonané následnou kontrolou; aktuální důkazy jsou v [QA reportu](../docs/qa-report.md).
- Vynechány jsou system/developer instrukce, interní reasoning, nástroje a jejich výstupy, automaticky vložený kontext prostředí a binární obrázky. Email, IP, lokální cesty, UUID a rozpoznané klíče jsou redigovány. Text bez obrázku může být neúplný; obrázky ze Supabase mohou obsahovat kontakty, proto nejsou přibaleny.
- `sessions/` jsou nadále **kurátorské souhrny**, oddělené od exportu. Export není úplná surová trajektorie ani nativní Claude `/export`, nepokrývá všechny původní vývojové relace Antigravity. Tato mez je výslovně uvedena také v návrhu závěrečného emailu v README.
- Reprodukce: `node scripts/export-ai-conversation.mjs <source.jsonl> [continuation.jsonl ...]`. Předat pouze soubory tohoto projektového rozhovoru. Skript má allowlist rolí/fází a nic nepublikuje; nové výstupy je před zařazením do Gitu nutné zkontrolovat kvůli PII a případným dalším formátům klíčů. Originální logy se do repozitáře nekopírují.

Kompletní export všech relací Antigravity v tomto balíčku není a není předstírán. Pokud zadavatel vyžaduje i tyto relace, je nutné dodat jejich samostatný bezpečně zkontrolovaný export.

## Pravidla a dohled nad AI
1. **Žádné nekontrolované přijímání dat:** Finanční údaje nejsou generovány z parametrů modelu, ale přímo z oficiálních zdrojů (Vanguard, iShares, State Street Global Advisors, NYSE Arca) a ověřeny skriptem `scripts/validate-data.ts`.
2. **Přísné testování:** Výpočty a backend jsou kontrolovány deterministickými testy (Vitest, po opravě bodu 2 celkem 57 testů). Jejich rozsah a limity rozlišuje QA matice.
3. **Audit kódu:** Každý generovaný soubor prochází kontrolou typů (`tsc`), statickou analýzou (`next lint`) a bezpečnostním auditem (žádné unescaped HTML, žádné vystavení serverových secretů, ochrana Origin hlavičky).
