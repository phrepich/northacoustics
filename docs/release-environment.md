# NorthAcoustics - Environment Configuration

Estado: preparacion de release, Fase 0. No contiene secretos reales.

## Archivos generados

- `.env.development.example`
- `.env.staging.example`
- `.env.production.example`

Copiar el archivo correspondiente al ambiente y completar valores reales en el gestor seguro del entorno. No versionar `.env`, `.env.local` ni archivos con secretos reales.

## Variables

| Variable | Uso | Obligatoria | Ejemplo | Impacto |
| --- | --- | --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase usada por la app movil Expo. | Si, mobile real. | `https://prod-your-project.supabase.co` | Sin esta variable la app movil queda en modo sin backend o falla login/sync. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Llave anonima publica para Supabase en mobile. | Si, mobile real. | `prod-anon-key` | Permite autenticacion y acceso sujeto a RLS. Debe ser anon key, nunca service role. |
| `EXPO_PUBLIC_ENABLE_DEMO_MODE` | Activa datos demo locales en mobile. | Si, definir explicitamente. | `false` | En produccion debe ser `false`; si queda `true`, los usuarios veran datos demo. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase usada por Next.js client/server. | Si, web real. | `https://prod-your-project.supabase.co` | Sin esta variable la web usa fallback/demo o falla integraciones. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave anonima publica para web. | Si, web real. | `prod-anon-key` | Permite validar sesiones desde rutas protegidas. Debe estar limitada por RLS. |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | Activa modo demo web. | Si, definir explicitamente. | `false` | En produccion debe ser `false` para evitar datos simulados. |
| `NEXT_PUBLIC_SITE_URL` | URL publica canonica de la web para SEO, sitemap y robots. | Si, web publica. | `https://northacoustics.cl` | Si queda mal configurada, buscadores y previews pueden apuntar a un dominio incorrecto. |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave server-only para rutas web administrativas y Edge Function. | Si, web/Edge real. | `<production-service-role-key>` | Alta criticidad. Nunca exponer al cliente; ignora RLS si se usa mal. |
| `SUPABASE_URL` | URL Supabase para Edge Function `generate-report`. | Si, Edge Function. | `https://prod-your-project.supabase.co` | Sin esta variable la funcion no puede validar JWT ni escribir reportes. |
| `SUPABASE_ANON_KEY` | Anon key usada por Edge Function para validar token Bearer. | Si, Edge Function. | `<production-anon-key>` | Sin esta variable la funcion no puede autenticar solicitudes. |
| `CONTACT_SUBMISSIONS_WEBHOOK_URL` | Webhook server-side para derivar formularios de contacto. | Opcional si no se usa contacto; recomendado. | `https://hooks.example/contact` | Si falta, `/api/contact` responde 503 para evitar persistir PII localmente. |
| `SUPABASE_ACCESS_TOKEN` | Token CLI para `npx supabase link/db push` en CI o maquina de despliegue. | Si para CI/CD Supabase. | `<supabase-access-token>` | Permite aplicar migraciones. Debe vivir solo en secrets del CI. |
| `SUPABASE_PROJECT_REF` | Identificador del proyecto Supabase para link/deploy. | Si para CI/CD Supabase. | `abcdefghijklmnop` | Evita aplicar migraciones al proyecto incorrecto. |

## Politica por ambiente

| Ambiente | Demo mode | Proyecto Supabase | Usuarios |
| --- | --- | --- | --- |
| Development | Permitido `true` | Local o dev remoto | Usuarios de desarrollo. |
| Staging | `false` | Proyecto staging aislado | Usuarios QA/operacion controlados. |
| Production | `false` obligatorio | Proyecto produccion | Usuarios reales con roles y organizacion. |

## Validaciones previas al release

- Confirmar que ninguna variable con `SERVICE_ROLE` tiene prefijo `NEXT_PUBLIC_` ni `EXPO_PUBLIC_`.
- Confirmar que `*_ENABLE_DEMO_MODE=false` en staging y produccion.
- Confirmar que `NEXT_PUBLIC_SITE_URL` apunta al dominio publico correcto del ambiente.
- Confirmar que las llaves anon corresponden al mismo proyecto que la URL.
- Confirmar que Edge Function tiene `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
- Confirmar que `CONTACT_SUBMISSIONS_WEBHOOK_URL` responde con 2xx ante payload valido.
