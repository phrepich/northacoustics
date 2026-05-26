#!/bin/bash
# === DEPLOYMENT SCRIPT FOR NORTHACOUSTICS FIELD CLEAN ===
# Deploys application to condor-core server with proper isolation
# Usage: ./scripts/deploy.sh [target] [action]
# Example: ./scripts/deploy.sh condor-core start

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER=${SERVER_USER:-phrepich}
SERVER_HOST=${1:-condor-core}
ACTION=${2:-start}
REMOTE_PATH="/home/phrepich/projects/northacoustics-field-clean"
LOCAL_PROJECT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Phase 1: Local Preparation
phase_1_local_prep() {
    log_info "=== PHASE 1: LOCAL PREPARATION ==="

    log_info "Removing node_modules..."
    rm -rf "$LOCAL_PROJECT_PATH/node_modules"
    log_success "node_modules removed"

    log_info "Checking .dockerignore..."
    if [ -f "$LOCAL_PROJECT_PATH/.dockerignore" ]; then
        log_success ".dockerignore exists"
    else
        log_warning ".dockerignore not found"
    fi

    log_info "Validating package.json..."
    if [ -f "$LOCAL_PROJECT_PATH/package.json" ]; then
        node -e "JSON.parse(require('fs').readFileSync('$LOCAL_PROJECT_PATH/package.json', 'utf8'))" && \
            log_success "package.json is valid" || \
            log_error "package.json is invalid JSON"
    else
        log_error "package.json not found"
    fi

    log_success "Local preparation complete"
}

# Phase 2: Transfer Files
phase_2_transfer() {
    log_info "=== PHASE 2: TRANSFER FILES TO SERVER ==="

    log_info "Testing SSH connection to $SERVER_USER@$SERVER_HOST..."
    ssh "$SERVER_USER@$SERVER_HOST" "echo 'SSH connection OK'" || log_error "Cannot connect to server"

    log_info "Creating remote directory structure..."
    ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $REMOTE_PATH"

    log_info "Transferring project files (excluding node_modules)..."
    rsync -avz \
        --delete \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.expo' \
        --exclude='.git' \
        "$LOCAL_PROJECT_PATH/" \
        "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/"

    log_success "Files transferred successfully"
}

# Phase 3: Server Setup
phase_3_server_setup() {
    log_info "=== PHASE 3: SERVER SETUP ==="

    log_info "Building Docker image..."
    ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && docker-compose build"

    log_success "Server setup complete"
}

# Phase 4: Validation
phase_4_validation() {
    log_info "=== PHASE 4: VALIDATION ==="

    log_info "Checking Docker containers..."
    ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && docker-compose ps"

    log_info "Verifying port accessibility..."
    ssh "$SERVER_USER@$SERVER_HOST" "curl -f http://localhost:3111/health || echo 'Not yet running'"

    log_success "Validation complete"
}

# Docker Management Functions
docker_start() {
    log_info "Starting containers..."
    ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && docker-compose up -d"
    log_success "Containers started"
}

docker_stop() {
    log_info "Stopping containers..."
    ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && docker-compose down"
    log_success "Containers stopped"
}

docker_restart() {
    docker_stop
    sleep 2
    docker_start
}

docker_logs() {
    log_info "Fetching Docker logs..."
    ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && docker-compose logs -f --tail=50"
}

docker_status() {
    log_info "Container status:"
    ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && docker-compose ps"
}

# Main menu
show_menu() {
    echo ""
    echo "=== NORTHACOUSTICS FIELD CLEAN DEPLOYMENT ==="
    echo "Server: $SERVER_HOST | User: $SERVER_USER"
    echo ""
    echo "Actions:"
    echo "  phase1      Phase 1: Local Preparation"
    echo "  phase2      Phase 2: Transfer Files"
    echo "  phase3      Phase 3: Server Setup"
    echo "  phase4      Phase 4: Validation"
    echo "  full        Execute all phases"
    echo "  start       Start containers on server"
    echo "  stop        Stop containers on server"
    echo "  restart     Restart containers on server"
    echo "  logs        View container logs"
    echo "  status      Check container status"
    echo ""
}

# Main execution
if [ "$ACTION" == "help" ] || [ "$ACTION" == "" ]; then
    show_menu
elif [ "$ACTION" == "phase1" ]; then
    phase_1_local_prep
elif [ "$ACTION" == "phase2" ]; then
    phase_2_transfer
elif [ "$ACTION" == "phase3" ]; then
    phase_3_server_setup
elif [ "$ACTION" == "phase4" ]; then
    phase_4_validation
elif [ "$ACTION" == "full" ]; then
    phase_1_local_prep
    phase_2_transfer
    phase_3_server_setup
    phase_4_validation
    docker_start
elif [ "$ACTION" == "start" ]; then
    docker_start
elif [ "$ACTION" == "stop" ]; then
    docker_stop
elif [ "$ACTION" == "restart" ]; then
    docker_restart
elif [ "$ACTION" == "logs" ]; then
    docker_logs
elif [ "$ACTION" == "status" ]; then
    docker_status
else
    log_error "Unknown action: $ACTION"
fi

log_success "Done!"
