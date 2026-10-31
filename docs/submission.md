# Odevzdání zadání B

Podklady aktualizovány k odevzdání.

## Odkazy pro hodnotitele

- [Živá aplikace](https://etf-landing-page-phi.vercel.app/)
- [Veřejný repozitář s průběžnou historií](https://github.com/Svitovan/etf-landing-page)
- [Popis řešení a odůvodnění](../README.md)
- [Reklama A](../ads/ad-a.md), [HTML náhled A](../ads/ad-a.html)
- [Reklama B](../ads/ad-b.md), [HTML náhled B](../ads/ad-b.html)
- [Odhad konverze a tři seřazené A/B hypotézy](experiments.md)
- [QA a hranice důkazů](qa-report.md), [bezpečnost](security.md)
- [Scénář demonstrace](demo-script.md)

Zdrojový kód, dataset s primárními zdroji, migrace, testy a obě reklamy jsou součástí repozitáře. Po uložení kontaktu se materiál vydává ihned na webu s možností tisku do PDF. Emailová rozesílka ani placená kampaň nejsou implementovány.

## Ověřený stav a omezení

- Poslední ověřený aplikační commit: `e2353e9521edb3cb168222749cf3cd85bdae5d22`; Vercel READY a [úspěšný CI běh](https://github.com/Svitovan/etf-landing-page/actions/runs/38750577133). Pozdější dokumentační změna není novým runtime testem.
- Při posledním implementačním kroku prošlo 118 testů v 17 souborech, lint, typecheck a build. Rozsah jednotlivých vrstev popisuje QA.
- Dosavadní návštěvy byly testovací a jsou vyloučeny z konverzního reportu. CVR N/A není výsledek placené reklamy.
- Odhad 3–7 % je plánovací hypotéza. Randomizované A/B testy nebyly spuštěny.
- Production audit byl čistý; ve vývojových nástrojích zůstává přesně omezená bezpečnostní výjimka.

## Jazyk a úklid

Dokumenty pro hodnotitele jsou česky, technické části mohou být anglicky. Staré pracovní plány a audity byly z projektu odstraněny v rámci úklidu repozitáře ([záznam úklidu](repository-cleanup.md)). Historie v Gitu zůstává zachována.

## Návrh odpovědi zadavateli

```text
Dobrý den, pane Lörinci,

zasílám řešení zadání B – mobilní landing page se srovnáním ETF pro českého investora.

GitHub: https://github.com/Svitovan/etf-landing-page
Živá stránka: https://etf-landing-page-phi.vercel.app/

README vysvětluje cílovou skupinu, pořadí sekcí, odhad konverze i tři A/B hypotézy.
Obě reklamy včetně HTML náhledů jsou v ads/. Přehled ověření a omezení najdete
v docs/submission.md a docs/qa-report.md.

Formulář ukládá kontakt na server a okamžitě zpřístupňuje HTML materiál s tiskem
do PDF. Dosavadní provoz byl testovací a je vyloučen z konverzního reportu;
neprezentuji jej jako změřenou reklamní konverzi.

Děkuji za možnost zpracovat zadání a těším se na zpětnou vazbu.

S pozdravem
Aleš Janáček
```

Jde o připravený text. Email nebyl odeslán.
