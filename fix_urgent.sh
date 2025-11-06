#!/usr/bin/env bash

###############################################################################
# SCRIPT DE CORREÇÃO URGENTE - Imagens + SSL/HTTPS
###############################################################################

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CORREÇÃO URGENTE - Imagens + SSL     ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar se está no diretório correto
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}ERRO: Execute este script do diretório ~/inwistaMobile${NC}"
    exit 1
fi

# 1. LIMPAR TUDO E FAZER GIT PULL
echo -e "${YELLOW}[1/8] Limpando build antigo...${NC}"
rm -rf dist/ node_modules/.vite

echo -e "${YELLOW}[2/8] Fazendo git pull...${NC}"
git pull origin claude/setup-dual-apps-easypanel-nginx-011CUrxazNXwAyGMCJhT3i2M || true

# 2. VERIFICAR SE ASSETS ESTÃO NO LUGAR CERTO
echo -e "${YELLOW}[3/8] Verificando assets...${NC}"
if [[ ! -f "client/public/attached_assets/logo-inwista.png" ]]; then
    echo -e "${RED}ERRO: Assets não encontrados! Copiando...${NC}"
    mkdir -p client/public/attached_assets
    if [[ -d "attached_assets" ]]; then
        cp -r attached_assets/* client/public/attached_assets/
        echo -e "${GREEN}✓ Assets copiados!${NC}"
    else
        echo -e "${RED}ERRO: Diretório attached_assets não existe!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Assets já estão no lugar correto${NC}"
fi

# 3. REBUILD
echo -e "${YELLOW}[4/8] Rebuilding aplicação...${NC}"
npm run build

# Verificar se o build copiou os assets
if [[ ! -f "dist/public/attached_assets/logo-inwista.png" ]]; then
    echo -e "${RED}ERRO: Assets não foram copiados no build!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build completo com assets!${NC}"

# 4. REINICIAR PM2
echo -e "${YELLOW}[5/8] Reiniciando PM2...${NC}"
pm2 delete inwistamobile || true
pm2 start ecosystem.config.cjs --env production
pm2 save
echo -e "${GREEN}✓ PM2 reiniciado!${NC}"

# 5. EXPORTAR CERTIFICADO SSL (SEM SUDO - vai dar instruções)
echo -e "${YELLOW}[6/8] Preparando exportação de certificado SSL...${NC}"
echo ""
echo -e "${BLUE}Agora você precisa executar como ROOT:${NC}"
echo ""
echo -e "${GREEN}sudo bash deploy/scripts/export_ssl_ca.sh${NC}"
echo ""
echo -e "${YELLOW}Pressione ENTER para continuar após executar o comando acima...${NC}"
read

# 6. TESTAR SE A APLICAÇÃO ESTÁ SERVINDO IMAGENS
echo -e "${YELLOW}[7/8] Testando se imagens estão sendo servidas...${NC}"
sleep 2

HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:5000/attached_assets/logo-inwista.png || echo "000")

if [[ "$HTTP_CODE" == "200" ]]; then
    echo -e "${GREEN}✓ Imagens estão sendo servidas corretamente!${NC}"
else
    echo -e "${RED}✗ ERRO: Imagens não estão sendo servidas (HTTP $HTTP_CODE)${NC}"
    echo -e "${YELLOW}Verificando logs do PM2...${NC}"
    pm2 logs inwistamobile --lines 20 --nostream
fi

# 7. TESTAR NGINX SSL-CA
echo -e "${YELLOW}[8/8] Testando página SSL-CA...${NC}"
HTTP_CODE_SSL=$(curl -o /dev/null -s -w "%{http_code}" http://localhost/ssl-ca/ || echo "000")

if [[ "$HTTP_CODE_SSL" == "200" ]]; then
    echo -e "${GREEN}✓ Página SSL-CA está acessível!${NC}"
else
    echo -e "${RED}✗ AVISO: Página SSL-CA não está acessível (HTTP $HTTP_CODE_SSL)${NC}"
    echo -e "${YELLOW}Execute: sudo bash deploy/scripts/export_ssl_ca.sh${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  CORREÇÕES APLICADAS!                 ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✅ Teste agora:${NC}"
echo -e "   1. Acesse: ${BLUE}https://mobile.192.168.1.15.nip.io${NC}"
echo -e "   2. Verifique se o logo aparece"
echo -e "   3. Para corrigir HTTPS, acesse: ${BLUE}http://192.168.1.15/ssl-ca${NC}"
echo ""
