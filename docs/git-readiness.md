# NorthAcoustics - Git Readiness

Estado: preparado sin inicializar repositorio.

## Estado actual

- No existe repositorio Git operativo en la raiz del proyecto.
- `.git` aparece como placeholder/reparse point de OneDrive, pero `git rev-parse --show-toplevel` falla.
- No se debe inicializar Git sin autorizacion explicita o remote oficial.

## Archivos preparados

- `.gitignore`
- `.gitattributes`

## Estrategia de ramas

- `main`: produccion. Protegida. Solo merges via Pull Request.
- `develop`: integracion continua para staging.
- `release/x.y.z`: estabilizacion previa a produccion.
- `feature/<scope>-<short-description>`: desarrollo funcional o tecnico.
- `hotfix/x.y.z`: correcciones urgentes desde produccion.

## Convencion de commits

Usar Conventional Commits:

- `feat:` nueva funcionalidad.
- `fix:` correccion.
- `refactor:` cambio interno sin comportamiento visible.
- `docs:` documentacion.
- `chore:` tareas de mantenimiento.
- `test:` pruebas.
- `ci:` pipelines.
- `build:` dependencias/build.

Ejemplos:

- `docs: add production deployment guide`
- `refactor: isolate offline sync engine`
- `fix: protect report generation route`

## Estrategia de releases

Versionado SemVer:

- `MAJOR`: cambios incompatibles.
- `MINOR`: funcionalidades compatibles.
- `PATCH`: fixes compatibles.

Tag format:

- `v0.1.0`
- `v0.1.1`
- `v0.2.0`

## Protecciones requeridas

- PR obligatorio hacia `main`.
- Checks obligatorios:
  - `npm run typecheck`
  - `npm run lint:web`
  - `npm run build:web`
  - `npm audit --audit-level=critical`
- Revisión obligatoria de al menos 1 responsable técnico.
- Bloquear push directo a `main`.
- Requerir branches actualizadas antes de merge.

## Primer commit recomendado

Cuando exista repositorio correcto:

```bash
git add .
git commit -m "chore: prepare NorthAcoustics production release baseline"
```

Antes del commit, revisar que no existan secretos reales:

```bash
rg -n "service_role|sbp_|eyJ|SUPABASE_SERVICE_ROLE_KEY=.*[A-Za-z0-9]" . --glob "!node_modules/**"
```
