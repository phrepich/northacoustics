# NorthAcoustics - Runbook de Rollback

## Objetivo

Volver a una version estable cuando un release degrade produccion.

## Web

1. Identificar ultimo deploy estable.
2. Ejecutar rollback desde plataforma hosting.
3. Confirmar variables de entorno intactas.
4. Validar rutas criticas:
   - `/`
   - `/projects`
   - `/api/contact`
   - `/api/reports/demo`
5. Registrar version rollback.

## Mobile

1. Si la app ya fue publicada, evaluar phased rollout o rollback store.
2. Si el problema es configuracion, corregir variables remotas/secrets.
3. Si el problema es datos, no pedir reinstalacion hasta rescatar cola local.
4. Confirmar que AsyncStorage conserva cola.

## Supabase

1. No hacer rollback destructivo sin backup.
2. Para migraciones, preferir migracion correctiva.
3. Restaurar backup solo si:
   - hay perdida/corrupcion severa,
   - existe ventana de mantenimiento,
   - se acepto perdida segun RPO.
4. Validar RLS despues de restauracion.

## Edge Functions

1. Re-deploy de version anterior.
2. Confirmar secrets.
3. Probar request autorizado/no autorizado.

## Criterio de exito

- Servicio recuperado.
- Login funcional.
- Sync funcional.
- Datos visibles.
- Sin errores P0/P1 abiertos.
- Incidente documentado.
