import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Load environment variables if not already populated
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("==================================================");
console.log("  ETF Přehled – Supabase Connectivity & RLS Check ");
console.log("==================================================");

if (!url || !key || url.includes("your-project") || key.includes("your-supabase")) {
  console.log("⚠️  Supabase není plně nakonfigurován v .env souboru.");
  console.log("   Požadované proměnné: SUPABASE_URL a SUPABASE_SECRET_KEY\n");
  process.exit(0);
}

console.log(`Endpoint URL: ${url}`);

const isPublishable = key.startsWith("sb_publishable_");
const isSecret = key.startsWith("sb_secret_");
const isJwt = key.startsWith("eyJ");

if (isPublishable) {
  console.log("Klíč: sb_publishable_... (PUBLISHABLE / ANON KLÍČ)");
  console.log("⚠️  Upozornění: Tento klíč má roli 'anon'.");
  console.log("   Tabulky v projektu mají zapnuté RLS (Row Level Security) bez veřejného přístupu.");
  console.log("   Pro serverový zápis kontaktů a analytiky je potřeba Secret Key (sb_secret_... или service_role)!\n");
} else if (isSecret || isJwt) {
  console.log("Klíč: Server Secret / Service Role Key (oprávnění k zápisu přes RLS) ✅\n");
} else {
  console.log("Klíč: Vlastní formát klíče\n");
}

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const REQUIRED_TABLES = [
  "leads",
  "lead_submissions",
  "analytics_sessions",
  "analytics_events",
  "rate_limit_buckets",
];

async function runDiagnostics() {
  console.log("1. Kontrola existence a čtení tabulek:");
  let allTablesExist = true;

  for (const table of REQUIRED_TABLES) {
    const { count, error } = await client
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`   ❌ Tabulka '${table}': Chyba ${error.code} - ${error.message}`);
      allTablesExist = false;
    } else {
      console.log(`   ✅ Tabulka '${table}': nalezena (aktuální počet záznamů: ${count})`);
    }
  }

  if (!allTablesExist) {
    console.log("\n⚠️  Některé tabulky v databázi chybí.");
    console.log("   Ujistěte se, že jste v Supabase SQL Editoru spustili soubor:");
    console.log("   supabase/migrations/20261011000000_initial_schema.sql\n");
    return;
  }

  console.log("\n2. Test serverového zápisu kontaktu (RLS Write Test):");
  const testEmail = `diagnostic_test_${Date.now()}@example.com`;

  const { data: insertedLead, error: insertError } = await client
    .from("leads")
    .insert({
      email: testEmail,
      normalized_email: testEmail,
    })
    .select("id")
    .single();

  if (insertError) {
    console.log(`   ❌ Zápis selhal: kód ${insertError.code} - ${insertError.message}`);
    if (insertError.code === "42501" || insertError.message.includes("row-level security")) {
      console.log("\n💡 DŮVOD SELHÁNÍ:");
      console.log("   Použitý klíč nemá práva obcházet RLS (Row Level Security).");
      console.log("   Postup nápravy:");
      console.log("   1. Otevřete Supabase Dashboard: https://supabase.com/dashboard");
      console.log("   2. Zvolte váš projekt -> Project Settings (ozubené kolo) -> API Keys");
      console.log("   3. V sekci 'Project API Keys' klikněte na 'Reveal' u Secret key (sb_secret_...) nebo service_role");
      console.log("   4. Zkopírujte tento Secret key a vložte jej do .env souboru jako:");
      console.log("      SUPABASE_SECRET_KEY=sb_secret_...\n");
    }
  } else {
    console.log(`   ✅ Zkušební kontakt úspěšně vytvořen (ID: ${insertedLead.id})`);

    // Clean up test row
    const { error: delError } = await client
      .from("leads")
      .delete()
      .eq("id", insertedLead.id);

    if (delError) {
      console.log(`   ⚠️  Úklid testovacího záznamu selhal: ${delError.message}`);
    } else {
      console.log("   ✅ Testovací záznam byl okamžitě smazán (databáze zůstala čistá).");
    }

    console.log("\n🎉 Supabase je kompletně a bezpečně propojen s projektem!");
    console.log("   Všechny formuláře a analytické události se ukládají přímo do PostgreSQL.\n");
  }
}

runDiagnostics().catch((err) => {
  console.error("Neočekávaná chyba při diagnostice:", err);
});
