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

### Poznámka k surovému exportu konverzací
Kompletní surová trajektorie agentních konverzací (včetně interních volání nástrojů, mezistavů linteru a systémových promptů) je v prostředí Google Antigravity IDE automaticky ukládána do strojového formátu JSON Lines (`transcript.jsonl`) v systémovém adresáři:
`C:\Users\Oddman\.gemini\antigravity-ide\brain\<conversation-id>\.system_generated\logs\`

Vzhledem k rozsahu surových souborů (desítky megabajtů strojového JSON s tokeny nástrojů) jsou v repozitáři verzovány kurátorské souhrny relací (`ai-log/sessions/`) zachycující přesné zadání, rozhodovací body a výsledky verifikace, a detailní tabulka reálných chyb (`ai-log/mistakes.md`).

## Pravidla a dohled nad AI
1. **Žádné nekontrolované přijímání dat:** Finanční údaje nejsou generovány z parametrů modelu, ale přímo z oficiálních zdrojů (Vanguard, iShares, State Street Global Advisors, NYSE Arca) a ověřeny skriptem `scripts/validate-data.ts`.
2. **Přísné testování:** Všechny kalkulace jsou podloženy deterministickými jednotkovými testy (Vitest, 36 testů).
3. **Audit kódu:** Každý generovaný soubor prochází kontrolou typů (`tsc`), statickou analýzou (`next lint`) a bezpečnostním auditem (žádné unescaped HTML, žádné vystavení serverových secretů, ochrana Origin hlavičky).
