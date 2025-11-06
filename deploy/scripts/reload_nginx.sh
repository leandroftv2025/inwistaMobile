#!/usr/bin/env bash

# ====================================
# INWISTA - RELOAD NGINX
# ====================================
# Script para recarregar Nginx com segurança
# Testa a configuração antes de recarregar

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
    log_error "Este script deve ser executado como root (use sudo)"
    exit 1
fi

log_info "Testando configuração do Nginx..."

# Testar configuração
if nginx -t 2>&1; then
    log_success "Configuração do Nginx está válida!"

    log_info "Recarregando Nginx..."
    systemctl reload nginx

    if [ $? -eq 0 ]; then
        log_success "Nginx recarregado com sucesso!"
        log_info "Status: $(systemctl is-active nginx)"
        exit 0
    else
        log_error "Falha ao recarregar Nginx"
        exit 1
    fi
else
    log_error "Configuração do Nginx possui erros!"
    log_error "Corrija os erros acima antes de recarregar"
    exit 1
fi
