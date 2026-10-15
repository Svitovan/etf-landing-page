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
| **2 (Střední)** | **Kontextové CTA bezprostředně za kalkulačkou zkracuje cestu k formuláři** | CTA tlačítko pouze ve spodní sekci formuláře | Kontextové tlačítko *„Uložit tento propočet v PDF“* přímo pod výsledkem kalkulačky | Návštěvník je nejvíce motivován v momentě, kdy vidí konkrétní úsporu ve své měně. Odstranění nutnosti scrollovat snižuje drop-off. | Primární **CVR**, sekundární proklik k formuláři |
| **3 (Testování zprávy)** | **Formulace prvního zobrazení ovlivňuje motivaci podle typu návštěvníka** | Headline zaměřený na rozdíly mezi fondy (*„Jaký je mezi nimi rozdíl?“*) | Headline zaměřený na peníze v korunách (*„Kolik znamenají poplatky ETF v korunách?“*) | Různé segmenty publika mohou reagovat na jiné sdělení; jde o hypotézu, nikoli výsledek experimentu. | Primární **CVR**, sekundární podíl relací s `calculator_used` |

---

## 3. Předem stanovený statistický plán

Toto je **návrh budoucích experimentů**, ne implementovaný experimentální systém ani vykázané výsledky. `utm_content=ad_a/ad_b` dnes označuje reklamní kreativu a mění headline; nenahrazuje náhodné rozdělení srovnatelného provozu. Placená kampaň není součástí dodávky MVP.

Pro každý test je primární metrikou CVR: podíl souhlasných relací s `landing_observed`, ke kterým existuje alespoň jedna uložená submission. Jedna relace je jedna binární pozorovaná jednotka. Proklik a použití kalkulačky jsou sekundární diagnostické metriky, podle kterých se nevyhlašuje vítěz.

| Parametr | Plánovací hodnota |
|---|---|
| Výchozí CVR A | 5 % — pracovní předpoklad, nikoli změřená marketingová konverze |
| Alternativa B | 6 % |
| MDE | **+1 procentní bod**, tedy **+20 % relativně** vůči 5 % |
| Test | Dvouvýběrový test podílů, dvoustranný, bez korekce na spojitost |
| Hladina / síla | α = 0,05; 1 − β = 0,80 |
| Rozdělení | 1:1, jeden experiment v daný čas |
| Výpočet vzorku | 8 158 nezávislých sledovaných relací na variantu, normální aproximace |
| Zaokrouhlený cíl | **8 200 na variantu, 16 400 celkem** |

Při $\bar p=(p_A+p_B)/2$ používáme:

$$n = \left\lceil\frac{\left[z_{0{,}975}\sqrt{2\bar p(1-\bar p)}+z_{0{,}80}\sqrt{p_A(1-p_A)+p_B(1-p_B)}\right]^2}{(p_B-p_A)^2}\right\rceil.$$

Výpočet lze reprodukovat příkazem `node scripts/experiment-sample-size.mjs` z kořene repozitáře. Používá kvantily 1,9599639845 a 0,8416212336; nejde o novou závislost aplikace. Metoda používá pooled rozptyl pod nulovou hypotézou a oddělené rozptyly pod alternativou; viz [dokumentace statsmodels](https://www.statsmodels.org/stable/generated/statsmodels.stats.proportion.samplesize_proportions_2indep_onetail.html). Pro dvoustrannou variantu se používá kritická hodnota α/2. Jde o plánovací aproximaci, ne záruku výsledku.

Původních 1 000 relací na variantu nelze při tomto MDE označit za vzorek se silou 80 %. Změní-li se před zahájením odhad baseline, MDE nebo rozdělení provozu, přepočítá se a zapíše nový plán. Během experimentu se cíl podle průběžného výsledku nemění.

## 4. Podmínky spuštění a rozhodování

1. **Před spuštěním:** zavést náhodné a stabilní přiřazení varianty v rámci sledované relace, zaznamenat experiment/variantu u expozice a ověřit propojení s konverzí. Pouhé porovnání dvou rozdílných reklamních publik není randomizovaný A/B test. Aktuální funnel nemá oddělenou dimenzi experimentu; samotný UTM report tuto podmínku nesplňuje.
2. **Souhlas a výběr vzorku:** zahrnout pouze relace se souhlasem a skutečnou expozicí `landing_observed`; výsledek nelze přenést na návštěvníky bez souhlasu. Přiřazení nesmí ovlivňovat udělení souhlasu. Opakované návštěvy stejné osoby mohou porušovat nezávislost 30min relací; před ostrým testem je nutné zvolit odpovídající jednotku nebo upravit návrh a velikost vzorku bez zavádění sledování bez souhlasu.
3. **Zastavení:** předem zvolit okno, např. alespoň 14 celých dní a nejvýše 28 dní. Vyhodnotit jednou až po dosažení cíle obou ramen a minimální délky, po uzavření jejich konverzního okna. Nedosáhne-li test do maxima potřebného vzorku, výsledek označit jako neprůkazný. Žádné zastavení podle průběžného p-value.
4. **Kontrola kvality:** sledovat rozdělení 1:1, ztracené expozice, podíl `form_submit_failed` na relacích s pokusem o odeslání a dostupnost ukládání. Technické výpadky nebo nesoulad přiřazení jsou důvodem k přerušení a diagnostice, nikoli k vyhlášení vítěze. Duplicity lze ověřovat podle request ID; raw IP ani identitu návštěvníka kvůli tomu neukládat. Bounce rate zatím nemá definované měření a není zde rozhodovací metrikou.
5. **Rozhodnutí:** uvést absolutní rozdíl CVR, relativní změnu, 95% interval rozdílu a dvoustranné p-value. Pro nasazení B požadovat statistický důkaz zlepšení a přijatelný provoz formuláře; MDE je vstup plánování síly, nikoli slib dosaženého zlepšení. Neprůkazný test neznamená rovnost variant.
6. **Tři hypotézy:** spouštět odděleně v uvedeném pořadí, každou s vlastním předem zapsaným plánem. α = 0,05 platí pro jednotlivý experiment; pokud by šlo o společné potvrzení více hypotéz, je třeba předem upravit pravidla pro vícenásobné testování a přepočítat vzorek.
