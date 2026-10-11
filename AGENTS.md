# Operational Instructions for AI Agents (AGENTS.md)

Tento repozitář implementuje praktické zadání B pro pozici Junior AI Developer (konverzní landing page pro české drobné investory srovnávající ETF na NYSE Arca: VOO, IVV, SPY).

## 1. Primární dokumenty a pravidla

1. **Implementační plán:** [assignment-b-implementation-plan.ru.md](file:///c:/Users/Oddman/Desktop/Junior%20AI%20Developer/assignment-b-implementation-plan.ru.md) — detailní fázovaný plán (E0–E9), akceptační kritéria (R01–R18), bezpečnost, analytika, metodika.
2. **Výchozí zadání:** [Junior AI Developer – postup do ďalšieho kola a praktická úloha...txt](file:///c:/Users/Oddman/Desktop/Junior%20AI%20Developer/Junior%20AI%20Developer%20%E2%80%93%20postup%20do%20%C4%8Fal%C5%A1ieho%20kola%20a%20praktick%C3%A1%20%C3%BAloha%20-%20Matej%20Lorinc%20%28matej@clientelo.cz%29%20-%202026-10-08%201921.txt).
3. **Handoff a kontinuita:** [docs/handoff.md](file:///c:/Users/Oddman/Desktop/Junior%20AI%20Developer/docs/handoff.md) a [docs/decisions.md](file:///c:/Users/Oddman/Desktop/Junior%20AI%20Developer/docs/decisions.md) — po každé etapě aktualizovat skutečný stav, ověřené kroky a co zbývá.
4. **Záznam práce s AI:** [ai-log/README.md](file:///c:/Users/Oddman/Desktop/Junior%20AI%20Developer/ai-log/README.md) a [ai-log/mistakes.md](file:///c:/Users/Oddman/Desktop/Junior%20AI%20Developer/ai-log/mistakes.md) — evidovat pouze reálné zásahy a zjištěné omyly, nevymýšlet syntetické chyby.

## 2. Závazná pravidla vývoje

- **Žádné halucinace:** Nepřidávat smyšlená čísla, fiktivní recenze, smyšlenou konverzi ani vymyšlené partnery či ocenění. Všechna finanční data musí mít přímý primární zdroj v `data/etfs.json`.
- **Hranice projektu (Scope):** Žádné chatboty, uživatelské účty, live-kótování přes placená API, ani komplexní CRM. Soustředit se na P0: špičkový mobilní UX, reálné uložení kontaktu na serveru, okamžité vydání HTML reportu s tiskem do PDF, spolehlivé měření cesty uživatele, 2 reklamní koncepty a dokumentace.
- **Bezpečnost a GDPR:** Žádné osobní údaje ani tajné klíče (`SUPABASE_SECRET_KEY`) se nesmí dostat do klientského bundlu, URL, analytiky ani do gitu. Formulář používá Honeypot a rate-limiting.
- **Kvalita UI:** Čistá, prémiová finanční vizuální estetika přizpůsobená českému uživateli na mobilu (320px–390px, přístupnost, kontrast, bez layout shiftu).
- **Verifikace:** Každý krok ověřovat nástroji (testy, linter, typecheck, build, test uložení do DB/lokální emulace).
