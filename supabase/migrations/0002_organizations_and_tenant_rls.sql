-- Sprint 1: introduce tenant isolation without changing existing application payloads.
-- Existing data is assigned to the initial NorthAcoustics organization. New rows receive
-- their organization from the authenticated member or from their parent record.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (organization_id, user_id)
);

insert into public.organizations (slug, name)
values ('northacoustics', 'NorthAcoustics')
on conflict (slug) do nothing;

insert into public.organization_members (organization_id, user_id)
select organization.id, app_user.id
from public.organizations organization
cross join public.users app_user
where organization.slug = 'northacoustics'
on conflict (organization_id, user_id) do nothing;

alter table public.clients add column if not exists organization_id uuid references public.organizations(id);
alter table public.projects add column if not exists organization_id uuid references public.organizations(id);
alter table public.measurement_points add column if not exists organization_id uuid references public.organizations(id);
alter table public.measurements add column if not exists organization_id uuid references public.organizations(id);
alter table public.environmental_conditions add column if not exists organization_id uuid references public.organizations(id);
alter table public.photos add column if not exists organization_id uuid references public.organizations(id);
alter table public.equipment add column if not exists organization_id uuid references public.organizations(id);
alter table public.calibration_records add column if not exists organization_id uuid references public.organizations(id);
alter table public.checklists add column if not exists organization_id uuid references public.organizations(id);
alter table public.signatures add column if not exists organization_id uuid references public.organizations(id);
alter table public.generated_reports add column if not exists organization_id uuid references public.organizations(id);
alter table public.audit_logs add column if not exists organization_id uuid references public.organizations(id);

with default_organization as (
  select id from public.organizations where slug = 'northacoustics'
)
update public.clients set organization_id = (select id from default_organization) where organization_id is null;

update public.projects project
set organization_id = client.organization_id
from public.clients client
where project.client_id = client.id and project.organization_id is null;

update public.measurement_points point
set organization_id = project.organization_id
from public.projects project
where point.project_id = project.id and point.organization_id is null;

update public.measurements measurement
set organization_id = point.organization_id
from public.measurement_points point
where measurement.point_id = point.id and measurement.organization_id is null;

update public.environmental_conditions condition
set organization_id = measurement.organization_id
from public.measurements measurement
where condition.measurement_id = measurement.id and condition.organization_id is null;

update public.photos photo
set organization_id = project.organization_id
from public.projects project
where photo.project_id = project.id and photo.organization_id is null;

with default_organization as (
  select id from public.organizations where slug = 'northacoustics'
)
update public.equipment set organization_id = (select id from default_organization) where organization_id is null;

update public.calibration_records calibration
set organization_id = equipment.organization_id
from public.equipment equipment
where calibration.equipment_id = equipment.id and calibration.organization_id is null;

update public.checklists checklist
set organization_id = project.organization_id
from public.projects project
where checklist.project_id = project.id and checklist.organization_id is null;

update public.generated_reports report
set organization_id = project.organization_id
from public.projects project
where report.project_id = project.id and report.organization_id is null;

with default_organization as (
  select id from public.organizations where slug = 'northacoustics'
)
update public.signatures set organization_id = (select id from default_organization) where organization_id is null;

with default_organization as (
  select id from public.organizations where slug = 'northacoustics'
)
update public.audit_logs set organization_id = (select id from default_organization) where organization_id is null;

alter table public.clients alter column organization_id set not null;
alter table public.projects alter column organization_id set not null;
alter table public.measurement_points alter column organization_id set not null;
alter table public.measurements alter column organization_id set not null;
alter table public.environmental_conditions alter column organization_id set not null;
alter table public.photos alter column organization_id set not null;
alter table public.equipment alter column organization_id set not null;
alter table public.calibration_records alter column organization_id set not null;
alter table public.checklists alter column organization_id set not null;
alter table public.signatures alter column organization_id set not null;
alter table public.generated_reports alter column organization_id set not null;
alter table public.audit_logs alter column organization_id set not null;

create index if not exists idx_organization_members_user_id on public.organization_members(user_id);
create index if not exists idx_clients_organization_id on public.clients(organization_id);
create index if not exists idx_projects_organization_id on public.projects(organization_id);
create index if not exists idx_points_organization_id on public.measurement_points(organization_id);
create index if not exists idx_measurements_organization_id on public.measurements(organization_id);
create index if not exists idx_photos_organization_id on public.photos(organization_id);
create index if not exists idx_reports_organization_id on public.generated_reports(organization_id);

create or replace function public.has_organization_access(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.is_active = true
  );
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select membership.organization_id
  from public.organization_members membership
  where membership.user_id = auth.uid()
    and membership.is_active = true
  order by membership.created_at
  limit 1;
$$;

create or replace function public.assign_organization_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.organization_id is not null then
    return new;
  end if;

  case tg_table_name
    when 'clients', 'equipment', 'signatures', 'audit_logs' then
      new.organization_id := public.current_organization_id();
    when 'projects' then
      select organization_id into new.organization_id from public.clients where id = new.client_id;
    when 'measurement_points' then
      select organization_id into new.organization_id from public.projects where id = new.project_id;
    when 'measurements' then
      select organization_id into new.organization_id from public.measurement_points where id = new.point_id;
    when 'environmental_conditions' then
      select organization_id into new.organization_id from public.measurements where id = new.measurement_id;
    when 'photos', 'checklists', 'generated_reports' then
      select organization_id into new.organization_id from public.projects where id = new.project_id;
    when 'calibration_records' then
      select organization_id into new.organization_id from public.equipment where id = new.equipment_id;
  end case;

  if new.organization_id is null then
    raise exception 'Unable to assign an organization to %.%', tg_table_name, coalesce(new.id::text, 'new');
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  technician_role uuid;
  default_organization uuid;
begin
  select id into technician_role from public.roles where code = 'technician' limit 1;
  select id into default_organization from public.organizations where slug = 'northacoustics' limit 1;

  insert into public.users (id, role_id, full_name)
  values (
    new.id,
    technician_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.organization_members (organization_id, user_id)
  values (default_organization, new.id)
  on conflict (organization_id, user_id) do nothing;

  return new;
end;
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  subject_id uuid;
  subject_organization_id uuid;
begin
  if tg_op = 'DELETE' then
    subject_id := old.id;
    subject_organization_id := old.organization_id;
  else
    subject_id := new.id;
    subject_organization_id := new.organization_id;
  end if;

  insert into public.audit_logs (organization_id, actor_id, entity_type, entity_id, action, diff)
  values (
    subject_organization_id,
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

drop trigger if exists assign_organization_clients on public.clients;
drop trigger if exists assign_organization_projects on public.projects;
drop trigger if exists assign_organization_points on public.measurement_points;
drop trigger if exists assign_organization_measurements on public.measurements;
drop trigger if exists assign_organization_conditions on public.environmental_conditions;
drop trigger if exists assign_organization_photos on public.photos;
drop trigger if exists assign_organization_equipment on public.equipment;
drop trigger if exists assign_organization_calibrations on public.calibration_records;
drop trigger if exists assign_organization_checklists on public.checklists;
drop trigger if exists assign_organization_signatures on public.signatures;
drop trigger if exists assign_organization_reports on public.generated_reports;
drop trigger if exists assign_organization_audit_logs on public.audit_logs;

create trigger assign_organization_clients before insert on public.clients for each row execute procedure public.assign_organization_id();
create trigger assign_organization_projects before insert on public.projects for each row execute procedure public.assign_organization_id();
create trigger assign_organization_points before insert on public.measurement_points for each row execute procedure public.assign_organization_id();
create trigger assign_organization_measurements before insert on public.measurements for each row execute procedure public.assign_organization_id();
create trigger assign_organization_conditions before insert on public.environmental_conditions for each row execute procedure public.assign_organization_id();
create trigger assign_organization_photos before insert on public.photos for each row execute procedure public.assign_organization_id();
create trigger assign_organization_equipment before insert on public.equipment for each row execute procedure public.assign_organization_id();
create trigger assign_organization_calibrations before insert on public.calibration_records for each row execute procedure public.assign_organization_id();
create trigger assign_organization_checklists before insert on public.checklists for each row execute procedure public.assign_organization_id();
create trigger assign_organization_signatures before insert on public.signatures for each row execute procedure public.assign_organization_id();
create trigger assign_organization_reports before insert on public.generated_reports for each row execute procedure public.assign_organization_id();
create trigger assign_organization_audit_logs before insert on public.audit_logs for each row execute procedure public.assign_organization_id();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create policy "organization members read memberships"
on public.organization_members for select to authenticated
using (user_id = auth.uid() or public.has_organization_access(organization_id));

create policy "organization members managed by supervisor"
on public.organization_members for all to authenticated
using (public.is_supervisor_or_higher() and public.has_organization_access(organization_id))
with check (public.is_supervisor_or_higher() and public.has_organization_access(organization_id));

create policy "organizations readable by member"
on public.organizations for select to authenticated
using (public.has_organization_access(id));

drop policy if exists "clients readable" on public.clients;
drop policy if exists "clients insert" on public.clients;
drop policy if exists "clients update" on public.clients;
drop policy if exists "projects readable" on public.projects;
drop policy if exists "projects insert" on public.projects;
drop policy if exists "projects update" on public.projects;
drop policy if exists "points readable" on public.measurement_points;
drop policy if exists "points insert" on public.measurement_points;
drop policy if exists "points update" on public.measurement_points;
drop policy if exists "measurements readable" on public.measurements;
drop policy if exists "measurements insert" on public.measurements;
drop policy if exists "measurements update" on public.measurements;
drop policy if exists "environmental_conditions readable" on public.environmental_conditions;
drop policy if exists "environmental_conditions write" on public.environmental_conditions;
drop policy if exists "photos readable" on public.photos;
drop policy if exists "photos write" on public.photos;
drop policy if exists "equipment readable" on public.equipment;
drop policy if exists "equipment managed by reviewer" on public.equipment;
drop policy if exists "calibration_records readable" on public.calibration_records;
drop policy if exists "calibration_records managed by reviewer" on public.calibration_records;
drop policy if exists "checklists readable" on public.checklists;
drop policy if exists "checklists write" on public.checklists;
drop policy if exists "signatures readable" on public.signatures;
drop policy if exists "signatures insert" on public.signatures;
drop policy if exists "reports readable" on public.generated_reports;
drop policy if exists "reports write by authenticated" on public.generated_reports;
drop policy if exists "audit readable by reviewer" on public.audit_logs;

create policy "clients tenant access" on public.clients for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));
create policy "projects tenant access" on public.projects for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));
create policy "points tenant access" on public.measurement_points for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));
create policy "measurements tenant access" on public.measurements for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));
create policy "conditions tenant access" on public.environmental_conditions for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));
create policy "photos tenant access" on public.photos for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));
create policy "equipment tenant access" on public.equipment for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));
create policy "calibrations tenant access" on public.calibration_records for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));
create policy "checklists tenant access" on public.checklists for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));
create policy "signatures tenant access" on public.signatures for all to authenticated
using (public.has_organization_access(organization_id))
with check (public.has_organization_access(organization_id));
create policy "reports tenant read" on public.generated_reports for select to authenticated
using (public.has_organization_access(organization_id));
create policy "reports managed by reviewer" on public.generated_reports for all to authenticated
using (public.has_organization_access(organization_id) and public.is_reviewer_or_higher())
with check (public.has_organization_access(organization_id) and public.is_reviewer_or_higher());
create policy "audit tenant reviewer read" on public.audit_logs for select to authenticated
using (public.has_organization_access(organization_id) and public.is_reviewer_or_higher());

drop policy if exists "authenticated read photos bucket" on storage.objects;
drop policy if exists "authenticated upload project media" on storage.objects;

create policy "tenant read project photos"
on storage.objects for select to authenticated
using (
  bucket_id = 'project-photos'
  and exists (
    select 1 from public.projects project
    where project.id::text = (storage.foldername(name))[1]
      and public.has_organization_access(project.organization_id)
  )
);

create policy "tenant write project photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'project-photos'
  and owner_id = auth.uid()
  and exists (
    select 1 from public.projects project
    where project.id::text = (storage.foldername(name))[1]
      and public.has_organization_access(project.organization_id)
  )
);

create policy "tenant read generated reports"
on storage.objects for select to authenticated
using (
  bucket_id = 'generated-reports'
  and exists (
    select 1 from public.projects project
    where project.id::text = (storage.foldername(name))[1]
      and public.has_organization_access(project.organization_id)
  )
);

create policy "tenant read equipment documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'equipment-docs'
  and exists (
    select 1 from public.equipment item
    where item.id::text = (storage.foldername(name))[1]
      and public.has_organization_access(item.organization_id)
  )
);
