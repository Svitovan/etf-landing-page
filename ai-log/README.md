# AI Log a transparentní dokumentace spolupráce s LLM

Tato složka obsahuje záznamy o tom, jak byl projekt realizován ve spolupráci s AI asistentem v souladu s požadavky zadání:
- Jaké pokyny agenti dostali,
- Jak byly kontrolovány jejich výstupy,
- Kde se AI pomýlila a jak byla chyba odhalena a napravena.

## Struktura složky
- `ai-log/README.md`: Tento přehled metodiky řízení AI.
- `ai-log/mistakes.md`: Skutečný log zachycených nepřesností a chyb modelu během realizace projektu.
- `ai-log/sessions/`: Záznamy klíčových promptů a fází vývoje.

## Pravidla a dohled nad AI
1. **Žádné nekontrolované přijímání dat:** Finanční údaje nejsou generovány z parametrů modelu, ale přímo z oficiálních zdrojů (Vanguard, iShares, State Street Global Advisors, NYSE).
2. **Přísné testování:** Všechny kalkulace jsou podloženy deterministickými jednotkovými testy (Vitest).
3. **Audit kódu:** Každý generovaný soubor prochází kontrolou typů (`tsc`), statickou analýzou a bezpečnostním auditem (žádné unescaped HTML, žádné vystavení serverových secretů).
