-- Synthetic fixtures and every cleanup mutation are rolled back.
BEGIN;
DO $$
DECLARE
  old_id uuid := gen_random_uuid();
  new_id uuid := gen_random_uuid();
  v_session_id text := gen_random_uuid()::text;
  old_email text := gen_random_uuid()::text || '@example.com';
  result jsonb;
BEGIN
  INSERT INTO public.leads(id,email,normalized_email,created_at) VALUES
    (old_id,old_email,old_email,now()-interval '35 days'),
    (new_id,gen_random_uuid()::text||'@example.com',gen_random_uuid()::text||'@example.com',now());
  INSERT INTO public.lead_submissions(request_id,lead_id,selected_etfs,position_value_czk,privacy_version,dataset_version,created_at)
    VALUES(gen_random_uuid()::text,old_id,ARRAY['VOO'],100000,'test','test',now()-interval '35 days');
  INSERT INTO public.analytics_sessions(id,consent_version,is_active,created_at,expires_at)
    VALUES(v_session_id,'test',false,now()-interval '35 days',now()-interval '34 days');
  INSERT INTO public.analytics_events(event_id,session_id,event_name,server_timestamp)
    VALUES(gen_random_uuid()::text,v_session_id,'landing_observed',now()-interval '35 days');
  result := public.cleanup_project_data(30,true,NULL);
  IF (result->>'leadsDeleted')::int < 1 OR NOT EXISTS(SELECT 1 FROM public.leads WHERE id=old_id) THEN
    RAISE EXCEPTION 'Preview mutated records or missed the fixture';
  END IF;
  -- An error after the function call rolls back every deletion in the subtransaction.
  BEGIN
    PERFORM public.cleanup_project_data(30,false,old_email);
    RAISE EXCEPTION USING ERRCODE='P0999', MESSAGE='forced test rollback';
  EXCEPTION WHEN SQLSTATE 'P0999' THEN NULL;
  END;
  IF NOT EXISTS(SELECT 1 FROM public.leads WHERE id=old_id)
     OR NOT EXISTS(SELECT 1 FROM public.lead_submissions WHERE lead_id=old_id) THEN
    RAISE EXCEPTION 'Cleanup did not participate in transaction rollback';
  END IF;
  result := public.cleanup_project_data(30,false,old_email);
  IF result->>'leadsDeleted' <> '1' OR result->>'submissionsDeleted' <> '1'
     OR result->>'eventsDeleted' <> '0' OR result->>'sessionsDeleted' <> '0'
     OR NOT EXISTS(SELECT 1 FROM public.analytics_sessions WHERE id=v_session_id) THEN
    RAISE EXCEPTION 'Targeted deletion touched unrelated data or returned false counts';
  END IF;
  PERFORM public.cleanup_project_data(30,false,NULL);
  IF NOT EXISTS(SELECT 1 FROM public.leads WHERE id=new_id) THEN RAISE EXCEPTION 'Fresh contact deleted'; END IF;
  IF EXISTS(SELECT 1 FROM public.analytics_sessions s WHERE s.id=v_session_id) THEN RAISE EXCEPTION 'Expired session retained'; END IF;
  IF has_function_privilege('anon','public.cleanup_project_data(integer,boolean,text)','EXECUTE')
    OR has_function_privilege('authenticated','public.cleanup_project_data(integer,boolean,text)','EXECUTE') THEN
    RAISE EXCEPTION 'Public role can clean data';
  END IF;
END;
$$;
SELECT 'preview, targeted scope, actual counts, transaction rollback, retention and permissions passed' AS result;
ROLLBACK;
