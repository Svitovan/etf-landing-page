# Očekávaná konverze a návrh A/B testů

Tento dokument obsahuje odůvodněný odhad konverzního poměru (CVR) a tři metodicky připravené hypotézy pro A/B testování v souladu s požadavky zadání B a implementačního plánu.

## 1. Očekávaná konverze (CVR) pro README

### Pracovní odhad: 3–7 %
Jako výchozí scénář pro modelování plánujeme konverzi **3–7 % úspěšně odeslaných kontaktů ze sledovaných relací cílového mobilního provozu** (s centrálním odhadem **5 %**).

### Definice jmenovatele a metriky:
$$\text{CVR}_{\text{observed}} = \frac{\text{Unikátní sledované relace s potvrzeným uložením formuláře}}{\text{Unikátní sledované relace na landing page}} \times 100\,\%$$

### Důvody a předpoklady odhadu:
1. **Hodnota před formulářem (Value Upfront):** Návštěvník vidí kompletní srovnání i kalkulačku ještě předtím, než je požádán o e-mail. To buduje důvěru a filtruje okamžité odchody (bounce).
2. **Minimální tření ve formuláři:** Pouze jedno pole (e-mail) bez jména, telefonu či investičního rozpočtu.
3. **Okamžité doručení:** Žádné čekání na e-mail nebo potvrzovací odkaz – materiál je dostupný ihned na webu k tisku či uložení do PDF.
4. **Omezení cold trafficu:** U studené mobilní reklamy z Instagramu/Facebooku věnuje uživatel stránce jen několik sekund; část uživatelů odmítne cookies nebo má blokátory, což odhad udržuje v realistickém rozmezí 3–7 %.

---

## 2. Tři A/B hypotézy seřazené podle očekávaného dopadu

| Priorita | Hypotéza | Varianta A (Control) | Varianta B (Challenger) | Proč by to mělo fungovat? | Primární metrika |
|---|---|---|---|---|---|
| **1 (Nejvyšší)** | **Konkrétní hodnota materiálu s náhledem obsahu zvyšuje ochotu zanechat kontakt** | Obecná nabídka: *„Získat srovnání ETF“* | Specifický balíček: *„Vaše srovnání + kontrolní seznam pro českého investora v PDF“* s vizuálním rozpisem 4 částí | Návštěvník přesně ví, co získá. Výměna kontaktu za konkrétní checklist má výrazně vyšší vnímanou hodnotu než abstraktní souhrn. | **CVR sledovaných relací** (sessions $\rightarrow$ leads) |
| **2 (Střední)** | **Kontextové CTA bezprostředně za kalkulačkou zkracuje cestu k formuláři** | CTA tlačítko pouze ve spodní sekci formuláře | Kontextové tlačítko *„Uložit tento propočet v PDF“* přímo pod výsledkem kalkulačky | Návštěvník je nejvíce motivován v momentě, kdy vidí konkrétní úsporu ve své měně. Odstranění nutnosti scrollovat snižuje drop-off. | **Míra prokliku k formuláři** a celkové **CVR** |
| **3 (Testování zprávy)** | **Formulace prvního zobrazení ovlivňuje motivaci podle typu návštěvníka** | Headline zaměřený na rozdíly mezi fondy (*„Jaký je mezi nimi rozdíl?“*) | Headline zaměřený na peníze v korunách (*„Kolik znamenají poplatky ETF v korunách?“*) | Různé segmenty publika reagují na jiné triggery: analytičtější investory zajímá struktura fondů, zatímco začátečníky zajímá přímý dopad na peněženku. | **Bounce rate** prvního zobrazení a **CVR** |

---

## 3. Metodická pravidla a vyhodnocování experimentů
Pro zajištění statistické integrity (a zamezení předčasným závěrům):
1. **Randomizace relace:** Návštěvníkovi je varianta přiřazena náhodně a uložena po dobu jeho relace (30 minut).
2. **Minimální velikost vzorku:** Minimálně 1 000 sledovaných relací na každou variantu před jakýmkoliv vyhodnocením (při $\alpha = 0{,}05$ a síle testu $1 - \beta = 0{,}80$).
3. **Ochranné metriky (Guardrails):**
   - Počet chybových stavů formuláře (`form_submit_failed`),
   - Počet duplicitních odeslání ze stejné IP/klienta,
   - Míra okamžitého opuštění stránky (Bounce rate).
4. **Pravidlo zastavení:** Test nesmí být ukončen jen proto, že po prvních 20 konverzích jedna varianta dočasně vede.
