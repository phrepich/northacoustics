# NORTHACOUSTICS FIELD CLEAN - DEPLOYMENT TO CONDOR-CORE

**Project**: Northacoustics Field Clean (React Native/Expo)  
**Target Server**: condor-core (Ubuntu + Docker)  
**Deployment Date**: 2026-05-20  
**Status**: Ready for Phase 1 Local Preparation

---

## 📋 QUICK START

### Phase 1: Local Preparation (Windows Machine)
```powershell
# Remove node_modules
Remove-Item -Recurse -Force node_modules

# Verify Docker files are in place
Get-Item docker/Dockerfile
Get-Item docker-compose.yml
Get-Item nginx/default.conf

# Verify environment files
Get-Item .env.production
Get-Item .env.local
```

### Phase 2: Transfer to Server (Windows → condor-core)
```bash
# From project root, using WSL/Git Bash
rsync -avz --delete --exclude='node_modules' ./ phrepich@condor-core:/home/phrepich/projects/northacoustics-field-clean/
```

### Phase 3: Server Setup (SSH to condor-core)
```bash
ssh phrepich@condor-core
cd /home/phrepich/projects/northacoustics-field-clean
docker-compose build
```

### Phase 4: Start Containers
```bash
docker-compose up -d
docker-compose ps
curl http://localhost:3111/health
```

---

## 🏗️ PROJECT STRUCTURE

```
northacoustics-field-clean/
├── docker/
│   └── Dockerfile                 # Multi-stage build for Expo app
├── nginx/
│   ├── default.conf              # Reverse proxy configuration
│   └── health.html               # Health check endpoint
├── app/                          # Source code (mounted in container)
├── components/                   # React components
├── constants/                    # Constants and configuration
├── docker-compose.yml            # Container orchestration
├── .dockerignore                # Build exclusions
├── .env.production              # Production environment variables
├── .env.local                   # Local development environment
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript configuration
└── DEPLOYMENT.md               # This file
```

---

## 🐳 DOCKER ARCHITECTURE

### Services
1. **north-field-web** (port 3100)
   - React Native/Expo application
   - Node.js 20 Alpine
   - Non-root user (nextjs:1001)
   - Health checks enabled
   - Resource limits: 1GB memory, 1 CPU core

2. **north-field-nginx** (port 3111)
   - Reverse proxy & load balancer
   - Handles WebSocket and Expo dev connections
   - Gzip compression enabled
   - Security headers configured

### Network
- **Isolated bridge network**: `north-field-network` (172.25.0.0/16)
- **Zero interference** with existing services
- **Ports used**: 3100 (web), 3111 (proxy), 19000-19001 (Expo dev)

### Volumes
- **north-field-cache**: Persistent npm cache
- **Bind mounts**: app/, components/, constants/ (read-only, hot-reload)

---

## 🔧 CONFIGURATION FILES

### .env.production
```env
NODE_ENV=production
EXPO_PUBLIC_API_URL=http://north-field-nginx:3111
EXPO_PUBLIC_LOCATION_TRACKING=true
EXPO_PUBLIC_OFFLINE_MODE=true
REACT_APP_ENVIRONMENT=production
```

### docker-compose.yml
- Multi-container setup with compose version 3.9
- Health checks: 30s intervals, 40s startup period
- Logging: JSON-file driver with 10MB rotation
- Restart policy: `unless-stopped` (persistent across reboots)

### Dockerfile
- **Build stage**: Installs dependencies, optimizes with npm ci
- **Production stage**: Minimal image, non-root user, health check
- **Image size**: ~500MB (optimized with Alpine)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

- [ ] Local machine: node_modules removed
- [ ] Local machine: .dockerignore created
- [ ] Local machine: Docker files present (Dockerfile, docker-compose.yml, nginx config)
- [ ] Local machine: Environment files created (.env.production, .env.local)
- [ ] Server: SSH access verified (`ssh phrepich@condor-core`)
- [ ] Server: Docker installed and running
- [ ] Server: Free disk space available (≥5GB recommended)
- [ ] Server: Ports 3100, 3111, 19000, 19001 are available
- [ ] Server: Target directory `/home/phrepich/projects/northacoustics-field-clean/` ready
- [ ] Verification: No conflicts with existing services (App-Obra, CQ, OpenWebUI, Ollama, etc.)

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Local Preparation (5 minutes)
1. Navigate to project directory: `C:\Users\phrep\northacoustics-field-clean\`
2. Remove node_modules: `Remove-Item -Recurse node_modules`
3. Verify Docker files exist
4. Commit to git: `git add . && git commit -m "Add Docker configuration for deployment"`

### Step 2: Transfer to Server (5-15 minutes, depending on connection)
```bash
# From project root with rsync/SCP
rsync -avz --delete --exclude='node_modules' ./ phrepich@condor-core:/home/phrepich/projects/northacoustics-field-clean/

# Alternative with SCP (slower)
scp -r . phrepich@condor-core:/home/phrepich/projects/northacoustics-field-clean/
```

### Step 3: Server Setup (10-20 minutes, including build time)
```bash
ssh phrepich@condor-core

# Navigate to project
cd /home/phrepich/projects/northacoustics-field-clean

# Build Docker image
docker-compose build

# Verify build success
docker images | grep north-field
```

### Step 4: Container Startup (2-5 minutes)
```bash
# Start containers in background
docker-compose up -d

# Wait for health checks to pass
sleep 10

# Verify containers are running
docker-compose ps

# Expected output:
# CONTAINER ID   IMAGE                     STATUS
# <id>          north-field-web:latest    Up 2 seconds (health: starting)
# <id>          nginx:alpine              Up 2 seconds (healthy)
```

### Step 5: Validation (2 minutes)
```bash
# Test health endpoint
curl http://localhost:3111/health
# Expected: 200 OK

# Check web application
curl http://localhost:3111/
# Expected: HTML response

# View logs
docker-compose logs -f

# Check for errors
docker-compose logs | grep ERROR
```

---

## 📱 ACCESS URLS

### From condor-core
- **Web App**: http://localhost:3100
- **Reverse Proxy**: http://localhost:3111
- **Health Check**: http://localhost:3111/health

### From external (Windows machine, mobile)
- **Web App**: http://192.168.1.X:3100 (replace with actual server IP)
- **Reverse Proxy**: http://192.168.1.X:3111

### Future: HTTPS via Cloudflare
- Planned: https://field-clean.northacoustics.dev
- Does NOT require modification of existing Cloudflare config
- Will route to reverse proxy on condor-core

---

## 🔍 ISOLATION VERIFICATION

### Verify Network Isolation
```bash
# List Docker networks
docker network ls

# Inspect north-field-network
docker network inspect north-field-network

# Expected: Isolated from default networks
# Expected: Subnet 172.25.0.0/16
```

### Verify Port Isolation
```bash
# Check used ports
netstat -tlnp | grep LISTEN

# Expected:
# 3100: north-field-web (NOT in use by other services)
# 3111: north-field-nginx (NOT in use by other services)
# 80, 81, 443, 3000, 3001, 8080, 11434: OTHER SERVICES (untouched)
```

### Verify Service Independence
```bash
# Restart existing services (e.g., NGINX Proxy Manager, Ollama)
docker-compose -f /path/to/other/compose.yml restart

# Field Clean should remain unaffected
docker-compose ps  # Should still show containers running

# Test Field Clean still works
curl http://localhost:3111/health
```

---

## 🛠️ MANAGEMENT COMMANDS

### View Container Status
```bash
docker-compose ps
docker-compose logs --tail=100
docker-compose logs -f                    # Live logs
```

### Restart Containers
```bash
docker-compose restart
docker-compose restart north-field-web    # Specific service
```

### Stop/Start
```bash
docker-compose stop                       # Stop without removing
docker-compose down                       # Stop and remove containers
docker-compose up -d                      # Start again
```

### Rebuild After Code Changes
```bash
# On the server
docker-compose build --no-cache
docker-compose up -d
```

### View Resource Usage
```bash
docker stats north-field-web
docker stats north-field-nginx
```

### Clean Up (if needed)
```bash
# Remove containers but keep images
docker-compose down

# Remove containers and images
docker-compose down --rmi all

# Remove volumes (persistent data)
docker-compose down -v
```

---

## 📊 PERFORMANCE EXPECTATIONS

### Startup Time
- Docker image build: 10-20 minutes (first time only)
- Container startup: 30-60 seconds
- Health check passing: 40-50 seconds

### Memory Usage
- north-field-web: ~400-500MB
- north-field-nginx: ~20-30MB
- Total: ~500MB

### Network Performance
- Web requests: <500ms latency (local)
- Large file uploads: ~100MB/min (depends on network)

---

## 🔐 SECURITY

### Network Security
- Isolated Docker network: no access from other containers
- Non-root user: nextjs (UID 1001)
- Read-only mounts for source code

### Environment Secrets
- Production secrets in `.env.production` (not in git)
- Local development in `.env.local` (excluded from git)
- Never commit `.env.*.local` files

### Container Hardening
- Alpine base image (minimal surface area)
- Non-root user execution
- Resource limits (1GB memory, 1 CPU)
- Health checks with automatic restart

---

## 🚨 TROUBLESHOOTING

### Container Fails to Start
```bash
# Check logs
docker-compose logs north-field-web

# Rebuild with verbose output
docker-compose build --no-cache

# Check disk space
df -h
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3100
lsof -i :3111

# Kill process (if safe)
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

### Health Check Failing
```bash
# Manual test
docker exec north-field-web curl http://localhost:3100/health

# Check if app is running
docker exec north-field-web ps aux | grep node

# View container logs
docker-compose logs --tail=50
```

### Network Connectivity Issues
```bash
# Test from host
curl http://localhost:3111

# Test from within container
docker exec north-field-web curl http://localhost:3100

# Check network
docker network inspect north-field-network
```

---

## 📈 FUTURE INTEGRATIONS

### Planned Additions (Phase 5)
- **PostgreSQL/Supabase**: Database for measurements and projects
- **Ollama**: AI integration for automated report generation
- **Redis**: Caching and session management
- **MQTT Broker**: Real-time sensor data from field devices
- **GIS Integration**: Spatial analysis and mapping

### Architecture Ready For
```yaml
# Future: add to docker-compose.yml
north-field-db:
  image: postgres:16-alpine
  networks:
    - north-field-network

north-field-ollama:
  image: ollama/ollama
  networks:
    - north-field-network
```

---

## 📞 SUPPORT & DOCUMENTATION

- **Project Repo**: https://github.com/northacoustics/field-clean
- **Documentation**: DEPLOYMENT.md (this file)
- **Issues**: GitHub Issues
- **Contact**: phrepich@gmail.com

---

## 📝 DEPLOYMENT CHECKLIST

- [ ] Phase 1: Local Preparation Complete
- [ ] Phase 2: Files Transferred to Server
- [ ] Phase 3: Docker Image Built Successfully
- [ ] Phase 4: Containers Running (health: healthy)
- [ ] Web App Accessible at http://localhost:3111
- [ ] Network Isolation Verified
- [ ] Port Conflicts Resolved
- [ ] No Interference with Existing Services
- [ ] Logs Reviewed for Errors
- [ ] Performance Baseline Established
- [ ] Backup of Local Project Created
- [ ] Git Repository Updated with Docker Config

---

**Status**: ✅ Ready to Deploy  
**Last Updated**: 2026-05-20  
**Next Step**: Execute Phase 1 Local Preparation

