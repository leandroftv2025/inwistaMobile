#!/usr/bin/env bash

# ====================================
# INWISTA - ROLLBACK SCRIPT
# ====================================
# Rollback para versão anterior em caso de falha
# Usa Git tags/commits para fazer rollback

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ----------------------------------------
# CONFIGURAÇÕES
# ----------------------------------------
APP_NAME="${1:-inwistaMobile}"
ROLLBACK_STEPS="${2:-1}"

if [ "$APP_NAME" != "inwistaMobile" ] && [ "$APP_NAME" != "inwistasite" ]; then
    log_error "App inválido. Use: inwistaMobile ou inwistasite"
    echo "Uso: $0 <inwistaMobile|inwistasite> [steps]"
    exit 1
fi

APP_DIR="/home/nodejs/${APP_NAME}"

if [ ! -d "$APP_DIR" ]; then
    log_error "Diretório $APP_DIR não existe"
    exit 1
fi

cd "$APP_DIR"

# ----------------------------------------
# FUNÇÕES
# ----------------------------------------
backup_current() {
    log_info "Criando backup da versão atual..."
    BACKUP_DIR="/home/nodejs/backups/${APP_NAME}"
    mkdir -p "$BACKUP_DIR"

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"

    tar -czf "$BACKUP_FILE" \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.git' \
        .

    log_success "Backup criado: $BACKUP_FILE"
}

get_previous_commit() {
    git log --oneline -n $((ROLLBACK_STEPS + 1)) | tail -1 | awk '{print $1}'
}

rollback_code() {
    log_info "Fazendo rollback de $ROLLBACK_STEPS commit(s)..."

    PREVIOUS_COMMIT=$(get_previous_commit)
    CURRENT_COMMIT=$(git rev-parse HEAD)

    log_info "Commit atual: $CURRENT_COMMIT"
    log_info "Rollback para: $PREVIOUS_COMMIT"

    git checkout "$PREVIOUS_COMMIT"

    log_success "Código revertido para commit $PREVIOUS_COMMIT"
}

rebuild_app() {
    log_info "Rebuilding aplicação..."

    if [ "$APP_NAME" = "inwistaMobile" ]; then
        npm ci --legacy-peer-deps
        npm run build
    elif [ "$APP_NAME" = "inwistasite" ]; then
        npm ci --legacy-peer-deps
        npm run build
    fi

    log_success "Build concluído!"
}

restart_app() {
    log_info "Reiniciando aplicação..."

    if command -v pm2 &> /dev/null; then
        pm2 restart "$APP_NAME" || true
        log_success "App reiniciado via PM2"
    elif command -v docker &> /dev/null; then
        docker compose restart
        log_success "App reiniciado via Docker"
    else
        log_warning "PM2 e Docker não encontrados. Reinicie manualmente."
    fi
}

verify_health() {
    log_info "Verificando health da aplicação..."

    sleep 5  # Aguardar app iniciar

    if [ "$APP_NAME" = "inwistaMobile" ]; then
        HEALTH_URL="http://localhost:5000/api/healthz"
    elif [ "$APP_NAME" = "inwistasite" ]; then
        HEALTH_URL="http://localhost:8080/healthz"
    fi

    if curl -f -s "$HEALTH_URL" > /dev/null; then
        log_success "Aplicação está saudável!"
        return 0
    else
        log_error "Aplicação não está respondendo!"
        return 1
    fi
}

# ----------------------------------------
# MAIN
# ----------------------------------------
main() {
    log_warning "======================================"
    log_warning "  ROLLBACK: $APP_NAME"
    log_warning "======================================"
    log_warning "Isso irá reverter $ROLLBACK_STEPS commit(s)"
    echo ""

    read -p "Continuar? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Rollback cancelado"
        exit 0
    fi

    backup_current
    rollback_code
    rebuild_app
    restart_app

    if verify_health; then
        log_success "======================================"
        log_success "  ROLLBACK CONCLUÍDO COM SUCESSO!"
        log_success "======================================"
        exit 0
    else
        log_error "======================================"
        log_error "  ROLLBACK FALHOU!"
        log_error "======================================"
        log_error "Verifique os logs e corrija manualmente"
        exit 1
    fi
}

main "$@"
