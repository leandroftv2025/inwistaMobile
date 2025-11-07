#!/bin/bash

# ====================================
# INWISTA - ATUALIZAÇÃO SIMPLIFICADA
# ====================================
# Script SUPER SIMPLES para atualizar as aplicações
# Uso: bash atualizar-simples.sh

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=================================================="
echo "  🔄 ATUALIZANDO INWISTA"
echo -e "==================================================${NC}"
echo ""

# ----------------------------------------
# INWISTASITE (Site institucional)
# ----------------------------------------
echo -e "${BLUE}📄 Atualizando site institucional...${NC}"
cd /var/www/inwista/inwistasite

# Baixar atualizações
git pull origin main

# Instalar dependências
npm ci --silent

# Compilar
npm run build

# Reconstruir Docker
docker build -t inwistasite:latest . --quiet

# Reiniciar container
docker stop inwistasite 2>/dev/null || true
docker rm inwistasite 2>/dev/null || true
docker run -d \
  --name inwistasite \
  --restart unless-stopped \
  -p 8080:8080 \
  inwistasite:latest

echo -e "${GREEN}✓ Site institucional atualizado!${NC}"
echo ""

# ----------------------------------------
# INWISTAMOBILE (Aplicação web)
# ----------------------------------------
echo -e "${BLUE}📱 Atualizando aplicação web...${NC}"
cd /var/www/inwista/inwistaMobile

# Baixar atualizações
git pull origin main

# Instalar dependências
npm ci --silent

# Compilar
npm run build

# Reconstruir Docker
docker build -t inwistamobile:latest . --quiet

# Reiniciar container
docker stop inwistamobile 2>/dev/null || true
docker rm inwistamobile 2>/dev/null || true
docker run -d \
  --name inwistamobile \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  inwistamobile:latest

echo -e "${GREEN}✓ Aplicação web atualizada!${NC}"
echo ""

# ----------------------------------------
# VERIFICAR
# ----------------------------------------
echo -e "${BLUE}🔍 Verificando containers...${NC}"
docker ps --format "   • {{.Names}}: {{.Status}}"
echo ""

# Health checks
echo -e "${BLUE}💚 Testando aplicações...${NC}"
sleep 3

if curl -sf http://localhost:8080/healthz > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Site institucional: OK${NC}"
else
    echo -e "${YELLOW}⚠ Site institucional: Verificar logs${NC}"
    echo "   docker logs inwistasite"
fi

if curl -sf http://localhost:5000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Aplicação web: OK${NC}"
else
    echo -e "${YELLOW}⚠ Aplicação web: Verificar logs${NC}"
    echo "   docker logs inwistamobile"
fi

echo ""
echo -e "${GREEN}=================================================="
echo "  ✅ ATUALIZAÇÃO CONCLUÍDA!"
echo -e "==================================================${NC}"
echo ""
echo -e "🌐 Seus sites:"
echo "   • https://www.inwista.com"
echo "   • https://app.inwista.com"
echo ""
