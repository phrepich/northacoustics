# 🔧 Supabase Setup Guide

Complete step-by-step guide to configure Supabase for NorthAcoustics production.

---

## 📋 Pre-requisitos

- ✅ Supabase account (create at https://supabase.com)
- ✅ Email verified
- ✅ GitHub account (for OAuth integration - optional)
- ✅ Downloaded SQL files:
  - `001_northacoustics_schema.sql`
  - `002_rls_policies.sql`

---

## ✅ Paso 1: Crear Proyecto Supabase

### 1.1 Ir a Dashboard
```
https://app.supabase.com
```

### 1.2 Crear Nuevo Proyecto
- Click "New Project"
- **Organization**: Tu org (o crear nueva)
- **Name**: `northacoustics-prod`
- **Database Password**: Generar fuerte (guardar en 1Password)
- **Region**: `South America (São Paulo)` ← IMPORTANTE para Chile
- Click "Create new project"

### 1.3 Esperar Creación
- Tiempo: 2-3 minutos
- Verás dashboard cuando esté listo

---

## ✅ Paso 2: Obtener Credenciales

### 2.1 Ir a Settings
```
Dashboard > Settings (esquina inferior izquierda)
```

### 2.2 Copiar Credenciales
En **API Settings**:

```
Project URL:           → NEXT_PUBLIC_SUPABASE_URL
anon public key:       → NEXT_PUBLIC_SUPABASE_ANON_KEY
service_role key:      → SUPABASE_SERVICE_ROLE_KEY (GitHub Secrets)
```

Guardar en:
- **Web app**: `.env.local`
- **Mobile app**: `.env.local`
- **CI/CD**: GitHub Secrets

---

## ✅ Paso 3: Ejecutar SQL Schema

### 3.1 Ir a SQL Editor
```
Dashboard > SQL Editor
```

### 3.2 Crear Nueva Query
- Click "New Query"
- Nombre: `001_initial_schema`

### 3.3 Copiar SQL
1. Abre: `001_northacoustics_schema.sql`
2. Selecciona TODO
3. Copia al SQL Editor
4. Click "RUN" (botón azul)

**Resultado esperado**:
```
✓ Execution successful
11 tables created
40+ indexes
5 triggers
```

---

## ✅ Paso 4: Ejecutar RLS Policies

### 4.1 Nueva Query
- Click "New Query"
- Nombre: `002_rls_policies`

### 4.2 Copiar SQL
1. Abre: `002_rls_policies.sql`
2. Selecciona TODO
3. Copia al SQL Editor
4. Click "RUN"

**Resultado esperado**:
```
✓ Execution successful
30+ RLS policies
5 helper functions
```

---

## ✅ Paso 5: Crear Storage Buckets

### 5.1 Ir a Storage
```
Dashboard > Storage
```

### 5.2 Crear Buckets

**Bucket 1: photos**
- Nombre: `photos`
- Privacy: `Public` (fotos visibles)

**Bucket 2: reports**
- Nombre: `reports`
- Privacy: `Private` (acceso autorizado)

**Bucket 3: documents**
- Nombre: `documents`
- Privacy: `Private`

**Bucket 4: calibration-certificates**
- Nombre: `calibration-certificates`
- Privacy: `Private`

---

## ✅ Paso 6: Configurar Auth

### 6.1 Email Auth
```
Dashboard > Authentication > Providers
```
- Verifica que "Email" esté habilitado (default: sí)

### 6.2 Email Templates (Opcional)
```
Dashboard > Authentication > Email Templates
```
Personaliza:
- Confirmation email
- Password reset email
- Magic link email

---

## ✅ Paso 7: Crear Admin User

### 7.1 Ir a Users
```
Dashboard > Authentication > Users
```

### 7.2 Crear Usuario
- Click "Invite user"
- Email: `phrepich@gmail.com`
- Click "Send invite"

### 7.3 Aceptar Invitación
- Sigue el link en email
- Crea contraseña
- Guarda credenciales

### 7.4 Hacer Admin
En SQL Editor, ejecuta:
```sql
UPDATE public.profiles
SET role = 'admin', status = 'active'
WHERE email = 'phrepich@gmail.com';
```

---

## ✅ Paso 8: Habilitar Realtime (Opcional)

### 8.1 Ir a Realtime
```
Dashboard > Realtime
```

### 8.2 Enable para Tablas Críticas
- ✅ `measurement_points`
- ✅ `noise_measurements`
- ✅ `photos`
- ✅ `reports`

---

## ✅ Paso 9: Configurar Backups

### 9.1 Ir a Database > Backups
```
Dashboard > Database > Backups
```

### 9.2 Configurar
- **Frequency**: Daily (automático)
- **Retention**: 7 days (mínimo prod)

---

## ✅ Paso 10: Verificar Setup

### 10.1 Verificar Tablas
En SQL Editor:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Esperado: 11 tablas
```
profiles
clients
projects
measurement_points
noise_measurements
photos
reports
equipment
calibrations
field_visits
audit_logs
```

### 10.2 Verificar RLS
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Esperado: `rowsecurity = TRUE` en todas

### 10.3 Verificar Índices
```sql
SELECT COUNT(*) as index_count FROM pg_indexes 
WHERE schemaname = 'public';
```

Esperado: 40+

---

## 📝 Variables de Entorno

### .env.local (desarrollo)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### GitHub Secrets (CI/CD)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_DB_PASSWORD=super_secret_password
```

### Vercel Environment Variables (Producción)
Automáticamente desde GitHub Secrets

---

## 🔐 Security Checklist

- [ ] Service Role Key en GitHub Secrets (NO en .env.local)
- [ ] Database password en 1Password (NO en repo)
- [ ] RLS habilitado en todas las tablas
- [ ] RLS policies verificadas
- [ ] Email templates personalizados
- [ ] Backups configurados
- [ ] Realtime habilitado
- [ ] Storage buckets creados
- [ ] Admin user creado
- [ ] Bucket policies verificadas

---

## 🚨 Errores Comunes

### Error: "Policy for RLS not found"
**Solución**: Re-ejecutar `002_rls_policies.sql`

### Error: "Permission denied for schema"
**Solución**: Verificar que usuario tiene rol correcto en `profiles`

### Error: "Storage bucket not found"
**Solución**: Crear bucket en Storage dashboard

### Error: "JWT token invalid"
**Solución**: Regenerar anon_key en API Settings

---

## 📞 Soporte

- **Docs**: https://supabase.com/docs
- **Status**: https://status.supabase.com
- **Issues**: Create GitHub Issue with error

---

**Setup completado cuando**:
- ✅ 11 tablas creadas
- ✅ 30+ policies aplicadas
- ✅ 4 buckets storage
- ✅ Admin user creado
- ✅ Backups funcionando

Próximo paso: [DEPLOYMENT.md](./DEPLOYMENT.md)
