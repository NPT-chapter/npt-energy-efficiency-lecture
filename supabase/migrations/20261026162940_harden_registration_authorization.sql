create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $function$
  select coalesce(auth.uid() = _user_id, false)
    and exists (
      select 1
      from public.user_roles
      where user_id = _user_id and role = _role
    );
$function$;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

create or replace function public.hit_rate_limit(_key text, _max integer, _window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_window_start timestamptz;
  v_count integer;
begin
  if _key is null or length(_key) > 512 or _max < 0 or _window_seconds <= 0 then
    return false;
  end if;

  v_window_start := pg_catalog.to_timestamp(
    pg_catalog.floor(pg_catalog.date_part('epoch', pg_catalog.now()) / _window_seconds) * _window_seconds
  );

  insert into public.rate_limits as rl (key, window_start, count)
  values (_key, v_window_start, 1)
  on conflict (key, window_start)
  do update set count = rl.count + 1
  returning count into v_count;

  delete from public.rate_limits
  where window_start < pg_catalog.now() - interval '1 day';

  return v_count <= _max;
end;
$function$;

revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

revoke all on function public.rls_auto_enable() from public, anon, authenticated;
