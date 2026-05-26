# 🤝 Guía de Contribución — NorthAcoustics

¡Gracias por querer contribuir a NorthAcoustics! Esta guía establece los estándares para mantener un repositorio profesional, seguro y de alta calidad.

---

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Cómo Contribuir](#cómo-contribuir)
3. [Git Workflow](#git-workflow)
4. [Estándares de Commits](#estándares-de-commits)
5. [Pull Requests](#pull-requests)
6. [Revisión de Código](#revisión-de-código)
7. [Seguridad](#seguridad)
8. [Reportar Bugs](#reportar-bugs)

---

## 💼 Código de Conducta

- **Respeto**: Trata a todos con respeto profesional
- **Claridad**: Comunica de forma clara y directa
- **Inclusión**: Bienvenida a contribuidores de todos los niveles
- **Profesionalismo**: Lenguaje profesional en todos los espacios

---

## 🤔 Cómo Contribuir

### Tipos de Contribuciones

✅ **Bienvenidas**:
- Bug fixes (con test)
- Mejoras de performance
- Documentación
- Nuevas features (coordinadas)
- Refactoring de código existente

❌ **No permitidas sin coordinación**:
- Cambios mayores en arquitectura
- Cambios en stack tecnológico
- Cambios en schema Supabase
- Cambios en estructura monorepo

### Proceso General

1. **Revisa issues abiertos** para no duplicar trabajo
2. **Crea un issue** para coordinar features grandes
3. **Crea branch feature** desde `develop`
4. **Haz commits pequeños y claros**
5. **Abre Pull Request** con descripción detallada
6. **Responde feedback** de revisores
7. **Merge automático** cuando aprueben

---

## 🌳 Git Workflow

### Ramas Principales

```
main (producción) ← ← ← ← ← ← ← ← ← ←
  ↑                                   ↑
  └─ merged cuando deploy exitoso     release tags
     
develop (staging) ← ← ← ← ← ← ← ← ← ←
  ↑                                    ↑
  ├─ feature/*, bugfix/*, docs/*      └─ merge cuando listo
  │
  └─ merge cuando PR aprobado
```

### Nomenclatura de Ramas

```bash
# FEATURE (nueva funcionalidad)
feature/user-authentication
feature/mobile-offline-sync
feature/report-generator

# BUGFIX (correcciones)
bugfix/rls-policy-error
bugfix/photo-upload-crash
bugfix/typo-in-docs

# DOCUMENTATION
docs/add-deployment-guide
docs/fix-readme

# HOTFIX (producción urgente - solo desde main)
hotfix/security-patch
hotfix/critical-bug
```

**Regla**: Siempre basarse en `develop`, excepto hotfixes que van de `main`.

---

## 📝 Estándares de Commits

### Formato Convencional

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (Obligatorio)

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **refactor**: Cambio sin nueva funcionalidad
- **perf**: Mejora de performance
- **docs**: Cambios en documentación
- **style**: Formato, semicolons, etc (no lógica)
- **test**: Agregar o editar tests
- **chore**: Actualizaciones de dependencias, etc

### Scope (Recomendado)

Indica qué parte del código:
- `auth` - autenticación
- `db` - database queries
- `mobile` - app Expo
- `web` - app Next.js
- `rls` - Row Level Security
- `storage` - file uploads

### Subject (Obligatorio)

- Imperativo presente: "add" no "added" o "adds"
- Lowercase
- Sin punto final
- Máx 50 caracteres

### Body (Opcional)

- Explica qué y por qué
- Máx 72 caracteres por línea
- Separa con línea vacía del subject

### Footer (Opcional)

- Referencias a issues: `Fixes #123`
- Breaking changes: `BREAKING CHANGE: descripción`

### Ejemplos ✅

```
feat(auth): implement JWT token refresh

Add automatic token refresh when JWT is expiring.
Implements auto-refresh in Supabase client config
with 5-minute buffer before actual expiration.

Fixes #456
```

```
fix(mobile): prevent photo upload timeout

Increase timeout threshold from 30s to 120s
for large photos on slow networks.

Fixes #789
```

```
docs(readme): update installation instructions
```

### Mal formato ❌

```
✗ fixed bug
✗ Added new feature
✗ WIP: work in progress
✗ Update stuff
```

---

## 🔀 Pull Requests

### 1. Antes de Crear PR

```bash
# Actualizar develop
git checkout develop
git pull origin develop

# Crear branch
git checkout -b feature/tu-feature

# Hacer commits
# ...

# Antes de push:
npm run format:fix      # Auto-format código
npm run typecheck       # Verificar tipos
npm run lint            # Lint y mostrar errores

# Si hay errores, corregir y commitear
git add .
git commit -m "fix: resolve lint errors"

# Push
git push origin feature/tu-feature
```

### 2. Descripción del PR

Usa el template automático (`.github/PULL_REQUEST_TEMPLATE.md`):

```markdown
## 🎯 Descripción

Brief description of changes.

## 📋 Tipo de Cambio

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## 🧪 Cómo Testé Esto

Steps to reproduce/test.

## ✅ Checklist

- [x] Mi código sigue estándares del proyecto
- [x] He ejecutado `npm run format:fix`
- [x] He ejecutado `npm run typecheck` sin errores
- [x] He ejecutado `npm run lint` sin errores
- [x] Documentación actualizada
- [x] NO hay variables de entorno/secretos
- [x] NO hay console.log() sin remover

## 📝 Notas Adicionales

Anything reviewers should know.
```

### 3. Reglas de PR

- **Pequeño es mejor**: 200-400 líneas idealmente
- **Un cambio por PR**: No mezcles features
- **Título descriptivo**: "feat: add user profile page" no "fix stuff"
- **No merge mientras esté rojo** en CI/CD

---

## 👀 Revisión de Código

### Para Revisores

✅ Verifica:
- Código sigue convenciones
- Tipos TypeScript correctos
- No hay vulnerabilidades de seguridad
- Tests incluidos/actualizados
- Documentación completa
- Commits claros y lógicos

❌ No perder tiempo en:
- Preferencias de estilo (usa formatter automático)
- Comentarios triviales

### Para Autores de PR

- Responde proactivamente a feedback
- No discutas a menos que estés en desacuerdo
- Si pides cambios grandes, pregunta en issue primero
- Tag a reviewers si no han respondido en 24h

---

## 🔐 Seguridad — CRÍTICO

### ✅ PERMITIDO

```typescript
// Variables públicas en commits
NEXT_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...

// Hardcoded en código
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRIES = 3;
```

### ❌ PROHIBIDO — Nunca Commitar

```
.env              # Variables privadas
.env.local        # Variables locales
.env.*.local      # Archivos env específicos
*.pem             # Certificados privados
*.key             # Llaves privadas
service_role_key  # Supabase service role
api_key           # Cualquier API key
token             # Auth tokens
password          # Contraseñas
secret            # Secretos
firebase-adminsdk-*.json  # Service accounts
```

### Pre-commit Check

Antes de hacer commit, verifica:

```bash
# Buscar patrones sospechosos
git diff --cached | grep -i "password\|secret\|key\|token" && echo "⚠️ HAZARD!" || echo "✅ Safe"

# Verificar .env files
git status | grep ".env" && echo "⚠️ DETECTED" || echo "✅ Safe"
```

### Si Accidentalmente Commits Secretos

**INMEDIATO**:
1. NO hagas push
2. Revierte el commit: `git reset HEAD~1`
3. Regenera cualquier key expuesta en Supabase
4. Reporta al admin

**Si ya está en remoto**:
1. Avisa a admin inmediatamente
2. Regenera keys
3. Usa `git filter-branch` o `git-filter-repo` para limpiar historia

---

## 🐛 Reportar Bugs

### Template para Issues

```markdown
## 📍 Descripción

Clear description of the bug.

## 🔄 Pasos para Reproducir

1. Abre la app
2. Ve a la página de proyectos
3. Haz click en "Crear proyecto"
4. Se produce el error

## 💥 Error Observado

[Incluye screenshot o stack trace]

## ✅ Comportamiento Esperado

What should happen instead.

## 💻 Ambiente

- OS: macOS 14.5
- Browser: Chrome 125
- App version: 0.1.0
- Node: 18.18.0

## 📎 Archivos Relacionados

If applicable: files involved in the bug.
```

---

## ✨ Mejores Prácticas

### Commits

```bash
✅ git commit -m "feat(db): add measurement caching"
✅ git commit -m "fix: resolve RLS policy conflict"
❌ git commit -m "update"
❌ git commit -m "WIP"
```

### Branches

```bash
✅ git checkout -b feature/mobile-offline-sync
✅ git checkout -b bugfix/auth-token-refresh
❌ git checkout -b my-changes
❌ git checkout -b fix/bug
```

### Push

```bash
# Siempre push a rama feature, NUNCA a main/develop
✅ git push origin feature/auth-improvements
❌ git push origin develop  # Error - debe ser PR
❌ git push origin main     # NUNCA manualmente
```

### Antes de PR

```bash
# Siempre: typecheck → lint → format
npm run typecheck    # Errores fatales
npm run lint         # Problemas de código
npm run format:fix   # Auto-fix
npm run build        # Verifica build
```

---

## 📚 Recursos

- [Convencional Commits](https://www.conventionalcommits.org/)
- [Git Workflow Guide](https://github.com/nvie/gitflow)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/)
- [Our Architecture Docs](./docs/ARCHITECTURE.md)

---

## 🎯 Filosofía

**Calidad over Velocidad**: Preferimos PRs bien hechas que requieren 2 días de review, que PRs rápidas que crean deuda técnica.

**Seguridad First**: Mejor rechazar un feature si tiene riesgos de seguridad que incluirlo.

**Documentación Always**: Si es complicado de entender, incluye docs.

---

**¡Gracias por mantener NorthAcoustics profesional y seguro!** 🙏

Preguntas? Abre un GitHub Discussion o escribe a phrepich@gmail.com
