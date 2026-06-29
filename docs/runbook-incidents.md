# NorthAcoustics - Runbook de Incidentes

## Clasificacion

- P0: perdida de datos, exposicion de informacion, produccion caida.
- P1: sync bloqueado, reportes bloqueados, login general fallando.
- P2: errores parciales, conflicto alto, degradacion de rendimiento.
- P3: problemas menores sin impacto operacional.

## Flujo de respuesta

1. Declarar severidad.
2. Nombrar responsable del incidente.
3. Abrir registro con hora, impacto y alcance.
4. Mitigar primero; corregir despues.
5. Comunicar estado cada 30 minutos para P0/P1.
6. Cerrar solo con validacion y postmortem.

## Incidentes comunes

### Sync fallando masivamente

- Revisar Supabase status.
- Revisar RLS y migraciones recientes.
- Revisar `sync_operations`.
- Revisar errores de Storage.
- Activar modo contencion: no borrar cola local.

### Exposicion de service role

- Revocar/rotar llave inmediatamente.
- Revisar logs de acceso.
- Confirmar que no existe prefijo publico.
- Redeploy de secrets.

### Conflictos excesivos

- Detener automatismos de resolucion.
- Mantener politica manual.
- Revisar dispositivos afectados.
- Consolidar datos con auditoria.

## Postmortem

Debe incluir:

- Causa raiz.
- Deteccion.
- Impacto.
- Tiempo de recuperacion.
- Acciones preventivas.
- Owner y fecha objetivo.
