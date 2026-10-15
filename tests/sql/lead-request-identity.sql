-- Run after the migration, preferably against a test database. No fixtures persist.
BEGIN;

DO $$
DECLARE
  v_request_id TEXT := gen_random_uuid()::text;
  v_email TEXT := 'idempotency-' || gen_random_uuid()::text || '@example.com';
  v_first JSONB;
  v_retry JSONB;
  v_conflicts INTEGER := 0;
  v_case INTEGER;
BEGIN
  v_first := public.submit_lead(
    v_request_id, v_email, v_email, ARRAY['VOO','IVV'], 100000,
    'privacy-test', 'dataset-test', NULL
  );

  -- Emulate a legacy row whose order differs from the canonical representation.
  UPDATE public.lead_submissions SET selected_etfs = ARRAY['VOO','IVV','VOO']
  WHERE request_id = v_request_id;
  v_retry := public.submit_lead(
    v_request_id, '  ' || upper(v_email) || '  ', v_email, ARRAY['IVV','VOO'], 100000,
    'privacy-test', 'dataset-test', 'a-different-session'
  );
  IF v_retry->>'submission_id' IS DISTINCT FROM v_first->>'submission_id'
     OR v_retry->>'is_duplicate_request' IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Matching retry was not idempotent';
  END IF;

  FOR v_case IN 1..5 LOOP
    BEGIN
      PERFORM public.submit_lead(
        v_request_id,
        CASE WHEN v_case = 1 THEN 'different-' || v_email ELSE v_email END,
        CASE WHEN v_case = 1 THEN 'different-' || v_email ELSE v_email END,
        CASE WHEN v_case = 2 THEN ARRAY['SPY'] ELSE ARRAY['VOO','IVV'] END,
        CASE WHEN v_case = 3 THEN 250000 ELSE 100000 END,
        CASE WHEN v_case = 4 THEN 'changed-privacy' ELSE 'privacy-test' END,
        CASE WHEN v_case = 5 THEN 'changed-dataset' ELSE 'dataset-test' END,
        NULL
      );
      RAISE EXCEPTION 'Changed payload case % was accepted', v_case;
    EXCEPTION WHEN SQLSTATE 'PT409' THEN
      v_conflicts := v_conflicts + 1;
    END;
  END LOOP;

  IF v_conflicts <> 5 THEN RAISE EXCEPTION 'Some fields were not checked'; END IF;
  IF (SELECT count(*) FROM public.lead_submissions WHERE request_id = v_request_id) <> 1 THEN
    RAISE EXCEPTION 'Duplicate submission created';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.lead_submissions s JOIN public.leads l ON l.id = s.lead_id
    WHERE s.request_id = v_request_id AND s.position_value_czk = 100000
      AND s.selected_etfs = ARRAY['VOO','IVV','VOO']
      AND s.privacy_version = 'privacy-test' AND s.dataset_version = 'dataset-test'
      AND s.analytics_session_id IS NULL AND l.normalized_email = v_email
  ) THEN RAISE EXCEPTION 'A conflicting retry changed the original payload'; END IF;
  IF EXISTS (SELECT 1 FROM public.leads WHERE normalized_email = 'different-' || v_email) THEN
    RAISE EXCEPTION 'A conflicting retry created a contact';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_locks
    WHERE pid = pg_backend_pid() AND locktype = 'advisory' AND granted
  ) THEN RAISE EXCEPTION 'Request lock was not held until transaction end'; END IF;

  IF has_function_privilege('anon',
    'public.submit_lead(text,text,text,text[],numeric,text,text,text)', 'EXECUTE')
    OR has_function_privilege('authenticated',
    'public.submit_lead(text,text,text,text[],numeric,text,text,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Public role can execute privileged function';
  END IF;
END;
$$;

SELECT 'matching replay, normalization, five conflicts, unchanged records and permissions passed' AS result;
ROLLBACK;
