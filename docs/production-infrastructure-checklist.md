# NorthAcoustics - Production Infrastructure Checklist

Estado: Fase 0 release preparation.

## Supabase

- [ ] Crear proyecto Supabase de staging.
- [ ] Crear proyecto Supabase de produccion.
- [ ] Registrar `SUPABASE_PROJECT_REF` por ambiente.
- [ ] Configurar `SUPABASE_ACCESS_TOKEN` en CI/CD.
- [ ] Ejecutar migraciones `0001`, `0002`, `0003` en orden.
- [ ] Verificar tabla `organizations` con slug `northacoustics`.
- [ ] Verificar `organization_members` para usuarios reales.
- [ ] Ejecutar `seed.sql` solo si aplica al ambiente.

## Storage

- [ ] Crear bucket `project-photos`.
- [ ] Crear bucket `generated-reports`.
- [ ] Crear bucket `equipment-docs`.
- [ ] Definir buckets privados salvo decision explicita de negocio.
- [ ] Validar politicas Storage tenant-aware.
- [ ] Probar subida y lectura firmada de fotografia.
- [ ] Probar subida y lectura de reporte generado.

## RLS

- [ ] RLS activo en tablas de negocio.
- [ ] RLS activo en `organizations` y `organization_members`.
- [ ] RLS activo en `sync_operations`, `sync_conflicts`, `sync_telemetry`.
- [ ] Usuario tecnico no ve datos de otra organizacion.
- [ ] Usuario reviewer/supervisor puede leer auditoria segun politica.
- [ ] Service role solo usado server-side.

## Edge Functions

- [ ] Deploy de `generate-report`.
- [ ] Secrets configurados: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Verificar rechazo sin Bearer token.
- [ ] Verificar rechazo con rol no autorizado.
- [ ] Verificar generacion con rol `reviewer` o `supervisor`.

## Variables y Secrets

- [ ] Completar variables de `.env.production.example` en hosting/CI.
- [ ] Completar variables de `.env.staging.example` en hosting/CI.
- [ ] Confirmar `ENABLE_DEMO_MODE=false` en staging/produccion.
- [ ] Rotar service role si fue compartida fuera del gestor de secretos.
- [ ] Registrar responsables de acceso.

## Dominios y HTTPS

- [ ] Definir dominio web productivo.
- [ ] Configurar DNS.
- [ ] Activar HTTPS.
- [ ] Configurar redirects canonicales.
- [ ] Validar CORS/Auth redirect URLs en Supabase.
- [ ] Registrar URL de callback si se agregan proveedores OAuth.

## Backups

- [ ] Activar backups automáticos Supabase.
- [ ] Definir retencion minima.
- [ ] Probar restauracion en staging.
- [ ] Documentar RPO/RTO.
- [ ] Exportar esquema antes de migraciones mayores.

## Monitoreo, logs y alertas

- [ ] Monitorear errores de Next.js.
- [ ] Monitorear Edge Function `generate-report`.
- [ ] Monitorear fallas de sync y conflictos.
- [ ] Alertar por cola pendiente alta.
- [ ] Alertar por errores 5xx.
- [ ] Alertar por fallas de Storage.
- [ ] Revisar logs de Supabase Auth.

## CI/CD

- [ ] Repositorio Git NorthAcoustics operativo.
- [ ] Branch protection en `main`.
- [ ] GitHub Actions para typecheck.
- [ ] GitHub Actions para lint web.
- [ ] GitHub Actions para build web.
- [ ] Job manual/aprobado para migraciones Supabase.
- [ ] Deploy web a Vercel/Netlify u host definido.
- [ ] Pipeline Expo/EAS si se publica app movil.

## Versiones runtime

- [ ] Node.js recomendado: `22.22.3` o version LTS equivalente validada.
- [ ] npm recomendado: `10.9.8`.
- [ ] Next.js: `15.5.19`.
- [ ] React/React DOM: `18.3.1`.
- [ ] Expo: `~54.0.0`.
- [ ] React Native: `0.76.6`.

## Criterio de produccion

- [ ] `npm run typecheck` OK.
- [ ] `npm run lint:web` OK.
- [ ] `npm run build:web` OK en checkout limpio.
- [ ] `npm audit --audit-level=critical` OK.
- [ ] Migraciones aplicadas y verificadas.
- [ ] Prueba real offline/online aprobada.
- [ ] Runbooks disponibles.
- [ ] Rollback probado en staging.
