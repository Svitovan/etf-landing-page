-- Migration: Atomic Lead Submission Procedure (Task B - A02)
-- Wraps idempotency check, lead upsert and submission insert into a single database transaction.

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
REVOKE ALL ON FUNCTION public.submit_lead FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_lead TO service_role;
