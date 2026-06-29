# NorthAcoustics - Release Preparation Fase 0

Fecha: 2026-06-29

Estado: completado a nivel documental/preparacion. No se inicio Sprint 4.

## Objetivo

Dejar el proyecto preparado para produccion de forma que, cuando existan Supabase vinculado y Git operativo, el despliegue pueda ejecutarse rapidamente.

## Entregables

| Area | Archivo |
| --- | --- |
| Variables por ambiente | `.env.development.example`, `.env.staging.example`, `.env.production.example` |
| Documentacion de variables | `docs/release-environment.md` |
| Checklist infraestructura | `docs/production-infrastructure-checklist.md` |
| Deployment guide | `docs/deployment-guide.md` |
| Git readiness | `.gitignore`, `.gitattributes`, `docs/git-readiness.md` |
| Supabase readiness | `docs/supabase-readiness-checklist.md` |
| Runbook operacion | `docs/runbook-operations.md` |
| Runbook recuperacion | `docs/runbook-recovery.md` |
| Runbook incidentes | `docs/runbook-incidents.md` |
| Runbook rollback | `docs/runbook-rollback.md` |
| Linea base calidad | `docs/quality-baseline-2026-06-29.md` |

## Orden recomendado para produccion

1. Resolver Git oficial NorthAcoustics.
2. Cargar secrets por ambiente.
3. Vincular Supabase.
4. Aplicar migraciones.
5. Crear buckets Storage.
6. Deploy Edge Function.
7. Ejecutar QA offline/online real.
8. Configurar hosting web.
9. Configurar pipeline CI/CD.
10. Ejecutar Go/No-Go.

## Estado de bloqueo heredado

Persisten los bloqueos del cierre operativo previo a Sprint 4:

- Supabase no vinculado.
- Sin credenciales reales.
- Git raiz no operativo.
- Prueba real offline/online pendiente.

## Validacion local

Durante esta fase no se modifico funcionalidad. Los cambios son documentacion, archivos de configuracion de ejemplo y preparacion Git.

Antes de release real ejecutar:

```bash
npm run typecheck
npm run lint:web
npm run build:web
npm audit --audit-level=critical
```
