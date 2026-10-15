-- Privileged callers already possess table rights; do not bypass RLS here.
CREATE OR REPLACE FUNCTION public.cleanup_project_data(
  p_older_than_days integer DEFAULT 30,
  p_dry_run boolean DEFAULT true,
  p_target_email text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_cutoff timestamptz;
  v_email text := lower(btrim(p_target_email));
  v_ids uuid[];
  v_leads bigint := 0;
  v_submissions bigint := 0;
  v_events bigint := 0;
  v_sessions bigint := 0;
  v_buckets bigint := 0;
BEGIN
  IF p_older_than_days IS NULL OR p_older_than_days < 1 OR p_older_than_days > 365
     OR p_dry_run IS NULL OR (p_target_email IS NOT NULL AND v_email = '') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_CLEANUP_OPTIONS';
  END IF;
  v_cutoff := now() - make_interval(days => p_older_than_days);
  IF NOT p_dry_run THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('etf.cleanup_project_data', 0));
    -- Lock parents before counting/deleting their children, including cascading rows.
    PERFORM id FROM public.leads
      WHERE (v_email IS NOT NULL AND normalized_email = v_email)
         OR (v_email IS NULL AND created_at < v_cutoff)
      ORDER BY id FOR UPDATE;
  END IF;
  SELECT coalesce(array_agg(id), ARRAY[]::uuid[]) INTO v_ids FROM public.leads
    WHERE (v_email IS NOT NULL AND normalized_email = v_email)
       OR (v_email IS NULL AND created_at < v_cutoff);
  IF p_dry_run THEN
    v_leads := cardinality(v_ids);
    SELECT count(*) INTO v_submissions FROM public.lead_submissions
      WHERE lead_id = ANY(v_ids) OR (v_email IS NULL AND created_at < v_cutoff);
    IF v_email IS NULL THEN
      SELECT count(*) INTO v_events FROM public.analytics_events WHERE server_timestamp < v_cutoff;
      SELECT count(*) INTO v_sessions FROM public.analytics_sessions WHERE created_at < v_cutoff;
      SELECT count(*) INTO v_buckets FROM public.rate_limit_buckets WHERE expires_at < now();
    END IF;
  ELSE
    DELETE FROM public.lead_submissions
      WHERE lead_id = ANY(v_ids) OR (v_email IS NULL AND created_at < v_cutoff);
    GET DIAGNOSTICS v_submissions = ROW_COUNT;
    DELETE FROM public.leads WHERE id = ANY(v_ids);
    GET DIAGNOSTICS v_leads = ROW_COUNT;
    IF v_email IS NULL THEN
      DELETE FROM public.analytics_events WHERE server_timestamp < v_cutoff;
      GET DIAGNOSTICS v_events = ROW_COUNT;
      DELETE FROM public.analytics_sessions WHERE created_at < v_cutoff;
      GET DIAGNOSTICS v_sessions = ROW_COUNT;
      DELETE FROM public.rate_limit_buckets WHERE expires_at < now();
      GET DIAGNOSTICS v_buckets = ROW_COUNT;
    END IF;
  END IF;
  RETURN jsonb_build_object('dryRun', p_dry_run, 'leadsDeleted', v_leads,
    'submissionsDeleted', v_submissions, 'eventsDeleted', v_events,
    'sessionsDeleted', v_sessions, 'rateLimitsDeleted', v_buckets);
END;
$$;
REVOKE ALL ON FUNCTION public.cleanup_project_data(integer, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_project_data(integer, boolean, text) TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('etf-retention-daily', '15 3 * * *',
  $job$SELECT public.cleanup_project_data(30, false, NULL);$job$);
-- Keep only this project's old scheduler history, not other projects' jobs.
SELECT cron.schedule('etf-retention-history', '30 3 * * *',
  $job$DELETE FROM cron.job_run_details
    WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname IN ('etf-retention-daily', 'etf-retention-history'))
      AND end_time < now() - interval '30 days';$job$);
