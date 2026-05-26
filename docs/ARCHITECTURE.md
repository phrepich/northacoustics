# 🏗️ Architecture — NorthAcoustics

Complete system design, data model, and technical decisions.

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura de Sistema](#arquitectura-de-sistema)
4. [Data Model](#data-model)
5. [Security Model](#security-model)
6. [Scalability](#scalability)
7. [Decisiones Arquitectónicas](#decisiones-arquitectónicas)

---

## 🎯 Visión General

NorthAcoustics es una plataforma SaaS cloud-native que implementa un modelo de 3 capas:

```
┌──────────────────────────────────────────────────┐
│              CLIENT LAYER (Usuarios)             │
│  Web (Next.js) + Mobile (Expo) + Desktop       │
└──────────────────┬───────────────────────────────┘
                   │ REST/WebSocket
┌──────────────────▼───────────────────────────────┐
│           BACKEND AS A SERVICE (Supabase)       │
│  PostgreSQL + Auth + Storage + Realtime        │
└──────────────────┬───────────────────────────────┘
                   │ SQL
┌──────────────────▼───────────────────────────────┐
│            DATA LAYER (Cloud Storage)            │
│  PostgreSQL 15+ + S3-compatible Storage        │
└──────────────────────────────────────────────────┘
```

### Key Features
- **Multi-tenant ready**: Cada cliente empresa aislado
- **Real-time**: Sincronización inmediata entre dispositivos
- **Offline-first (mobile)**: Funciona sin conexión
- **Role-based access control**: 4 niveles de permisos
- **Audit trail**: Trazabilidad completa de cambios

---

## 🛠️ Stack Tecnológico

### Frontend Web
```
Next.js 14 (App Router)
├── TypeScript (strict mode)
├── React 18+
├── Tailwind CSS
├── Shadcn/ui Components
├── React Query (data fetching)
└── Zustand (state management)
```

### Frontend Mobile
```
React Native (Expo)
├── Expo SDK 50+
├── TypeScript
├── React Navigation
├── AsyncStorage (offline)
└── Supabase Client
```

### Shared Code
```
Monorepo (npm workspaces + Turborepo)
├── @northacoustics/config
├── @northacoustics/types
└── @northacoustics/hooks
```

### Backend
```
Supabase (BaaS)
├── PostgreSQL 15+
├── Supabase Auth
├── Row Level Security (RLS)
├── Realtime Subscriptions
├── Storage (S3)
└── pgvector (AI ready)
```

### DevOps
```
GitHub + Vercel + EAS
├── GitHub (version control + Actions)
├── Vercel (web deployment)
├── EAS Build (mobile builds)
└── Supabase (database + backend)
```

---

## 🏛️ Arquitectura de Sistema

### Monorepo Structure

```
northacoustics/
├── apps/
│   ├── web/           # Next.js SPA (Vercel)
│   └── mobile/        # React Native (EAS)
├── packages/
│   ├── config/        # Shared config (Supabase client)
│   ├── types/         # TypeScript types (auto-generated)
│   └── hooks/         # React hooks library
└── docs/              # Documentation
```

### Request Flow

**Web App**:
```
User Input
    ↓
React Component
    ↓
Supabase Client
    ↓
Supabase API (REST)
    ↓
PostgreSQL + RLS
    ↓
Response → Component State → Render
```

**Mobile App**:
```
User Input
    ↓
React Native Screen
    ↓
Supabase Client
    ↓
AsyncStorage (if offline)
    ↓
Supabase API (when online)
    ↓
PostgreSQL + RLS
    ↓
Update State + UI
```

### Real-time Subscription Flow

```
Multiple Clients
    ↓ (subscribe to channel)
Supabase Realtime
    ↓
PostgreSQL Trigger (change)
    ↓
Broadcast to all listeners
    ↓
Auto-update UI (React state)
```

---

## 📊 Data Model

### 11 Core Tables

```
profiles
├── id (UUID PK)
├── email (UNIQUE)
├── full_name
├── role (admin, supervisor, tecnico, cliente)
├── status (active, inactive, archived)
└── timestamps (created_at, updated_at)

clients
├── id
├── name
├── rut (Chilean ID)
├── contact info
├── created_by (FK profiles)
├── soft delete (deleted_at)
└── timestamps

projects
├── id
├── client_id (FK clients)
├── name, description
├── location (lat, long)
├── created_by (FK profiles)
├── soft delete
└── timestamps

measurement_points
├── id
├── project_id (FK projects)
├── GPS coordinates
├── environment details
├── created_by (FK profiles)
└── soft delete

noise_measurements
├── id
├── measurement_point_id (FK)
├── leq_decibels (main metric)
├── weather data (wind, temp, humidity)
├── equipment_id (FK)
├── created_by (FK profiles)
└── timestamps

photos
├── id
├── storage_path (S3 bucket)
├── measurement_point_id or project_id
├── metadata (width, height, tags)
├── created_by (FK profiles)
└── soft delete

reports
├── id
├── project_id (FK projects)
├── status (draft, review, approved, published)
├── storage_path (PDF)
├── generated_by_ai (boolean)
├── created_by (FK profiles)
└── soft delete

equipment
├── id
├── name, serial_number, model
├── calibration status
├── specifications (JSONB)
└── timestamps

calibrations
├── id
├── equipment_id (FK equipment)
├── calibration_date
├── valid_until
├── certificate_path (S3)
├── created_by (FK profiles)

field_visits
├── id
├── project_id (FK projects)
├── visit_date, weather
├── team_members (array)
├── equipment_used (UUID array)
└── timestamps

audit_logs
├── id
├── table_name, operation (INSERT/UPDATE/DELETE)
├── old_values, new_values (JSONB)
├── user_id (FK profiles)
├── created_at (immutable)
```

### Data Relationships

```
clients (1) ──→ (∞) projects
              ├─→ (∞) measurement_points
              │      ├─→ (∞) noise_measurements
              │      └─→ (∞) photos
              └─→ (∞) reports

equipment (1) ──→ (∞) calibrations
            └─→ (∞) noise_measurements

profiles (1) ──→ (∞) audit_logs
```

---

## 🔐 Security Model

### Authentication
- **Method**: Supabase Auth (JWT + Email)
- **Token lifetime**: 3600 seconds
- **Refresh**: Automatic before expiry
- **Session**: Persisted in browser/mobile storage

### Authorization (Row Level Security)

**4 Roles**:
1. **admin**: Full access to everything + user management
2. **supervisor**: Manage projects, equipment, reports
3. **tecnico**: Capture measurements, upload photos
4. **cliente**: Read-only access to their projects

**RLS Policies**:
```sql
-- Example: Technicians can only see their own measurements
CREATE POLICY "tecnico_see_own"
ON noise_measurements
FOR SELECT
USING (created_by = auth.uid());

-- Example: Admins bypass all restrictions
CREATE POLICY "admin_all"
ON noise_measurements
FOR ALL
USING (is_admin());
```

### Storage Access
- **photos**: Public bucket (signed URLs)
- **reports**: Private bucket (role-based)
- **documents**: Private bucket (role-based)
- **certificates**: Private bucket (supervisor only)

### Data Protection
- **In transit**: HTTPS only
- **At rest**: PostgreSQL native encryption
- **Backups**: Daily automated (Supabase managed)
- **Soft delete**: Never destroy data (deleted_at flag)
- **Audit logs**: Every change tracked

---

## 📈 Scalability

### Horizontal Scaling

```
Web Layer: Vercel (auto-scales)
├── Unlimited serverless functions
├── Auto-scaling based on traffic
└── Global CDN distribution

Mobile Layer: Expo + EAS
├── Offline-first (reduces API calls)
├── Local AsyncStorage caching
└── Eventual consistency sync

Backend: Supabase
├── PostgreSQL with connection pooling
├── Automatic read replicas (Pro tier+)
├── Real-time connection scaling
└── Infinite S3 storage
```

### Performance Optimizations

**Database**:
- 40+ indexes on frequently queried columns
- Proper foreign key constraints
- Connection pooling (pgBouncer)
- Materialized views for reports (future)

**API**:
- Selective field queries (not `SELECT *`)
- Pagination for large datasets
- Real-time over polling
- Compression enabled

**Frontend**:
- Code splitting (Next.js automatic)
- Image optimization (Next.js Image)
- Lazy loading
- Service Workers (future)

---

## 🎯 Decisiones Arquitectónicas

### 1. PostgreSQL + Supabase (No Firebase/AppWrite)
**Why**: 
- Native JSONB for flexible schemas
- pgvector for AI embeddings
- Row-level security built-in
- Open-source friendly

**Trade-off**: More infrastructure knowledge required

### 2. UUIDs as Primary Keys
**Why**:
- Globally unique (no coordination)
- Can be generated client-side
- Supports sharding/federation

**Trade-off**: Larger indexes than SERIAL

### 3. Soft Delete (deleted_at)
**Why**:
- Data recovery possible
- Compliance friendly
- Historical audit trail
- No permanent data loss

**Trade-off**: Queries must filter `WHERE deleted_at IS NULL`

### 4. RLS from Day 1
**Why**:
- Security isn't an afterthought
- Database enforces access control
- No reliance on app-layer validation
- Compliant with regulations

**Trade-off**: More complex SQL policies to maintain

### 5. Monorepo (npm workspaces)
**Why**:
- Share TypeScript types across apps
- Single version control
- Coordinated deployments
- Unified tooling (ESLint, Prettier, TypeScript)

**Trade-off**: Requires coordination, can't deploy individual apps independently

### 6. Vercel + EAS (Not Docker/K8s)
**Why**:
- Serverless = zero ops
- Auto-scaling out of box
- Better ROI for startup
- Focus on features, not infrastructure

**Trade-off**: Less control, vendor lock-in

### 7. Real-time First (Not polling)
**Why**:
- Better UX (instant updates)
- Lower API load
- Reduced bandwidth
- Foundation for multiplayer features

**Trade-off**: WebSocket complexity, connection limits

---

## 🔮 Future Enhancements

### AI/ML Layer (pgvector ready)
```
Noise Measurements
    ↓
pgvector embeddings
    ↓
Pattern recognition
    ↓
Auto-report generation
```

### Mobile Offline Sync
```
AsyncStorage (local)
    ↓
Sync queue
    ↓
Supabase sync (when online)
    ↓
Conflict resolution
```

### Advanced Analytics
```
Materialized Views
    ↓
Time-series aggregates
    ↓
Dashboard queries
```

### Multi-language Support
```
i18n framework
    ↓
Database translations
    ↓
Locale detection
```

---

## 📚 Related Documents

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — Database configuration
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment
- [ROADMAP.md](./ROADMAP.md) — Feature & product roadmap

---

**Status**: Production-ready  
**Last Updated**: 2026-05-26  
**Maintainer**: phrepich@gmail.com
