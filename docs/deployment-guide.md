# NorthAcoustics - Deployment Guide

Objetivo: permitir despliegue desde cero cuando existan Supabase y Git operativos.

## 1. Preparar repositorio

1. Clonar el repositorio Git oficial de NorthAcoustics.
2. Confirmar rama base:
   ```bash
   git status
   git branch
   ```
3. Instalar dependencias:
   ```bash
   npm install
   ```
4. Validar:
   ```bash
   npm run typecheck
   npm run lint:web
   npm run build:web
   npm audit --audit-level=critical
   ```

## 2. Preparar Supabase

1. Crear proyecto Supabase para staging o produccion.
2. Obtener:
   - Project ref.
   - Project URL.
   - Anon key.
   - Service role key.
3. Login CLI:
   ```bash
   npx supabase login
   ```
4. Vincular proyecto:
   ```bash
   npx supabase link --project-ref <project-ref>
   ```
5. Revisar migraciones pendientes:
   ```bash
   npx supabase migration list
   ```
6. Aplicar migraciones:
   ```bash
   npx supabase db push
   ```
7. Verificar tablas, RLS e indices desde Supabase Studio.

## 3. Configurar Storage

Crear buckets:

- `project-photos`
- `generated-reports`
- `equipment-docs`

Validar que las politicas Storage creadas por migraciones permitan acceso solo a miembros de la organizacion.

## 4. Deploy Edge Function

Configurar secrets:

```bash
npx supabase secrets set SUPABASE_URL=<url>
npx supabase secrets set SUPABASE_ANON_KEY=<anon-key>
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Deploy:

```bash
npx supabase functions deploy generate-report
```

Prueba minima:

- POST sin token debe fallar.
- POST con usuario sin rol reviewer/supervisor debe fallar.
- POST con reviewer/supervisor debe generar reporte.

## 5. Configurar web

En el hosting elegido, configurar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`
- `NEXT_PUBLIC_SITE_URL=https://northacoustics.cl`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CONTACT_SUBMISSIONS_WEBHOOK_URL`

Build command:

```bash
npm run build:web
```

Output: Next.js app.

## 6. Configurar mobile

Configurar variables Expo:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_ENABLE_DEMO_MODE=false`

Validar local:

```bash
npm --workspace @northacoustics/mobile run typecheck
npm --workspace @northacoustics/mobile run dev
```

Para release movil, definir estrategia EAS antes de publicar stores.

## 7. Prueba operacional obligatoria

1. Crear usuario real en Supabase Auth.
2. Confirmar fila en `users`.
3. Confirmar membresia en `organization_members`.
4. Login mobile.
5. Crear cliente.
6. Crear proyecto.
7. Crear punto con GPS.
8. Crear medicion.
9. Adjuntar fotografia.
10. Cortar conectividad.
11. Crear al menos una operacion offline.
12. Restaurar conectividad.
13. Ejecutar sync.
14. Verificar tablas.
15. Verificar Storage.
16. Verificar `/sync`.

## 8. Go/No-Go

Go solo si:

- Migraciones aplicadas.
- RLS validado.
- Storage validado.
- Edge Function validada.
- Offline/online validado.
- Telemetria visible.
- No hay vulnerabilidades criticas.
- Git/CI operativo.
