# Regulační a daňové zdroje — Codex, 2026-10-15

Uživatel požádal „Выполни пункт 2“ podle posledního readiness seznamu: primární zdroje pro daně, W-8BEN, PRIIPs/KID a odstranění přehnaných formulací.

Byly přečteny IRS treaty index pro ČR, smlouva USA–ČR (čl. 10 včetně RIC, čl. 1/17/24), IRS instructions W-8BEN a NRA withholding, ČNB RS2018-12 zejména jazyk KID. EUR-Lex při přímém otevření originálu i konsolidace zobrazoval anti-bot kontrolu; použito indexované úřední znění čl. 5/6/7/13, omezení zaznamenáno. Sekundární investiční blogy nebyly použity jako důkaz.

Přidána společná investorContext evidence v datasetu, typy a strukturální validace. Serverová stránka předává pouze potřebný kontext komponentám; žádná nová klientská síťová závislost. Stránka, comparison, FAQ a report čerpají společné texty se zdrojovými odkazy. Použit skill React Best Practices pro kontrolu více upravených TSX.

Opraveny univerzální český KID a jeho kategorická absence, automatických 15 % při podepsání W-8BEN, přesně tři strany KID, nepodložené pořadí velikosti/likvidity a blanket pětiletý horizont. Odstraněno tvrzení reklamy, že všechny fondy drží přesně stejných 500 největších firem. Neprováděl se nový průzkum brokerů nebo aktuální žebříček AUM.

Skutečný omyl v pracovním návrhu: měsíc revize W-8BEN 10/2021 byl nejprve zapsán jako 2021-10-01. Opraveno na asOf NULL a přesné uvedení měsíce v poznámce, protože den nebyl doložen. Původní ETF snapshot 2026-10-11 a jeho sazby nebyly přepsány.

Ověření: 78/78 testů včetně negativních provenance testů a skutečného renderu landing kontextu/reportu, data validation, lint, typecheck a build. Validátor byl přejmenován v konzolovém výstupu tak, aby strukturální průchod neoznačoval za ověření vzdálených zdrojů. React review bez nových hooks/async závislostí, odkazy mají klíče a zalamování. Vizuální PDF/Lighthouse patří dalšímu QA.

Neproběhla DB změna, Git commit/push, deploy ani odeslání zpráv. Předchozí necommitnuté retention změny zachovány. Důkazy a omezení: `docs/data-methodology.md`.
