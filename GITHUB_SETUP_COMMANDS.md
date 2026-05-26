# 🔧 GitHub Setup Commands — NorthAcoustics

Comandos exactos para inicializar el repositorio Git y conectar con GitHub.

---

## 📋 Requisitos

- ✅ Git instalado (`git --version`)
- ✅ GitHub account creada (https://github.com)
- ✅ SSH key configurada (opcional pero recomendado)
- ✅ Acceso a northacoustics organization o crear repo personal

---

## 🚀 Paso 1: Verificar Git Configuración

```bash
# Verificar que Git esté instalado
git --version

# Configurar nombre (una sola vez)
git config --global user.name "Tu Nombre"

# Configurar email (debe coincidir con GitHub)
git config --global user.email "tu@email.com"

# Verificar configuración
git config --global --list
```

---

## 🎯 Paso 2: Inicializar Repositorio Local

```bash
# Navegar a la carpeta del proyecto
cd ~/northacoustics-field-clean

# Inicializar Git
git init

# Ver estado
git status
```

**Resultado esperado**:
```
On branch master

Initial commit

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .env.example
        .github/
        .gitignore
        README.md
        ...
```

---

## 📌 Paso 3: Crear Rama Principal (main)

```bash
# Renombrar master → main (si es necesario)
git branch -M main

# Verificar rama actual
git branch
# Debe mostrar: * main
```

---

## 📝 Paso 4: Hacer Primer Commit

```bash
# Agregar todos los archivos
git add .

# Verificar qué se va a commitear
git status

# Hacer commit inicial
git commit -m "feat: Initialize NorthAcoustics repository with professional structure

- Add README with project overview and installation guide
- Add CONTRIBUTING with git workflow and standards
- Add documentation in /docs (Architecture, Supabase, Deployment, Roadmap)
- Add .gitignore with comprehensive exclusions for secrets
- Add .env.example as template
- Add GitHub Actions CI/CD pipeline
- Add Pull Request template
- Setup professional monorepo structure"

# Verificar commit
git log --oneline
```

---

## 🔗 Paso 5: Conectar con GitHub Remoto

### 5.1 Crear Repositorio en GitHub

1. Ir a: https://github.com/new
2. Crear repositorio:
   - **Repository name**: `northacoustics`
   - **Description**: Professional acoustic monitoring platform
   - **Public or Private**: Private (después cambiar a Public si deseas)
   - **Add .gitignore**: No (ya tenemos uno)
   - **Add LICENSE**: MIT (agregar después)
   - Click "Create repository"

3. **Copiar URL del repositorio**:
   - HTTPS: `https://github.com/USERNAME/northacoustics.git`
   - SSH: `git@github.com:USERNAME/northacoustics.git`

### 5.2 Agregar Remote

```bash
# Usando HTTPS (más simple)
git remote add origin https://github.com/USERNAME/northacoustics.git

# O usando SSH (recomendado si tienes SSH key)
git remote add origin git@github.com:USERNAME/northacoustics.git

# Verificar remote
git remote -v
# Debe mostrar:
# origin  https://github.com/USERNAME/northacoustics.git (fetch)
# origin  https://github.com/USERNAME/northacoustics.git (push)
```

---

## 🚀 Paso 6: Push Inicial

```bash
# Hacer push de main branch
git push -u origin main
# -u = establecer upstream (para future git push)

# Si da error "fatal: The current branch main has no upstream branch"
git branch --set-upstream-to=origin/main main
git push
```

**Si se pide contraseña HTTPS**:
```bash
# Generar Personal Access Token en GitHub:
# Settings > Developer settings > Personal access tokens > Generate new token
# Usar token como "password" cuando se pida
```

---

## 🌿 Paso 7: Crear Rama Develop

```bash
# Crear rama develop basada en main
git checkout -b develop

# Push develop a remoto
git push -u origin develop

# Verificar ramas
git branch -a
# Debe mostrar:
# * develop
#   main
#   remotes/origin/develop
#   remotes/origin/main
```

---

## 🔐 Paso 8: Configurar Branch Protection (GitHub Web)

1. Ir a: **GitHub** > **Settings** > **Branches**
2. Click "Add rule"
3. Configurar para rama `main`:
   - **Require pull request reviews before merging**: ✓
   - **Dismiss stale pull request approvals**: ✓
   - **Require status checks to pass**: ✓
   - **Include administrators**: ✓
4. Configurar para rama `develop`:
   - **Require pull request reviews before merging**: ✓
   - **Require status checks to pass**: ✓
   - (Menos restrictivo que main)

---

## 🔑 Paso 9: Agregar Secrets a GitHub

Para CI/CD (GitHub Actions):

1. Ir a: **GitHub** > **Settings** > **Secrets and variables** > **Actions**
2. Click "New repository secret"
3. Agregar cada secret:

```
NEXT_PUBLIC_SUPABASE_URL
Valor: https://your-project.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIs...

SUPABASE_SERVICE_ROLE_KEY
Valor: eyJhbGciOiJIUzI1NiIs...

SUPABASE_DB_PASSWORD
Valor: super_secret_password

VERCEL_TOKEN
Valor: [Obtener de Vercel dashboard]

VERCEL_ORG_ID
Valor: [Obtener de Vercel team settings]

VERCEL_PROJECT_ID
Valor: [Obtener de Vercel project settings]

SLACK_WEBHOOK (Opcional)
Valor: https://hooks.slack.com/services/...
```

---

## ✅ Paso 10: Verificar Setup

```bash
# Verificar ramas locales
git branch -a

# Verificar commits
git log --oneline

# Verificar remoto
git remote -v

# Verificar estado
git status
# Debe mostrar: nothing to commit, working tree clean
```

---

## 📊 Verificación en GitHub Web

Ir a **GitHub** > **Repository** y verificar:

✅ **Code** tab:
- Código visible
- .gitignore funcionando (no hay node_modules, .env, etc)
- README visible en preview

✅ **Settings** > **Branches**:
- Branch protection rules activas

✅ **Settings** > **Secrets**:
- Todos los secrets configurados

✅ **Actions** tab:
- CI/CD pipeline configured (si hay .github/workflows/)

✅ **Pull requests** tab:
- PR template visible (de .github/PULL_REQUEST_TEMPLATE.md)

---

## 🔄 Workflow de Desarrollo

### Para crear nueva feature:

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear rama feature
git checkout -b feature/nombre-feature

# 3. Hacer cambios
# ...editar archivos...

# 4. Commit local
git add .
git commit -m "feat(scope): descripción"

# 5. Push a remoto
git push origin feature/nombre-feature

# 6. En GitHub: Crear Pull Request
# - Title: "feat: descripción"
# - Description: incluir por qué, qué cambió
# - Asignar reviewers
# - Esperar approvals + checks passed

# 7. Merge en GitHub (clickear "Merge pull request")

# 8. Delete branch (GitHub sugiere)

# 9. Actualizar local
git checkout develop
git pull origin develop
```

---

## 🚨 Errores Comunes

### Error: "fatal: not a git repository"
```bash
# Solución: Asegúrate de estar en la carpeta correcta
cd ~/northacoustics-field-clean
git init
```

### Error: "remote origin already exists"
```bash
# Solución: Reemplazar remote existente
git remote remove origin
git remote add origin https://github.com/USERNAME/northacoustics.git
```

### Error: "rejected because the tip of your current branch"
```bash
# Solución: Pull antes de push
git pull origin main
git push origin main
```

### Error: "fatal: Could not read from remote repository"
```bash
# Solución: Verificar SSH key o HTTPS credentials
# SSH: ssh -T git@github.com
# HTTPS: Usar Personal Access Token como password
```

---

## 📞 Verificación Final

```bash
# Checklist completo
echo "=== Git Status ==="
git status

echo "=== Branches ==="
git branch -a

echo "=== Remote ==="
git remote -v

echo "=== Recent Commits ==="
git log --oneline -5

echo "=== .gitignore Working? ==="
git check-ignore -v node_modules/ .env .env.local || echo "✓ Ignored files are not tracked"

echo ""
echo "✅ All checks passed! Repository is ready."
```

---

## 🎯 Próximos Pasos

1. ✅ Git repository inicializado
2. ✅ GitHub remoto conectado
3. ✅ Branch protection configurada
4. ✅ Secrets agregados
5. 🔜 FASE 5: Implementar autenticación

---

## 📚 Referencias

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Ejecutado**: 2026-05-26  
**Status**: ✅ Ready to push  
**Next**: FASE 5 Authentication
