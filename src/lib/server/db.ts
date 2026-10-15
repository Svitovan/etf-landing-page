import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface LeadRow {
  id: string;
  email: string;
  normalized_email: string;
  created_at: string;
}

export interface LeadSubmissionRow {
  id: string;
  request_id: string;
  lead_id: string;
  selected_etfs: string[];
  position_value_czk: number;
  privacy_version: string;
  dataset_version: string;
  analytics_session_id: string | null;
  created_at: string;
}

export interface AnalyticsSessionRow {
  id: string;
  consent_version: string;
  utm_content: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string;
}

export interface AnalyticsEventRow {
  id: string;
  event_id: string;
  session_id: string | null;
  event_name: string;
  properties: Record<string, unknown>;
  server_timestamp: string;
}

// In-Memory Storage for tests and local fallback
class MemoryStore {
  leads: LeadRow[] = [];
  submissions: LeadSubmissionRow[] = [];
  sessions: AnalyticsSessionRow[] = [];
  events: AnalyticsEventRow[] = [];
  rateLimits: Map<string, { count: number; expiresAt: number }> = new Map();

  reset(): void {
    this.leads = [];
    this.submissions = [];
    this.sessions = [];
    this.events = [];
    this.rateLimits.clear();
  }
}

export const memoryStore = new MemoryStore();

let warnedPublishableKey = false;

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || url.includes("your-project") || key.includes("your-supabase")) {
    return false;
  }

  // A publishable key (sb_publishable_...) carries the 'anon' role and cannot write
  // to tables protected by Row Level Security (RLS) without anon policies.
  if (key.startsWith("sb_publishable_")) {
    if (!warnedPublishableKey) {
      console.warn(
        "\n[Supabase Configuration Warning] SUPABASE_SECRET_KEY is configured with a publishable key ('sb_publishable_...').\n" +
        "Server Route Handlers require the Secret key ('sb_secret_...' or 'service_role' JWT) to bypass Row Level Security.\n" +
        "Using local fallback store to prevent 503 errors on lead submissions.\n" +
        "To enable real Supabase storage, copy the Secret Key from Supabase Dashboard > Project Settings > API Keys.\n"
      );
      warnedPublishableKey = true;
    }
    return false;
  }

  return true;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!;
    const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!;
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseInstance;
}

