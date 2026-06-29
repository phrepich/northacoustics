# NorthAcoustics - Runbook de Operacion

## Objetivo

Operar la plataforma en produccion con controles diarios y semanales.

## Revision diaria

- Revisar uptime web.
- Revisar logs de Next.js.
- Revisar logs de Supabase Auth.
- Revisar errores de Edge Function `generate-report`.
- Revisar cola de sincronizacion: pendientes, fallidas y conflictos.
- Revisar Storage: errores de upload y crecimiento de uso.
- Confirmar que no hay alertas de seguridad.

## Revision semanal

- Ejecutar `npm audit --audit-level=critical` en checkout limpio.
- Revisar dependencias obsoletas.
- Verificar backups Supabase.
- Probar restore de backup en staging si hubo cambios de esquema.
- Revisar usuarios inactivos o sin rol.
- Revisar `organization_members`.
- Revisar conflictos no resueltos.

## Indicadores minimos

- Operaciones sync pendientes.
- Operaciones sync fallidas.
- Conflictos abiertos.
- Tiempo promedio de sync.
- Fotografias pendientes.
- Errores 5xx.
- Fallas de Edge Function.
- Uso de Storage.

## Acciones normales

- Conflictos: revisar panel tecnico, decidir politica, registrar resolucion.
- Cola fallida: revisar `lastError`, corregir causa, reintentar.
- Storage alto: auditar fotografias y politicas de retencion.
- Usuario bloqueado: validar Auth, rol y membresia.
