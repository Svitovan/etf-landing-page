# Skutečný protokol chyb a korekcí AI (Mistakes Log)

Tento dokument eviduje výhradně **reálně vzniklé a odhalené omyly a nepřesnosti AI** během vývoje tohoto projektu. Neobsahuje žádné syntetické či předem vygenerované příklady.

| Datum / Fáze | Původní návrh / předpoklad AI | Způsob kontroly | Zjištěný problém | Náprava | Důkaz / Poznámka |
|---|---|---|---|---|---|
| 2026-10-11 (E0/E1) | Předpoklad, že SPY má Expense Ratio 0,09 % a je kotován na NYSE (hlavní parket) | Vyhledání v primárních zdrojích SSGA a NYSE | SPY má přesný hrubý náklad (Gross Expense Ratio) 0,0945 % a primárně se obchoduje na elektronické burze NYSE Arca, nikoli na klasickém parketu NYSE | Data upravena na přesnou hodnotu 0,000945 (0,0945 %) a burza specifikována jako NYSE Arca | Oficiální prospekt SSGA & web NYSE Arca |
| 2026-10-11 (E0/E1) | Pokus o čtení stránky BlackRock iShares prostým HTTP GET | Spuštění `read_url_content` a následný grep textu | Web ishares.com je Client-Side Single Page Application (SPA), v surovém HTML text chybí | Ověření pomocí oficiálních factsheetů a vyhledávače primárních zdrojů | JSON snapshot obsahuje ověřené factsheet URL |
