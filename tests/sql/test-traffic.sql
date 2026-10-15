begin;
set local role service_role;
do $$
declare
  demo_lead uuid := gen_random_uuid();
  normal_lead uuid := gen_random_uuid();
  demo_session text := gen_random_uuid()::text;
  early_session text := gen_random_uuid()::text;
  late_session text := gen_random_uuid()::text;
  normal_session text := gen_random_uuid()::text;
  demo_request text := gen_random_uuid()::text;
  normal_request text := gen_random_uuid()::text;
  preview jsonb;
begin
  insert into public.leads(id,email,normalized_email) values
    (demo_lead,'cohort-fixture@example.com','cohort-fixture@example.com'),
    (normal_lead,'cohort-fixture@unit.localhost','cohort-fixture@unit.localhost');
  insert into public.analytics_sessions(id,consent_version,expires_at) values
    (demo_session,'fixture',now()+interval '30 minutes'),(early_session,'fixture',now()+interval '30 minutes'),
    (late_session,'fixture',now()+interval '30 minutes'),(normal_session,'fixture',now()+interval '30 minutes');
  insert into public.analytics_events(event_id,session_id,event_name,properties)
    values(gen_random_uuid()::text,early_session,'form_submit_attempted',jsonb_build_object('requestId',demo_request));
  insert into public.lead_submissions(request_id,lead_id,selected_etfs,position_value_czk,privacy_version,dataset_version,analytics_session_id) values
    (demo_request,demo_lead,array['IVV'],250000,'fixture','fixture',demo_session),
    (normal_request,normal_lead,array['VOO'],100000,'fixture','fixture',normal_session);
  if not (select is_test from public.lead_submissions where request_id=demo_request)
    or not (select is_test from public.analytics_sessions where id=early_session)
    or not (select is_test from public.analytics_sessions where id=demo_session)
    or (select is_test from public.lead_submissions where request_id=normal_request) then
    raise exception 'classification or early split propagation failed';
  end if;
  insert into public.analytics_events(event_id,session_id,event_name,properties)
    values(gen_random_uuid()::text,late_session,'form_submit_attempted',jsonb_build_object('requestId',demo_request));
  if not (select is_test from public.analytics_sessions where id=late_session) then raise exception 'late event failed'; end if;
  preview := public.mark_test_traffic(null,normal_session,true);
  if (preview->>'submissionsMatched')::int <> 1 or (select is_test from public.analytics_sessions where id=normal_session)
    then raise exception 'preview mutated data or wrong count'; end if;
  perform public.mark_test_traffic(null,normal_session,false);
  if not (select is_test from public.lead_submissions where request_id=normal_request)
    or not (select is_test from public.analytics_sessions where id=normal_session) then raise exception 'manual classification failed'; end if;
  if has_function_privilege('anon','public.mark_test_traffic(text,text,boolean)','EXECUTE')
    or has_function_privilege('authenticated','public.mark_test_traffic(text,text,boolean)','EXECUTE') then raise exception 'public classification access'; end if;
end;
$$;
rollback;
select 'test traffic SQL passed; fixture writes rolled back' as result;
