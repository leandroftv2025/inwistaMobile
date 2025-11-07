#!/usr/bin/env bash

# ====================================
# INWISTA - SETUP DUAL APPS
# ====================================
# Configura inwistasite + inwistaMobile no mesmo servidor

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

log_info "======================================"
log_info "  SETUP DUAL APPS - INWISTA"
log_info "======================================"
echo ""

# ----------------------------------------
# 1. CLONAR REPOSITÓRIOS
# ----------------------------------------
log_info "1. Clonando repositórios..."

if [ ! -d "/home/user/inwistasite" ]; then
    log_info "Clonando inwistasite..."
    cd /home/user
    git clone https://github.com/leandroftv2025/inwistasite.git
    log_success "inwistasite clonado!"
else
    log_warning "inwistasite já existe, fazendo pull..."
    cd /home/user/inwistasite
    git pull origin main
fi

if [ ! -d "/home/user/inwistaMobile" ]; then
    log_info "Clonando inwistaMobile..."
    cd /home/user
    git clone https://github.com/leandroftv2025/inwistaMobile.git
    log_success "inwistaMobile clonado!"
else
    log_warning "inwistaMobile já existe, fazendo pull..."
    cd /home/user/inwistaMobile
    git pull origin main
fi

# ----------------------------------------
# 2. BUILD INWISTASITE
# ----------------------------------------
log_info "2. Building inwistasite..."
cd /home/user/inwistasite

if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado!"
    exit 1
fi

log_info "Instalando dependências..."
npm ci

log_info "Building aplicação..."
npm run build

log_info "Building Docker image..."
docker build -t inwistasite:latest .

log_info "Parando container antigo..."
docker stop inwistasite 2>/dev/null || true
docker rm inwistasite 2>/dev/null || true

log_info "Iniciando container inwistasite..."
docker run -d \
  --name inwistasite \
  --restart unless-stopped \
  -p 8080:8080 \
  inwistasite:latest

log_success "inwistasite rodando na porta 8080!"

# ----------------------------------------
# 3. BUILD INWISTAMOBILE
# ----------------------------------------
log_info "3. Building inwistaMobile..."
cd /home/user/inwistaMobile

if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado!"
    exit 1
fi

log_info "Instalando dependências..."
npm ci

# Criar .env se não existir
if [ ! -f ".env" ]; then
    log_warning ".env não encontrado, criando a partir de .env.example..."
    cp .env.example .env
    log_info "⚠️  ATENÇÃO: Configure o .env com os valores corretos!"
fi

log_info "Building aplicação..."
npm run build

log_info "Building Docker image..."
docker build -t inwistamobile:latest .

log_info "Parando container antigo..."
docker stop inwistamobile 2>/dev/null || true
docker rm inwistamobile 2>/dev/null || true

log_info "Iniciando container inwistaMobile..."
docker run -d \
  --name inwistamobile \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  inwistamobile:latest

log_success "inwistaMobile rodando na porta 5000!"

# ----------------------------------------
# 4. CONFIGURAR NGINX
# ----------------------------------------
log_info "4. Configurando Nginx..."

NGINX_CONFIG="/home/user/inwistaMobile/deploy/nginx/dual-apps.conf"

if [ ! -f "$NGINX_CONFIG" ]; then
    log_error "Arquivo de configuração Nginx não encontrado: $NGINX_CONFIG"
    exit 1
fi

log_info "Copiando configuração para Nginx..."
cp "$NGINX_CONFIG" /etc/nginx/sites-available/inwista-dual-apps

log_info "Removendo configuração default (se existir)..."
rm -f /etc/nginx/sites-enabled/default

log_info "Ativando site..."
ln -sf /etc/nginx/sites-available/inwista-dual-apps /etc/nginx/sites-enabled/

log_info "Testando configuração Nginx..."
nginx -t

log_info "Recarregando Nginx..."
systemctl reload nginx

log_success "Nginx configurado!"

# ----------------------------------------
# 5. VERIFICAR HEALTH CHECKS
# ----------------------------------------
log_info "5. Verificando health checks..."

sleep 5

# inwistasite
if curl -sf http://localhost:8080/healthz > /dev/null; then
    log_success "✓ inwistasite: OK"
else
    log_error "✗ inwistasite: FALHOU"
fi

# inwistaMobile
if curl -sf http://localhost:5000/api/healthz > /dev/null; then
    log_success "✓ inwistaMobile: OK"
else
    log_error "✗ inwistaMobile: FALHOU"
fi

# ----------------------------------------
# PÓS-INSTALAÇÃO
# ----------------------------------------
SERVER_IP=$(hostname -I | awk '{print $1}')

log_success "======================================"
log_success "  SETUP CONCLUÍDO!"
log_success "======================================"
echo ""
log_info "🌐 Serviços disponíveis:"
echo ""
echo "  📄 inwistasite:"
echo "     http://${SERVER_IP}/"
echo "     http://localhost:8080/"
echo ""
echo "  📱 inwistaMobile:"
echo "     http://mobile.${SERVER_IP}.nip.io/"
echo "     http://localhost:5000/"
echo ""
log_info "📊 Status dos containers:"
docker ps --filter "name=inwistasite" --format "  • {{.Names}}: {{.Status}}"
docker ps --filter "name=inwistamobile" --format "  • {{.Names}}: {{.Status}}"
echo ""
log_info "📋 Próximos passos:"
echo ""
echo "1. Configurar variáveis de ambiente do inwistaMobile (.env)"
echo "2. Configurar banco de dados PostgreSQL"
echo "3. Testar acessos via navegador"
echo "4. Configurar SSL com Let's Encrypt (opcional)"
echo ""
log_info "📖 Documentação:"
echo "  • inwistasite: /home/user/inwistasite/DEPLOY.md"
echo "  • inwistaMobile: /home/user/inwistaMobile/README.md"
echo "  • EasyPanel: /home/user/inwistaMobile/deploy/EASYPANEL.md"
echo ""
