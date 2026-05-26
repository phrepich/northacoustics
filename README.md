# 🎵 NorthAcoustics — Environmental Monitoring Platform

[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Node](https://img.shields.io/badge/node-18%2B-success)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-informational)]()

Professional cloud platform for acoustic and environmental monitoring. Designed for enterprise acoustic consultants, municipalities, and environmental firms.

---

## 📊 Descripción Ejecutiva

NorthAcoustics es una plataforma SaaS cloud-native que permite:
- ✅ Captura de datos acústicos en tiempo real (mobile)
- ✅ Gestión de proyectos ambientales (web)
- ✅ Análisis de ruido según normativa ISO 3891/3746
- ✅ Generación automática de informes técnicos
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Sincronización en tiempo real entre dispositivos

**Target**: Firmas de consultoría ambiental, municipalidades, empresas minero-energéticas en América Latina.

---

## 🏗️ Stack Tecnológico

### Frontend Web
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State**: React Context API + Hooks
- **API Client**: Supabase JS SDK
- **Deploy**: Vercel

### Mobile App
- **Framework**: React Native (Expo)
- **Build**: EAS Build
- **Database**: Supabase Client (offline sync via AsyncStorage)
- **Distribution**: Expo Go / TestFlight / Play Store

### Backend & Database
- **Database**: PostgreSQL 15+ (Supabase managed)
- **Authentication**: Supabase Auth (JWT + Email)
- **Authorization**: Row Level Security (RLS)
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (S3-compatible)
- **AI Ready**: pgvector extension para embeddings

### DevOps & CI/CD
- **Version Control**: GitHub
- **CI/CD**: GitHub Actions
- **Build Orchestration**: Turborepo
- **Code Quality**: TypeScript strict, ESLint, Prettier
- **Package Manager**: npm workspaces

---

## 📁 Estructura Monorepo

```
northacoustics/
├── apps/
│   ├── web/                    # Next.js web app (Vercel)
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Utilities & helpers
│   │   │   └── styles/        # Global styles
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                # Expo React Native app
│       ├── src/
│       │   ├── screens/       # Screen components
│       │   ├── components/    # Reusable components
│       │   ├── lib/           # Mobile utilities
│       │   └── navigation/    # React Navigation
│       ├── app.json
│       ├── eas.json
│       └── package.json
│
├── packages/
│   ├── config/                # Shared configuration
│   │   ├── src/
│   │   │   ├── supabase-client.ts
│   │   │   ├── constants.ts
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   ├── types/                 # TypeScript type definitions
│   │   ├── src/
│   │   │   └── database.ts   # Auto-generated from Supabase
│   │   └── package.json
│   │
│   └── hooks/                 # React Hooks library
│       ├── src/
│       │   ├── useAuth.ts
│       │   ├── useProjects.ts
│       │   └── useMeasurements.ts
│       └── package.json
│
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── SUPABASE_SETUP.md
│   ├── DEPLOYMENT.md
│   └── ROADMAP.md
│
├── .github/
│   ├── workflows/
│   │   └── ci.yml             # GitHub Actions CI/CD
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .gitignore
├── .env.example
├── turbo.json                 # Turborepo config
├── package.json               # Root workspace
├── README.md                  # Este archivo
├── CONTRIBUTING.md
└── tsconfig.json              # Root TypeScript config
```

---

## 📋 Requisitos

- **Node.js**: 18.x o superior
- **npm**: 9.x o superior (o yarn)
- **Git**: 2.37+
- **Cuenta Supabase**: Free o Pro tier
- **GitHub Account**: Para repositorio y Actions

### Instalación Local

```bash
# 1. Clonar repositorio
git clone https://github.com/northacoustics/northacoustics.git
cd northacoustics

# 2. Instalar dependencias (instala en todos los workspaces)
npm install

# 3. Crear .env.local con credenciales Supabase
cp .env.example .env.local
# Editar .env.local con tus valores reales

# 4. Verificar setup
npm run lint
npm run typecheck

# 5. Iniciar desarrollo
npm run dev
```

---

## 🚀 Scripts Principales

### Desarrollo
```bash
# Inicia todos los apps en modo desarrollo
npm run dev

# Inicia solo la web app
npm run dev:web

# Inicia solo la mobile app
npm run dev:mobile
```

### Quality Assurance
```bash
# TypeScript type checking
npm run typecheck

# ESLint linting
npm run lint

# Prettier formatting
npm run format

# Format + Lint (fix)
npm run format:fix
```

### Build & Deploy
```bash
# Build todo (web + mobile + packages)
npm run build

# Build solo web app
npm run build:web

# Deploy a Vercel (automático con GitHub)
# Ver DEPLOYMENT.md para detalles
```

### Database
```bash
# Generar TypeScript types desde Supabase schema
npm run db:types

# (Futuro) Ejecutar migrations
npm run db:migrate
```

---

## 🔐 Variables de Entorno

Crear archivo `.env.local` (NUNCA commit):

```bash
# Supabase (Public - en Next.js público)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Supabase Mobile (Expo)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Development
NODE_ENV=development
```

**NUNCA** incluir en `.env.local`:
- `SUPABASE_SERVICE_ROLE_KEY` (solo en GitHub Secrets)
- `SUPABASE_DB_PASSWORD` (solo en 1Password/LastPass)
- Claves API reales

Ver [.env.example](.env.example) para template.

---

## 📚 Flujo de Desarrollo

### 1. Crear Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-feature
```

### 2. Hacer cambios
```bash
# Editar código
npm run format:fix    # Auto-format
npm run typecheck     # Verificar tipos
npm run lint          # Lint

git add .
git commit -m "feat: descripción clara"
```

### 3. Push y Pull Request
```bash
git push origin feature/nombre-feature
# Ir a GitHub y crear PR con template
```

### 4. Review y Merge
- Revisor verifica checklist del PR
- CI/CD pasa (lint, typecheck, build)
- Merge a `develop`
- Después, merge a `main` para deploy

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para detalles completos.

---

## 📖 Documentación

- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Guía de contribución y git workflow
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Diseño del sistema
- **[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)** — Setup base de datos
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Deploying a Vercel & EAS
- **[docs/ROADMAP.md](docs/ROADMAP.md)** — Producto & features roadmap

---

## 🛠️ Desarrollo Rápido

### Agregar una nueva dependencia a un workspace
```bash
# Agregar a web app
npm install axios --workspace=@northacoustics/web

# Agregar a paquete compartido
npm install zod --workspace=@northacoustics/config
```

### Referencia cruzada entre workspaces
```typescript
// En apps/web/src/lib/api.ts
import { supabase } from '@northacoustics/config';
import type { Profile } from '@northacoustics/types';
```

### Generación de tipos Supabase
```bash
npm run db:types
# Genera packages/types/src/database.ts automaticamente
```

---

## 🔄 Próximos Pasos

- [ ] **FASE 3**: GitHub profesional (en progreso)
- [ ] **FASE 5**: Implementar autenticación real
- [ ] **FASE 6**: MVP CRUD operations
- [ ] **FASE 7**: Deploy a Vercel
- [ ] **FASE 8**: Diseño visual profesional
- [ ] **FASE 9**: Analítica y pricing

Ver [docs/ROADMAP.md](docs/ROADMAP.md) para timeline detallado.

---

## 📞 Soporte & Contacto

- **Email**: phrepich@gmail.com
- **Issues**: GitHub Issues (reportar bugs)
- **Discussions**: GitHub Discussions (preguntas técnicas)
- **Docs**: Ver carpeta `/docs`

---

## 📄 Licencia

MIT License — Ver [LICENSE](LICENSE) para detalles.

---

**Status**: 🟢 Repositorio profesional cloud-ready
**Última actualización**: 2026-05-26
**Rama principal**: `main` (producción) → `develop` (staging)
