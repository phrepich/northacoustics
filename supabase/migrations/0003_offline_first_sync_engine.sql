do $$
begin
  if not exists (select 1 from pg_type where typname = 'sync_status') then
    create type public.sync_status as enum ('pending', 'running', 'synced', 'failed', 'conflict', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'sync_conflict_policy') then
    create type public.sync_conflict_policy as enum ('server-wins', 'client-wins', 'latest-version', 'manual');
  end if;
  if not exists (select 1 from pg_type where typname = 'sync_conflict_reason') then
    create type public.sync_conflict_reason as enum (
      'simultaneous-edit',
      'remote-deleted',
      'local-deleted',
      'incompatible-change',
      'photo-conflict',
      'file-conflict'
    );
  end if;
end $$;

create or replace function public.ensure_sync_columns(target_table regclass)
returns void
language plpgsql
as $$
begin
  execute format('alter table %s add column if not exists version integer not null default 1', target_table);
  execute format('alter table %s add column if not exists updated_at timestamptz not null default timezone(''utc'', now())', target_table);
  execute format('alter table %s add column if not exists updated_by uuid references public.users(id)', target_table);
  execute format('alter table %s add column if not exists device_id text', target_table);
  execute format('alter table %s add column if not exists sync_version bigint not null default 0', target_table);
  execute format('alter table %s add column if not exists sync_status public.sync_status not null default ''synced''', target_table);
  execute format('alter table %s add column if not exists deleted_at timestamptz', target_table);
end;
$$;

select public.ensure_sync_columns('public.clients');
select public.ensure_sync_columns('public.projects');
select public.ensure_sync_columns('public.measurement_points');
select public.ensure_sync_columns('public.measurements');
select public.ensure_sync_columns('public.environmental_conditions');
select public.ensure_sync_columns('public.photos');
select public.ensure_sync_columns('public.equipment');
select public.ensure_sync_columns('public.calibration_records');
select public.ensure_sync_columns('public.checklists');
select public.ensure_sync_columns('public.signatures');
select public.ensure_sync_columns('public.generated_reports');

drop function if exists public.ensure_sync_columns(regclass);

create table if not exists public.sync_operations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  operation text not null,
  entity text not null,
  entity_id uuid,
  idempotency_key text not null,
  user_id uuid references public.users(id),
  device_id text,
  priority integer not null default 0,
  attempts integer not null default 0,
  status public.sync_status not null default 'pending',
  last_error text,
  last_attempt_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, idempotency_key)
);

create table if not exists public.sync_conflicts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  entity text not null,
  entity_id uuid,
  reason public.sync_conflict_reason not null,
  policy public.sync_conflict_policy not null default 'manual',
  local_version integer not null,
  remote_version integer,
  local_payload jsonb not null default '{}'::jsonb,
  remote_payload jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  resolution text,
  decision_by uuid references public.users(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sync_telemetry (
  id bigserial primary key,
  organization_id uuid references public.organizations(id),
  user_id uuid references public.users(id),
  device_id text,
  average_duration_ms integer not null default 0,
  pending_operations integer not null default 0,
  successful_operations integer not null default 0,
  failed_operations integer not null default 0,
  conflicts_detected integer not null default 0,
  conflicts_resolved integer not null default 0,
  retry_count integer not null default 0,
  synced_bytes bigint not null default 0,
  pending_photos integer not null default 0,
  local_storage_bytes bigint not null default 0,
  captured_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_sync_operations_organization_status on public.sync_operations(organization_id, status);
create index if not exists idx_sync_operations_idempotency on public.sync_operations(idempotency_key);
create index if not exists idx_sync_conflicts_organization_entity on public.sync_conflicts(organization_id, entity, entity_id);
create index if not exists idx_sync_telemetry_organization_device on public.sync_telemetry(organization_id, device_id, captured_at desc);

create or replace function public.touch_sync_metadata()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.updated_at := timezone('utc', now());
    new.version := greatest(coalesce(old.version, 0), coalesce(new.version, 0)) + 1;
    new.sync_version := greatest(coalesce(old.sync_version, 0), coalesce(new.sync_version, 0));
  end if;

  if new.sync_status is null then
    new.sync_status := 'synced';
  end if;

  return new;
end;
$$;

drop trigger if exists touch_sync_clients on public.clients;
drop trigger if exists touch_sync_projects on public.projects;
drop trigger if exists touch_sync_points on public.measurement_points;
drop trigger if exists touch_sync_measurements on public.measurements;
drop trigger if exists touch_sync_conditions on public.environmental_conditions;
drop trigger if exists touch_sync_photos on public.photos;
drop trigger if exists touch_sync_equipment on public.equipment;
drop trigger if exists touch_sync_calibrations on public.calibration_records;
drop trigger if exists touch_sync_checklists on public.checklists;
drop trigger if exists touch_sync_signatures on public.signatures;
drop trigger if exists touch_sync_reports on public.generated_reports;

create trigger touch_sync_clients before update on public.clients for each row execute procedure public.touch_sync_metadata();
create trigger touch_sync_projects before update on public.projects for each row execute procedure public.touch_sync_metadata();
create trigger touch_sync_points before update on public.measurement_points for each row execute procedure public.touch_sync_metadata();
create trigger touch_sync_measurements before update on public.measurements for each row execute procedure public.touch_sync_metadata();
create trigger touch_sync_conditions before update on public.environmental_conditions for each row execute procedure public.touch_sync_metadata();
create trigger touch_sync_photos before update on public.photos for each row execute procedure public.touch_sync_metadata();
create trigger touch_sync_equipment before update on public.equipment for each row execute procedure public.touch_sync_metadata();
create trigger touch_sync_calibrations before update on public.calibration_records for each row execute procedure public.touch_sync_metadata();
create trigger touch_sync_checklists before update on public.checklists for each row execute procedure public.touch_sync_metadata();
create trigger touch_sync_signatures before update on public.signatures for each row execute procedure public.touch_sync_metadata();
create trigger touch_sync_reports before update on public.generated_reports for each row execute procedure public.touch_sync_metadata();

alter table public.sync_operations enable row level security;
alter table public.sync_conflicts enable row level security;
alter table public.sync_telemetry enable row level security;

create policy "sync operations tenant access" on public.sync_operations for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));

create policy "sync conflicts tenant access" on public.sync_conflicts for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));

create policy "sync telemetry tenant access" on public.sync_telemetry for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));
