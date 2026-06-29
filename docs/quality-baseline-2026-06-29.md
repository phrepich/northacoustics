# NorthAcoustics - Quality Baseline

Fecha: 2026-06-29

Alcance: `apps`, `packages`, `supabase`.

## Resumen numerico

| Metrica | Valor |
| --- | ---: |
| Archivos de codigo revisados (`ts`, `tsx`, `js`, `mjs`, `sql`) | 75 |
| Lineas de codigo | 7.404 |
| Dependencias root | 6 |
| Dependencias web | 8 |
| Dependencias mobile | 14 |
| Dependencias shared | 0 |
| Servicios/repositorios identificados | 10 |
| Hooks exportados | 2 |
| Usos de `any` | 12 |
| Archivos mayores de 500 lineas | 1 |
| Vulnerabilidades criticas npm | 0 |

## Componentes y pantallas

Se detectaron componentes/pantallas React en:

- `apps/mobile/app`
- `apps/mobile/components`
- `apps/web/app`
- `apps/web/components`
- `apps/mobile/providers`

El conteo aproximado por declaraciones React/funciones en `.tsx` es 37 archivos con componentes o pantallas.

## Servicios y repositorios

| Archivo | Rol |
| --- | --- |
| `apps/mobile/src/application/auth/field-session-service.ts` | Servicio de sesion mobile. |
| `apps/mobile/src/application/device/field-device-service.ts` | Servicio de GPS/fotografia. |
| `apps/mobile/src/application/sync/field-sync-service.ts` | Ejecutor de sincronizacion. |
| `apps/mobile/src/application/sync/offline-sync-engine.ts` | Motor puro Offline First. |
| `apps/mobile/src/application/sync/offline-sync-config.ts` | Configuracion de sync. |
| `apps/mobile/src/infrastructure/storage/offline-field-state-store.ts` | Repositorio offline AsyncStorage. |
| `apps/mobile/src/infrastructure/supabase/field-remote-repository.ts` | Repositorio remoto Supabase. |
| `apps/mobile/src/infrastructure/supabase/mobile-supabase-client.ts` | Cliente Supabase mobile. |
| `apps/web/lib/supabase-server.ts` | Cliente Supabase server-side web. |
| `apps/web/lib/report-authorization.ts` | Autorizacion de reportes. |

## TypeScript

- `strict` activo desde `tsconfig.base.json`.
- `npm run typecheck` OK en shared, mobile y web.
- Cobertura TypeScript estructural: alta en codigo fuente principal.
- Riesgo: `apps/web/tsconfig.json` mantiene `allowJs=true` por compatibilidad Next, aunque el codigo propio es TypeScript.

## Uso de `any`

Usos detectados: 12.

- `apps/web/lib/admin-data.ts`: 10 usos en mapeo de filas Supabase.
- `apps/mobile/components/project-map-preview.tsx`: 2 usos para import dinamico de `react-native-maps`.

Accion recomendada:

- Tipar filas remotas web como se hizo en mobile.
- Sustituir `any` del mapa por tipos minimos o wrapper adapter.

## Archivos mayores de 500 lineas

| Archivo | Lineas |
| --- | ---: |
| `supabase/migrations/0001_northacoustics_field.sql` | 519 |

No hay archivos TypeScript propios mayores de 500 lineas en el alcance medido.

## Deuda tecnica remanente

- Git raiz no operativo por placeholder/reparse point de OneDrive.
- Supabase no vinculado; migracion `0003` pendiente de aplicar en backend real.
- Prueba offline/online real pendiente con dispositivo/emulador y Supabase.
- `next lint` esta deprecado en Next 15; migrar a ESLint CLI antes de Next 16.
- Web conserva mapeos Supabase con `any`.
- Assets historicos `cq-*` en `apps/web/public` no referenciados por codigo; evaluar retiro cuando Git este operativo.
- No existe cobertura automatizada de tests unitarios/E2E todavia.

## Complejidad

Riesgo de complejidad actual:

- Mobile sync: medio, mitigado por separacion Sprint 2/3.
- Web admin/reportes: medio, por mapeo remoto y PDF/report auth en `lib`.
- Base de datos: medio-alto, por RLS/tenant/sync metadata que requieren validacion real.

## Linea base para futuras comparaciones

La siguiente comparacion debe registrar:

- Variacion de lineas.
- Variacion de `any`.
- Nuevos archivos >500 lineas.
- Cobertura de tests.
- Vulnerabilidades por severidad.
- Tiempo promedio de build.
- Tiempo promedio de sync.
- Conflictos abiertos.
