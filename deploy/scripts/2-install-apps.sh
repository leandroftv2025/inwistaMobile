#!/usr/bin/env bash

# ====================================
# INWISTA - INSTALAÇÃO DAS APLICAÇÕES
# ====================================
# Deploy inicial do inwistasite + inwistaMobile
# Domínios: www.inwista.com, app.inwista.com

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
echo "  🚀 INWISTA - INSTALAÇÃO DAS APLICAÇÕES"
echo "=================================================="
echo ""
log_info "Este script irá instalar:"
echo "   • inwistasite (www.inwista.com)"
echo "   • inwistaMobile (app.inwista.com)"
echo ""
read -p "Pressione ENTER para continuar..."
echo ""

# ----------------------------------------
# 1. VERIFICAR DNS
# ----------------------------------------
log_info "1. Verificando DNS..."
echo ""
log_warning "ATENÇÃO: Verifique se o DNS está configurado no Cloudflare!"
echo ""
echo "   Configuração necessária:"
echo "   • inwista.com → A → 161.97.96.29"
echo "   • www.inwista.com → CNAME → inwista.com"
echo "   • app.inwista.com → A → 161.97.96.29"
echo ""
read -p "DNS está configurado? (s/N): " dns_ok
if [[ ! "$dns_ok" =~ ^[Ss]$ ]]; then
    log_error "Configure o DNS antes de continuar!"
    echo ""
    echo "Como configurar no Cloudflare:"
    echo "1. Acesse: https://dash.cloudflare.com"
    echo "2. Selecione o domínio inwista.com"
    echo "3. Vá em DNS > Records"
    echo "4. Adicione os registros acima"
    echo ""
    exit 1
fi
log_success "DNS confirmado!"

# ----------------------------------------
# 2. CLONAR REPOSITÓRIOS
# ----------------------------------------
log_info "2. Clonando repositórios..."

cd /var/www/inwista

# inwistasite
if [ ! -d "inwistasite" ]; then
    log_info "Clonando inwistasite..."
    git clone https://github.com/leandroftv2025/inwistasite.git
    log_success "inwistasite clonado!"
else
    log_warning "inwistasite já existe, fazendo pull..."
    cd inwistasite && git pull origin main && cd ..
fi

# inwistaMobile
if [ ! -d "inwistaMobile" ]; then
    log_info "Clonando inwistaMobile..."
    git clone https://github.com/leandroftv2025/inwistaMobile.git
    log_success "inwistaMobile clonado!"
else
    log_warning "inwistaMobile já existe, fazendo pull..."
    cd inwistaMobile && git pull origin main && cd ..
fi

chown -R deploy:deploy /var/www/inwista

# ----------------------------------------
# 3. CONFIGURAR INWISTAMOBILE .ENV
# ----------------------------------------
log_info "3. Configurando variáveis de ambiente..."

cd /var/www/inwista/inwistaMobile

if [ ! -f ".env" ]; then
    log_info "Criando arquivo .env..."
    cp .env.example .env

    # Gerar secret aleatório
    SECRET=$(openssl rand -base64 32)
    sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=$SECRET|g" .env

    log_warning "⚠️  IMPORTANTE: Configure o .env com suas credenciais!"
    log_info "Arquivo: /var/www/inwista/inwistaMobile/.env"
    echo ""
    read -p "Deseja editar o .env agora? (s/N): " edit_env
    if [[ "$edit_env" =~ ^[Ss]$ ]]; then
        nano .env
    else
        log_warning "Lembre-se de configurar o .env antes de usar a aplicação!"
    fi
else
    log_success ".env já configurado!"
fi

# ----------------------------------------
# 4. BUILD INWISTASITE
# ----------------------------------------
log_info "4. Building inwistasite..."
cd /var/www/inwista/inwistasite

log_info "Instalando dependências..."
npm ci --silent

log_info "Building aplicação..."
npm run build

log_info "Building Docker image..."
docker build -t inwistasite:latest . -q

log_info "Parando container antigo..."
docker stop inwistasite 2>/dev/null || true
docker rm inwistasite 2>/dev/null || true

log_info "Iniciando container inwistasite..."
docker run -d \
  --name inwistasite \
  --restart unless-stopped \
  -p 8080:8080 \
  inwistasite:latest

log_success "inwistasite instalado!"

# ----------------------------------------
# 5. BUILD INWISTAMOBILE
# ----------------------------------------
log_info "5. Building inwistaMobile..."
cd /var/www/inwista/inwistaMobile

log_info "Instalando dependências..."
npm ci --silent

log_info "Building aplicação..."
npm run build

log_info "Building Docker image..."
docker build -t inwistamobile:latest . -q

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

log_success "inwistaMobile instalado!"

# ----------------------------------------
# 6. CONFIGURAR NGINX
# ----------------------------------------
log_info "6. Configurando Nginx..."

# Criar diretório de cache
mkdir -p /var/cache/nginx/inwista
chown -R www-data:www-data /var/cache/nginx/inwista

# Copiar configuração (temporária sem SSL)
log_info "Criando configuração temporária (HTTP apenas)..."
cat > /etc/nginx/sites-available/inwista <<'EOF'
# Configuração temporária - HTTP apenas
# Será substituída após obter certificados SSL

server {
    listen 80;
    listen [::]:80;
    server_name inwista.com www.inwista.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name app.inwista.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Ativar site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/inwista /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx

log_success "Nginx configurado (HTTP)!"

# ----------------------------------------
# 7. OBTER CERTIFICADOS SSL
# ----------------------------------------
log_info "7. Obtendo certificados SSL..."
echo ""
log_warning "Vamos obter certificados SSL do Let's Encrypt"
log_info "Isso requer que o DNS esteja propagado corretamente"
echo ""
read -p "Deseja obter os certificados agora? (S/n): " get_ssl

if [[ ! "$get_ssl" =~ ^[Nn]$ ]]; then
    log_info "Obtendo certificado para inwista.com e www.inwista.com..."
    certbot --nginx -d inwista.com -d www.inwista.com --non-interactive --agree-tos --register-unsafely-without-email --redirect || {
        log_error "Falha ao obter certificado para inwista.com"
        log_warning "Verifique se o DNS está propagado e tente novamente"
    }

    log_info "Obtendo certificado para app.inwista.com..."
    certbot --nginx -d app.inwista.com --non-interactive --agree-tos --register-unsafely-without-email --redirect || {
        log_error "Falha ao obter certificado para app.inwista.com"
        log_warning "Verifique se o DNS está propagado e tente novamente"
    }

    # Aplicar configuração otimizada
    log_info "Aplicando configuração Nginx otimizada..."
    cp /var/www/inwista/inwistaMobile/deploy/nginx/production.conf /etc/nginx/sites-available/inwista
    nginx -t && systemctl reload nginx

    log_success "SSL configurado!"
else
    log_warning "Você pode obter SSL depois executando:"
    echo "   sudo bash 3-setup-ssl.sh"
fi

# ----------------------------------------
# 8. CONFIGURAR AUTO-RENOVAÇÃO SSL
# ----------------------------------------
log_info "8. Configurando auto-renovação SSL..."
systemctl enable certbot.timer
systemctl start certbot.timer
log_success "Auto-renovação SSL configurada!"

# ----------------------------------------
# 9. VERIFICAR HEALTH CHECKS
# ----------------------------------------
log_info "9. Verificando aplicações..."
sleep 5

# inwistasite
if curl -sf http://localhost:8080/healthz > /dev/null; then
    log_success "✓ inwistasite: OK"
else
    log_error "✗ inwistasite: FALHOU"
    docker logs inwistasite --tail 20
fi

# inwistaMobile
if curl -sf http://localhost:5000/ > /dev/null; then
    log_success "✓ inwistaMobile: OK"
else
    log_error "✗ inwistaMobile: FALHOU"
    docker logs inwistamobile --tail 20
fi

# ----------------------------------------
# 10. CRIAR SCRIPT DE ATUALIZAÇÃO
# ----------------------------------------
log_info "10. Criando script de atualização..."
cat > /opt/inwista/scripts/atualizar.sh <<'UPDATESCRIPT'
#!/bin/bash
# Script simples de atualização
# Execute: bash /opt/inwista/scripts/atualizar.sh

set -e

echo "🔄 Atualizando aplicações Inwista..."

# inwistasite
echo "📄 Atualizando inwistasite..."
cd /var/www/inwista/inwistasite
git pull origin main
npm ci
npm run build
docker build -t inwistasite:latest .
docker stop inwistasite && docker rm inwistasite
docker run -d --name inwistasite --restart unless-stopped -p 8080:8080 inwistasite:latest
echo "✓ inwistasite atualizado!"

# inwistaMobile
echo "📱 Atualizando inwistaMobile..."
cd /var/www/inwista/inwistaMobile
git pull origin main
npm ci
npm run build
docker build -t inwistamobile:latest .
docker stop inwistamobile && docker rm inwistamobile
docker run -d --name inwistamobile --restart unless-stopped -p 5000:5000 --env-file .env inwistamobile:latest
echo "✓ inwistaMobile atualizado!"

echo ""
echo "✅ Atualização concluída!"
docker ps
UPDATESCRIPT

chmod +x /opt/inwista/scripts/atualizar.sh
chown deploy:deploy /opt/inwista/scripts/atualizar.sh
log_success "Script de atualização criado!"

# ----------------------------------------
# 11. CRIAR SCRIPT DE BACKUP
# ----------------------------------------
log_info "11. Criando script de backup..."
cat > /opt/inwista/scripts/backup.sh <<'BACKUPSCRIPT'
#!/bin/bash
# Script de backup
# Execute: bash /opt/inwista/scripts/backup.sh

BACKUP_DIR="/opt/inwista/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 Criando backup..."

# Criar diretório
mkdir -p $BACKUP_DIR

# Backup dos containers
docker export inwistasite > $BACKUP_DIR/inwistasite_$DATE.tar
docker export inwistamobile > $BACKUP_DIR/inwistamobile_$DATE.tar

# Backup do .env
cp /var/www/inwista/inwistaMobile/.env $BACKUP_DIR/env_$DATE

# Comprimir
cd $BACKUP_DIR
tar -czf inwista_backup_$DATE.tar.gz *.tar env_$DATE
rm *.tar env_$DATE

# Manter apenas últimos 5 backups
ls -t inwista_backup_*.tar.gz | tail -n +6 | xargs -r rm

echo "✓ Backup criado: $BACKUP_DIR/inwista_backup_$DATE.tar.gz"
BACKUPSCRIPT

chmod +x /opt/inwista/scripts/backup.sh
chown deploy:deploy /opt/inwista/scripts/backup.sh
log_success "Script de backup criado!"

# ----------------------------------------
# RESUMO FINAL
# ----------------------------------------
clear
log_success "=================================================="
log_success "  ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
log_success "=================================================="
echo ""
log_info "🌐 Seus sites:"
echo ""
echo "   📄 Site institucional:"
if [[ ! "$get_ssl" =~ ^[Nn]$ ]]; then
    echo "      https://www.inwista.com"
    echo "      https://inwista.com (redirect)"
else
    echo "      http://www.inwista.com (temporário)"
    echo "      ⚠️  Configure SSL para usar HTTPS"
fi
echo ""
echo "   📱 Aplicação web:"
if [[ ! "$get_ssl" =~ ^[Nn]$ ]]; then
    echo "      https://app.inwista.com"
else
    echo "      http://app.inwista.com (temporário)"
    echo "      ⚠️  Configure SSL para usar HTTPS"
fi
echo ""
log_info "🐳 Status dos containers:"
docker ps --format "   • {{.Names}}: {{.Status}}"
echo ""
log_info "📋 Comandos úteis:"
echo ""
echo "   Ver status:"
echo "      bash /opt/inwista/scripts/status.sh"
echo ""
echo "   Atualizar aplicações:"
echo "      bash /opt/inwista/scripts/atualizar.sh"
echo ""
echo "   Criar backup:"
echo "      bash /opt/inwista/scripts/backup.sh"
echo ""
echo "   Ver logs:"
echo "      docker logs -f inwistasite"
echo "      docker logs -f inwistamobile"
echo ""
if [[ "$get_ssl" =~ ^[Nn]$ ]]; then
    log_warning "⚠️  LEMBRE-SE: Configure SSL executando:"
    echo "      sudo bash 3-setup-ssl.sh"
    echo ""
fi
log_info "📁 Arquivos importantes:"
echo "   • Código: /var/www/inwista/"
echo "   • Scripts: /opt/inwista/scripts/"
echo "   • Backups: /opt/inwista/backups/"
echo "   • Logs: /var/log/inwista/"
echo ""
log_success "=================================================="
echo ""
