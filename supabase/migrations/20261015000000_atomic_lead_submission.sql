-- Migration: Atomic Lead Submission & Rate Limiting Procedures (Task B - A02, B01, B03)
-- 1. Wraps idempotency check, lead upsert and submission insert into a single database transaction.
-- 2. Provides atomic counter increment and expiration check for rate limit buckets.

-- 1. Atomic submit_lead Procedure
CREATE OR REPLACE FUNCTION public.submit_lead(
  p_request_id TEXT,
  p_email TEXT,
  p_normalized_email TEXT,
  p_selected_etfs TEXT[],
  p_position_value_czk NUMERIC,
  p_privacy_version TEXT,
  p_dataset_version TEXT,
  p_analytics_session_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_id UUID;
  v_submission_id UUID;
  v_is_new_lead BOOLEAN := false;
  v_existing_sub RECORD;
BEGIN
  -- 1. Idempotency check: has this request_id already been saved?
  SELECT id, lead_id, position_value_czk, selected_etfs
  INTO v_existing_sub
  FROM public.lead_submissions
  WHERE request_id = p_request_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'lead_id', v_existing_sub.lead_id,
      'submission_id', v_existing_sub.id,
      'is_new_lead', false,
      'is_duplicate_request', true,
      'position_value_czk', v_existing_sub.position_value_czk,
      'selected_etfs', v_existing_sub.selected_etfs
    );
  END IF;

  -- 2. Upsert lead atomically (guarantees safe concurrency without duplicates)
  INSERT INTO public.leads (email, normalized_email)
  VALUES (p_email, p_normalized_email)
  ON CONFLICT (normalized_email) DO UPDATE
    SET normalized_email = EXCLUDED.normalized_email
  RETURNING id, (xmax = 0) INTO v_lead_id, v_is_new_lead;

  -- 3. Insert submission (if this fails, transaction rolls back automatically)
  INSERT INTO public.lead_submissions (
    request_id,
    lead_id,
    selected_etfs,
    position_value_czk,
    privacy_version,
    dataset_version,
    analytics_session_id
  )
  VALUES (
    p_request_id,
    v_lead_id,
    p_selected_etfs,
    p_position_value_czk,
    p_privacy_version,
    p_dataset_version,
    p_analytics_session_id
  )
  RETURNING id INTO v_submission_id;

  RETURN jsonb_build_object(
    'success', true,
    'lead_id', v_lead_id,
    'submission_id', v_submission_id,
    'is_new_lead', v_is_new_lead,
    'is_duplicate_request', false,
    'position_value_czk', p_position_value_czk,
    'selected_etfs', p_selected_etfs
  );
END;
$$;

-- Restrict execution to service_role (Route Handlers) only
REVOKE ALL ON FUNCTION public.submit_lead(TEXT, TEXT, TEXT, TEXT[], NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_lead(TEXT, TEXT, TEXT, TEXT[], NUMERIC, TEXT, TEXT, TEXT) TO service_role;


-- 2. Atomic check_rate_limit Procedure (B03)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_bucket_key TEXT,
  p_max_requests INT,
  p_window_seconds INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_expires_at TIMESTAMPTZ;
  v_count INT;
  v_retry_after INT := 0;
BEGIN
  -- Insert new bucket or update existing atomically with row lock
  INSERT INTO public.rate_limit_buckets (bucket_key, request_count, expires_at)
  VALUES (p_bucket_key, 1, v_now + (p_window_seconds || ' seconds')::interval)
  ON CONFLICT (bucket_key) DO UPDATE
    SET request_count = CASE
          WHEN rate_limit_buckets.expires_at < v_now THEN 1
          ELSE rate_limit_buckets.request_count + 1
        END,
        expires_at = CASE
          WHEN rate_limit_buckets.expires_at < v_now THEN v_now + (p_window_seconds || ' seconds')::interval
          ELSE rate_limit_buckets.expires_at
        END
  RETURNING request_count, expires_at INTO v_count, v_expires_at;

  IF v_count > p_max_requests THEN
    v_retry_after := CEIL(EXTRACT(EPOCH FROM (v_expires_at - v_now)))::INT;
    IF v_retry_after < 1 THEN v_retry_after := 1; END IF;
    RETURN jsonb_build_object(
      'allowed', false,
      'retry_after_seconds', v_retry_after,
      'request_count', v_count
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'retry_after_seconds', 0,
    'request_count', v_count
  );
END;
$$;

-- Restrict execution to service_role only
REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO service_role;
