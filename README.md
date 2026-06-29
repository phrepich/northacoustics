# Northacoustics Field

MVP operativo multiplataforma para levantamiento ambiental en terreno, con foco en campañas acústicas, evidencia técnica y automatización documental.

## Componentes

- `apps/mobile`: Expo + React Native + Expo Router.
- `apps/web`: Next.js App Router.
- `packages/shared`: tipos, seeds, builder de reportes y utilidades compartidas.
- `supabase`: SQL final, seed y función Edge para generación de reportes.

## Archivos de credenciales

### Móvil Expo

Copiar:

- [apps/mobile/.env.example](</C:/Users/phrep/OneDrive - Conix SpA/Documentos/New project/apps/mobile/.env.example>)

A:

- `apps/mobile/.env`

Contenido esperado:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
EXPO_PUBLIC_ENABLE_DEMO_MODE=false
```

### Web Next.js

Copiar:

- [apps/web/.env.local.example](</C:/Users/phrep/OneDrive - Conix SpA/Documentos/New project/apps/web/.env.local.example>)

A:

- `apps/web/.env.local`

Contenido esperado:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
```

Notas:

- Deja `EXPO_PUBLIC_ENABLE_DEMO_MODE=false` y `NEXT_PUBLIC_ENABLE_DEMO_MODE=false` para validación operativa real.
- Solo usa `true` si quieres volver a ejecutar el proyecto en modo demo controlado.

## SQL a aplicar en Supabase

Aplicar primero:

- [supabase/migrations/0001_northacoustics_field.sql](</C:/Users/phrep/OneDrive - Conix SpA/Documentos/New project/supabase/migrations/0001_northacoustics_field.sql>)

Opcionalmente cargar seed base:

- [supabase/seed.sql](</C:/Users/phrep/OneDrive - Conix SpA/Documentos/New project/supabase/seed.sql>)

Buckets esperados en Supabase Storage:

- `project-photos`
- `equipment-docs`
- `generated-reports`

## Comandos exactos en Windows

Abrir PowerShell en la raíz del proyecto:

```powershell
cd "C:\Users\phrep\OneDrive - Conix SpA\Documentos\New project"
```

Instalar dependencias:

```powershell
npm install
```

Validar tipos:

```powershell
npm run typecheck
```

Levantar panel web:

```powershell
npm run dev:web
```

Levantar app móvil Expo:

```powershell
npm run dev:mobile
```

Construir panel web:

```powershell
npm run build:web
```

Validar lint del panel web:

```powershell
npm run lint:web
```

## Checklist operativo exacto

1. Crear el proyecto en Supabase.
2. Ejecutar el SQL principal [0001_northacoustics_field.sql](</C:/Users/phrep/OneDrive - Conix SpA/Documentos/New project/supabase/migrations/0001_northacoustics_field.sql>).
3. Crear un usuario en Supabase Auth con correo y contraseña.
4. Completar `apps/mobile/.env` y `apps/web/.env.local`.
5. Ejecutar `npm install`.
6. Ejecutar `npm run dev:mobile`.
7. Login:
   Inicia sesión con el usuario de Supabase Auth.
8. Crear cliente:
   Entra a `Clientes y proyectos` y guarda un cliente real.
9. Crear proyecto:
   Entra a `Nuevo proyecto` y crea la campaña.
10. Crear punto de medición:
   Abre el proyecto y entra a `Nuevo punto`.
11. Capturar GPS:
   Pulsa `Capturar coordenadas GPS` y concede permisos.
12. Tomar foto:
   Pulsa `Tomar fotografía del punto` y guarda la imagen.
13. Registrar medición acústica:
   Entra a `Nueva medición` y guarda LAeq/Lmax/Lmin y condiciones ambientales.
14. Sincronizar:
   Entra a `Sincronización` y pulsa `Ejecutar sincronización`.
15. Visualizar en panel web:
   Ejecuta `npm run dev:web` y abre [http://localhost:3000/projects](http://localhost:3000/projects).
16. Exportar CSV:
   Pulsa `Exportar CSV`.
17. Generar informe:
   Pulsa `Generar informe PDF`.

## Estado actual del MVP

### Funcional real

- Login con Supabase Auth si hay credenciales.
- Persistencia local en móvil.
- CRUD móvil de clientes.
- CRUD móvil de proyectos.
- Registro de puntos con GPS.
- Captura de fotografía en móvil.
- Registro de mediciones acústicas.
- Cola offline y sincronización a Supabase para clientes, proyectos, puntos, mediciones, condiciones ambientales, fotos y versiones de reporte.
- Panel web con lectura desde Supabase si hay credenciales.
- Filtros administrativos.
- Exportación CSV.
- Generación de informe PDF y HTML descargables.

### Demo opcional

- El modo demo ya no es implícito.
- Solo se activa con `EXPO_PUBLIC_ENABLE_DEMO_MODE=true` y `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`.

## Referencias

- Arquitectura: [docs/architecture.md](</C:/Users/phrep/OneDrive - Conix SpA/Documentos/New project/docs/architecture.md>)
- Roadmap V2: [docs/v2-roadmap.md](</C:/Users/phrep/OneDrive - Conix SpA/Documentos/New project/docs/v2-roadmap.md>)
