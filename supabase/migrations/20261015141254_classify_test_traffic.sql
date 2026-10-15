-- Private server-side classification. Existing RLS and grants remain unchanged.
alter table public.lead_submissions add column is_test boolean not null default false;
alter table public.analytics_sessions add column is_test boolean not null default false;

create index idx_events_attempt_request_id
  on public.analytics_events ((properties->>'requestId'))
  where event_name = 'form_submit_attempted';

create function public.is_demo_email(value text) returns boolean
language sql immutable strict security invoker set search_path = '' as $$
  select pg_catalog.lower(pg_catalog.split_part(value, '@', 2)) in ('example.com','example.net','example.org','test','invalid')
    or pg_catalog.lower(pg_catalog.split_part(value, '@', 2)) like '%.test'
    or pg_catalog.lower(pg_catalog.split_part(value, '@', 2)) like '%.invalid';
$$;

create function public.classify_test_submission() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.is_test := new.is_test or coalesce((
    select public.is_demo_email(l.normalized_email) from public.leads l where l.id = new.lead_id
  ), false) or exists(select 1 from public.analytics_sessions a where a.id = new.analytics_session_id and a.is_test);
  if new.is_test then
    update public.analytics_sessions set is_test = true
    where not is_test and (id = new.analytics_session_id or id in (
      select e.session_id from public.analytics_events e
      where e.event_name = 'form_submit_attempted' and e.properties->>'requestId' = new.request_id
    ));
  end if;
  return new;
end;
$$;

create trigger classify_test_submission
before insert or update on public.lead_submissions
for each row execute function public.classify_test_submission();

create function public.classify_test_event() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.event_name = 'form_submit_attempted' and exists (
    select 1 from public.lead_submissions s
    where s.request_id = new.properties->>'requestId' and s.is_test
  ) then
    update public.analytics_sessions set is_test = true where id = new.session_id and not is_test;
  end if;
  return new;
end;
$$;

create trigger classify_test_event after insert or update on public.analytics_events
for each row execute function public.classify_test_event();

revoke all on function public.is_demo_email(text) from public, anon, authenticated;
revoke all on function public.classify_test_submission() from public, anon, authenticated;
revoke all on function public.classify_test_event() from public, anon, authenticated;
grant execute on function public.is_demo_email(text) to service_role;
grant execute on function public.classify_test_submission() to service_role;
grant execute on function public.classify_test_event() to service_role;

-- Reserved example domains only. No personal addresses or generated IDs in migrations.
update public.lead_submissions s set is_test = true
from public.leads l where l.id = s.lead_id and public.is_demo_email(l.normalized_email) and not s.is_test;

create function public.mark_test_traffic(p_request_id text default null, p_session_id text default null, p_dry_run boolean default true)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  related_sessions text[];
  submission_count integer;
  session_count integer;
begin
  if (p_request_id is null) = (p_session_id is null) or p_dry_run is null
    or coalesce(pg_catalog.length(p_request_id),1) not between 1 and 200
    or coalesce(pg_catalog.length(p_session_id),1) not between 1 and 200 then
    raise exception 'INVALID_TEST_TRAFFIC_TARGET';
  end if;
  with targets as (
    select request_id, analytics_session_id from public.lead_submissions
    where request_id = p_request_id or analytics_session_id = p_session_id
  ), related as (
    select analytics_session_id as id from targets
    union select e.session_id from public.analytics_events e join targets t on t.request_id = e.properties->>'requestId'
      where e.event_name = 'form_submit_attempted'
    union select p_session_id
  ) select coalesce(pg_catalog.array_agg(id) filter(where id is not null),array[]::text[]) into related_sessions from related;
  select count(*) into submission_count from public.lead_submissions
    where request_id = p_request_id or analytics_session_id = any(related_sessions);
  select count(*) into session_count from public.analytics_sessions where id = any(related_sessions);
  if submission_count = 0 and session_count = 0 then raise exception 'TEST_TRAFFIC_TARGET_NOT_FOUND'; end if;
  if not p_dry_run then
    update public.lead_submissions set is_test = true
      where not is_test and (request_id = p_request_id or analytics_session_id = any(related_sessions));
    update public.analytics_sessions set is_test = true where not is_test and id = any(related_sessions);
  end if;
  return pg_catalog.jsonb_build_object('dryRun',p_dry_run,'submissionsMatched',submission_count,'sessionsMatched',session_count);
end;
$$;
revoke all on function public.mark_test_traffic(text,text,boolean) from public, anon, authenticated;
grant execute on function public.mark_test_traffic(text,text,boolean) to service_role;
