#!/usr/bin/env bash

# ====================================
# INWISTA - PREPARAÇÃO DO SERVIDOR VPS
# ====================================
# Script para preparar servidor VPS Contabo do zero
# Servidor: 161.97.96.29
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
echo "  🚀 INWISTA - PREPARAÇÃO DO SERVIDOR VPS"
echo "=================================================="
echo ""
log_info "Servidor: 161.97.96.29"
log_info "Domínios: www.inwista.com, app.inwista.com"
echo ""
read -p "Pressione ENTER para começar a instalação..."
echo ""

# ----------------------------------------
# 1. ATUALIZAR SISTEMA
# ----------------------------------------
log_info "1. Atualizando sistema operacional..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get autoremove -y -qq
log_success "Sistema atualizado!"

# ----------------------------------------
# 2. INSTALAR DEPENDÊNCIAS BÁSICAS
# ----------------------------------------
log_info "2. Instalando dependências básicas..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    ufw \
    fail2ban \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    htop \
    nano \
    vim
log_success "Dependências básicas instaladas!"

# ----------------------------------------
# 3. CONFIGURAR FIREWALL
# ----------------------------------------
log_info "3. Configurando firewall (UFW)..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable
log_success "Firewall configurado!"

# ----------------------------------------
# 4. INSTALAR DOCKER
# ----------------------------------------
log_info "4. Instalando Docker..."

# Remover versões antigas
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Adicionar repositório Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar e habilitar Docker
systemctl start docker
systemctl enable docker

# Testar instalação
docker --version
log_success "Docker instalado!"

# ----------------------------------------
# 5. INSTALAR NODE.JS 20
# ----------------------------------------
log_info "5. Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y -qq nodejs

# Verificar versão
node --version
npm --version
log_success "Node.js 20 instalado!"

# ----------------------------------------
# 6. INSTALAR NGINX
# ----------------------------------------
log_info "6. Instalando Nginx..."
apt-get install -y -qq nginx

# Iniciar e habilitar Nginx
systemctl start nginx
systemctl enable nginx

# Verificar versão
nginx -v
log_success "Nginx instalado!"

# ----------------------------------------
# 7. INSTALAR CERTBOT (Let's Encrypt)
# ----------------------------------------
log_info "7. Instalando Certbot para SSL..."
apt-get install -y -qq certbot python3-certbot-nginx
log_success "Certbot instalado!"

# ----------------------------------------
# 8. CONFIGURAR FAIL2BAN
# ----------------------------------------
log_info "8. Configurando Fail2Ban..."
systemctl start fail2ban
systemctl enable fail2ban

cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

systemctl restart fail2ban
log_success "Fail2Ban configurado!"

# ----------------------------------------
# 9. CRIAR USUÁRIO DEPLOY
# ----------------------------------------
log_info "9. Criando usuário 'deploy'..."
if id "deploy" &>/dev/null; then
    log_warning "Usuário 'deploy' já existe"
else
    useradd -m -s /bin/bash -G docker deploy
    log_success "Usuário 'deploy' criado!"
fi

# ----------------------------------------
# 10. CRIAR ESTRUTURA DE DIRETÓRIOS
# ----------------------------------------
log_info "10. Criando estrutura de diretórios..."
mkdir -p /var/www/inwista
mkdir -p /var/log/inwista
mkdir -p /opt/inwista/scripts
mkdir -p /opt/inwista/backups

chown -R deploy:deploy /var/www/inwista
chown -R deploy:deploy /opt/inwista
log_success "Diretórios criados!"

# ----------------------------------------
# 11. OTIMIZAÇÕES DO SISTEMA
# ----------------------------------------
log_info "11. Aplicando otimizações do sistema..."

# Aumentar limites de arquivos abertos
cat >> /etc/security/limits.conf <<'EOF'
* soft nofile 65535
* hard nofile 65535
EOF

# Otimizações de rede
cat >> /etc/sysctl.conf <<'EOF'
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8096
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
EOF
sysctl -p > /dev/null

log_success "Otimizações aplicadas!"

# ----------------------------------------
# 12. CONFIGURAR SWAP (se necessário)
# ----------------------------------------
log_info "12. Verificando swap..."
if [ $(swapon --show | wc -l) -eq 0 ]; then
    log_warning "Swap não configurado, criando 2GB de swap..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    log_success "Swap criado!"
else
    log_success "Swap já configurado!"
fi

# ----------------------------------------
# 13. CRIAR SCRIPT DE STATUS
# ----------------------------------------
log_info "13. Criando script de status..."
cat > /opt/inwista/scripts/status.sh <<'SCRIPT'
#!/bin/bash
echo "======================================"
echo "  INWISTA - STATUS DO SERVIDOR"
echo "======================================"
echo ""
echo "🖥️  Sistema:"
echo "   Uptime: $(uptime -p)"
echo "   Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "   RAM: $(free -h | awk 'NR==2{printf "   Usado: %s / Total: %s (%.2f%%)", $3, $2, $3*100/$2}')"
echo "   Disk: $(df -h / | awk 'NR==2{printf "   Usado: %s / Total: %s (%s)", $3, $2, $5}')"
echo ""
echo "🐳 Docker:"
docker ps --format "   • {{.Names}}: {{.Status}}"
echo ""
echo "🌐 Nginx:"
systemctl status nginx --no-pager | grep Active
echo ""
echo "📊 Logs recentes:"
echo "   Nginx: $(ls -lh /var/log/nginx/ | tail -2)"
echo ""
SCRIPT
chmod +x /opt/inwista/scripts/status.sh
log_success "Script de status criado!"

# ----------------------------------------
# RESUMO FINAL
# ----------------------------------------
clear
log_success "=================================================="
log_success "  ✅ SERVIDOR PREPARADO COM SUCESSO!"
log_success "=================================================="
echo ""
log_info "📋 Resumo da instalação:"
echo ""
echo "   ✓ Sistema operacional atualizado"
echo "   ✓ Docker $(docker --version | awk '{print $3}')"
echo "   ✓ Node.js $(node --version)"
echo "   ✓ Nginx $(nginx -v 2>&1 | awk '{print $3}')"
echo "   ✓ Certbot para SSL"
echo "   ✓ Firewall (UFW) configurado"
echo "   ✓ Fail2Ban ativo"
echo "   ✓ Usuário 'deploy' criado"
echo "   ✓ Estrutura de diretórios pronta"
echo ""
log_info "🔒 Portas abertas:"
echo "   • SSH (22)"
echo "   • HTTP (80)"
echo "   • HTTPS (443)"
echo ""
log_info "📁 Diretórios criados:"
echo "   • /var/www/inwista (aplicações)"
echo "   • /opt/inwista/scripts (scripts)"
echo "   • /opt/inwista/backups (backups)"
echo "   • /var/log/inwista (logs)"
echo ""
log_info "🎯 Próximos passos:"
echo ""
echo "   1. Configure o DNS no Cloudflare:"
echo "      • inwista.com → A → 161.97.96.29"
echo "      • www.inwista.com → CNAME → inwista.com"
echo "      • app.inwista.com → A → 161.97.96.29"
echo ""
echo "   2. Execute o script de instalação:"
echo "      sudo bash 2-install-apps.sh"
echo ""
log_info "💡 Comando útil:"
echo "   Ver status: bash /opt/inwista/scripts/status.sh"
echo ""
log_success "=================================================="
echo ""
