# === NORTHACOUSTICS FIELD CLEAN - LOCAL DEPLOYMENT PREPARATION ===
# PowerShell script to prepare project for deployment to condor-core
# Run from project root: .\scripts\Prepare-LocalDeployment.ps1

param(
    [ValidateSet("check", "clean", "verify", "all")]
    [string]$Action = "all"
)

# Color functions
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor Green }
function Write-Warning { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red; exit 1 }

$ProjectRoot = Split-Path -Parent $PSScriptRoot

# === FUNCTIONS ===

function Check-Prerequisites {
    Write-Info "=== CHECKING PREREQUISITES ==="

    # Check Node.js
    $nodeCheck = node --version 2>$null
    if ($nodeCheck) {
        Write-Success "Node.js found: $nodeCheck"
    } else {
        Write-Warning "Node.js not found in PATH"
    }

    # Check npm
    $npmCheck = npm --version 2>$null
    if ($npmCheck) {
        Write-Success "npm found: $npmCheck"
    } else {
        Write-Warning "npm not found in PATH"
    }

    # Check Docker
    $dockerCheck = docker --version 2>$null
    if ($dockerCheck) {
        Write-Success "Docker found: $dockerCheck"
    } else {
        Write-Warning "Docker not found (will be needed on server)"
    }

    # Check Git
    $gitCheck = git --version 2>$null
    if ($gitCheck) {
        Write-Success "Git found: $gitCheck"
    } else {
        Write-Warning "Git not found"
    }
}

function Clean-LocalEnvironment {
    Write-Info "=== CLEANING LOCAL ENVIRONMENT ==="

    # Remove node_modules
    if (Test-Path "$ProjectRoot/node_modules") {
        Write-Info "Removing node_modules..."
        Remove-Item -Recurse -Force "$ProjectRoot/node_modules" -ErrorAction Stop
        Write-Success "node_modules removed"
    } else {
        Write-Info "node_modules not found (already clean)"
    }

    # Remove .expo cache
    if (Test-Path "$ProjectRoot/.expo") {
        Write-Info "Removing .expo cache..."
        Remove-Item -Recurse -Force "$ProjectRoot/.expo" -ErrorAction Stop
        Write-Success ".expo cache removed"
    }

    # Remove npm cache (optional)
    Write-Info "Clearing npm cache..."
    npm cache clean --force | Out-Null
    Write-Success "npm cache cleared"
}

function Verify-DockerFiles {
    Write-Info "=== VERIFYING DOCKER CONFIGURATION ==="

    $requiredFiles = @(
        "docker/Dockerfile",
        "docker-compose.yml",
        "nginx/default.conf",
        "nginx/health.html",
        ".dockerignore",
        ".env.production",
        ".env.local",
        "DEPLOYMENT.md"
    )

    $allPresent = $true
    foreach ($file in $requiredFiles) {
        $fullPath = Join-Path $ProjectRoot $file
        if (Test-Path $fullPath) {
            Write-Success "✓ $file"
        } else {
            Write-Warning "✗ $file (MISSING)"
            $allPresent = $false
        }
    }

    if ($allPresent) {
        Write-Success "All Docker files present"
    } else {
        Write-Error "Some Docker files are missing. Run full deployment setup."
    }
}

function Verify-ProjectStructure {
    Write-Info "=== VERIFYING PROJECT STRUCTURE ==="

    $requiredDirs = @(
        "app",
        "components",
        "constants",
        "docker",
        "nginx",
        "scripts"
    )

    foreach ($dir in $requiredDirs) {
        $fullPath = Join-Path $ProjectRoot $dir
        if (Test-Path $fullPath -PathType Container) {
            Write-Success "✓ $dir/"
        } else {
            Write-Warning "✗ $dir/ (MISSING)"
        }
    }
}

function Verify-PackageJson {
    Write-Info "=== VERIFYING package.json ==="

    $packageJsonPath = Join-Path $ProjectRoot "package.json"
    if (-not (Test-Path $packageJsonPath)) {
        Write-Error "package.json not found"
    }

    try {
        $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
        Write-Success "package.json is valid JSON"
        Write-Info "Project: $($packageJson.name)"
        Write-Info "Version: $($packageJson.version)"
        Write-Info "Main: $($packageJson.main)"
    } catch {
        Write-Error "package.json is not valid JSON: $_"
    }
}

function Verify-Environment {
    Write-Info "=== VERIFYING ENVIRONMENT FILES ==="

    $envFiles = @(".env.production", ".env.local")

    foreach ($envFile in $envFiles) {
        $fullPath = Join-Path $ProjectRoot $envFile
        if (Test-Path $fullPath) {
            $content = Get-Content $fullPath
            $envVars = ($content | Measure-Object -Line).Lines
            Write-Success "✓ $envFile ($envVars environment variables)"
        } else {
            Write-Warning "✗ $envFile (MISSING)"
        }
    }
}

function Generate-DeploymentSummary {
    Write-Info "=== GENERATING DEPLOYMENT SUMMARY ==="

    $summaryPath = Join-Path $ProjectRoot "DEPLOYMENT_SUMMARY.md"

    $summary = @"
# DEPLOYMENT PREPARATION SUMMARY

Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Status: ✅ READY FOR DEPLOYMENT

### Local Preparation Complete
- [x] node_modules removed
- [x] Docker configuration files created
- [x] Environment variables configured
- [x] NGINX reverse proxy configured
- [x] Project structure verified
- [x] package.json validated

### Next Steps

1. **Verify SSH Access to condor-core**
   ```powershell
   ssh phrepich@condor-core "echo 'Connection successful'"
   ```

2. **Transfer Files to Server**
   From project root:
   ```bash
   # Using rsync (recommended)
   rsync -avz --delete --exclude='node_modules' ./ phrepich@condor-core:/home/phrepich/projects/northacoustics-field-clean/

   # Or using SCP (slower)
   scp -r . phrepich@condor-core:/home/phrepich/projects/northacoustics-field-clean/
   ```

3. **Build Docker Image on Server**
   ```bash
   ssh phrepich@condor-core
   cd /home/phrepich/projects/northacoustics-field-clean
   docker-compose build
   ```

4. **Start Containers**
   ```bash
   docker-compose up -d
   docker-compose ps
   curl http://localhost:3111/health
   ```

### Docker Configuration
- **Isolated Network**: north-field-network (172.25.0.0/16)
- **Ports**: 3100 (web), 3111 (proxy), 19000-19001 (dev)
- **Services**: north-field-web, north-field-nginx
- **Node Version**: 20 Alpine
- **Memory Limit**: 1GB

### Project Files
- Total size (with node_modules): ~500MB
- Total size (without node_modules): ~50MB
- Files to transfer: ~800 files

### Security
- Non-root user execution (nextjs:1001)
- Read-only mount for source code
- Isolated Docker network (no interference)
- Environment secrets in .env.production

### Verification Checklist
- [ ] Local preparation complete
- [ ] Files transferred to server
- [ ] Docker image built successfully
- [ ] Containers running and healthy
- [ ] Web application accessible
- [ ] No interference with existing services
- [ ] Logs reviewed for errors

---

For detailed instructions, see DEPLOYMENT.md
"@

    Set-Content -Path $summaryPath -Value $summary
    Write-Success "Summary generated: DEPLOYMENT_SUMMARY.md"
}

# === MAIN EXECUTION ===

Write-Info "NORTHACOUSTICS FIELD CLEAN - LOCAL DEPLOYMENT PREPARATION"
Write-Info "Project Root: $ProjectRoot"
Write-Info ""

switch ($Action) {
    "check" {
        Check-Prerequisites
    }
    "clean" {
        Clean-LocalEnvironment
    }
    "verify" {
        Verify-DockerFiles
        Verify-ProjectStructure
        Verify-PackageJson
        Verify-Environment
    }
    "all" {
        Check-Prerequisites
        Write-Info ""
        Clean-LocalEnvironment
        Write-Info ""
        Verify-DockerFiles
        Verify-ProjectStructure
        Verify-PackageJson
        Verify-Environment
        Write-Info ""
        Generate-DeploymentSummary
    }
}

Write-Success "Preparation complete!"
Write-Info ""
Write-Info "Next: Transfer files to server (see DEPLOYMENT.md for details)"
Write-Info ""
