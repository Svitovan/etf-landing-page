# Metodika dat a finančních výpočtů

## 1. Výběr fondů a burzy
V souladu se zadáním B porovnáváme tři nejvýznamnější americké ETF na index S&P 500:
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
- **SPY** je historicky nejstarší ETF (spuštěn v roce 1993) a má právní formu **Unit Investment Trust (UIT)**. Jako UIT nemůže reinvestovat dividendy držené v hotovosti ani půjčovat cenné papíry za účelem snížení nákladů tak flexibilně jako moderní otevřené fondy (Open-End Management Investment Companies). Jeho hrubý roční náklad činí 0,0945 %. Výměnou za to nabízí extrémní likviditu a nejnižší spready vhodné pro instituce a intradenní tradery.
- **VOO a IVV** vznikly později jako standardní otevřené investiční společnosti s optimalizovaným provozním nákladem 0,03 % ročně, což z nich dělá populární volbu pro dlouhodobé pasivní držení (Buy & Hold).

## 3. Metodika výpočtu v kalkulačce

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
  4. Daň ze zisku nebo srážková daň z dividend (standardně 15 % při vyplněném formuláři W-8BEN),
  5. Případné poplatky za úschovu cenných papírů (custody fees).

Kalkulačka slouží jako ilustrativní příklad rozsahu nákladů a nepředstavuje garantovanou budoucí výkonnost ani investiční doporučení.

## 4. Právní a regulační kontext pro české retailové investory (PRIIPs / KID)

- **Nařízení PRIIPs (EU č. 1286/2014, články 5 a 13):** Finanční zprostředkovatelé v EU smějí nabízet investiční produkty retailovým investorům pouze v případě, že je k dispozici sdělení klíčových informací (KID – Key Information Document) v jazyce daného státu.
- **Dostupnost US ETF:** Americké fondy (včetně VOO, IVV, SPY) podléhají regulaci SEC a obvykle nevydávají evropský KID.
- **Praxe v ČR:**
  - Někteří čeští retailoví brokeři přímý nákup těchto konkrétních amerických tickerů omezují nebo umožňují pouze profesionálním klientům (dle § 2b zákona o podnikání na kapitálovém trhu).
  - Jiní brokeři umožňují nákup přes opce nebo nabízejí evropské ekvivalenty **UCITS ETF** se sídlem v Irsku či Lucembursku (např. iShares Core S&P 500 UCITS ETF s tickerem SXR8 nebo Vanguard S&P 500 UCITS ETF s tickerem VUAA), které reinvestují dividendy (akumulační) a evropský KID mají.
- **Závěr pro naši landing page:** V souladu se zadáním porovnáváme americké fondy kótované na NYSE Arca, ale explicitně u každého fondu i v kontrolním seznamu uvádíme status: **„Ověřte dostupnost u svého brokera“** a vysvětlujeme podstatu KID a UCITS alternativ.
