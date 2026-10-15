import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zásady ochrany soukromí a zpracování údajů | ETF Přehled",
  description: "Informace o zpracování osobních údajů, cookies a analytice na projektu ETF Přehled.",
};

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh", padding: "2.5rem 0" }}>
      <div className="container" style={{ maxWidth: "680px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
            &larr; Zpět na hlavní stránku
          </Link>
        </div>

        <article
          style={{
            backgroundColor: "#ffffff",
            padding: "2rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
            lineHeight: 1.6,
          }}
        >
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "1rem", color: "var(--text-main)" }}>
            Zásady ochrany osobních údajů (Privacy Notice)
          </h1>

          <p style={{ color: "var(--text-light)", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
            Platnost od: 11. října 2026 &bull; Verze dokumentu: 2026-10-11
          </p>

          <section style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              1. Správce a účel projektu
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Tento web je demonstračním a vzdělávacím projektem v rámci výběrového řízení na pozici Junior AI Developer pro společnost Clientelo. Správcem osobních údajů je autor projektu (kontakt pro uplatnění práv subjektů údajů: <strong>jana4ek@gmail.com</strong>).
            </p>
          </section>

          <section style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              2. Zpracování e-mailových adres
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Při odeslání formuláře zadáváte svou e-mailovou adresu výhradně za účelem vyžádání a okamžitého zobrazení vzdělávacího materiálu (Srovnání ETF + kontrolní seznam).
            </p>
            <ul style={{ fontSize: "0.88rem", color: "var(--text-muted)", paddingLeft: "1.2rem", marginTop: "0.4rem" }}>
              <li><strong>Právní základ:</strong> Plnění požadavku uživatele (poskytnutí vyžádaného materiálu dle čl. 6 odst. 1 písm. b GDPR).</li>
              <li><strong>Marketing a sdílení:</strong> Váš e-mail NENÍ zařazen do marketingových rozesílek ani předáván třetím stranám k reklamním účelům.</li>
              <li><strong>Technologičtí zpracovatelé:</strong> Data jsou ukládána v zabezpečené databázi Supabase (PostgreSQL) a web je hostován na platformě Vercel.</li>
              <li><strong>Doba uchování:</strong> Po uplynutí 30 dní jsou demonstrační data a kontakty odstraněny při nejbližším denním běhu automatické databázové úlohy (za běžného provozu do dalších 24 hodin). Úloha běží denně v 03:15 UTC. Stav spuštění je zaznamenán v historii úloh; technický výpadek vyžaduje nápravu a opakování běhu správcem. Tato lhůta se týká aktivní databáze; případné zálohy podléhají retenčním pravidlům poskytovatele.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              3. Cookies a analytika
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              V souladu s pokyny Úřadu pro ochranu osobních údajů (ÚOOÚ) a evropskou směrnicí ePrivacy nespouštíme žádnou behaviorální analytiku před vaším výslovným souhlasem v cookie liště.
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              Pokud analytiku povolíte, je vytvořena pseudonymní relace trvající 30 minut. Nesbíráme vaši IP adresu ani osobní údaje v analytických událostech (všechny vlastnosti událostí procházejí striktním filtrem bez PII). Svůj souhlas můžete kdykoliv odvolat odkazem v zápatí stránky.
            </p>
          </section>

          <section style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              4. Vaše práva dle GDPR
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Dle nařízení GDPR máte právo na přístup k údajům, opravu, výmaz („právo být zapomenut“) nebo vznesení námitky. Pro okamžité smazání jakéhokoliv testovacího záznamu napište na <strong>jana4ek@gmail.com</strong>, případně správce zajistí smazání spuštěním skriptu pro selektivní výmaz.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
