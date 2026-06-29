create extension if not exists pgcrypto;

create type public.project_status as enum ('pending', 'measured', 'reviewed', 'approved');
create type public.measurement_validity as enum ('valid', 'invalid');
create type public.photo_category as enum (
  'measurement_point',
  'emission_source',
  'surroundings',
  'installed_equipment',
  'complementary_evidence'
);
create type public.equipment_type as enum (
  'sound_level_meter',
  'calibrator',
  'microphone',
  'tripod',
  'accessory'
);
create type public.signature_entity_type as enum ('project', 'point', 'measurement', 'report');
create type public.report_status as enum ('draft', 'generated', 'approved');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  full_name text not null,
  phone text,
  signature_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_rut text not null,
  address text not null,
  contact_name text not null,
  contact_email text not null,
  phone text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid default auth.uid() references public.users(id),
  updated_by uuid default auth.uid() references public.users(id),
  deleted_at timestamptz
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id),
  name text not null,
  internal_code text not null unique,
  site_address text not null,
  district text not null,
  region text not null,
  visit_date date not null,
  professional_responsible text not null,
  study_objective text not null,
  report_type text not null,
  applicable_regulation text not null,
  general_notes text,
  status public.project_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid default auth.uid() references public.users(id),
  updated_by uuid default auth.uid() references public.users(id),
  deleted_at timestamptz
);

create table if not exists public.measurement_points (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  code text not null,
  latitude double precision not null,
  longitude double precision not null,
  photo_path text,
  environment_description text not null,
  sketch_reference text,
  land_use text,
  nearest_sensitive_receiver text,
  estimated_distance_to_source_m numeric(8,2),
  notes text,
  measured_at timestamptz not null default timezone('utc', now()),
  recorded_by uuid default auth.uid() references public.users(id),
  status public.project_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid default auth.uid() references public.users(id),
  updated_by uuid default auth.uid() references public.users(id),
  deleted_at timestamptz
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  point_id uuid not null references public.measurement_points(id) on delete cascade,
  measurement_type text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_minutes integer not null,
  laeq numeric(8,2) not null,
  lmax numeric(8,2) not null,
  lmin numeric(8,2) not null,
  l10 numeric(8,2),
  l50 numeric(8,2),
  l90 numeric(8,2),
  weighting text not null,
  equipment_response text not null,
  equipment_name text not null,
  sound_level_meter_code text not null,
  serial_number text not null,
  calibrator_name text not null,
  initial_calibration numeric(6,2) not null,
  final_calibration numeric(6,2) not null,
  validity public.measurement_validity not null default 'valid',
  technical_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid default auth.uid() references public.users(id),
  updated_by uuid default auth.uid() references public.users(id),
  deleted_at timestamptz
);

create table if not exists public.environmental_conditions (
  id uuid primary key default gen_random_uuid(),
  measurement_id uuid not null unique references public.measurements(id) on delete cascade,
  temperature_c numeric(6,2),
  relative_humidity numeric(6,2),
  wind_speed_ms numeric(6,2),
  cloudiness text,
  weather_state text,
  weather_notes text,
  external_evidence text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid default auth.uid() references public.users(id),
  updated_by uuid default auth.uid() references public.users(id)
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  point_id uuid references public.measurement_points(id) on delete cascade,
  measurement_id uuid references public.measurements(id) on delete cascade,
  category public.photo_category not null,
  storage_path text not null,
  taken_at timestamptz not null default timezone('utc', now()),
  captured_by uuid default auth.uid() references public.users(id),
  latitude double precision,
  longitude double precision,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid default auth.uid() references public.users(id),
  updated_by uuid default auth.uid() references public.users(id),
  deleted_at timestamptz
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  type public.equipment_type not null,
  brand text not null,
  model text not null,
  serial_number text not null unique,
  calibration_certificate_path text,
  calibration_due_date date,
  attachment_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid default auth.uid() references public.users(id),
  updated_by uuid default auth.uid() references public.users(id),
  deleted_at timestamptz
);

create table if not exists public.calibration_records (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  certificate_number text,
  calibration_date date not null,
  expiration_date date not null,
  laboratory_name text,
  document_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid default auth.uid() references public.users(id),
  updated_by uuid default auth.uid() references public.users(id)
);

create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  point_id uuid references public.measurement_points(id) on delete cascade,
  measurement_id uuid references public.measurements(id) on delete cascade,
  technician_id uuid default auth.uid() references public.users(id),
  items jsonb not null default '[]'::jsonb,
  technician_confirmation text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid default auth.uid() references public.users(id),
  updated_by uuid default auth.uid() references public.users(id),
  deleted_at timestamptz
);

create table if not exists public.signatures (
  id uuid primary key default gen_random_uuid(),
  entity_type public.signature_entity_type not null,
  entity_id uuid not null,
  signed_by uuid default auth.uid() references public.users(id),
  signature_label text not null,
  signature_path text,
  signed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid default auth.uid() references public.users(id)
);

create table if not exists public.generated_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version integer not null,
  status public.report_status not null default 'draft',
  file_type text not null default 'html',
  storage_path text,
  payload_snapshot jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default timezone('utc', now()),
  generated_by uuid default auth.uid() references public.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (project_id, version)
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_id uuid references public.users(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  diff jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_projects_client_id on public.projects(client_id);
create index if not exists idx_projects_visit_date on public.projects(visit_date);
create index if not exists idx_points_project_id on public.measurement_points(project_id);
create index if not exists idx_measurements_point_id on public.measurements(point_id);
create index if not exists idx_photos_project_id on public.photos(project_id);
create index if not exists idx_reports_project_id on public.generated_reports(project_id);

create trigger set_users_updated_at before update on public.users
for each row execute procedure public.set_updated_at();

create trigger set_clients_updated_at before update on public.clients
for each row execute procedure public.set_updated_at();

create trigger set_projects_updated_at before update on public.projects
for each row execute procedure public.set_updated_at();

create trigger set_points_updated_at before update on public.measurement_points
for each row execute procedure public.set_updated_at();

create trigger set_measurements_updated_at before update on public.measurements
for each row execute procedure public.set_updated_at();

create trigger set_environmental_conditions_updated_at before update on public.environmental_conditions
for each row execute procedure public.set_updated_at();

create trigger set_photos_updated_at before update on public.photos
for each row execute procedure public.set_updated_at();

create trigger set_equipment_updated_at before update on public.equipment
for each row execute procedure public.set_updated_at();

create trigger set_calibration_records_updated_at before update on public.calibration_records
for each row execute procedure public.set_updated_at();

create trigger set_checklists_updated_at before update on public.checklists
for each row execute procedure public.set_updated_at();

create trigger set_generated_reports_updated_at before update on public.generated_reports
for each row execute procedure public.set_updated_at();

create or replace function public.current_user_role_code()
returns text
language sql
stable
as $$
  select r.code
  from public.users u
  join public.roles r on r.id = u.role_id
  where u.id = auth.uid()
$$;

create or replace function public.is_reviewer_or_higher()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role_code() in ('reviewer', 'supervisor'), false)
$$;

create or replace function public.is_supervisor_or_higher()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role_code() = 'supervisor', false)
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
as $$
declare
  subject_id uuid;
begin
  if tg_op = 'DELETE' then
    subject_id := old.id;
  else
    subject_id := new.id;
  end if;

  insert into public.audit_logs (actor_id, entity_type, entity_id, action, diff)
  values (
    auth.uid(),
    tg_table_name,
    subject_id,
    lower(tg_op),
    case
      when tg_op = 'DELETE' then jsonb_build_object('old', to_jsonb(old))
      when tg_op = 'INSERT' then jsonb_build_object('new', to_jsonb(new))
      else jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
    end
  );

  return coalesce(new, old);
end;
$$;

create trigger audit_clients after insert or update or delete on public.clients
for each row execute procedure public.write_audit_log();

create trigger audit_projects after insert or update or delete on public.projects
for each row execute procedure public.write_audit_log();

create trigger audit_measurement_points after insert or update or delete on public.measurement_points
for each row execute procedure public.write_audit_log();

create trigger audit_measurements after insert or update or delete on public.measurements
for each row execute procedure public.write_audit_log();

create trigger audit_generated_reports after insert or update or delete on public.generated_reports
for each row execute procedure public.write_audit_log();

insert into public.roles (code, name)
values
  ('technician', 'Técnico de terreno'),
  ('reviewer', 'Revisor / administrador'),
  ('supervisor', 'Supervisor / gerente')
on conflict (code) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  technician_role uuid;
begin
  select id into technician_role from public.roles where code = 'technician' limit 1;

  insert into public.users (id, role_id, full_name)
  values (
    new.id,
    technician_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.measurement_points enable row level security;
alter table public.measurements enable row level security;
alter table public.environmental_conditions enable row level security;
alter table public.photos enable row level security;
alter table public.equipment enable row level security;
alter table public.calibration_records enable row level security;
alter table public.checklists enable row level security;
alter table public.signatures enable row level security;
alter table public.generated_reports enable row level security;
alter table public.audit_logs enable row level security;

create policy "roles readable by authenticated"
on public.roles for select
to authenticated
using (true);

create policy "users read self or reviewer"
on public.users for select
to authenticated
using (id = auth.uid() or public.is_reviewer_or_higher());

create policy "users update self or reviewer"
on public.users for update
to authenticated
using (id = auth.uid() or public.is_reviewer_or_higher())
with check (id = auth.uid() or public.is_reviewer_or_higher());

create policy "clients readable"
on public.clients for select
to authenticated
using (deleted_at is null);

create policy "clients insert"
on public.clients for insert
to authenticated
with check (auth.uid() is not null);

create policy "clients update"
on public.clients for update
to authenticated
using (created_by = auth.uid() or public.is_reviewer_or_higher())
with check (created_by = auth.uid() or public.is_reviewer_or_higher());

create policy "projects readable"
on public.projects for select
to authenticated
using (deleted_at is null);

create policy "projects insert"
on public.projects for insert
to authenticated
with check (auth.uid() is not null);

create policy "projects update"
on public.projects for update
to authenticated
using (created_by = auth.uid() or public.is_reviewer_or_higher())
with check (created_by = auth.uid() or public.is_reviewer_or_higher());

create policy "points readable"
on public.measurement_points for select
to authenticated
using (deleted_at is null);

create policy "points insert"
on public.measurement_points for insert
to authenticated
with check (auth.uid() is not null);

create policy "points update"
on public.measurement_points for update
to authenticated
using (created_by = auth.uid() or public.is_reviewer_or_higher())
with check (created_by = auth.uid() or public.is_reviewer_or_higher());

create policy "measurements readable"
on public.measurements for select
to authenticated
using (deleted_at is null);

create policy "measurements insert"
on public.measurements for insert
to authenticated
with check (auth.uid() is not null);

create policy "measurements update"
on public.measurements for update
to authenticated
using (created_by = auth.uid() or public.is_reviewer_or_higher())
with check (created_by = auth.uid() or public.is_reviewer_or_higher());

create policy "environmental_conditions readable"
on public.environmental_conditions for select
to authenticated
using (true);

create policy "environmental_conditions write"
on public.environmental_conditions for all
to authenticated
using (public.is_reviewer_or_higher() or created_by = auth.uid())
with check (public.is_reviewer_or_higher() or created_by = auth.uid() or auth.uid() is not null);

create policy "photos readable"
on public.photos for select
to authenticated
using (deleted_at is null);

create policy "photos write"
on public.photos for all
to authenticated
using (public.is_reviewer_or_higher() or created_by = auth.uid())
with check (public.is_reviewer_or_higher() or created_by = auth.uid() or auth.uid() is not null);

create policy "equipment readable"
on public.equipment for select
to authenticated
using (deleted_at is null);

create policy "equipment managed by reviewer"
on public.equipment for all
to authenticated
using (public.is_reviewer_or_higher())
with check (public.is_reviewer_or_higher());

create policy "calibration_records readable"
on public.calibration_records for select
to authenticated
using (true);

create policy "calibration_records managed by reviewer"
on public.calibration_records for all
to authenticated
using (public.is_reviewer_or_higher())
with check (public.is_reviewer_or_higher());

create policy "checklists readable"
on public.checklists for select
to authenticated
using (deleted_at is null);

create policy "checklists write"
on public.checklists for all
to authenticated
using (public.is_reviewer_or_higher() or created_by = auth.uid())
with check (public.is_reviewer_or_higher() or created_by = auth.uid() or auth.uid() is not null);

create policy "signatures readable"
on public.signatures for select
to authenticated
using (true);

create policy "signatures insert"
on public.signatures for insert
to authenticated
with check (auth.uid() is not null);

create policy "reports readable"
on public.generated_reports for select
to authenticated
using (deleted_at is null);

create policy "reports write by authenticated"
on public.generated_reports for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "audit readable by reviewer"
on public.audit_logs for select
to authenticated
using (public.is_reviewer_or_higher());

insert into storage.buckets (id, name, public)
values
  ('project-photos', 'project-photos', false),
  ('equipment-docs', 'equipment-docs', false),
  ('generated-reports', 'generated-reports', false)
on conflict (id) do nothing;

create policy "authenticated read photos bucket"
on storage.objects for select
to authenticated
using (bucket_id in ('project-photos', 'equipment-docs', 'generated-reports'));

create policy "authenticated upload project media"
on storage.objects for insert
to authenticated
with check (bucket_id in ('project-photos', 'equipment-docs', 'generated-reports'));
