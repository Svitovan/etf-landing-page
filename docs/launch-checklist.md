# Kontrolní seznam připravenosti k nasazení (Launch Checklist)

Tento checklist rozlišuje dva stavy v souladu se sekcí 13.4 implementačního plánu:

## 1. Úroveň A: Připraveno k hodnocení (Evaluation Ready) – SPLNĚNO ✓
Tato úroveň pokrývá všechny požadavky zadání pro úspěšnou kontrolu hodnotitelem:

- [x] **R01–R03 (Hodnota před formulářem):** Srovnání tří ETF (VOO, IVV, SPY) kótovaných na NYSE Arca se zobrazením parametrů a nákladů v Kč bez nutnosti zadávat e-mail.
- [x] **R04 (Získání kontaktu):** Jednopolový formulář s validací, honeypotem, rate limitingem a serverovým zápisem do databáze.
- [x] **R05–R06 (Design, cílová skupina a produktový brief):** Prémiový mobilní layout v češtině, dokumentováno v `docs/product-brief.md`.
- [x] **R07 (Dvě verze reklamy):** Kompletní koncepty a vizuální náhledy `ads/ad-a.html` a `ads/ad-b.html` s UTM parametry.
- [x] **R08 (Interaktivita):** Interaktivní srovnání parametrů a kalkulačka nákladů s kontextovým CTA vedoucím k uložení materiálu.
- [x] **R09 (Výsledek po odeslání):** Okamžitý přístup k materiálu `/report` s 5bodovým kontrolním seznamem a tiskovým PDF stylem.
- [x] **R10 (Skutečná data se zdroji):** Verze datasetu `2026-10-11` s oficiálními odkazy na prospekty v `data/etfs.json`.
- [x] **R11 (Měření cesty a konverze):** Souhlasové měření s 30min relacemi a skriptem `npm run report:funnel`.
- [x] **R12 (Odůvodnění pořadí sekcí):** Popsáno v README a v implementačním plánu.
- [x] **R13–R14 (Očekávaná konverze a A/B hypotézy):** Odhad 3–7 % a 3 seřazené hypotézy v `docs/experiments.md`.
- [x] **R15–R16 (Hosting a Git):** Připraveno pro Vercel a Git historie s průběžnými commity.
- [x] **R17 (Transparentní práce s AI):** Dokumentováno v `ai-log/README.md` a reálné chyby v `ai-log/mistakes.md`.
- [x] **R18 (Návrh odpovědi na e-mail):** Připraven v sekci 21 plánu a v README.

---

## 2. Úroveň B: Připraveno k ostrému placenému spuštění reklamy (Production Ad-Ready)
Body, které je nutné dokončit před investováním reálného rozpočtu do placených reklam:

- [ ] **Oficiální provozovatel:** Doplnit IČO, název společnosti a sídlo reálného zadavatele do `src/app/privacy/page.tsx`.
- [ ] **Nastavení produkčního e-mailového providera (P1):** Pokud má být materiál posílán do schránky, propojit Resend s ověřenou doménou (DKIM/SPF záznamy).
- [ ] **Komerční hostingový tarif:** Přechod z bezplatného Hobby tarifu na Vercel Pro v případě komerčního využití.
- [ ] **Schválení reklamních účtů:** Vytvoření reklamního účtu v Meta Business Manageru, nahrání platební metody a nasazení Meta Conversion API.
