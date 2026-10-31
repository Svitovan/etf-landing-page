# Předání projektu

Aktualizováno k odevzdání. Vstup pro hodnotitele: [komplet odevzdání](submission.md).

## Ověřený stav

- Next 15.5.28 / React 18.3.1 / Node 24.x; česká landing page, srovnání, kalkulačka, formulář, report a tisk.
- Atomický zápis kontaktu a žádosti, fail-closed v produkci, idempotence a 409; honeypot, Origin, validace a rate limit.
- Souhlasná analytika, koordinace relace, agregovaný report se stránkováním; testy oddělené od skutečné konverze.
- Denní retenční úlohy aktivní; [provozní postup](data-retention.md) uvádí hranice ověření.
- Poslední ověřený kód e2353e9, Vercel READY a CI success; 118 testů v 17 souborech, lint/typecheck/build prošly. [QA](qa-report.md) rozlišuje vrstvy důkazů.
- [Bezpečnost](security.md) neskrývá zbývající dev-only advisory.

## Dokumentace pro odevzdání

README, komplet odevzdání, QA, checklist a demo scénář odpovídají dokončeným opravám. Provozní instrukce k testům a bezpečnosti jsou česky.

[Seznam k úklidu](repository-cleanup.md) shrnuje úklid pracovních dokumentů a starých artefaktů. Historie v Gitu se nepřepisuje.

Před skutečnou kampaní potvrdit provozovatele, hosting a reklamní účet, aktuálnost dat a bezpečnosti, poslední ostrý běh retence a případnou randomizaci A/B testů.

Dosavadní provoz byl testovací; poslední snapshot 10/24 vyloučených žádostí/relací, netestový CVR N/A. Email zadavateli nebyl odeslán.

## Ověření projektu

`npm run check:submission` kontroluje integritu repozitáře a lokální odkazy dokumentace. Prošlo 118/118 testů v 17 souborech, lint, typecheck, validate:data a produkční build.
