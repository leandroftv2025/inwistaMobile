#!/usr/bin/env bash

# ====================================
# INWISTA - SETUP EASYPANEL
# ====================================
# Instala e configura EasyPanel no servidor
# Documentação: https://easypanel.io/docs

set -euo pipefail

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar root
if [[ $EUID -ne 0 ]]; then
    log_error "Execute como root: sudo $0"
    exit 1
fi

# ----------------------------------------
# INSTALAR EASYPANEL
# ----------------------------------------
install_easypanel() {
    log_info "======================================"
    log_info "  INSTALANDO EASYPANEL"
    log_info "======================================"
    echo ""

    if command -v easypanel &> /dev/null; then
        log_warning "EasyPanel já está instalado!"
        log_info "Versão: $(easypanel --version || echo 'unknown')"
        return
    fi

    log_info "Baixando e executando instalador oficial..."
    curl -sSL https://get.easypanel.io | sh

    log_success "EasyPanel instalado!"
}

# ----------------------------------------
# CONFIGURAR PORTAS
# ----------------------------------------
configure_ports() {
    log_info "Configurando firewall para EasyPanel..."

    # EasyPanel usa porta 3000 por padrão
    ufw allow 3000/tcp comment 'EasyPanel Web UI'

    log_success "Firewall configurado!"
}

# ----------------------------------------
# INFORMAÇÕES PÓS-INSTALAÇÃO
# ----------------------------------------
post_install_info() {
    SERVER_IP=$(hostname -I | awk '{print $1}')

    log_success "======================================"
    log_success "  EASYPANEL INSTALADO!"
    log_success "======================================"
    echo ""
    log_info "🌐 Acesse o painel em:"
    echo "   http://${SERVER_IP}:3000"
    echo ""
    log_info "📋 PRÓXIMOS PASSOS:"
    echo ""
    echo "1. Acesse o painel e crie sua conta de administrador"
    echo ""
    echo "2. Criar projeto INWISTASITE:"
    echo "   - Type: Docker"
    echo "   - Source: GitHub (https://github.com/leandroftv2025/inwistasite.git)"
    echo "   - Port: 8080"
    echo "   - Dockerfile: Dockerfile"
    echo "   - Health check: /healthz"
    echo ""
    echo "3. Criar projeto INWISTAMOBILE:"
    echo "   - Type: Docker"
    echo "   - Source: GitHub (https://github.com/leandroftv2025/inwistaMobile.git)"
    echo "   - Port: 5000"
    echo "   - Dockerfile: Dockerfile"
    echo "   - Environment vars:"
    echo "     * DATABASE_URL=postgresql://..."
    echo "     * SESSION_SECRET=..."
    echo "     * NODE_ENV=production"
    echo "   - Health check: /api/healthz"
    echo ""
    echo "4. Configurar domínios/portas:"
    echo "   - inwistasite: 8080 (interno)"
    echo "   - inwistaMobile: 5000 (interno)"
    echo "   - Nginx fará o proxy reverso para 80/443"
    echo ""
    log_info "📖 Documentação completa:"
    echo "   https://easypanel.io/docs"
    echo ""
}

# ----------------------------------------
# MAIN
# ----------------------------------------
main() {
    install_easypanel
    configure_ports
    post_install_info
}

main "$@"
