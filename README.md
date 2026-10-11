# ETF Přehled — Konverzní landing page pro české investory (Zadání B)

> Praktické řešení výběrového řízení na pozici **Junior AI Developer** (Clientelo / Matej Lörinc).  
> Projekt srovnává tři nejvýznamnější americká ETF na index S&P 500 obchodovaná na NYSE Arca: **VOO, IVV a SPY**.

---

## 1. Rychlé ověření za 2 minuty

```bash
# 1. Instalace závislostí
npm install

# 2. Ověření platnosti datasetu a finančních zdrojů
npm run validate:data

# 3. Spuštění unit testů (výpočty, parsování, rate limit, idempotence)
npm test

# 4. Spuštění produkčního buildu / lokálního vývojového serveru
npm run build
npm run dev

# 5. Vygenerování anonymizovaného reportu konverzního trychtýře
npm run report:funnel
```

Otevřete v prohlížeči: [http://localhost:3000/?utm_content=ad_a](http://localhost:3000/?utm_content=ad_a)

---

## 2. Co bylo vytvořeno

1. **Mobilní landing page v češtině:** Optimalizováno pro návštěvníka z mobilní reklamy (320px–390px, rychlé načtení, žádný layout shift).
2. **Reálná hodnota před formulářem (Value Upfront):** Návštěvník vidí kompletní srovnání parametrů VOO, IVV a SPY i interaktivní kalkulačku nákladů v Kč, aniž by musel zadávat kontakt.
3. **Získání kontaktu s minimálním třením:** Jednoduchý formulář s jedním polem (e-mail), honeypot ochranou a serverovým rate limitingem.
4. **Okamžité doručení materiálu:** Po uložení kontaktu se návštěvníkovi ihned otevře personalizovaný přehled (`/report`) s 5bodovým kontrolním seznamem a optimalizovaným tiskovým stylem pro uložení do PDF.
5. **Měření cesty v souladu s GDPR/ÚOOÚ:** Relace a události se zaznamenávají výhradně po aktivním souhlasu uživatele.
6. **Dva koncepty mobilních reklam:** Texty, vizuální koncepty a HTML náhledy (`ads/ad-a.html`, `ads/ad-b.html`) s UTM parametry.
7. **Transparentní AI protokol:** Skutečný protokol promptů a zachycených chyb modelu v `ai-log/mistakes.md`.

---

## 3. Shoda se zadáním zaměstnavatele (R01–R18)

| ID | Požadavek ze zadání | Implementace v projektu | Odkaz na důkaz |
|---|---|---|---|
| **R01** | Srovnání ETF z NYSE | VOO, IVV, SPY kótované na NYSE Arca | `data/etfs.json`, `docs/data-methodology.md` |
| **R02** | Český retailový investor na mobilu | Textace v češtině, responzivní UI (320–390px) | `src/styles/globals.css`, `src/components/Hero.tsx` |
| **R03** | Hodnota před formulářem | Srovnávací karty a kalkulačka nákladů v Kč | `src/components/EtfComparison.tsx`, `CostCalculator.tsx` |
| **R04** | Získání kontaktu | Jednopolový e-mail formulář se serverovým zápisem | `src/components/LeadForm.tsx`, `src/app/api/leads/route.ts` |
| **R05** | Promyšlený design a texty | Vlastní editorial styl, nulové šablonové AI klišé | `docs/product-brief.md`, `src/styles/globals.css` |
| **R06** | Cílová skupina a lead magnet | Definováno v briefu a navázáno na UI | `docs/product-brief.md` |
| **R07** | Dvě verze reklamy | Varianta A (rozdíly) a Varianta B (náklady v Kč) | `ads/ad-a.md`, `ads/ad-b.md`, `ads/ad-a.html`, `ads/ad-b.html` |
| **R08** | Interaktivita vede ke kontaktu | Kalkulačka nákladů s kontextovým CTA tlačítkem | `src/components/CostCalculator.tsx` |
| **R09** | Promyšlený výsledek odeslání | Stránka `/report` s kontrolním seznamem a tiskem PDF | `src/app/report/page.tsx`, `PrintButton.tsx` |
| **R10** | Skutečná data se zdroji | Factsheety Vanguard, BlackRock, SSGA a NYSE | `data/etfs.json`, `scripts/validate-data.ts` |
| **R11** | Měření celé cesty (analytika) | Souhlasové měření s 30min relacemi a skriptem funnelu | `src/lib/server/analytics.ts`, `scripts/funnel-report.ts` |
| **R12** | Odůvodnění pořadí sekcí | Logika uživatelské cesty od reklamy po materiál | Sekce 4 tohoto README |
| **R13** | Očekávaná konverze | 3–7 % s jasně definovaným jmenovatelem | `docs/experiments.md` |
| **R14** | Tři A/B hypotézy dle dopadu | 3 seřazené hypotézy s metrikami a pravidly | `docs/experiments.md` |
| **R15** | Bezplatný hosting | Připraveno pro Vercel (Next.js App Router) | `next.config.js`, `package.json` |
| **R16** | Git s historií commitů | Čistá historie s atomickými commity | `git log` |
| **R17** | Dokumentace práce s AI | Reálné prompty, kontroly a opravy chyb AI | `ai-log/README.md`, `ai-log/mistakes.md` |
| **R18** | Odpověď na e-mail | Připravený text odpovědi pro odeslání | Sekce 10 tohoto README |

---

## 4. Odůvodnění pořadí sekcí na stránce

1. **Kompaktní záhlaví:** Okamžitá identifikace projektu, kotva důvěryhdnosti.
2. **První obrazovka (Hero):** Okamžitě plní slib z mobilní reklamy (Message Match). Ukazuje nákladovost VOO, IVV a SPY v prvních 2 sekundách.
3. **Interaktivní srovnání fondů:** Dává návštěvníkovi přehled o parametrech fondů (správce, struktura UIT, burza NYSE Arca) ještě před jakýmkoliv vyžádáním kontaktu.
4. **Kalkulačka nákladů v Kč:** Převádí neosobní desetiny procent na hmatatelné koruny pro zvolenou částku (např. 100 000 Kč $\rightarrow$ 30 Kč vs. 94,50 Kč ročně).
5. **Kontext pro české investory:** Vysvětluje klíčové legislativní překážky (nařízení PRIIPs, KID) a měnová rizika u českých brokerů.
6. **Materiál a formulář (Lead Magnet):** Žádost o e-mail přichází až v momentě, kdy uživatel viděl výsledek kalkulace a chce si jej uložit spolu s 5bodovým checklistem.
7. **Časté dotazy (FAQ) a primární zdroje:** Odbourává poslední pochybnosti a uvádí přesné odkazy na prospekty.
8. **Zápatí a právní doložka:** Právní upozornění na vzdělávací charakter a možnost správy cookies.

---

## 5. Finanční data a metodika

- **Srovnávané fondy:**
  - **VOO** (Vanguard S&P 500 ETF) – Expense Ratio: **0,03 %** (Net)
  - **IVV** (iShares Core S&P 500 ETF) – Expense Ratio: **0,03 %** (Net)
  - **SPY** (SPDR S&P 500 ETF Trust) – Expense Ratio: **0,0945 %** (Gross)
- **Burza:** Všechny tři fondy jsou kótovány a primárně obchodovány na **NYSE Arca** (elektronická součást NYSE pro ETPs).
- **Vzorec ročních nákladů:**
  $$\text{Roční náklad fondu (Kč)} = \text{Hodnota pozice (Kč)} \times \text{Sazba Expense Ratio}$$
  *(Např. 100 000 Kč $\times$ 0,0003 = 30 Kč; 100 000 Kč $\times$ 0,000945 = 94,50 Kč).*
- **Omezení výpočtu:** Zahrnuje pouze interní náklad fondu strhávaný správcem z NAV. Nezahrnuje brokerské komise, spread, směnu CZK/USD ani daně. Podrobně viz [docs/data-methodology.md](file:///c:/Users/Oddman/Desktop/Junior%20AI%20Developer/docs/data-methodology.md).

---

## 6. Ukládání kontaktů a architektura

- **Frontend & Backend:** Next.js (App Router), TypeScript, CSS custom properties (žádný objemný runtime).
- **Databáze:** Supabase Postgres s Row Level Security (RLS). Žádný anonymní klient z prohlížeče nemá přístup k datům kontaktů. Pro lokální vývoj a testy je k dispozici plně funkční paměťové úložiště.
- **Bezpečnost formuláře:**
  - Zod validace e-mailu a povolených hodnot,
  - Skryté honeypot pole `website`,
  - Serverový rate limiting s HMAC hashem IP (bez ukládání surových IP adres),
  - Idempotentní zpracování přes `requestId` (ochrana proti dvojkliku a timeoutům).
- **Vydání materiálu:** Po odeslání uživatel získává odkaz na `/report`, kde má kompletní materiál k přečtení i tisku (PDF) přímo na webu.

---

## 7. Analytika a odhad konverze

- **Zásada soukromí:** Žádné měřicí cookies ani události se neposílají před aktivním souhlasem v cookie liště.
- **Odhad konverze:** Pro studený mobilní provoz z Meta Ads odhadujeme **3–7 %** konverzi ze sledovaných relací (centrální scénář 5 %).
- **Tři A/B hypotézy:**
  1. *Konkrétní pojmenování materiálu a náhled obsahu* (očekávaný nejvyšší dopad na CVR).
  2. *Kontextové CTA přímo u výsledku kalkulačky* (zkrácení cesty k formuláři).
  3. *Message matching prvního zobrazení dle kreativy* (snížení okamžitého odchodu).
  *Podrobně v [docs/experiments.md](file:///c:/Users/Oddman/Desktop/Junior%20AI%20Developer/docs/experiments.md).*

---

## 8. Práce s AI (AI-Log)

Vývoj probíhal ve spolupráci s asistentem v prostředí Antigravity IDE (Gemini 3.8 Flash) s přísnými kontrolními mechanismy:
1. **Nulová tolerance halucinací:** Žádné fiktivní recenze, smyšlené statistiky ani vygenerovaná čísla. Všechny finanční hodnoty pocházejí z auditovaných primárních odkazů.
2. **Deterministické testování:** Zjištěné floating-point nepřesnosti v JavaScriptu (např. `100 000 * 0.0003 = 29.999999999999996`) byly zachyceny testy Vitest a opraveny zaokrouhlováním na 4 desetinná místa.
3. **Log chyb:** Skutečné odhalené nepřesnosti AI jsou zaznamenány v [ai-log/mistakes.md](file:///c:/Users/Oddman/Desktop/Junior%20AI%20Developer/ai-log/mistakes.md).

---

## 9. Výsledky testů a QA

- **Automatické testy:** 25/25 testů úspěšných (`npm test` a `npm run validate:data`).
- **Typová kontrola:** `tsc --noEmit` probíhá s 0 chybami.
- **Produkční build:** `next build` probíhá úspěšně s minimální velikostí First Load JS (87.2 kB).
- Kompletní QA protokol je k dispozici v [docs/qa-report.md](file:///c:/Users/Oddman/Desktop/Junior%20AI%20Developer/docs/qa-report.md).

---

## 10. Návrh odpovědi na e-mail zadavatele

```text
Dobrý den, pane Lörinci,

zasílám řešení zadání B – konverzní landing page se srovnáním ETF pro českého investora.

GitHub repozitář: [URL veřejného repozitáře]
Živá verze stránky: [URL nasazeného webu na Vercelu]

V repozitáři najdete:
- Funkční aplikaci (Next.js / TypeScript) se srovnáním VOO, IVV a SPY na NYSE Arca,
- Reálné uložení kontaktů se serverovou ochranou a okamžitým vydáním HTML/PDF reportu,
- Dvě verze mobilní reklamy včetně HTML náhledů a UTM odkazů (ads/),
- Analytiku funnelu v souladu s GDPR/ÚOOÚ (spustitelnou přes npm run report:funnel),
- Odůvodnění struktury, odhad konverze a 3 seřazené A/B hypotézy v README a dokumentaci,
- Transparentní protokol práce s AI a skutečný log zachycených nepřesností v ai-log/.

Přeji příjemné procházení a těším se na Vaši zpětnou vazbu.

S pozdravem,
[Vaše jméno]
```
