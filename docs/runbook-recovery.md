# NorthAcoustics - Runbook de Recuperacion

## Objetivo

Restaurar servicio y datos ante perdida de disponibilidad o corrupcion.

## Escenarios

### Perdida de conectividad movil

1. Confirmar que la app mantiene cola offline.
2. No reinstalar la app antes de extraer diagnostico.
3. Recuperar conectividad.
4. Ejecutar sincronizacion.
5. Verificar que pendientes bajan y telemetria se actualiza.

### Error de migracion

1. Detener nuevos deploys.
2. Revisar migracion aplicada.
3. Confirmar backup previo.
4. Restaurar staging para reproducir.
5. Preparar migracion correctiva reversible.
6. Aplicar en produccion solo con aprobacion tecnica.

### Perdida/corrupcion de datos

1. Identificar tablas afectadas.
2. Congelar escrituras si el impacto continua.
3. Revisar `audit_logs`.
4. Revisar `sync_operations` y `sync_conflicts`.
5. Restaurar desde backup a entorno temporal.
6. Comparar y recuperar registros necesarios.

### Falla Edge Function

1. Revisar logs de `generate-report`.
2. Validar secrets.
3. Validar permisos del usuario.
4. Re-deploy de funcion si el artefacto esta corrupto.
5. Reintentar generacion.

## Evidencia obligatoria

- Hora inicio/fin.
- Sistemas afectados.
- Logs relevantes.
- Accion correctiva.
- Responsable.
- Riesgo residual.
