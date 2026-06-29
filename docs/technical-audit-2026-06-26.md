# Auditoria tecnica - NorthAcoustics App de Ruido

Fecha: 2026-06-26

Estado: Fase 1 completada. Revision sin cambios de codigo, arquitectura, dependencias ni diseno.

## 1. Resumen ejecutivo

El proyecto revisado es el monorepo `northacoustics-field`. Incluye una aplicacion movil para trabajo de campo, una aplicacion web Next.js, un paquete compartido para modelos y reportes, y una definicion Supabase para datos, autenticacion, almacenamiento y una Edge Function.

La base funcional es prometedora: existe un modelo de dominio razonable, captura de mediciones, persistencia local, cola de sincronizacion, reportes y un esquema inicial de datos. Sin embargo, no esta listo para un uso productivo profesional. Los riesgos principales son de seguridad y aislamiento de datos, una ruta web publica que usa la clave de servicio para generar reportes, contenido corporativo ajeno a NorthAcoustics que rompe el typecheck, sincronizacion sin resolucion real de conflictos, y vulnerabilidades conocidas en dependencias.

No se realizaron cambios durante esta fase. La siguiente intervencion debe empezar por contencion de seguridad y recuperacion de la compilacion web, antes de incorporar funcionalidades o redisenar pantallas.

## 2. Alcance y evidencia revisada

Se revisaron el monorepo raiz, los paquetes `apps/mobile`, `apps/web` y `packages/shared`, las migraciones y funcion de `supabase`, la documentacion y los manifiestos npm.

El directorio vecino `northacoustics-field-clean` parece ser una variante estatica o de despliegue separada. No forma parte del alcance funcional principal definido por el `README.md` del monorepo y no debe mezclarse con esta aplicacion sin una decision explicita.

## 3. Arquitectura actual

### Stack

- Monorepo npm workspaces.
- Movil: Expo 54, React Native 0.76, Expo Router, Supabase JS y AsyncStorage.
- Web: Next.js 15.1.6 con App Router, React 18.3, Tailwind CSS 4, Supabase JS y PDFKit.
- Dominio compartido: TypeScript con tipos, datos de ejemplo y generacion de HTML/CSV.
- Backend: Supabase PostgreSQL, Auth, Storage y Edge Function Deno.

### Organizacion

- `apps/mobile`: captura en terreno, autenticacion, datos locales, sincronizacion, GPS, camara y pantallas operativas.
- `apps/web`: sitio web y panel de proyectos/reportes.
- `packages/shared`: contratos de dominio y generador de reportes.
- `supabase/migrations`: modelo relacional, RLS, politicas e indices.
- `supabase/functions/generate-report`: generacion de reporte HTML/PDF desde datos del proyecto.

### Flujo observado

1. El usuario movil inicia sesion con Supabase.
2. La aplicacion carga estado local y, si existe sesion, descarga el conjunto completo de datos disponibles.
3. Las operaciones se guardan localmente y se agregan a una cola.
4. La sincronizacion ejecuta upserts secuenciales contra Supabase y carga fotos a Storage.
5. La web obtiene datos mediante un cliente server-side con `SUPABASE_SERVICE_ROLE_KEY`.
6. La web puede solicitar un PDF mediante una ruta API publica.

## 4. Estado funcional

### Modulos presentes

- Autenticacion movil con Supabase.
- CRUD basico de clientes, proyectos, puntos y mediciones.
- Captura manual de variables acusticas y ambientales.
- Persistencia offline y cola de sincronizacion.
- Captura de ubicacion y fotografia.
- Listado web de proyectos, filtros y exportacion CSV.
- Generacion basica de reporte PDF/HTML.
- Esquema de datos para equipos, calibraciones, checklists, firmas y reportes.

### Parcialmente implementados

- Offline first: hay cola, pero no hay estrategia de reintentos, observabilidad, reconciliacion ni resolucion de conflictos.
- Evidencia fotografica: existe carga a Storage, pero el punto puede conservar una ruta local `file://` en vez de una ruta remota.
- Reportes: se crean metadatos, pero en movil no se genera un archivo real y el PDF web no incorpora evidencia ni firmas.
- Control de calidad: las tablas existen, pero la experiencia operativa y las validaciones no estan integradas de extremo a extremo.
- Panel web: tiene componentes administrativos, pero varias paginas corporativas no compilan por datos de otra marca.

### Pendiente o sin evidencia suficiente

- Roles operativos y autorizacion por empresa, proyecto o cliente.
- Eliminacion segura, archivado y restauracion de datos.
- Trazabilidad completa de cambios y conflictos.
- Integracion con instrumento de medicion.
- Pruebas automatizadas, CI/CD y monitoreo de errores.
- Politica de respaldo, retencion y recuperacion.

## 5. Hallazgos criticos

### P0-01: ruta publica genera y expone reportes con privilegios de servicio

Archivo: `apps/web/app/api/reports/demo/route.ts`.

La ruta GET no valida sesion ni autorizacion. Puede consultar datos mediante el cliente configurado con la clave de servicio, generar un PDF, escribirlo en Storage e insertar un reporte. Una llamada publica tiene efectos de escritura y puede exponer informacion de proyectos.

Impacto: acceso no autorizado a datos y consumo/alteracion no autorizada de recursos.

Accion inmediata: deshabilitar o proteger la ruta, exigir identidad autenticada, comprobar autorizacion por proyecto y mover la operacion con efectos de escritura a POST.

### P0-02: RLS permite acceso transversal entre usuarios autenticados

Archivo: `supabase/migrations/20250308000000_initial_schema.sql`.

Las politicas de lectura permiten a cualquier usuario autenticado leer clientes, proyectos, puntos, mediciones, reportes y evidencia no eliminada. Las politicas de escritura de varias tablas permiten operaciones excesivamente amplias. Storage permite lectura y carga autenticada sin validar propiedad ni prefijo por organizacion.

Impacto: un usuario autenticado puede acceder potencialmente a informacion de otros clientes, proyectos y evidencias.

Accion inmediata: definir modelo de organizacion/equipo, introducir `organization_id` o equivalente, y reescribir politicas RLS y Storage con aislamiento por tenant y rol.

### P0-03: la funcion Edge de reportes no implementa autorizacion explicita

Archivo: `supabase/functions/generate-report/index.ts`.

La funcion usa la clave de servicio para acceder a datos y no valida identidad, rol ni pertenencia al proyecto en el codigo. Tampoco valida formalmente el payload.

Impacto: riesgo de generacion o exposicion de reportes si el endpoint se publica o configura sin proteccion adicional.

Accion inmediata: validar JWT, autorizacion de proyecto, esquema de entrada, limites de uso y registrar auditoria.

## 6. Problemas altos

### P1-01: la aplicacion web no supera typecheck

Comando: `npm run typecheck`.

El paquete compartido y la aplicacion movil pasaron. La aplicacion web fallo porque importa datos inexistentes desde `apps/web/lib/site-content.ts`: `differentiators`, `directionHighlights`, `homeMetrics`, `serviceLines`, `workflow` y `projects`.

El archivo actual contiene contenido de una marca ajena, CQ/Condor Quality, y el footer tambien muestra referencias a CQ. Esto confirma contaminacion de alcance y bloquea la compilacion tipada.

Accion: restaurar o reconstruir un contenido web coherente con NorthAcoustics, eliminar referencias ajenas y cubrir las paginas con tipos explicitos.

### P1-02: vulnerabilidades de dependencias

Comando: `npm audit --audit-level=moderate`.

Resultado: 35 vulnerabilidades: 2 criticas, 11 altas, 21 moderadas y 1 baja. Destaca Next.js 15.1.6 con multiples avisos de seguridad. Tambien aparecen cadenas vulnerables en dependencias de Expo, Babel, PostCSS, undici, ws y otras.

Accion: planificar una actualizacion controlada por compatibilidad; no aplicar `npm audit fix --force` sin pruebas, porque propone saltos mayores.

### P1-03: sincronizacion sin control de conflicto real

Archivos: `apps/mobile/providers/field-data-provider.tsx` y `docs/architecture.md`.

La documentacion declara comparacion de `updated_at` y resolucion de conflictos. La implementacion realiza upserts directos sin comparar version, sin bloqueo optimista, sin merge y sin una experiencia de resolucion para el usuario.

Impacto: perdida silenciosa de cambios cuando varios dispositivos editan el mismo registro.

Accion: definir versionado de entidad, estrategia de conflicto, reintentos idempotentes y registro de errores de sincronizacion.

### P1-04: cliente web con service role sin barrera de usuario

Archivos: `apps/web/lib/supabase-server.ts` y `apps/web/lib/admin-data.ts`.

El servidor consulta todas las tablas con la clave de servicio y no existe una capa visible de autenticacion/autorizacion para las pantallas que la usan. El modo demo puede ocultar fallos reales devolviendo datos de ejemplo.

Accion: separar cliente anonimo, cliente de sesion y cliente administrativo; exigir sesion y permisos en cada ruta protegida; limitar el modo demo a desarrollo.

## 7. Problemas medios

- `apps/mobile/app/login.tsx` muestra credenciales de ejemplo prellenadas, incluyendo una contrasena. Aunque no equivale por si sola a una filtracion de secretos validos, normaliza una practica insegura y debe eliminarse.
- `apps/mobile/lib/offline-store.ts` no protege el parseo de estado persistido. Un JSON corrupto puede impedir iniciar la aplicacion.
- La aplicacion movil descarga tablas completas sin paginacion ni filtro de organizacion en `remote-data.ts`. Esto no escala y amplifica el riesgo de RLS.
- La cola de sincronizacion no conserva detalle de error, no aplica backoff ni limite de reintentos, y puede refrescar estado remoto en medio de fallos.
- La pantalla de nueva medicion usa el primer punto disponible y permite conversiones numericas invalidas o valores vacios que se transforman en cero.
- El generador de HTML de reportes inserta campos de usuario sin escape. El contenido malicioso puede propagarse al reporte.
- `apps/web/app/api/contact/route.ts` persiste datos personales en un archivo local. Esto es fragil o inutil en despliegues serverless y carece de limites de tasa, validacion robusta y gestion de retencion.
- La creacion de URL firmadas para fotos ocurre una a una, con riesgo de N+1 en proyectos grandes.
- Hay artefactos de compilacion presentes en el arbol (`dist`, `tsbuildinfo`). Debe revisarse si estan versionados y alinearse `.gitignore`.

## 8. Problemas menores y UX

- La pantalla de sincronizacion expone el JSON completo de la cola, potencialmente con coordenadas y datos de personas.
- Varios mapeos usan `any`, reduciendo la seguridad de tipos y la mantenibilidad.
- El PDF actual no representa evidencia fotografica, firmas ni una estructura robusta de informe profesional.
- La navegacion web mezcla sitio corporativo, contenido de otra marca y panel administrativo.
- No se observo una estrategia de accesibilidad, estados vacios, manejo de error consistente ni pruebas de flujos moviles.

## 9. Base de datos y escalabilidad

El modelo cubre las entidades principales: usuarios, clientes, proyectos, puntos, mediciones, condiciones ambientales, fotos, equipos, calibraciones, checklists, firmas, reportes y auditoria. Las relaciones base son razonables y existen indices en varias claves foraneas.

Las debilidades principales son ausencia de tenant/organizacion, politicas RLS no restrictivas, indices incompletos para consultas frecuentes por estado/fecha/organizacion, y ausencia de versionado para sincronizacion concurrente. La auditoria por trigger es util como inicio, pero necesita identificar actor, contexto de dispositivo y operacion de forma consistente.

## 10. Rendimiento

Los principales riesgos de rendimiento son:

- Descarga completa de todas las tablas al iniciar sincronizacion.
- Persistencia del estado completo en AsyncStorage en cada cambio.
- Sincronizacion secuencial sin agrupacion, reintentos ni trazas.
- Generacion de URL firmadas de forma N+1.
- Generacion de reportes sin control de concurrencia ni limites.

La prioridad no es micro-optimizar componentes React: primero hay que corregir el aislamiento de datos y convertir las cargas completas en consultas paginadas y acotadas.

## 11. Verificaciones ejecutadas

| Verificacion | Resultado |
| --- | --- |
| `npm audit --audit-level=moderate` | Completa: 35 vulnerabilidades (2 criticas, 11 altas, 21 moderadas, 1 baja). |
| `npm run typecheck` | Fallida en web por importaciones inexistentes de contenido. Shared y mobile correctos. |
| `npm --workspace @northacoustics/web run build` | No finalizo antes del limite de aproximadamente 62 minutos del entorno. No debe interpretarse como build validado. |
| Repositorio Git | No se encontro directorio `.git` en el monorepo revisado; no es posible crear el commit requerido por fase. |

## 12. Priorizacion de acciones

1. Contener exposicion de datos y generacion publica de reportes.
2. Reparar RLS, Storage y el modelo de organizacion/roles.
3. Recuperar typecheck y separar contenido NorthAcoustics de contenido ajeno.
4. Actualizar dependencias criticas con matriz de compatibilidad y pruebas.
5. Endurecer sincronizacion offline y validaciones de captura.
6. Profesionalizar reportes, calidad, observabilidad y entrega continua.

## 13. Plan de modernizacion por fases

### Fase 2 - Estabilizacion y seguridad base

Alcance: proteger rutas API y Edge Function, eliminar credenciales de ejemplo, definir autenticacion/autorizacion web, corregir contenido ajeno y recuperar typecheck, restringir modo demo y sustituir persistencia local de contacto.

Estimacion: 5 a 8 dias habiles.

Criterios de salida: typecheck y build reproducibles, rutas de datos protegidas, sin claves de servicio expuestas a flujos publicos, contenido coherente con NorthAcoustics.

### Fase 3 - Datos, RLS y sincronizacion confiable

Alcance: modelo de organizaciones, politicas RLS/Storage por tenant, indices, migracion de datos si aplica, versionado de entidades, conflictos, reintentos, telemetria y recuperacion de cola.

Estimacion: 10 a 15 dias habiles.

Criterios de salida: usuarios aislados por organizacion, operaciones auditables, conflictos visibles y sincronizacion recuperable.

### Fase 4 - Operacion de terreno y calidad

Alcance: validaciones de medicion, seleccion de punto, equipos/calibraciones/checklists/firmas integrados, evidencia remota consistente, flujos de error y accesibilidad.

Estimacion: 8 a 12 dias habiles.

Criterios de salida: captura operativa verificable, trazabilidad completa y experiencia movil apta para trabajo de terreno.

### Fase 5 - Reportes y panel profesional

Alcance: panel web autenticado, filtros y paginacion, reportes robustos con evidencia y firmas, exportaciones controladas, indicadores y permisos de rol.

Estimacion: 10 a 15 dias habiles.

Criterios de salida: reportes confiables, panel seguro y uso administrable por perfiles definidos.

### Fase 6 - Calidad, despliegue y operacion continua

Alcance: pruebas unitarias, integracion y E2E prioritarias; CI/CD; analisis estatico; monitoreo; respaldos; documentacion de despliegue y respuesta a incidentes.

Estimacion: 7 a 12 dias habiles.

Criterios de salida: pipeline automatizado, cobertura de flujos criticos, alertas y procedimiento de recuperacion documentado.

Estimacion total orientativa: 40 a 62 dias habiles, ajustable tras definir usuarios, roles, datos existentes e integraciones de instrumentos.

## 14. Recomendacion de arranque

No se recomienda desplegar nuevas capacidades ni abrir acceso a terceros antes de ejecutar la Fase 2 y la parte de aislamiento de datos de la Fase 3. El primer hito debe ser asegurar que cada persona solo vea y opere datos autorizados, y que la generacion de reportes no pueda ser invocada publicamente.

La ejecucion de fases requiere una ubicacion Git valida para registrar commits. El monorepo revisado no contiene `.git`; antes de continuar con cambios debe proporcionarse el repositorio correcto o autorizar la inicializacion y vinculacion de uno.
