# Antigravity: export vybraných projektových relací

Obsahuje 8 vybraných relací a 49 dostupných zpráv z 11.–15. 10. 2026. Jde o redigované zprávy, nikoli nový přepis nebo shrnutí. Úplnost všech relací IDE se netvrdí.

**Omezení zdroje:** 10 zpráv má již v původním transcriptu příznak zkráceného obsahu. Chybějící text není domýšlen; dotčené zprávy jsou označeny.

| Relace | Datum | Zprávy | Zkrácené ve zdroji |
|---|---|---:|---:|
| [01-session-2026-10-11-initial-implementation-e74b3c28.md](01-session-2026-10-11-initial-implementation-e74b3c28.md) | 2026-10-11 | 2 | 1 |
| [02-session-2026-10-11-readiness-audit-setup-e1798fde.md](02-session-2026-10-11-readiness-audit-setup-e1798fde.md) | 2026-10-11 | 6 | 1 |
| [03-session-2026-10-15-stitch-mcp-design-80ff471b.md](03-session-2026-10-15-stitch-mcp-design-80ff471b.md) | 2026-10-15 | 9 | 2 |
| [04-session-2026-10-15-supabase-vercel-integration-b27df57e.md](04-session-2026-10-15-supabase-vercel-integration-b27df57e.md) | 2026-10-15 | 17 | 4 |
| [05-session-2026-10-15-priority-fixes-hardening-50d92dc2.md](05-session-2026-10-15-priority-fixes-hardening-50d92dc2.md) | 2026-10-15 | 5 | 1 |
| [06-session-2026-10-15-git-sync-docs-e8fe8e10.md](06-session-2026-10-15-git-sync-docs-e8fe8e10.md) | 2026-10-15 | 5 | 0 |
| [07-session-2026-10-15-desktop-centering-f8e91b8f.md](07-session-2026-10-15-desktop-centering-f8e91b8f.md) | 2026-10-15 | 2 | 0 |
| [08-session-2026-10-15-chat-export-12c86b56.md](08-session-2026-10-15-chat-export-12c86b56.md) | 2026-10-15 | 3 | 1 |

[Společný soubor](all-antigravity-sessions-combined.md), [manifest a kontrolní součty](manifest.json), [aktuální QA](../../../docs/qa-report.md).

Ponechány jsou USER_INPUT a neprázdné PLANNER_RESPONSE.content. Neexportují se thinking, system obsah, nástroje ani obrázky. Rozpoznaná tajemství, emaily, IP, lokální cesty a DB endpointy jsou redigovány. Hlavičky a témata relací jsou redakční metadata; těla zpráv zůstávají v původním jazyce. Žádná odpověď asistenta se nevytváří automaticky. Nejde o nativní Claude /export ani úplnou raw trajektorii.

Manifest rozlišuje SHA-256 lokálního zdroje a výsledného Markdownu. Změna pokračující relace změní zdrojový hash při příštím exportu. Soukromé zdroje nejsou v repozitáři. Reprodukce: node scripts/export-antigravity-sessions.mjs [local-brain-directory]; před publikací vždy zkontrolovat citlivá data.
