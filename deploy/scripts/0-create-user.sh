#!/usr/bin/env bash

# ====================================
# INWISTA - CRIAR USUÁRIO SEGURO
# ====================================
# Script para criar usuário dedicado para deploy
# Execute COMO ROOT

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
echo "  🔒 INWISTA - CRIAR USUÁRIO SEGURO"
echo "=================================================="
echo ""
log_info "Este script irá criar um usuário dedicado para deploy"
log_info "Mais seguro que usar root direto!"
echo ""

# ----------------------------------------
# 1. ESCOLHER NOME DO USUÁRIO
# ----------------------------------------
log_info "1. Nome do usuário"
echo ""
echo "Opções recomendadas:"
echo "  • inwista (específico para este projeto)"
echo "  • deploy (genérico para deployments)"
echo ""
read -p "Nome do usuário [inwista]: " USERNAME
USERNAME=${USERNAME:-inwista}

log_info "Usando usuário: $USERNAME"
echo ""

# ----------------------------------------
# 2. VERIFICAR SE JÁ EXISTE
# ----------------------------------------
if id "$USERNAME" &>/dev/null; then
    log_warning "Usuário '$USERNAME' já existe!"
    echo ""
    read -p "Deseja reconfigurar este usuário? (s/N): " RECONFIG
    if [[ ! "$RECONFIG" =~ ^[Ss]$ ]]; then
        log_info "Cancelado. Use outro nome ou reconfigure manualmente."
        exit 0
    fi
    log_info "Reconfigurando usuário existente..."
else
    # ----------------------------------------
    # 3. CRIAR USUÁRIO
    # ----------------------------------------
    log_info "2. Criando usuário '$USERNAME'..."

    # Criar usuário com home directory
    useradd -m -s /bin/bash "$USERNAME"

    log_success "Usuário criado!"

    # ----------------------------------------
    # 4. DEFINIR SENHA
    # ----------------------------------------
    log_info "3. Definindo senha..."
    echo ""
    log_warning "IMPORTANTE: Use uma senha FORTE!"
    log_info "Dicas:"
    echo "  • Mínimo 12 caracteres"
    echo "  • Letras maiúsculas e minúsculas"
    echo "  • Números e símbolos"
    echo "  • Exemplo: Inw!st@2025#Secur3"
    echo ""

    passwd "$USERNAME"

    log_success "Senha definida!"
fi

# ----------------------------------------
# 5. ADICIONAR AO GRUPO SUDO
# ----------------------------------------
log_info "4. Adicionando ao grupo sudo..."
usermod -aG sudo "$USERNAME"
log_success "Usuário pode usar 'sudo' agora!"

# ----------------------------------------
# 6. ADICIONAR AO GRUPO DOCKER
# ----------------------------------------
if command -v docker &>/dev/null; then
    log_info "5. Adicionando ao grupo docker..."
    usermod -aG docker "$USERNAME"
    log_success "Usuário pode usar Docker sem sudo!"
else
    log_warning "Docker não instalado ainda (será instalado depois)"
fi

# ----------------------------------------
# 7. CRIAR DIRETÓRIOS
# ----------------------------------------
log_info "6. Criando diretórios..."

# Criar .ssh se não existir
if [ ! -d "/home/$USERNAME/.ssh" ]; then
    mkdir -p "/home/$USERNAME/.ssh"
    chmod 700 "/home/$USERNAME/.ssh"
    chown "$USERNAME:$USERNAME" "/home/$USERNAME/.ssh"
    log_success "Diretório .ssh criado"
fi

# Criar authorized_keys se não existir
if [ ! -f "/home/$USERNAME/.ssh/authorized_keys" ]; then
    touch "/home/$USERNAME/.ssh/authorized_keys"
    chmod 600 "/home/$USERNAME/.ssh/authorized_keys"
    chown "$USERNAME:$USERNAME" "/home/$USERNAME/.ssh/authorized_keys"
    log_success "Arquivo authorized_keys criado"
fi

# ----------------------------------------
# 8. CONFIGURAR CHAVE SSH (OPCIONAL)
# ----------------------------------------
echo ""
log_info "7. Configurar chave SSH? (Recomendado)"
echo ""
log_info "Chave SSH é mais seguro que senha!"
echo ""
read -p "Você já tem uma chave SSH no seu computador? (s/N): " HAS_KEY

if [[ "$HAS_KEY" =~ ^[Ss]$ ]]; then
    echo ""
    log_info "Cole sua chave pública SSH aqui (toda a linha):"
    log_info "No seu PC, execute: cat ~/.ssh/id_rsa.pub (ou id_ed25519.pub)"
    echo ""
    read -p "Chave SSH: " SSH_KEY

    if [ -n "$SSH_KEY" ]; then
        echo "$SSH_KEY" >> "/home/$USERNAME/.ssh/authorized_keys"
        log_success "Chave SSH adicionada!"
        log_info "Agora você pode logar sem senha: ssh $USERNAME@IP"
    else
        log_warning "Nenhuma chave fornecida. Pulando..."
    fi
else
    log_info "Pulando configuração de chave SSH"
    log_info "Você pode configurar depois seguindo o guia: deploy/SECURITY_USERS.md"
fi

# ----------------------------------------
# 9. TESTAR SUDO
# ----------------------------------------
log_info "8. Testando permissões sudo..."
if sudo -u "$USERNAME" sudo -n true 2>/dev/null; then
    log_success "Sudo funcionando!"
else
    log_info "Sudo configurado (vai pedir senha na primeira vez)"
fi

# ----------------------------------------
# 10. DESABILITAR ROOT SSH (OPCIONAL)
# ----------------------------------------
echo ""
log_warning "⚠️  IMPORTANTE: Desabilitar login root via SSH?"
echo ""
log_info "Isso aumenta muito a segurança!"
log_info "Mas você DEVE testar o usuário '$USERNAME' ANTES!"
echo ""
read -p "Desabilitar root SSH agora? (s/N): " DISABLE_ROOT

if [[ "$DISABLE_ROOT" =~ ^[Ss]$ ]]; then
    log_info "Desabilitando root SSH..."

    # Backup do sshd_config
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)

    # Desabilitar root login
    sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config

    # Testar configuração
    if sshd -t; then
        systemctl restart sshd
        log_success "Root SSH desabilitado!"
        log_warning "⚠️  Agora você DEVE logar como: $USERNAME"
    else
        log_error "Erro na configuração SSH. Root não foi desabilitado."
    fi
else
    log_info "Root SSH ainda ativo"
    log_warning "⚠️  Lembre-se de desabilitar depois de testar o usuário!"
    log_info "Execute: sudo nano /etc/ssh/sshd_config"
    log_info "Mude: PermitRootLogin no"
    log_info "Depois: sudo systemctl restart sshd"
fi

# ----------------------------------------
# RESUMO FINAL
# ----------------------------------------
clear
log_success "=================================================="
log_success "  ✅ USUÁRIO CRIADO COM SUCESSO!"
log_success "=================================================="
echo ""
log_info "👤 Usuário: $USERNAME"
log_info "🏠 Home: /home/$USERNAME"
log_info "🔑 Grupos: sudo, docker"
echo ""
log_info "🔐 Como conectar:"
echo ""
echo "   ssh $USERNAME@$(hostname -I | awk '{print $1}')"
echo ""
if [[ -s "/home/$USERNAME/.ssh/authorized_keys" ]]; then
    log_info "   (Chave SSH configurada - não pedirá senha)"
else
    log_info "   (Usará senha que você definiu)"
fi
echo ""
log_info "📋 Comandos úteis:"
echo ""
echo "   Ver grupos do usuário:"
echo "      groups $USERNAME"
echo ""
echo "   Trocar senha:"
echo "      sudo passwd $USERNAME"
echo ""
echo "   Testar sudo:"
echo "      sudo -u $USERNAME sudo whoami"
echo ""
log_info "🎯 Próximos passos:"
echo ""
echo "   1. Abra NOVA janela SSH (não feche esta!)"
echo "   2. Teste login: ssh $USERNAME@IP"
echo "   3. Teste sudo: sudo whoami"
echo "   4. Se funcionar, pode fechar esta janela"
echo ""
if [[ ! "$DISABLE_ROOT" =~ ^[Ss]$ ]]; then
    log_warning "   5. Desabilite root SSH (segurança):"
    echo "      sudo nano /etc/ssh/sshd_config"
    echo "      PermitRootLogin no"
    echo "      sudo systemctl restart sshd"
    echo ""
fi
log_info "📖 Guia completo:"
echo "   deploy/SECURITY_USERS.md"
echo ""
log_success "=================================================="
echo ""
log_warning "⚠️  TESTE O NOVO USUÁRIO ANTES DE FECHAR ESTA SESSÃO!"
echo ""
