# NorthAcoustics - Supabase Readiness Checklist

## Proyecto

- [ ] Supabase project ref definido.
- [ ] CLI autenticado con `SUPABASE_ACCESS_TOKEN` o `npx supabase login`.
- [ ] Proyecto vinculado con `npx supabase link --project-ref <ref>`.
- [ ] Ambientes separados: development, staging, production.

## Migraciones

- [ ] `0001_northacoustics_field.sql` aplicada.
- [ ] `0002_organizations_and_tenant_rls.sql` aplicada.
- [ ] `0003_offline_first_sync_engine.sql` aplicada.
- [ ] `npx supabase migration list` sin pendientes inesperados.
- [ ] Backup tomado antes de aplicar en produccion.

## Buckets

- [ ] `project-photos` existe.
- [ ] `generated-reports` existe.
- [ ] `equipment-docs` existe.
- [ ] Buckets privados o politicas justificadas.
- [ ] Storage policies validadas con usuario tecnico y reviewer.

## RLS y permisos

- [ ] RLS activo en tablas de negocio.
- [ ] RLS activo en tablas de organizacion.
- [ ] RLS activo en tablas de sincronizacion.
- [ ] Usuario sin membresia no lee datos.
- [ ] Usuario de otra organizacion no lee datos.
- [ ] Usuario tecnico puede crear registros operativos permitidos.
- [ ] Reviewer/supervisor puede generar reportes.

## Funciones y triggers

- [ ] `set_updated_at` existe.
- [ ] `assign_organization_id` existe.
- [ ] `touch_sync_metadata` existe.
- [ ] `write_audit_log` existe.
- [ ] Triggers de auditoria activos.
- [ ] Triggers de sync metadata activos.

## Edge Functions

- [ ] `generate-report` desplegada.
- [ ] Secrets configurados.
- [ ] Logs revisados despues de prueba.
- [ ] Rechaza requests sin autorizacion.

## Usuarios y roles

- [ ] Roles `technician`, `reviewer`, `supervisor` existen.
- [ ] Usuario QA tecnico creado.
- [ ] Usuario QA reviewer creado.
- [ ] Usuario QA supervisor creado.
- [ ] Todos tienen `organization_members` activo.

## Seeds

- [ ] `seed.sql` revisado antes de ejecutar.
- [ ] Seeds solo aplicados en development/staging salvo decision explicita.
- [ ] Produccion sin datos demo.

## Backups

- [ ] Backups automaticos activos.
- [ ] Restauracion probada en staging.
- [ ] Runbook de restauracion disponible.
- [ ] RPO/RTO definidos.
