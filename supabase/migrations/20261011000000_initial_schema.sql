-- Initial Schema for ETF Přehled (Task B)
-- All tables have RLS enabled with NO anonymous client access.
-- Server Route Handlers access data exclusively via SUPABASE_SECRET_KEY (service role).

-- 1. Leads Table (Unique contact per normalized email)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  normalized_email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Lead Submissions Table (Idempotent per request_id, links to lead)
CREATE TABLE IF NOT EXISTS public.lead_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT UNIQUE NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  selected_etfs TEXT[] NOT NULL,
  position_value_czk NUMERIC NOT NULL,
  privacy_version TEXT NOT NULL,
  dataset_version TEXT NOT NULL,
  analytics_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Analytics Sessions Table (Consented 30-min sessions)
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id TEXT PRIMARY KEY,
  consent_version TEXT NOT NULL,
  utm_content TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 4. Analytics Events Table (Consented behavioral events)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  session_id TEXT REFERENCES public.analytics_sessions(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  server_timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Rate Limit Buckets Table (Server protection without storing raw IPs)
CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key TEXT PRIMARY KEY,
  request_count INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.lead_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_session_id ON public.lead_submissions(analytics_session_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_server_timestamp ON public.analytics_events(server_timestamp);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- Deny all public anon access by default (only service role with secret key can read/write)
-- No anon policies are created, ensuring public API clients cannot read or modify any data.
