# Scénář prezentace řešení (2–3 minuty)

Tento scénář slouží pro rychlou obhajobu projektu nebo demonstraci hodnotiteli:

## 1. Vstup z mobilní reklamy (0:00 – 0:30)
- **Krok:** Otevřete živou stránku [https://etf-landing-page-phi.vercel.app/?utm_content=ad_a](https://etf-landing-page-phi.vercel.app/?utm_content=ad_a) (případně lokálně `http://localhost:3000/?utm_content=ad_a` či soubor `ads/ad-a.html`).
- **Komentář:**  
  *„Uživatel přichází z mobilní reklamy s příslibem vysvětlení rozdílů mezi fondy. Během prvních dvou sekund vidí na prvním displeji (Hero) přesně to, co reklama slíbila: srovnání VOO, IVV a SPY na NYSE Arca a okamžitou ochutnávku jejich roční nákladovosti (0,03 % vs. 0,0945 %).“*

## 2. Hodnota před formulářem a interaktivita (0:30 – 1:15)
- **Krok:** Prozkoumejte sekci srovnání parametrů a zadejte do kalkulačky částku (např. 250 000 Kč).
- **Komentář:**  
  *„Předtím, než po uživateli chceme kontakt, mu dáváme reálnou hodnotu. Všechna data mají auditované primární zdroje přímo z prospektů emitentů. Kalkulačka převádí abstraktní procenta na srozumitelné koruny. Zde uživatel vidí, že u 250 000 Kč zaplatí u VOO 75 Kč ročně, zatímco u SPY 236,25 Kč.“*

## 3. Odeslání formuláře a okamžitý materiál (1:15 – 2:00)
- **Krok:** Zadejte testovací e-mail (např. `test@investor.cz`) a odešlete formulář. Klikněte na *„Otevřít přehled a kontrolní seznam“*.
- **Komentář:**  
  *„Formulář má pouze jedno pole a honeypot ochranu. Žádný spam. Na serveru proběhne atomické uložení a návštěvníkovi se okamžitě vygeneruje odkaz na `/report`. Zde dostává kompletní 5bodový kontrolní checklist pro nákup u brokera (KID, měnová konverze, W-8BEN), tabulku parametrů a tiskovou verzi do PDF.“*

## 4. Analytika a práce s AI (2:00 – 2:45)
- **Krok:** V terminálu spusťte `npm run report:funnel` a ukažte soubor `ai-log/mistakes.md`.
- **Komentář:**  
  *„Měření cesty funguje na principu aktivního souhlasu dle GDPR/ÚOOÚ. Data z trychtýře si můžeme kdykoliv zobrazit příkazem `npm run report:funnel`. V `ai-log/mistakes.md` máme zaznamenány skutečné chyby AI zachycené během vývoje – například nepřesnost v hrubých nákladech SPY (0,0945 %) a záludnost floating-point násobení v JavaScriptu, které jsme ošetřili deterministickými testy.“*
