-- A requestId identifies one immutable business payload.
-- No new columns or stored PII hashes: compare with the original submission/lead.
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
SET search_path = ''
AS $$
DECLARE
  v_lead_id UUID;
  v_submission_id UUID;
  v_is_new_lead BOOLEAN := false;
  v_existing_sub RECORD;
  v_existing_etfs TEXT[];
  v_normalized_email TEXT := lower(btrim(p_email));
  v_selected_etfs TEXT[] := ARRAY(
    SELECT DISTINCT ticker FROM unnest(p_selected_etfs) AS input(ticker) ORDER BY ticker
  );
BEGIN
  IF p_request_id IS NULL OR btrim(p_request_id) = ''
     OR v_normalized_email IS NULL OR v_normalized_email = ''
     OR p_normalized_email IS DISTINCT FROM v_normalized_email THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_LEAD_REQUEST';
  END IF;

  -- Serialize identical IDs even before their first row exists. The lock lasts
  -- until commit/rollback, so a concurrent retry sees the committed payload.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('etf.submit_lead:' || p_request_id, 0)
  );

  SELECT s.id, s.lead_id, s.position_value_czk, s.selected_etfs,
         s.privacy_version, s.dataset_version, l.normalized_email
    INTO v_existing_sub
    FROM public.lead_submissions AS s
    JOIN public.leads AS l ON l.id = s.lead_id
   WHERE s.request_id = p_request_id;

  IF FOUND THEN
    -- Legacy submissions can have a different ticker order or duplicates.
    v_existing_etfs := ARRAY(
      SELECT DISTINCT ticker FROM unnest(v_existing_sub.selected_etfs) AS input(ticker) ORDER BY ticker
    );
    IF v_existing_sub.normalized_email IS DISTINCT FROM v_normalized_email
       OR v_existing_etfs IS DISTINCT FROM v_selected_etfs
       OR v_existing_sub.position_value_czk IS DISTINCT FROM p_position_value_czk
       OR v_existing_sub.privacy_version IS DISTINCT FROM p_privacy_version
       OR v_existing_sub.dataset_version IS DISTINCT FROM p_dataset_version THEN
      -- PostgREST exposes this as 409; Next.js also maps the code explicitly.
      -- Do not include email, original payload or provider details in the error.
      RAISE EXCEPTION USING ERRCODE = 'PT409', MESSAGE = 'IDEMPOTENCY_CONFLICT';
    END IF;

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

  INSERT INTO public.leads (email, normalized_email)
  VALUES (btrim(p_email), v_normalized_email)
  ON CONFLICT (normalized_email) DO UPDATE
    SET normalized_email = EXCLUDED.normalized_email
  RETURNING id, (xmax = 0) INTO v_lead_id, v_is_new_lead;

  INSERT INTO public.lead_submissions (
    request_id, lead_id, selected_etfs, position_value_czk,
    privacy_version, dataset_version, analytics_session_id
  ) VALUES (
    p_request_id, v_lead_id, v_selected_etfs, p_position_value_czk,
    p_privacy_version, p_dataset_version, p_analytics_session_id
  ) RETURNING id INTO v_submission_id;

  RETURN jsonb_build_object(
    'success', true,
    'lead_id', v_lead_id,
    'submission_id', v_submission_id,
    'is_new_lead', v_is_new_lead,
    'is_duplicate_request', false,
    'position_value_czk', p_position_value_czk,
    'selected_etfs', v_selected_etfs
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_lead(TEXT, TEXT, TEXT, TEXT[], NUMERIC, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_lead(TEXT, TEXT, TEXT, TEXT[], NUMERIC, TEXT, TEXT, TEXT)
  TO service_role;
