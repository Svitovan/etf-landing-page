# Demonstrace řešení za 2–3 minuty

## 1. Reklama a první obrazovka

Otevřete [variantu A](https://etf-landing-page-phi.vercel.app/?utm_content=ad_a), poté [variantu B](https://etf-landing-page-phi.vercel.app/?utm_content=ad_b). Ukažte oba návrhy v ads/ a návaznost slibu na titulní část stránky. Cílovou skupinou je český začátečník na mobilu.

## 2. Hodnota před kontaktem

Projděte srovnání, zdroje a kalkulačku. Zadejte například 250 000 Kč a vyberte IVV. Náklady a popisky používají stejný dataset; nejde o prognózu výnosu ani kompletní brokerské náklady.

## 3. Formulář a materiál

Pro demonstraci použijte **demo@example.com**. Tato rezervovaná doména zajistí automatické označení žádosti a související relace jako testovací. Běžná adresa bez předchozího označení QA relace by mohla znečistit statistiku.

Pokud chcete ukázat měřenou cestu, povolte analytiku. Bez souhlasu má být formulář stále funkční. Odešlete jedno pole, otevřete materiál a ukažte zachovaný výběr/částku, checklist, slovník, primární zdroje a tlačítko tisku do PDF. Zpráva o úspěchu sama neprokazuje DB: skutečné zápisy byly ověřeny odděleně, viz QA.

## 4. Měření a QA

S lokální serverovou konfigurací spusťte `npm run report:funnel`. Ukažte oddělený počet testů. Není-li žádná pozorovaná netestová relace, správný výsledek CVR je **N/A**. Demonstrace není reklamní úspěch; UTM není důkaz zaplacené reklamy.

Protokol [QA](qa-report.md) odděluje unit testy, mocky, SQL, produkční průchody a datovaný PDF vzorek.
