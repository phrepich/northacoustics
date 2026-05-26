# 🚀 Deployment Guide — NorthAcoustics

Production deployment procedures for web, mobile, and database.

---

## 📋 Tabla de Contenidos

1. [Overview](#overview)
2. [Web Deployment (Vercel)](#web-deployment-vercel)
3. [Mobile Deployment (EAS)](#mobile-deployment-eas)
4. [Database Setup (Supabase)](#database-setup-supabase)
5. [Environment Variables](#environment-variables)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring & Logs](#monitoring--logs)
8. [Rollback Procedures](#rollback-procedures)

---

## 🎯 Overview

```
Development (Local)
    ↓
GitHub Push
    ↓ (Automatic)
GitHub Actions (CI)
    ├→ Lint ✓
    ├→ TypeCheck ✓
    ├→ Build ✓
    └→ Deploy ✓
    ↓
Vercel (Web)    +    EAS (Mobile)    +    Supabase (Database)
```

---

## 🌐 Web Deployment (Vercel)

### 1. Conectar GitHub a Vercel

#### 1.1 Ir a Vercel
```
https://vercel.com/dashboard
```

#### 1.2 Crear Nuevo Proyecto
- Click "Add New..."
- Select "Project"
- Click "Continue with GitHub"
- Authorize Vercel
- Select `northacoustics` repo

#### 1.3 Configurar Proyecto
- **Project name**: `northacoustics` (o custom)
- **Root directory**: `apps/web`
- **Build command**: `npm run build`
- **Output directory**: `.next`
- Click "Deploy"

### 2. Configurar Environment Variables

En Vercel Dashboard:
```
Project Settings > Environment Variables
```

Agregar:
```
NEXT_PUBLIC_SUPABASE_URL      = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOi...
```

**No agregar** `SUPABASE_SERVICE_ROLE_KEY` en Vercel (usa GitHub Secrets)

### 3. Deployment Automático

**Configuración automática** en `.vercelignore` (raíz):
```
# Ignore cuando solo docs cambian
docs/**
README.md
CONTRIBUTING.md

# No ignorar package changes
!packages/**
!apps/web/**
!apps/mobile/package.json
```

**Flujo**:
```
Push a main
    ↓
Vercel detects push
    ↓
Build (npm run build)
    ↓
Deploy a production URL
    ↓
SSL automático
```

### 4. Production URL

Después del deploy:
```
https://northacoustics.vercel.app
(o tu custom domain)
```

---

## 📱 Mobile Deployment (EAS)

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
# o
yarn global add eas-cli
```

### 2. Autenticar con Expo

```bash
eas login
# Ingresa credenciales Expo
```

### 3. Configurar eas.json

En `apps/mobile/eas.json`:
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "your-app-id"
      },
      "android": {
        "track": "production"
      }
    }
  }
}
```

### 4. Build para Preview (Testing)

```bash
eas build --platform ios --profile preview
# o
eas build --platform android --profile preview
```

### 5. Build para Producción

```bash
# iOS (requiere Apple Developer Account)
eas build --platform ios --profile production

# Android (requiere Google Play Developer Account)
eas build --platform android --profile production
```

### 6. Submit a Stores (TestFlight/Play Store)

```bash
# Después del build exitoso
eas submit --platform ios --latest
# o
eas submit --platform android --latest
```

---

## 💾 Database Setup (Supabase)

### 1. Crear Proyecto Supabase

Ver: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 2. Ejecutar Schema SQL

```sql
-- Ejecutar en Supabase SQL Editor:
001_northacoustics_schema.sql
002_rls_policies.sql
```

### 3. Crear Storage Buckets

- `photos` (public)
- `reports` (private)
- `documents` (private)
- `calibration-certificates` (private)

### 4. Crear Admin User

```sql
INSERT INTO public.profiles (id, email, full_name, role, status)
SELECT id, email, email, 'admin', 'active'
FROM auth.users
WHERE email = 'admin@northacoustics.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', status = 'active';
```

### 5. Configure Backups

```
Dashboard > Database > Backups
- Frequency: Daily
- Retention: 7 days
```

---

## 🔑 Environment Variables

### Estructura

```
Local (Development)          .env.local
    ↓
GitHub (Public)             .github/workflows/ci.yml
    ├→ NEXT_PUBLIC_*        (visible en browser)
    └→ (secrets via secrets)
    ↓
GitHub Secrets (Private)    Settings > Secrets
    ├→ SUPABASE_SERVICE_ROLE_KEY
    └→ SUPABASE_DB_PASSWORD
    ↓
Vercel (Production Web)     Project Settings
    ├→ NEXT_PUBLIC_SUPABASE_URL
    ├→ NEXT_PUBLIC_SUPABASE_ANON_KEY
    └→ (+ más para APIs)
    ↓
Expo/EAS (Production Mobile) app.json
    ├→ EXPO_PUBLIC_SUPABASE_URL
    └→ EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### Checklist

- [ ] `.env.local` en `.gitignore` (nunca commit)
- [ ] `.env.example` tiene templates (sin valores reales)
- [ ] GitHub Secrets creados y populados
- [ ] Vercel Environment Variables configurados
- [ ] EAS secrets configurados
- [ ] Supabase anon_key es público
- [ ] Supabase service_role_key es secreto

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml

name: CI/CD

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build

  deploy-web:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run deploy:web
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

### Deployment Triggers

```
develop branch:
  ↓ (PR created)
  Review
  ↓ (PR merged)
  CI runs (lint, typecheck, build)
  ✓ Success
  ↓ (no auto-deploy, just validate)

main branch:
  ↓ (PR created from develop)
  Review + Approval
  ↓ (PR merged)
  CI runs (lint, typecheck, build)
  ✓ Success
  ↓ (auto-deploy to Vercel)
  Production live 🚀
```

---

## 📊 Monitoring & Logs

### Vercel Logs

```
Vercel Dashboard > Deployments > [deployment] > Logs
```

View:
- Build logs
- Function logs
- Request logs
- Error logs

### Supabase Logs

```
Supabase Dashboard > Logs
```

View:
- API logs
- Database logs
- Authentication logs
- Storage logs
- Realtime logs

### GitHub Actions Logs

```
GitHub Repo > Actions > [workflow] > [run]
```

View:
- Build output
- Test results
- Deployment status
- Error messages

---

## ↩️ Rollback Procedures

### Rollback Vercel (Web)

**Inmediato** (si hay error post-deploy):
```
Vercel Dashboard > Deployments
Click [previous deployment] > "Promote to Production"
```

**Git rollback**:
```bash
git revert HEAD  # Crea nuevo commit que revierte
git push origin main
# Vercel detecta y re-deploya
```

### Rollback Database (Supabase)

**Si hay error en migration**:
```
Supabase Dashboard > Database > Backups
Click [last good backup] > "Restore"
```

**Manualmente**:
```bash
# Conectar a Supabase
psql postgresql://[user]:[password]@[host]:5432/[db]

-- Ejecutar restore script
\i restore_backup.sql
```

### Rollback Mobile (EAS)

1. **Immediatamente** (if critical):
   - iOS: Remove from App Store
   - Android: Un-publish from Play Store

2. **Si bug menor**:
   - Keep deployed version
   - Fix bug in code
   - Submit hotfix build: `eas build --auto-submit`

---

## 🔐 Security Deployment Checklist

- [ ] No `.env` files committed
- [ ] No hardcoded secrets in code
- [ ] All secrets in GitHub Secrets
- [ ] HTTPS enforced everywhere
- [ ] CORS configured properly
- [ ] Rate limiting enabled (Supabase)
- [ ] RLS policies verified
- [ ] Database backups working
- [ ] Error logs not exposing sensitive info
- [ ] Monitoring alerts configured

---

## 🆘 Common Issues

### Vercel Deploy Fails
```
Error: Build failed
→ Check logs: Vercel Dashboard > Logs
→ Usuallly: Missing env var or build error
→ Fix: npm run build locally, push fix
```

### Mobile Build Fails
```
Error: EAS build failed
→ Check: eas build logs in terminal
→ Usually: Dependency issue or config error
→ Fix: Update dependencies, re-run build
```

### Database Queries Slow
```
Problem: Queries timing out
→ Check: Are indexes created?
→ Run: SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public';
→ Expected: 40+
→ If less: Re-run 001_northacoustics_schema.sql
```

---

## 📞 Escalation Path

1. **Check logs** (Vercel/Supabase/GitHub)
2. **Verify environment variables**
3. **Test locally** (npm run dev)
4. **Rollback** if needed
5. **Contact support**:
   - Vercel: https://vercel.com/support
   - Supabase: https://supabase.com/support
   - GitHub: https://github.com/support

---

**Production Ready**: ✅  
**Last Updated**: 2026-05-26  
**Next**: [ROADMAP.md](./ROADMAP.md)
