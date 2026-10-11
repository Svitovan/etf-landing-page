# Handoff Report

- **Datum a čas:** 2026-10-11 16:37 Europe/Prague
- **Poslední ověřený commit:** Inicializace repozitáře (bude proveden po E0)
- **Dokončené etapy a důkazy:**
  - E0 (Příprava a audit prostředí):
    - Audit prostředí: Node.js `v24.19.0`, npm `11.17.0`, Git inicializován, `.gitignore` nastaven.
    - Prostudováno zadání a implementační plán `assignment-b-implementation-plan.ru.md`.
    - Založeny governance dokumenty: `AGENTS.md`, `docs/decisions.md`, `docs/product-brief.md`, `docs/handoff.md`, `ai-log/README.md`, `ai-log/mistakes.md`.
- **Aktuální stav změn:** Dokončena fáze E0, připraveno na fázi E1 (data ETF a metodika).
- **Přijatá rozhodnutí:**
  - Srovnávané ETF: VOO (Vanguard), IVV (iShares), SPY (State Street). Všechny sledují S&P 500 Index.
  - Burza: NYSE Arca.
  - MVP dodání materiálu: Okamžitý interaktivní HTML přehled s tiskovým PDF stylem přímo na webu (`/report`).
  - Stack: Next.js (App Router), TypeScript, CSS Modules, Zod, Supabase (server-only).
- **Dostupné externí služby a chybějící přístupy:**
  - GitHub: lokální git připraven, vzdálený public repozitář čeká na propojení/push od uživatele.
  - Supabase: připraveno klientské/serverové schéma a lokální fallback; produkční klíče budou zadány přes `.env.local`.
  - Vercel: připraveno pro bezplatný deployment.
- **Další konkrétní krok:** Fáze E1 — vytvoření `data/etfs.json`, validačního skriptu `scripts/validate-data.ts` a metodiky `docs/data-methodology.md`.
