#!/usr/bin/env bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo -e "  CORREÇÃO FORÇADA - IMAGENS             "
echo -e "==========================================${NC}"
echo ""

# 1. Git pull
echo -e "${YELLOW}[1/7] Baixando correções...${NC}"
git pull origin claude/setup-dual-apps-easypanel-nginx-011CUrxazNXwAyGMCJhT3i2M

# 2. Garantir que assets estão em client/public/
echo -e "${YELLOW}[2/7] Verificando assets em client/public/attached_assets/...${NC}"
if [[ ! -d "client/public/attached_assets" ]] || [[ ! -f "client/public/attached_assets/logo-inwista.png" ]]; then
    echo -e "${RED}ERRO: Assets não estão em client/public/attached_assets/${NC}"
    echo -e "${YELLOW}Copiando assets...${NC}"

    if [[ -d "attached_assets" ]]; then
        mkdir -p client/public/attached_assets
        cp -r attached_assets/* client/public/attached_assets/
        echo -e "${GREEN}✓ Assets copiados!${NC}"
    else
        echo -e "${RED}ERRO: Diretório attached_assets não existe!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Assets já estão no lugar correto${NC}"
fi

# 3. Limpar cache e node_modules
echo -e "${YELLOW}[3/7] Limpando cache...${NC}"
rm -rf dist/ node_modules/.vite
echo -e "${GREEN}✓ Cache limpo${NC}"

# 4. Build
echo -e "${YELLOW}[4/7] Building aplicação...${NC}"
npm run build

# 5. Verificar se assets foram copiados para o build
echo -e "${YELLOW}[5/7] Verificando se assets foram copiados no build...${NC}"
MISSING=0
for file in "logo-inwista.png" "card-front.png" "card-back.png" "pix-icon.png"; do
    if [[ ! -f "dist/public/attached_assets/$file" ]]; then
        echo -e "${RED}✗ $file não foi copiado!${NC}"
        MISSING=1
    else
        echo -e "${GREEN}✓ $file copiado${NC}"
    fi
done

if [[ $MISSING -eq 1 ]]; then
    echo -e "${RED}ERRO: Alguns assets não foram copiados!${NC}"
    exit 1
fi

# 6. Parar e reiniciar PM2
echo -e "${YELLOW}[6/7] Reiniciando PM2...${NC}"
pm2 delete inwistamobile || true
sleep 2
pm2 start ecosystem.config.cjs --env production
pm2 save

# 7. Aguardar servidor iniciar
echo -e "${YELLOW}[7/7] Aguardando servidor iniciar...${NC}"
sleep 5

# Testar
echo ""
echo -e "${BLUE}=========================================="
echo -e "  TESTANDO...                            "
echo -e "==========================================${NC}"
echo ""

PORT=5000
SUCCESS=0
for file in "logo-inwista.png" "card-front.png" "pix-icon.png"; do
    HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" "http://localhost:$PORT/attached_assets/$file" 2>/dev/null || echo "000")
    if [[ "$HTTP_CODE" == "200" ]]; then
        echo -e "${GREEN}✓ /attached_assets/$file - HTTP $HTTP_CODE${NC}"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${RED}✗ /attached_assets/$file - HTTP $HTTP_CODE${NC}"
    fi
done

echo ""
if [[ $SUCCESS -eq 3 ]]; then
    echo -e "${GREEN}=========================================="
    echo -e "  ✅ SUCESSO! TODAS AS IMAGENS FUNCIONAM!"
    echo -e "==========================================${NC}"
    echo ""
    echo -e "${GREEN}Acesse agora:${NC}"
    echo -e "  ${BLUE}https://mobile.192.168.1.15.nip.io${NC}"
    echo ""
    echo -e "${GREEN}As imagens devem aparecer!${NC}"
else
    echo -e "${RED}=========================================="
    echo -e "  ✗ ERRO! Algumas imagens não funcionam"
    echo -e "==========================================${NC}"
    echo ""
    echo -e "${YELLOW}Execute o diagnóstico:${NC}"
    echo -e "  ${BLUE}bash diagnose_images.sh${NC}"
fi
echo ""
