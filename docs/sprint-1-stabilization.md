# Sprint 1 - Estabilizacion critica

Fecha: 2026-06-26
Cierre tecnico: 2026-06-28

Estado: cerrado tecnicamente. Queda pendiente registrar commit cuando se trabaje sobre el repositorio Git correcto.

## Objetivo

Resolver los hallazgos P0 y P1 del informe `technical-audit-2026-06-26.md` sin introducir cambios funcionales experimentales.

## Cambios realizados

### Aislamiento por organizacion

- Se agrego la migracion `supabase/migrations/0002_organizations_and_tenant_rls.sql`.
- Crea `organizations` y `organization_members`.
- Conserva los registros existentes dentro de la organizacion inicial `northacoustics`.
- Agrega `organization_id` a las entidades operativas, reportes y auditoria.
- Asigna organizacion por membresia o por la entidad padre mediante triggers, manteniendo los payloads actuales de la aplicacion movil.
- Reemplaza las politicas RLS globales por politicas de acceso por organizacion.
- Restringe Storage de fotos y reportes a proyectos de organizaciones autorizadas.
- El trigger de nuevos usuarios crea una membresia en la organizacion inicial para preservar compatibilidad del flujo actual.

### Proteccion de reportes

- `apps/web/app/api/reports/demo/route.ts` ya no expone una ruta GET con efectos de escritura.
- La generacion requiere POST, token Bearer de Supabase y rol `reviewer` o `supervisor`.
- Los datos se cargan filtrados por `organization_id`.
- Se sanitiza el nombre de archivo y se manejan errores de Storage y base de datos.
- `apps/web/lib/report-authorization.ts` centraliza autenticacion, rol y membresia.
- `supabase/functions/generate-report/index.ts` valida metodo, payload, JWT, rol y pertenencia del proyecto antes de usar la clave de servicio.
- La funcion Edge escapa contenido HTML generado desde datos de usuario.

### Credenciales y persistencia

- Se eliminaron las credenciales de ejemplo prellenadas en `apps/mobile/app/login.tsx`.
- `apps/web/app/api/contact/route.ts` ya no escribe datos personales a archivos locales.
- El contacto valida y normaliza el payload, incorpora un honeypot y reenvia a `CONTACT_SUBMISSIONS_WEBHOOK_URL`.
- Se documento la variable de entorno en `.env.example`.

### Compilacion y contenido web

- Se reemplazo el contenido corporativo ajeno por contenido NorthAcoustics en rutas web, metadata, logo y footer.
- Se restauraron los exports de contenido requeridos por las paginas, resolviendo el error de typecheck detectado en Fase 1.
- Se conserva el sistema visual existente para evitar un rediseño no solicitado.

### Dependencias

- Next.js y `eslint-config-next` se actualizaron de `15.1.6` a `15.5.19`.
- React 18.3 se mantiene para no ampliar innecesariamente el alcance de compatibilidad.
- `npm audit fix` elimino la vulnerabilidad critica transitiva de `shell-quote`.

## Riesgos mitigados

- Generacion publica de reportes con clave de servicio.
- Lectura y escritura transversal entre usuarios autenticados de distintas organizaciones.
- Acceso a Storage sin validacion de pertenencia al proyecto.
- Funcion Edge de reportes sin autenticacion ni autorizacion explicita.
- Credenciales de ejemplo visibles en el login.
- Persistencia de PII en filesystem local no apto para serverless.
- Contenido CQ/Condor Quality ajeno a NorthAcoustics y typecheck roto.
- Version vulnerable de Next.js identificada en la auditoria.

## Despliegue de base de datos

La migracion debe aplicarse en un entorno controlado de Supabase antes de desplegar el frontend:

1. Respaldar la base de datos.
2. Aplicar `0002_organizations_and_tenant_rls.sql`.
3. Verificar que los usuarios existentes fueron agregados a `organization_members`.
4. Probar lectura y escritura con dos usuarios de organizaciones distintas.
5. Confirmar acceso a fotos y reportes solo dentro del proyecto autorizado.
6. Configurar `CONTACT_SUBMISSIONS_WEBHOOK_URL` en el entorno de produccion.

La organizacion inicial conserva la compatibilidad con los usuarios y registros existentes. La creacion de organizaciones adicionales y la administracion de membresias requieren un flujo administrativo controlado antes de abrir multi-tenant a terceros.

## Pruebas ejecutadas

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` antes de actualizar Next | Correcto en shared, mobile y web. |
| `npm run typecheck` despues de los cambios de codigo | Correcto en shared, mobile y web. |
| `npm install` | Correcto; `package-lock.json` actualizado. |
| `npm audit fix` | Correcto; no quedan vulnerabilidades criticas. Quedan 8 altas y 20 moderadas transitivas, principalmente Expo/React Native, que exigen una actualizacion mayor y no se forzaron. |
| `npm run typecheck` en copia limpia fuera de OneDrive | Correcto en shared, mobile y web. |
| `npm audit --audit-level=critical` en copia limpia fuera de OneDrive | Correcto, exit code 0. Se mantienen vulnerabilidades altas y moderadas transitivas que requieren cambios mayores de Expo/React Native y no forman parte del cierre P0/P1. |
| `npm run build:web` en copia limpia fuera de OneDrive | Correcto. Next.js 15.5.19 compila, genera 18 rutas y finaliza `Collecting build traces`. |

## Causa raiz del bloqueo de build local

El fallo original de `npm run build:web` no corresponde a codigo fuente ni a configuracion de Next.js. La compilacion alcanzaba correctamente `Compiled successfully`, generaba paginas estaticas y luego fallaba con `UNKNOWN: unknown error, read` al leer archivos dentro de `node_modules` ubicado en la carpeta sincronizada por OneDrive.

Archivos/dependencias observadas durante el diagnostico:

- `node_modules/next/node_modules/postcss/lib/postcss.js`
- `node_modules/eslint-config-next/index.js`
- `eslint-plugin-react` cargado por `eslint-config-next/core-web-vitals`

La validacion con una copia limpia en `C:\na-clean-build`, instalacion nueva de dependencias y el mismo codigo fuente confirma que el problema era una instalacion local danada o lectura inestable de dependencias dentro de OneDrive, no un defecto del proyecto.

## Entorno validado

- Node.js: `v22.22.3`
- npm: `10.9.8`
- Next.js web: `15.5.19`
- React/React DOM: `18.3.1`

No se modifico el runtime global ni se aplicaron cambios de NVM durante el cierre. Para builds reproducibles se recomienda ejecutar instalacion y compilacion fuera de carpetas sincronizadas por OneDrive, o usar CI con checkout limpio y `npm install`/`npm ci`.

## Estado Git

Esta copia del monorepo no contiene directorio `.git`, por lo que no es posible realizar el commit requerido desde este directorio. No se inicializo un repositorio nuevo para evitar crear historial incorrecto. Se requiere trabajar sobre el repositorio correcto o recibir autorizacion explicita para inicializar Git.

## Cierre Sprint 1

Sprint 1 queda cerrado tecnicamente bajo estos criterios:

- `npm run typecheck`: OK.
- `npm audit --audit-level=critical`: OK.
- `npm run build:web`: OK en copia limpia reproducible.
- Sin credenciales de ejemplo en el codigo fuente revisado.
- Sin contenido ajeno a NorthAcoustics en el codigo fuente web/mobile revisado.
- Rutas criticas de reportes protegidas por autenticacion, rol y organizacion.
- RLS y aislamiento por organizacion implementados en migracion.
- Edge Function de reportes protegida.
- Persistencia local de contacto reemplazada por webhook configurable.

No iniciar Sprint 2 hasta registrar estos cambios en el repositorio Git correcto y validar la aplicacion de la migracion en Supabase.
