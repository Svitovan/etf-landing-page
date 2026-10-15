# Metodika dat a finančních výpočtů

## 1. Výběr fondů a burzy
V souladu se zadáním B porovnáváme tři americké ETF na index S&P 500, bez tvrzení o pořadí podle velikosti nebo likvidity:
1. **VOO** (Vanguard S&P 500 ETF) – správce The Vanguard Group, Inc.
2. **IVV** (iShares Core S&P 500 ETF) – správce BlackRock Fund Advisors
3. **SPY** (SPDR S&P 500 ETF Trust) – správce State Street Global Advisors

### Proč stejný index?
Srovnání ETF sledujících stejný benchmark (S&P 500 Index) poskytuje retailovému investorovi maximální přehlednost: odstraňuje zkreslení způsobené odlišnou výkonností podkladových aktiv a soustředí se na to, co investor může přímo ovlivnit nebo co tvoří náklady fondu: **Expense Ratio**, právní strukturu a likviditu.

### Burza: NYSE Arca
Všechny tři fondy jsou primárně kótovány a obchodovány na burze **NYSE Arca**, což je plně elektronická součást skupiny New York Stock Exchange určená pro ETPs (Exchange Traded Products). Toto rozhodnutí je podloženo oficiálními záznamy burzy NYSE i prospekty jednotlivých fondů.

## 2. Nákladovost fondů (Expense Ratio)

| Ticker | Fond | Správce | Expense Ratio | Typ nákladu | Roční náklad na 100 000 Kč |
|---|---|---|---|---|---|
| **VOO** | Vanguard S&P 500 ETF | Vanguard | 0,03 % (0,0003) | Net / Total | 30,00 Kč |
| **IVV** | iShares Core S&P 500 ETF | BlackRock | 0,03 % (0,0003) | Net / Total | 30,00 Kč |
| **SPY** | SPDR S&P 500 ETF Trust | State Street | 0,0945 % (0,000945) | Gross | 94,50 Kč |

### Rozdíl mezi Gross a Net a struktura fondů:
- **SPY** je v použitém snapshotu veden jako **Unit Investment Trust (UIT)** s hrubou nákladovostí 0,0945 %.
- **VOO a IVV** jsou v tomto snapshotu otevřené fondy s nákladovostí 0,03 % (Net). Z právní formy samotné neodvozujeme příčinu rozdílu poplatků ani pořadí podle likvidity. Nižší Expense Ratio není samo o sobě doporučením ani výpočtem celkových nákladů obchodu.

## 3. Metodika výpočtu v kalkulačce

Číselný `expenseRatio.value.rate` je jediným zdrojem sazby pro výpočty i procentní popisky v Hero, srovnání, kalkulačce, FAQ a reportu. `formatPercent` / `formatExpenseRatio` zajišťují české formátování a Gross/Net z `kind`. Starší `displayPercent` zůstává součástí datového formátu, ale UI ho nečte. Tabulka reportu čerpá i ostatní parametry z datasetu; budoucí změna sazby nevyžaduje opravu JSX.

### Vzorec pro roční náklad:
$$\text{Roční náklad fondu (Kč)} = \text{Hodnota pozice (Kč)} \times \text{Sazba Expense Ratio}$$

### Příklad výpočtu:
Pro modelovou investici 100 000 Kč:
- VOO / IVV: $100\,000 \times 0{,}0003 = 30{,}00\text{ Kč ročně}$
- SPY: $100\,000 \times 0{,}000945 = 94{,}50\text{ Kč ročně}$
- **Rozdíl:** $94{,}50 - 30{,}00 = 64{,}50\text{ Kč ročně}$

### Co je a co NENÍ zahrnuto:
- **Zahrnuto:** Pouze interní průběžný náklad na správu fondu (Expense Ratio), který je průběžně odečítán z čisté hodnoty aktiv fondu (NAV) správcem.
- **NENÍ zahrnuto:**
  1. Poplatky brokera za nákup a prodej (transakční komise),
  2. Měnová konverze (CZK $\rightarrow$ USD a zpět),
  3. Tržní rozpětí (Bid-Ask Spread),
  4. Daně z příjmů a případná americká srážka (režim závisí na příjmu, rezidenci a doloženém nároku; není součástí kalkulace),
  5. Případné poplatky za úschovu cenných papírů (custody fees).

Kalkulačka slouží jako ilustrativní příklad rozsahu nákladů a nepředstavuje garantovanou budoucí výkonnost ani investiční doporučení.

## 4. Právní a regulační kontext pro české retailové investory (PRIIPs / KID)

Aktuální formulace a primární zdroje jsou uloženy v `data/etfs.json → investorContext`; komponenty je přijímají ze serverové stránky. Nevznikají samostatné kopie daňových pravidel v JSX.

| Klíč | Význam a přesná opora |
|---|---|
| `priips` | Vypracování/předání KID: [nařízení 1286/2014, čl. 5 a 13](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32014R1286). Jazyk: čl. 7 a [ČNB, sekce A otázka 1](https://www.cnb.cz/cs/dohled-financni-trh/legislativni-zakladna/stanoviska-k-regulaci-financniho-trhu/RS2018-12/). Nelze tvrdit univerzální povinnost výhradně českého KID. |
| `kidDefinition` | Čl. 6 odst. 4: nejvýše tři strany A4 při tisku, nikoli přesně tři. Čl. 7 upravuje jazyk. Report není KID. |
| `dividendTreaty` | [Smlouva USA–ČR, čl. 10 odst. 2 písm. b) a odst. 3](https://www.irs.gov/pub/irs-trty/czech.pdf), PDF str. 11–12: podmíněný limit 15 % z hrubých dividend; skutečný vlastník a rezidence, zvláštní ustanovení pro RIC. Čl. 1/17 omezují nárok; čl. 24 upravuje odstranění dvojího zdanění. Není to univerzální sazba každé distribuce ani výpočet české daně. |
| `w8ben` | [IRS instructions W-8BEN](https://www.irs.gov/instructions/iw8ben), Purpose, Who Must Provide, Giving a Expiration: pro příslušné zahraniční fyzické osoby, předává se plátci, ne IRS. Samotný podpis nezaručuje nárok. |
| `withholding` | [IRS NRA withholding](https://www.irs.gov/individuals/international-taxpayers/nra-withholding): obecný režim 30 % s možným zákonným či smluvním snížením/výjimkou. Konkrétní distribuce se musí klasifikovat. |

Zdroje byly prověřeny 2026-10-15. IRS nadále uvádí smlouvu z roku 1993 v [seznamu pro ČR](https://www.irs.gov/businesses/international-businesses/czech-republic-tax-treaty-documents). U pokynů W-8BEN je uveden pouze měsíc revize 10/2021; `asOf` zůstává NULL, abychom nevymýšleli přesný den. Přímé otevření EUR-Lex blokovala anti-bot kontrola; články byly ověřeny v indexovaném úředním textu, český jazykový výklad přímo na ČNB. To není potvrzení dostupnosti konkrétního KID nebo nákupu u konkrétního brokera.

Původní finanční snapshot ETF `2026-10-11` ani sazby Expense Ratio nebyly touto kontrolou aktualizovány. `investorContext.reviewedAt` označuje samostatnou kontrolu regulačních/daňových textů. Validátor ověřuje strukturu, primární domény, datum kontroly a poznámku s umístěním/působností; neověřuje právní správnost ani budoucí změny vzdáleného zdroje.

Odstraněny byly neověřené broker-specific příklady a kategorická absence českého KID, žebříčky velikosti/spreadů a paušální pětiletý investiční horizont. Daňové přiznání, zápočet či jiné individuální povinnosti v ČR tento materiál nepočítá; žádné osvobození ani nulový doplatek neslibuje.
