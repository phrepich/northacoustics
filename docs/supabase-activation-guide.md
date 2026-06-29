# NorthAcoustics - Supabase Activation Guide

Estado: preparacion controlada. No iniciar Sprint 4 desde este documento.

Objetivo: dejar listo el procedimiento para conectar Supabase, aplicar migraciones y validar el entorno cuando existan credenciales reales, sin ejecutar cambios destructivos ni modificar logica de aplicacion.

## Alcance

Este documento cubre tres rutas de activacion:

- Acceso por `SUPABASE_ACCESS_TOKEN` y `SUPABASE_PROJECT_REF`.
- Acceso por `DATABASE_URL` PostgreSQL directo.
- Acceso manual por Supabase SQL Editor.

No contiene secretos reales. No versionar tokens, passwords, service role keys ni connection strings reales.

## Estado requerido antes de ejecutar

- Repositorio: `C:\Users\phrep\northacoustics-production`.
- Rama: `release/production-baseline`.
- Remote: `https://github.com/phrepich/northacoustics.git`.
- Migraciones disponibles:
  - `supabase/migrations/0001_northacoustics_field.sql`
  - `supabase/migrations/0002_organizations_and_tenant_rls.sql`
  - `supabase/migrations/0003_offline_first_sync_engine.sql`
- Ambiente confirmado: `staging` o `production`.
- Backup del proyecto Supabase confirmado antes de production.

## Variables y datos necesarios

| Dato | Uso | Obligatorio | Dónde configurarlo |
| --- | --- | --- | --- |
| `SUPABASE_ACCESS_TOKEN` | Autenticar Supabase CLI. | Si para CLI. | Variable de entorno local temporal o secret CI. |
| `SUPABASE_PROJECT_REF` | Vincular CLI al proyecto correcto. | Si para CLI. | Variable de entorno local temporal o secret CI. |
| `DATABASE_URL` | Aplicar SQL por cliente PostgreSQL directo. | Solo ruta alternativa. | Variable temporal local; no versionar. |
| `SUPABASE_URL` | Edge Functions y validaciones server-side. | Si para runtime. | Supabase secrets y hosting. |
| `SUPABASE_ANON_KEY` | Validacion JWT Edge Function. | Si para runtime. | Supabase secrets y hosting. |
| `SUPABASE_SERVICE_ROLE_KEY` | Operaciones server-only autorizadas. | Si para runtime controlado. | Secret manager; nunca cliente. |
| `EXPO_PUBLIC_SUPABASE_URL` | App mobile. | Si para prueba real. | `.env` local no versionado o Expo env. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | App mobile. | Si para prueba real. | `.env` local no versionado o Expo env. |
| `NEXT_PUBLIC_SUPABASE_URL` | Web. | Si para prueba real. | Hosting/env local no versionado. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web. | Si para prueba real. | Hosting/env local no versionado. |

## Checklist staging

- [ ] Proyecto Supabase staging creado y aislado de production.
- [ ] `SUPABASE_PROJECT_REF` staging confirmado.
- [ ] `SUPABASE_ACCESS_TOKEN` disponible solo como secreto temporal.
- [ ] Backups habilitados o snapshot inicial tomado.
- [ ] Variables mobile staging configuradas con anon key de staging.
- [ ] Variables web staging configuradas con anon key de staging.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` staging configurada solo server-side.
- [ ] Buckets esperados revisados o listos para ser creados por migraciones:
  - `project-photos`
  - `generated-reports`
  - `equipment-docs`
- [ ] Usuario de prueba creado en Supabase Auth.
- [ ] Usuario de prueba asociado a una organizacion y rol valido.
- [ ] Se confirma que aplicar `0003` en staging esta autorizado.
- [ ] Se documenta fecha, operador y project ref usado.

## Checklist production

- [ ] Staging validado con `0001`, `0002` y `0003`.
- [ ] Prueba offline/online aprobada en staging.
- [ ] Backup production tomado antes de migrar.
- [ ] Ventana de mantenimiento aprobada si hay usuarios reales.
- [ ] `SUPABASE_PROJECT_REF` production confirmado por doble revision.
- [ ] Variables production configuradas en hosting y secrets manager.
- [ ] No existe `SUPABASE_SERVICE_ROLE_KEY` expuesta como `NEXT_PUBLIC_*` o `EXPO_PUBLIC_*`.
- [ ] Buckets production revisados:
  - `project-photos`
  - `generated-reports`
  - `equipment-docs`
- [ ] RLS habilitado en tablas criticas.
- [ ] Plan de rollback aprobado.
- [ ] Responsable tecnico asignado para monitoreo post-migracion.
- [ ] Se confirma explicitamente autorizacion para aplicar migracion en production.

## Ruta A: Supabase CLI con access token

Usar esta ruta cuando existan `SUPABASE_ACCESS_TOKEN` y `SUPABASE_PROJECT_REF`.

No escribir el token en archivos versionados. En PowerShell, configurarlo solo para la sesion actual:

```powershell
$env:SUPABASE_ACCESS_TOKEN="<token-real>"
$env:SUPABASE_PROJECT_REF="<project-ref>"
```

Validar CLI:

```powershell
npx supabase --version
npx supabase projects list
```

Vincular el proyecto:

```powershell
npx supabase link --project-ref $env:SUPABASE_PROJECT_REF
```

Revisar migraciones:

```powershell
npx supabase migration list
```

Aplicar migraciones solo con autorizacion explicita:

```powershell
npx supabase db push
```

Validar nuevamente:

```powershell
npx supabase migration list
```

Desplegar Edge Function solo despues de validar secrets:

```powershell
npx supabase secrets set SUPABASE_URL="<url-real>"
npx supabase secrets set SUPABASE_ANON_KEY="<anon-key-real>"
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
npx supabase functions deploy generate-report
```

## Ruta B: DATABASE_URL directo

Usar esta ruta solo si no se puede usar Supabase CLI. Requiere una connection string PostgreSQL con permisos suficientes.

Configurar temporalmente:

```powershell
$env:DATABASE_URL="<postgresql-connection-string-real>"
```

Validar conexion con el cliente disponible en el entorno. Ejemplo con `psql`:

```powershell
psql $env:DATABASE_URL -c "select current_database(), current_user, now();"
```

Aplicar migraciones en orden, solo si el proyecto esta vacio o si `0001` y `0002` aun no existen:

```powershell
psql $env:DATABASE_URL -f supabase/migrations/0001_northacoustics_field.sql
psql $env:DATABASE_URL -f supabase/migrations/0002_organizations_and_tenant_rls.sql
```

Aplicar `0003` cuando `0001` y `0002` ya esten presentes:

```powershell
psql $env:DATABASE_URL -f supabase/migrations/0003_offline_first_sync_engine.sql
```

Registrar manualmente en el informe:

- Ambiente.
- Project ref.
- Usuario PostgreSQL usado.
- Fecha y hora.
- Resultado completo del comando.

## Ruta C: SQL Editor manual

Usar esta ruta cuando no hay CLI ni `DATABASE_URL`.

Procedimiento:

1. Abrir Supabase Dashboard.
2. Seleccionar el proyecto correcto.
3. Confirmar ambiente: staging o production.
4. Abrir SQL Editor.
5. Crear un query nuevo.
6. Copiar el contenido completo de `supabase/migrations/0003_offline_first_sync_engine.sql`.
7. Ejecutar el query.
8. Guardar captura o exportar resultado de ejecucion.
9. No ejecutar `0001` o `0002` manualmente si ya fueron aplicadas.
10. Registrar fecha, operador, project ref y resultado en `docs/operational-closure-pre-sprint-4.md`.

## Validacion posterior a migracion

Ejecutar estas consultas desde SQL Editor o cliente PostgreSQL.

Tablas de sincronizacion:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('sync_operations', 'sync_conflicts', 'sync_telemetry')
order by table_name;
```

Columnas de versionado:

```sql
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and column_name in (
    'version',
    'created_at',
    'updated_at',
    'updated_by',
    'device_id',
    'sync_version',
    'deleted_at',
    'sync_status'
  )
order by table_name, column_name;
```

Politicas RLS:

```sql
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Indices:

```sql
select schemaname, tablename, indexname
from pg_indexes
where schemaname = 'public'
  and (
    indexname like '%sync%'
    or tablename in ('sync_operations', 'sync_conflicts', 'sync_telemetry')
  )
order by tablename, indexname;
```

Funciones y triggers:

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name like '%sync%'
order by routine_name;

select event_object_table, trigger_name
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;
```

Storage buckets:

```sql
select id, name, public
from storage.buckets
where id in ('project-photos', 'generated-reports', 'equipment-docs')
order by id;
```

## Prueba operacional posterior

No autorizar Sprint 4 hasta completar y documentar:

1. Iniciar sesion con usuario real de staging.
2. Crear cliente.
3. Crear proyecto.
4. Crear punto.
5. Crear medicion.
6. Adjuntar fotografia.
7. Trabajar offline.
8. Volver online.
9. Sincronizar.
10. Verificar datos en Supabase.
11. Verificar fotografia en Storage.
12. Verificar telemetria.
13. Verificar panel `/sync`.

## Rollback

Antes de migration en production:

- Tomar backup o snapshot.
- Exportar schema actual.
- Registrar version desplegada.
- Confirmar ventana de mantenimiento.

Si falla `0003` durante aplicacion:

1. Detener nuevos intentos.
2. Capturar error completo.
3. Verificar si hubo cambios parciales.
4. No ejecutar fixes manuales no revisados.
5. Restaurar desde backup si el estado queda inconsistente.
6. Documentar tablas, funciones, triggers o politicas creadas parcialmente.

Si falla la prueba offline/online:

1. No autorizar Sprint 4.
2. Mantener la rama actual sin nuevos cambios funcionales.
3. Registrar modulo afectado: Auth, RLS, Storage, Sync, Telemetry o UI tecnica.
4. Preparar correccion minima y nueva prueba.

## Riesgos

- Aplicar migraciones al project ref incorrecto.
- Ejecutar `0001` o `0002` manualmente sobre un entorno ya migrado.
- Exponer service role key en cliente.
- Validar solo build local sin prueba real contra Supabase.
- Usar production antes de validar staging.
- Resolver errores de migracion con SQL ad hoc no versionado.

## Criterio de cierre

El cierre operativo previo a Sprint 4 solo puede declararse completo cuando:

- `0003_offline_first_sync_engine.sql` fue aplicada en el ambiente autorizado.
- Tablas, columnas, RLS, indices, funciones, triggers y Storage fueron validados.
- Prueba offline/online fue aprobada.
- Telemetria y panel `/sync` fueron verificados.
- `docs/operational-closure-pre-sprint-4.md` fue actualizado con evidencia real.
- Validaciones locales pasan:
  - `npm run typecheck`
  - `npm run lint:web`
  - `npm run build:web`
  - `npm audit --audit-level=critical`
