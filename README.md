# ETF Přehled — Konverzní landing page pro české investory (Zadání B)

> Praktické řešení výběrového řízení na pozici **Junior AI Developer** (Clientelo / Matej Lörinc).  
> Projekt srovnává tři americká ETF na index S&P 500 obchodovaná na NYSE Arca: **VOO, IVV a SPY**.

---

Komplet pro hodnotitele: [odevzdání a návrh emailu](docs/submission.md). [Záznam úklidu](docs/repository-cleanup.md): repozitář byl vyčištěn od pracovních souborů; volitelné kandidáty jsme ponechali. Dokumentace je česky.

## 1. Lokální spuštění a ověření

```bash
# 1. Instalace závislostí (Node 24.x)
npm ci

# 2. Ověření platnosti datasetu a finančních zdrojů
npm run validate:data
npm run check:submission

# 3. Spuštění unit testů (výpočty, parsování, rate limit, idempotence)
npm test

# 4. Spuštění produkčního buildu / lokálního vývojového serveru
npm run build
npm run dev

# 5. Vygenerování anonymizovaného reportu konverzního trychtýře
npm run report:funnel
```

Pro lokální UI a paměťové testy není přístup do produkční databáze nutný. Pro skutečné ukládání a serverové CLI vytvořte lokální `.env` podle [.env.example](.env.example): `SUPABASE_URL`, serverový `SUPABASE_SECRET_KEY`, vlastní náhodný `RATE_LIMIT_SECRET`, `APP_ORIGIN` odpovídající adrese aplikace a `DATASET_VERSION=2026-10-11`. Databázové migrace jsou v `supabase/migrations/`; všechny musí být v cílové DB aplikovány v pořadí. Produkce bez správné DB nevrací falešný úspěch. Tajemství nevkládejte do Git ani do proměnných s prefixem `NEXT_PUBLIC_`. CLI v package.json čtou `.env`; `.env.local` pro ně není náhradou.

- **Živá produkční verze:** [https://etf-landing-page-phi.vercel.app/?utm_content=ad_a](https://etf-landing-page-phi.vercel.app/?utm_content=ad_a)
- **Lokální verze:** [http://localhost:3000/?utm_content=ad_a](http://localhost:3000/?utm_content=ad_a)

Bezpečnostní ověření: `npm run audit:production`, `npm run audit:dependencies`, po buildu také `npm run check:secret-exposure` (poslední kontrola potřebuje lokální `.env`, hodnoty nevypisuje). [Bezpečnostní přehled](docs/security.md) rozlišuje čistý production audit a jeden neopravený dev-only braces advisory v pěti závislých uzlech. Výjimka review platí jen do 2026-11-15, nové problémy blokují CI. Historické QA výsledky na Next 14 se nevydávají za měření nové verze Next 15.

Report konverzí standardně vylučuje testové odeslání i celé související session z čitatele/jmenovatele, kroků a UTM. Server rozpozná rezervované testovací email domény; další QA označí administrátor předem přes `npm run analytics:mark-test -- --session-id=SESSION_ID --apply` (bez `--apply` pouze preview). Původní demonstrace jsou po potvrzení uživatele označeny, nikoli smazány. Bez skutečných pozorovaných netestových relací je CVR **N/A**. [Pravidla a živé důkazy](docs/test-traffic.md).

---

## 2. Co bylo vytvořeno

1. **Mobilní landing page v češtině:** Optimalizováno pro návštěvníka z mobilní reklamy (320px–390px, rychlé načtení, žádný layout shift).
2. **Reálná hodnota před formulářem (Value Upfront):** Návštěvník vidí kompletní srovnání parametrů VOO, IVV a SPY i interaktivní kalkulačku nákladů v Kč, aniž by musel zadávat kontakt.
3. **Získání kontaktu s minimálním třením:** Jednoduchý formulář s jedním polem (e-mail), honeypot ochranou a serverovým rate limitingem.
4. **Okamžité doručení materiálu:** Po uložení kontaktu se návštěvníkovi ihned otevře personalizovaný přehled (`/report`) s 5bodovým kontrolním seznamem a optimalizovaným tiskovým stylem pro uložení do PDF.
5. **Měření cesty v souladu s GDPR/ÚOOÚ:** Relace a události se zaznamenávají výhradně po aktivním souhlasu uživatele.
6. **Dva koncepty mobilních reklam:** Texty, vizuální koncepty a HTML náhledy (`ads/ad-a.html`, `ads/ad-b.html`) s UTM parametry.
7. **Transparentní vývoj a principy kvality:** Nulová tolerance halucinací, deterministické výpočty se zaokrouhlováním a ověření všech kroků testy.

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
| **R15** | Bezplatný hosting | Nasazeno na Vercelu (Next.js App Router) | [https://etf-landing-page-phi.vercel.app/](https://etf-landing-page-phi.vercel.app/) |
| **R16** | Git s historií commitů | Čistá historie s atomickými commity | `git log` |
| **R17** | Dokumentace a kvalita vývoje | Nulová tolerance halucinací, verifikace výpočtů a testy | `docs/qa-report.md`, `docs/decisions.md` |
| **R18** | Odpověď na e-mail | Připravený text odpovědi pro odeslání | Sekce 9 tohoto README |

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

Regulační a daňové formulace mají primární zdroje a přesné vymezení v `data/etfs.json → investorContext` (kontrola 2026-10-15). Na stránce i v reportu jsou odkazy přímo u tvrzení. Podrobná mapa: [docs/data-methodology.md](docs/data-methodology.md). Nejde o individuální daňové posouzení; finanční snapshot ETF zůstává `2026-10-11`.

Procentní popisky i výpočty používají jednu číselnou sazbu z datasetu. Hero, FAQ, kalkulačka a tabulka reportu neobsahují ručně opsané sazby; změnu dat ověřují regresní render testy.

- **Srovnávané fondy:**
  - **VOO** (Vanguard S&P 500 ETF) – Expense Ratio: **0,03 %** (Net)
  - **IVV** (iShares Core S&P 500 ETF) – Expense Ratio: **0,03 %** (Net)
  - **SPY** (SPDR S&P 500 ETF Trust) – Expense Ratio: **0,0945 %** (Gross)
- **Burza:** Všechny tři fondy jsou kótovány a primárně obchodovány na **NYSE Arca** (elektronická součást NYSE pro ETPs).
- **Vzorec ročních nákladů:**
  $$\text{Roční náklad fondu (Kč)} = \text{Hodnota pozice (Kč)} \times \text{Sazba Expense Ratio}$$
  *(Např. 100 000 Kč $\times$ 0,0003 = 30 Kč; 100 000 Kč $\times$ 0,000945 = 94,50 Kč).*
- **Omezení výpočtu:** Zahrnuje pouze interní náklad fondu strhávaný správcem z NAV. Nezahrnuje brokerské komise, spread, směnu CZK/USD ani daně. Podrobně viz [docs/data-methodology.md](docs/data-methodology.md).

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

### Opakování žádosti a konflikt dat

Stejný `requestId` se stejným obsahem vrací původní výsledek bez nové submission. Změna e-mailu, množiny ETF, částky, verze soukromí nebo datasetu vrací HTTP 409 (`IDEMPOTENCY_CONFLICT`). Pořadí ETF a normalizace e-mailu se nepovažují za změnu. Formulář ponechá ID při síťovém retry, ale při explicitním odeslání změněných údajů vytvoří novou žádost.

**Stav opravy:** migrace i aplikace jsou publikovány; skutečný production scénář ověřil 200 při shodném opakování, 409 při změně a jedinou původní žádost v DB. Datum, testovaná verze a hranice důkazů jsou v [QA](docs/qa-report.md).

---

## 7. Analytika a odhad konverze

**Retence:** Supabase spouští automatický cleanup denně v 03:15 UTC. CLI používá stejnou atomickou funkci; `npm run cleanup:data -- --dry-run` zobrazí kandidáty bez mazání. Chyba vrací exit 1. Nastavení, kontrola historie a přesný rozsah: [docs/data-retention.md](docs/data-retention.md).

- **Zásada soukromí:** Žádné měřicí cookies ani události se neposílají před aktivním souhlasem v cookie liště.
- **Odhad konverze:** Pro studený mobilní provoz z Meta Ads odhadujeme **3–7 %** konverzi ze sledovaných relací (centrální scénář 5 %).
- **Tři A/B hypotézy:**
  1. *Konkrétní pojmenování materiálu a náhled obsahu* (očekávaný nejvyšší dopad na CVR).
  2. *Kontextové CTA přímo u výsledku kalkulačky* (zkrácení cesty k formuláři).
  3. *Message matching prvního zobrazení dle kreativy* (snížení okamžitého odchodu).
  *Podrobně v [docs/experiments.md](docs/experiments.md): baseline 5 %, MDE +1 procentní bod (5 % → 6 %), α = 0,05, síla 80 %, plán 8 200 relací na variantu. Jde o návrh; UTM varianty samy nejsou randomizovaný experiment.*

---

## 8. Výsledky testů a QA

- **Automatické testy:** Rozsah a výsledky po poslední kontrole uvádí [QA report](docs/qa-report.md). Odděluje testy v paměti, skutečné handlery s mocky, SQL a historické live ověření; žádný unit test sám neprokazuje produkční zápis.
- **Linter a typová kontrola:** `npm run lint` používá ESLint CLI; `npm run typecheck` používá TypeScript. Poslední implementační kontrola prošla bez chyb.
- **Produkční build:** Next 15.5.28, Node 24.x; poslední automatická sada má 118 testů v 17 souborech. Přesné verze a datované artefakty uvádí QA.
- Kompletní QA protokol je k dispozici v [docs/qa-report.md](docs/qa-report.md).
- **Chyba reportu:** `npm run report:funnel` při chybě čtení vrací nenulový exit code a nevypíše falešné nulové statistiky. Test používá lokální HTTP provider; dočasný výpadek produkce kvůli tomu není vyvoláván.

---

## 9. Odevzdání

Aktuální návrh odpovědi zadavateli, veřejné odkazy a přiznaná omezení jsou na jednom místě: [komplet odevzdání](docs/submission.md). [Scénář demonstrace](docs/demo-script.md) používá rezervovaný testovací email; [seznam k úklidu](docs/repository-cleanup.md) shrnuje úklid projektu.
