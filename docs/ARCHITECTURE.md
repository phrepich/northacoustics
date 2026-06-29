# Arquitectura Northacoustics Field

## Capas

### 1. Captura en terreno

- App Expo Router con formularios por etapas.
- Captura de GPS con `expo-location`.
- Captura de fotos con `expo-image-picker`.
- Persistencia local con `@react-native-async-storage/async-storage`.
- Cola de sincronización con reintentos y marcas `dirty`.

### 2. Plataforma de datos

- Supabase Auth para login y recuperación de contraseña.
- PostgreSQL en Supabase con RLS.
- Storage para fotos, certificados y reportes generados.
- `audit_logs` para trazabilidad transversal.

### 3. Revisión administrativa

- Next.js App Router con panel de control por proyecto.
- Filtros por cliente, comuna, responsable y fecha.
- Vista tabular y mapa de puntos.
- Exportación de CSV y disparo de generación documental.

### 4. Automatización documental

- Consulta estructurada desde Supabase.
- Builder compartido de payload documental.
- Render HTML imprimible en el MVP.
- Persistencia de versiones en `generated_reports`.

## Estructura de carpetas

```text
.
|-- apps
|   |-- mobile
|   |   |-- app
|   |   |-- components
|   |   |-- lib
|   |   `-- providers
|   `-- web
|       |-- app
|       |-- components
|       `-- lib
|-- packages
|   `-- shared
|       `-- src
|-- supabase
|   |-- functions
|   `-- migrations
`-- docs
```

## Resolución de conflictos offline

- Entidades con `updated_at`, `created_by` y `updated_by`.
- Cola local con operaciones `upsert`.
- En sincronización, el servidor compara `updated_at`.
- Si existe conflicto, se conserva el registro más reciente y se escribe un `audit_log`.
- Las fotos quedan desacopladas del formulario, de modo que un reintento fallido no bloquea el resto del punto.

## Módulos del MVP

- Autenticación y roles.
- Clientes y proyectos.
- Puntos de medición.
- Mediciones acústicas.
- Condiciones ambientales.
- Registro fotográfico.
- Checklist y firma simple.
- Revisión web.
- Generación documental base.

