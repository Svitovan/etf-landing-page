# Operational Instructions for AI Agents (AGENTS.md)

Tento repozitář implementuje praktické zadání B pro pozici Junior AI Developer (konverzní landing page pro české drobné investory srovnávající ETF na NYSE Arca: VOO, IVV, SPY).

## 1. Primární dokumenty a pravidla

1. **Aktuální podklady:** [docs/submission.md](docs/submission.md), [docs/product-brief.md](docs/product-brief.md) a [docs/qa-report.md](docs/qa-report.md).
2. **Výchozí zadání:** Přehled požadavků a termínu je v [docs/submission.md](docs/submission.md).
3. **Handoff a kontinuita:** [docs/handoff.md](docs/handoff.md) a [docs/decisions.md](docs/decisions.md) — po každé etapě aktualizovat skutečný stav, ověřené kroky a co zbývá.

## 2. Závazná pravidla vývoje

- **Žádné halucinace:** Nepřidávat smyšlená čísla, fiktivní recenze, smyšlenou konverzi ani vymyšlené partnery či ocenění. Všechna finanční data musí mít přímý primární zdroj v `data/etfs.json`.
- **Hranice projektu (Scope):** Žádné chatboty, uživatelské účty, live-kótování přes placená API, ani komplexní CRM. Soustředit se na P0: špičkový mobilní UX, reálné uložení kontaktu na serveru, okamžité vydání HTML reportu s tiskem do PDF, spolehlivé měření cesty uživatele, 2 reklamní koncepty a dokumentace.
- **Bezpečnost a GDPR:** Žádné osobní údaje ani tajné klíče (`SUPABASE_SECRET_KEY`) se nesmí dostat do klientského bundlu, URL, analytiky ani do gitu. Formulář používá Honeypot a rate-limiting.
- **Kvalita UI:** Čistá, prémiová finanční vizuální estetika přizpůsobená českému uživateli na mobilu (320px–390px, přístupnost, kontrast, bez layout shiftu).
- **Verifikace:** Každý krok ověřovat nástroji (testy, linter, typecheck, build, test uložení do DB/lokální emulace).
