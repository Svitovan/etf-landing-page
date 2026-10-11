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

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && key && !url.includes("your-project") && !key.includes("your-supabase"));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL!;
    const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!;
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseInstance;
}
