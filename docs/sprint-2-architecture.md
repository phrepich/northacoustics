# Sprint 2 - Reingenieria de Arquitectura

Fecha: 2026-06-28

Estado: cerrado tecnicamente. No se ejecuto Sprint 3.

## Resumen ejecutivo

Sprint 2 reorganizo la arquitectura interna de la app movil sin cambiar funcionalidades visibles ni contratos usados por las pantallas. El objetivo fue reducir acoplamiento, aislar proveedores externos y preparar el sistema para el rediseño Offline First de Sprint 3.

La intervencion se concentro en el punto de mayor riesgo arquitectonico: `FieldDataProvider`, que mezclaba UI state, autenticacion, persistencia local, mapeo remoto, permisos nativos, sincronizacion y reglas de dominio en un solo archivo.

## Arquitectura anterior

- `apps/mobile/providers/field-data-provider.tsx` concentraba la mayor parte de la logica de campo.
- Las operaciones de Supabase estaban mezcladas con estado React.
- La cola offline se procesaba directamente dentro del provider.
- La persistencia AsyncStorage estaba en `apps/mobile/lib/offline-store.ts`.
- El mapeo remoto usaba objetos ambiguos para filas de Supabase.
- Las pantallas dependian de `useFieldData`, por lo que cambiar ese contrato tenia alto riesgo.

## Arquitectura nueva

Se agrego una estructura interna en `apps/mobile/src`:

- `domain/field`: modelos de estado, inputs, factories de entidades y agregados puros.
- `application/auth`: casos de uso de sesion, login, logout y refresh autenticado.
- `application/device`: servicios de GPS y fotografia.
- `application/sync`: procesamiento de cola offline.
- `infrastructure/supabase`: cliente Supabase y repositorio remoto tipado.
- `infrastructure/storage`: repositorio de estado offline sobre AsyncStorage.

`FieldDataProvider` queda como fachada compatible para React: conserva `useFieldData`, `useProjectReportPreview` y `buildDemoClient`, pero delega dominio, servicios y repositorios a las capas nuevas.

## Justificacion tecnica

- Se mantuvo la API publica del provider para no modificar pantallas ni comportamiento visible.
- Se evitaron librerias nuevas; Context sigue siendo suficiente para el estado actual.
- No se introdujo Zustand, Redux ni TanStack Query porque el problema principal era acoplamiento interno, no cache distribuido.
- Se separo dominio puro de infraestructura para que Sprint 3 pueda reescribir sincronizacion sin tocar pantallas.
- Los archivos antiguos de `apps/mobile/lib` quedaron como wrappers de compatibilidad para evitar imports rotos.

## Beneficios

- Menor acoplamiento entre UI, Supabase, AsyncStorage y reglas de negocio.
- Provider mas pequeno y orientado a orquestacion.
- Sincronizacion aislada en un servicio reemplazable.
- Mapeo Supabase tipado en vez de conversiones ambiguas.
- Mejor base para pruebas unitarias de dominio y servicios.
- Puntos claros de extension para versionado, conflictos, backoff y auditoria.

## Archivos modificados

- `apps/mobile/providers/field-data-provider.tsx`
- `apps/mobile/lib/persisted-state.ts`
- `apps/mobile/lib/offline-store.ts`
- `apps/mobile/lib/remote-data.ts`

## Archivos agregados

- `apps/mobile/src/domain/field/field-state.ts`
- `apps/mobile/src/domain/README.md`
- `apps/mobile/src/application/auth/field-session-service.ts`
- `apps/mobile/src/application/device/field-device-service.ts`
- `apps/mobile/src/application/sync/field-sync-service.ts`
- `apps/mobile/src/application/README.md`
- `apps/mobile/src/infrastructure/supabase/mobile-supabase-client.ts`
- `apps/mobile/src/infrastructure/supabase/field-remote-repository.ts`
- `apps/mobile/src/infrastructure/storage/offline-field-state-store.ts`
- `apps/mobile/src/infrastructure/README.md`
- `docs/sprint-2-architecture.md`

## Modulos reorganizados

- Autenticacion: de provider a `application/auth` + `infrastructure/supabase`.
- Clientes/proyectos/puntos/mediciones/reportes: factories y agregados en `domain/field`.
- Fotografias: captura en `application/device`, subida en `application/sync`.
- Sincronizacion: de provider a `application/sync`.
- Configuracion y cliente Supabase: encapsulados por infraestructura.
- Storage offline: de `lib/offline-store` a `infrastructure/storage`.

## Deuda tecnica eliminada

- Provider monolitico con mas de 500 lineas de responsabilidades mezcladas.
- Consultas y upserts Supabase directos dentro del provider.
- Uso de filas remotas ambiguas en el nuevo flujo de lectura.
- Persistencia local acoplada al estado React.
- Logica de GPS/camara mezclada con contexto global.

## Mejoras obtenidas

- `FieldDataProvider` queda como API de composicion, no como repositorio ni servicio de sincronizacion.
- El dominio puede probarse sin React Native.
- La sincronizacion puede evolucionar de forma aislada en Sprint 3.
- Las pantallas no cambiaron imports ni comportamiento.
- Se documentaron objetivo, dependencias, responsabilidades y extension de las capas principales.

## Estimacion de reduccion de complejidad

- Reduccion estimada de responsabilidad del provider: 55-65%.
- Reduccion de acoplamiento UI/infraestructura en mobile: alta.
- Reduccion de riesgo para Sprint 3: media-alta, porque la cola offline ya tiene un punto unico de reemplazo.
- Complejidad funcional visible: sin cambios.

## QA

Validacion local en workspace:

- `npm run typecheck`: OK en shared, mobile y web.
- `npm --workspace @northacoustics/mobile run typecheck`: OK.

Validacion reproducible fuera de OneDrive en `C:\na-sprint2-build`:

- `npm install --no-audit --no-fund`: OK.
- `npm run typecheck`: OK.
- `npm run lint:web`: OK, sin warnings ni errores ESLint. Se mantiene aviso de deprecacion de `next lint` por Next.js 15.
- `npm run build:web`: OK. Next.js 15.5.19 compila y genera 18 rutas.

Notas de entorno:

- Node.js: `v22.22.3`.
- npm: `10.9.8`.
- El workspace bajo OneDrive sigue generando fallos intermitentes de lectura/spawn en `node_modules`; por eso la evidencia de build/lint se tomo en copia limpia fuera de carpeta sincronizada.

## Riesgos remanentes

- Sprint 3 debe redisenar sincronizacion con versionado, conflictos, reintentos y auditoria.
- El repositorio Git aun no esta operativo desde este directorio: `git rev-parse --show-toplevel` falla aunque exista un placeholder `.git` en OneDrive.
- Web conserva estructura historica en `app`, `components` y `lib`; no se refactorizo para evitar ampliar el alcance y porque el acoplamiento critico estaba en mobile.

## Criterio de cierre

Sprint 2 queda cerrado porque:

- No hubo cambio funcional visible.
- Se mantuvo compatibilidad de pantallas.
- Se separaron dominio, aplicacion e infraestructura en mobile.
- Typecheck, lint web y build web fueron validados.
- No se avanzo a Sprint 3.
