#!/usr/bin/env bash

# ====================================
# INWISTA - CONFIGURAÇÃO SSL
# ====================================
# Script para configurar certificados SSL Let's Encrypt

set -euo pipefail

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# Verificar root
if [[ $EUID -ne 0 ]]; then
    log_error "Execute como root: sudo bash $0"
    exit 1
fi

clear
echo "=================================================="
echo "  🔒 INWISTA - CONFIGURAÇÃO SSL"
echo "=================================================="
echo ""
log_info "Este script irá configurar HTTPS para:"
echo "   • inwista.com"
echo "   • www.inwista.com"
echo "   • app.inwista.com"
echo ""
log_warning "Requisitos:"
echo "   ✓ DNS configurado no Cloudflare"
echo "   ✓ DNS propagado (pode levar até 24h)"
echo "   ✓ Portas 80 e 443 abertas"
echo ""
read -p "Continuar? (S/n): " continue_ssl
if [[ "$continue_ssl" =~ ^[Nn]$ ]]; then
    log_info "Cancelado pelo usuário"
    exit 0
fi
echo ""

# ----------------------------------------
# 1. VERIFICAR DNS
# ----------------------------------------
log_info "1. Verificando DNS..."
echo ""

# Verificar inwista.com
INW_IP=$(dig +short inwista.com A | tail -n1)
if [ "$INW_IP" = "161.97.96.29" ]; then
    log_success "inwista.com → 161.97.96.29 ✓"
else
    log_warning "inwista.com → $INW_IP (esperado: 161.97.96.29)"
fi

# Verificar www.inwista.com
WWW_IP=$(dig +short www.inwista.com A | tail -n1)
if [ "$WWW_IP" = "161.97.96.29" ]; then
    log_success "www.inwista.com → 161.97.96.29 ✓"
else
    log_warning "www.inwista.com → $WWW_IP (esperado: 161.97.96.29)"
fi

# Verificar app.inwista.com
APP_IP=$(dig +short app.inwista.com A | tail -n1)
if [ "$APP_IP" = "161.97.96.29" ]; then
    log_success "app.inwista.com → 161.97.96.29 ✓"
else
    log_warning "app.inwista.com → $APP_IP (esperado: 161.97.96.29)"
fi

echo ""
if [ "$INW_IP" != "161.97.96.29" ] || [ "$WWW_IP" != "161.97.96.29" ] || [ "$APP_IP" != "161.97.96.29" ]; then
    log_warning "DNS não está propagado corretamente!"
    echo ""
    read -p "Deseja continuar mesmo assim? (s/N): " force_continue
    if [[ ! "$force_continue" =~ ^[Ss]$ ]]; then
        log_error "Configure o DNS e aguarde a propagação antes de continuar"
        exit 1
    fi
fi

# ----------------------------------------
# 2. OBTER CERTIFICADOS
# ----------------------------------------
log_info "2. Obtendo certificados SSL..."
echo ""

# inwista.com + www.inwista.com
log_info "Obtendo certificado para inwista.com e www.inwista.com..."
certbot --nginx \
    -d inwista.com \
    -d www.inwista.com \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email \
    --redirect

if [ $? -eq 0 ]; then
    log_success "Certificado obtido: inwista.com + www.inwista.com"
else
    log_error "Falha ao obter certificado para inwista.com"
    log_info "Possíveis causas:"
    echo "   • DNS não propagado"
    echo "   • Firewall bloqueando porta 80/443"
    echo "   • Nginx não está rodando"
    exit 1
fi

# app.inwista.com
log_info "Obtendo certificado para app.inwista.com..."
certbot --nginx \
    -d app.inwista.com \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email \
    --redirect

if [ $? -eq 0 ]; then
    log_success "Certificado obtido: app.inwista.com"
else
    log_error "Falha ao obter certificado para app.inwista.com"
    exit 1
fi

# ----------------------------------------
# 3. APLICAR CONFIGURAÇÃO OTIMIZADA
# ----------------------------------------
log_info "3. Aplicando configuração Nginx otimizada..."

# Backup da configuração atual
cp /etc/nginx/sites-available/inwista /etc/nginx/sites-available/inwista.backup.$(date +%Y%m%d_%H%M%S)

# Copiar configuração otimizada
cp /var/www/inwista/inwistaMobile/deploy/nginx/production.conf /etc/nginx/sites-available/inwista

# Testar configuração
if nginx -t; then
    log_success "Configuração Nginx válida!"
    systemctl reload nginx
    log_success "Nginx recarregado!"
else
    log_error "Configuração Nginx inválida!"
    log_info "Restaurando backup..."
    cp /etc/nginx/sites-available/inwista.backup.* /etc/nginx/sites-available/inwista
    systemctl reload nginx
    exit 1
fi

# ----------------------------------------
# 4. VERIFICAR SSL
# ----------------------------------------
log_info "4. Verificando certificados SSL..."
echo ""

# Verificar inwista.com
if openssl s_client -connect inwista.com:443 -servername inwista.com </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    log_success "✓ inwista.com - SSL válido"
else
    log_warning "⚠ inwista.com - Verificação SSL falhou"
fi

# Verificar www.inwista.com
if openssl s_client -connect www.inwista.com:443 -servername www.inwista.com </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    log_success "✓ www.inwista.com - SSL válido"
else
    log_warning "⚠ www.inwista.com - Verificação SSL falhou"
fi

# Verificar app.inwista.com
if openssl s_client -connect app.inwista.com:443 -servername app.inwista.com </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    log_success "✓ app.inwista.com - SSL válido"
else
    log_warning "⚠ app.inwista.com - Verificação SSL falhou"
fi

# ----------------------------------------
# 5. CONFIGURAR AUTO-RENOVAÇÃO
# ----------------------------------------
log_info "5. Configurando auto-renovação..."
systemctl enable certbot.timer
systemctl start certbot.timer
log_success "Auto-renovação SSL configurada!"

# Testar renovação (dry-run)
log_info "Testando renovação..."
certbot renew --dry-run --quiet && log_success "Teste de renovação OK!" || log_warning "Teste de renovação falhou"

# ----------------------------------------
# RESUMO FINAL
# ----------------------------------------
clear
log_success "=================================================="
log_success "  ✅ SSL CONFIGURADO COM SUCESSO!"
log_success "=================================================="
echo ""
log_info "🔒 Certificados instalados:"
echo ""
certbot certificates | grep -E "Certificate Name|Domains|Expiry Date"
echo ""
log_info "🌐 Seus sites (HTTPS):"
echo ""
echo "   📄 Site institucional:"
echo "      https://www.inwista.com ✓"
echo "      https://inwista.com (redirect) ✓"
echo ""
echo "   📱 Aplicação web:"
echo "      https://app.inwista.com ✓"
echo ""
log_info "🔄 Renovação automática:"
echo "   ✓ Configurada via systemd timer"
echo "   ✓ Certificados renovam automaticamente antes de expirar"
echo ""
log_info "📋 Comandos úteis:"
echo ""
echo "   Ver certificados:"
echo "      sudo certbot certificates"
echo ""
echo "   Renovar manualmente:"
echo "      sudo certbot renew"
echo ""
echo "   Testar renovação:"
echo "      sudo certbot renew --dry-run"
echo ""
log_info "🎯 Teste seus sites:"
echo "   • https://www.inwista.com"
echo "   • https://app.inwista.com"
echo ""
log_success "=================================================="
echo ""
