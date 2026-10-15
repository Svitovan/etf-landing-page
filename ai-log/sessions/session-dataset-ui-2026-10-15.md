# Finanční UI z datasetu — Codex, 2026-10-15

Uživatel: „Сделай 3 пункт“ — odstranit duplikované finanční hodnoty v JSX podle posledního readiness seznamu.

Zachovány všechny existující necommitnuté retention/source změny. V této etapě se neměnila skutečná data fondů ani sazby v datasetu. Neprováděl se nový finanční průzkum.

Hero, comparison, calculator, FAQ a report používají numeric rate a společné formátování. Typ Net/Gross čerpá z kind. Tabulka reportu čte i emitenta, burzu, měnu, domicil, strukturu a distribuci z ETF záznamů; zdroje čte z evidence. Zmizely tři téměř stejné bloky kalkulačky a napevno přiřazené varování SPY. Zachovány skutečné výpočty, výběr fondů i desetiletá ilustrace za konstantní hodnoty pozice.

Devět regresních render testů mění izolovaný fixture bez přepsání souboru: jiné rates, jiné pořadí nejdražšího ETF, stale displayPercent, Gross/Net a metadata. Kontroluje se všech pět částí UI, přepočet částek a varovná barva. VOO je v testu nejdražší, takže neprojde návrat k hardcoded SPY pravidlu.

Skutečné chyby při implementaci: výměna opakovaného JSX bloku zpočátku odstranila i rámeček s rozdílem; kontrola oproti Git verzi to odhalila a rámeček byl obnoven s dynamickým textem. Typecheck také zachytil chybný typ default exportu JSON ve vi.mock factory; runtime test prošel, ale typ vyžadoval explicitní module shape. Obojí opraveno před finální kontrolou.

Ověřeno 87/87 testů, lint, typecheck, build, validate:data. Použit React Best Practices skill; bez nových závislostí a síťových požadavků. Lokální browser 320/390 px: bez globálního overflow, delší sazby v Hero se vejdou, reportová tabulka scrolluje uvnitř kontejneru. Po zadání 250000 CZK jsou částky 75 / 75 / 236,25 CZK a rozdíl 161,25 CZK, report IVV zachovává výběr. Nezaznamenány console warnings/errors; GET / a /report v server logu 200.

Browser viewport resetován, dočasná karta zavřena a dev server zastaven. Žádná formulářová žádost, DB změna, commit/push ani deploy; skutečný PDF a produkční Lighthouse nejsou tímto prokázány.
