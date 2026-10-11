# Reklamní strategie a koncepty (Zadání B)

V souladu se zadáním B obsahuje tento repozitář dva kompletní koncepty mobilní reklamy pro placený sociální kanál (Meta Ads – Instagram a Facebook):

## Přehled variant

| Parametr | Varianta A: Rozdíly mezi ETF | Varianta B: Náklady v korunách |
|---|---|---|
| **Cílový soubor** | `ads/ad-a.md` | `ads/ad-b.md` |
| **Hlavní motivace** | Odstranění zmatení (Proč existují 3 fondy na stejný index a proč je SPY dražší?) | Finanční hmatatelnost (Kolik mě to konkrétně stojí v korunách na kalkulačce?) |
| **Headline** | „VOO, IVV, SPY. Jaký je mezi nimi skutečný rozdíl?“ | „Kolik znamenají poplatky ETF v korunách?“ |
| **CTA** | Zobrazit srovnání | Spočítat náklady |
| **Cílová UTM URL** | `/?utm_source=meta&utm_medium=paid_social&utm_campaign=etf_compare&utm_content=ad_a` | `/?utm_source=meta&utm_medium=paid_social&utm_campaign=etf_compare&utm_content=ad_b` |
| **Message match na webu** | Dynamický headline zohledňující `ad_a` s důrazem na srovnání parametrů | Dynamický headline zohledňující `ad_b` s přímým odkazem na kalkulačku v Kč |

## Message Match a uživatelská kontinuita
Obě varianty vedou na stejnou cílovou stránku, která díky komponentě `src/data/campaign-copy.ts` automaticky adaptuje hlavní titulek prvního obrazovkového zobrazení (Hero sekce) bez layout shiftu a bez rizika injekce cizího textu z URL (používá striktní allowlist povolených hodnot).

Návštěvník z reklamy A vidí v prvních 2 sekundách potvrzení, že dorazil na srovnání VOO, IVV a SPY.  
Návštěvník z reklamy B vidí v prvních 2 sekundách modelové náklady v Kč a možnost okamžitého přepočtu.

## Omezení a disclaimer
V souladu se zadáním a etickými pravidly:
- Reklamy neslibují žádné garantované výnosy ani zisk,
- Uvádějí pouze ověřené oficiální náklady z prospektů (0,03 % a 0,0945 %),
- Kampaně nebyly placeně spuštěny (slouží jako podklad pro schválení a budoucí spuštění).
