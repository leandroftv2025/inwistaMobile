#!/usr/bin/env bash

# ====================================
# INWISTA - SCRIPT DE PROVISIONAMENTO LOCAL
# ====================================
# Provisiona servidor Ubuntu 192.168.1.15 para rodar:
# - inwistasite (porta 8080)
# - inwistaMobile (porta 5000)
# - Nginx com TLS local (mkcert)
# - EasyPanel
# - PostgreSQL
# - UFW Firewall
# - Fail2ban
# - Hardening básico
#
# USO:
#   chmod +x provision_local.sh
#   ./provision_local.sh

set -euo pipefail
IFS=$'\n\t'

# ----------------------------------------
# CORES E FUNÇÕES AUXILIARES
# ----------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script deve ser executado como root (use sudo)"
        exit 1
    fi
}

# ----------------------------------------
# CONFIGURAÇÕES
# ----------------------------------------
SERVER_IP="192.168.1.15"
APP_USER="nodejs"
APP_GROUP="nodejs"
INWISTA_SITE_PORT=8080
INWISTA_MOBILE_PORT=5000
POSTGRES_VERSION=16

# ----------------------------------------
# 1. ATUALIZAÇÃO DO SISTEMA
# ----------------------------------------
update_system() {
    log_info "Atualizando sistema Ubuntu..."
    apt-get update -qq
    apt-get upgrade -y -qq
    apt-get install -y -qq \
        curl \
        wget \
        git \
        build-essential \
        ca-certificates \
        gnupg \
        lsb-release \
        software-properties-common \
        ufw \
        fail2ban \
        unattended-upgrades \
        tzdata
    log_success "Sistema atualizado!"
}

# ----------------------------------------
# 2. CRIAR USUÁRIO NÃO-ROOT
# ----------------------------------------
create_app_user() {
    log_info "Criando usuário ${APP_USER}..."

    if id "${APP_USER}" &>/dev/null; then
        log_warning "Usuário ${APP_USER} já existe"
    else
        useradd -m -s /bin/bash -G sudo "${APP_USER}"
        log_success "Usuário ${APP_USER} criado!"
    fi

    # Criar diretório .ssh se não existir
    if [ ! -d "/home/${APP_USER}/.ssh" ]; then
        mkdir -p "/home/${APP_USER}/.ssh"
        chmod 700 "/home/${APP_USER}/.ssh"
        chown -R "${APP_USER}:${APP_GROUP}" "/home/${APP_USER}/.ssh"
        log_info "Para acesso SSH, adicione sua chave pública em: /home/${APP_USER}/.ssh/authorized_keys"
    fi
}

# ----------------------------------------
# 3. INSTALAR DOCKER
# ----------------------------------------
install_docker() {
    log_info "Instalando Docker..."

    if command -v docker &> /dev/null; then
        log_warning "Docker já está instalado ($(docker --version))"
        return
    fi

    # Adicionar repositório Docker
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Adicionar usuário ao grupo docker
    usermod -aG docker "${APP_USER}"

    # Iniciar Docker
    systemctl enable docker
    systemctl start docker

    log_success "Docker instalado! ($(docker --version))"
}

# ----------------------------------------
# 4. INSTALAR NODE.JS 22 (via NVM)
# ----------------------------------------
install_nodejs() {
    log_info "Instalando Node.js 22..."

    # Instalar NVM para o usuário não-root
    su - "${APP_USER}" <<'EOF'
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 22
    nvm use 22
    nvm alias default 22
else
    echo "NVM já instalado"
fi
EOF

    log_success "Node.js 22 instalado!"
}

# ----------------------------------------
# 5. INSTALAR POSTGRESQL 16
# ----------------------------------------
install_postgresql() {
    log_info "Instalando PostgreSQL ${POSTGRES_VERSION}..."

    if command -v psql &> /dev/null; then
        log_warning "PostgreSQL já está instalado"
        return
    fi

    # Adicionar repositório PostgreSQL
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

    apt-get update -qq
    apt-get install -y -qq postgresql-${POSTGRES_VERSION} postgresql-contrib-${POSTGRES_VERSION}

    systemctl enable postgresql
    systemctl start postgresql

    log_success "PostgreSQL ${POSTGRES_VERSION} instalado!"
}

# ----------------------------------------
# 6. INSTALAR NGINX
# ----------------------------------------
install_nginx() {
    log_info "Instalando Nginx..."

    if command -v nginx &> /dev/null; then
        log_warning "Nginx já está instalado ($(nginx -v 2>&1))"
        return
    fi

    apt-get install -y -qq nginx

    systemctl enable nginx
    systemctl start nginx

    # Criar diretório para SSL
    mkdir -p /etc/nginx/ssl
    chmod 700 /etc/nginx/ssl

    log_success "Nginx instalado!"
}

# ----------------------------------------
# 7. INSTALAR MKCERT (certificados locais)
# ----------------------------------------
install_mkcert() {
    log_info "Instalando mkcert para certificados locais..."

    if command -v mkcert &> /dev/null; then
        log_warning "mkcert já está instalado"
        return
    fi

    # Detectar arquitetura
    ARCH=$(dpkg --print-architecture)
    if [ "$ARCH" = "amd64" ]; then
        MKCERT_ARCH="amd64"
    elif [ "$ARCH" = "arm64" ]; then
        MKCERT_ARCH="arm64"
    else
        log_error "Arquitetura não suportada: $ARCH"
        return 1
    fi

    # Baixar mkcert
    MKCERT_VERSION="v1.4.4"
    wget -q "https://github.com/FiloSottile/mkcert/releases/download/${MKCERT_VERSION}/mkcert-${MKCERT_VERSION}-linux-${MKCERT_ARCH}" \
        -O /usr/local/bin/mkcert
    chmod +x /usr/local/bin/mkcert

    # Instalar CA local
    mkcert -install

    log_success "mkcert instalado!"
}

# ----------------------------------------
# 8. GERAR CERTIFICADOS TLS LOCAIS
# ----------------------------------------
generate_certificates() {
    log_info "Gerando certificados TLS locais..."

    cd /etc/nginx/ssl

    # Certificado para inwistasite (raiz)
    if [ ! -f "${SERVER_IP}.pem" ]; then
        mkcert "${SERVER_IP}" inwista.local localhost
        log_success "Certificado para ${SERVER_IP} gerado!"
    else
        log_warning "Certificado para ${SERVER_IP} já existe"
    fi

    # Certificado para inwistaMobile (subdomínio)
    if [ ! -f "mobile.${SERVER_IP}.nip.io.pem" ]; then
        mkcert "mobile.${SERVER_IP}.nip.io" "${SERVER_IP}" localhost
        log_success "Certificado para mobile.${SERVER_IP}.nip.io gerado!"
    else
        log_warning "Certificado para mobile já existe"
    fi

    # Ajustar permissões
    chmod 600 /etc/nginx/ssl/*.pem
    chmod 600 /etc/nginx/ssl/*-key.pem
}

# ----------------------------------------
# 9. CONFIGURAR FIREWALL UFW
# ----------------------------------------
configure_firewall() {
    log_info "Configurando Firewall UFW..."

    # Regras básicas
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing

    # Permitir SSH (IMPORTANTE!)
    ufw allow 22/tcp comment 'SSH'

    # Permitir HTTP/HTTPS
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'

    # Permitir portas internas (apenas de localhost)
    ufw allow from 127.0.0.1 to any port ${INWISTA_SITE_PORT} comment 'inwistasite'
    ufw allow from 127.0.0.1 to any port ${INWISTA_MOBILE_PORT} comment 'inwistaMobile'
    ufw allow from 127.0.0.1 to any port 5432 comment 'PostgreSQL'

    # Ativar firewall
    ufw --force enable

    log_success "Firewall configurado!"
    ufw status verbose
}

# ----------------------------------------
# 10. CONFIGURAR FAIL2BAN
# ----------------------------------------
configure_fail2ban() {
    log_info "Configurando Fail2ban..."

    # Configuração básica
    cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/*error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/*error.log
maxretry = 10
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban

    log_success "Fail2ban configurado!"
}

# ----------------------------------------
# 11. CONFIGURAR ATUALIZAÇÕES AUTOMÁTICAS
# ----------------------------------------
configure_auto_updates() {
    log_info "Configurando atualizações automáticas..."

    cat > /etc/apt/apt.conf.d/50unattended-upgrades <<EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}:\${distro_codename}-updates";
};
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
EOF

    systemctl enable unattended-upgrades
    systemctl start unattended-upgrades

    log_success "Atualizações automáticas configuradas!"
}

# ----------------------------------------
# 12. INSTALAR PM2 (opcional)
# ----------------------------------------
install_pm2() {
    log_info "Instalando PM2..."

    su - "${APP_USER}" <<'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm install -g pm2
pm2 startup systemd -u nodejs --hp /home/nodejs
EOF

    # Executar comando de startup (precisa ser como root)
    env PATH=$PATH:/home/${APP_USER}/.nvm/versions/node/v*/bin /home/${APP_USER}/.nvm/versions/node/v*/lib/node_modules/pm2/bin/pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}

    log_success "PM2 instalado!"
}

# ----------------------------------------
# 13. CONFIGURAR TIMEZONE
# ----------------------------------------
configure_timezone() {
    log_info "Configurando timezone para America/Sao_Paulo..."
    timedatectl set-timezone America/Sao_Paulo
    log_success "Timezone configurado!"
}

# ----------------------------------------
# MAIN - EXECUÇÃO PRINCIPAL
# ----------------------------------------
main() {
    log_info "======================================"
    log_info "  PROVISÃO SERVIDOR INWISTA (LAN)"
    log_info "======================================"
    log_info "Servidor: ${SERVER_IP}"
    log_info "Apps: inwistasite:${INWISTA_SITE_PORT}, inwistaMobile:${INWISTA_MOBILE_PORT}"
    echo ""

    check_root

    log_info "Iniciando provisionamento..."
    echo ""

    configure_timezone
    update_system
    create_app_user
    install_docker
    install_nodejs
    install_postgresql
    install_nginx
    install_mkcert
    generate_certificates
    configure_firewall
    configure_fail2ban
    configure_auto_updates
    install_pm2

    echo ""
    log_success "======================================"
    log_success "  PROVISIONAMENTO CONCLUÍDO!"
    log_success "======================================"
    echo ""
    log_info "PRÓXIMOS PASSOS:"
    echo "1. Instalar EasyPanel: curl -sSL https://get.easypanel.io | sh"
    echo "2. Configurar Nginx: copiar arquivos de deploy/nginx/"
    echo "3. Clonar repositórios em /home/${APP_USER}/"
    echo "4. Configurar bancos de dados PostgreSQL"
    echo "5. Testar: curl -k https://${SERVER_IP}/healthz"
    echo ""
    log_info "Logs importantes:"
    echo "  - Nginx: /var/log/nginx/"
    echo "  - UFW: sudo ufw status verbose"
    echo "  - Fail2ban: sudo fail2ban-client status"
    echo ""
}

main "$@"
