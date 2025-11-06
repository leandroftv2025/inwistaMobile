#!/bin/bash

echo "=========================================="
echo "  APLICANDO CORREÇÃO URGENTE - IMAGENS  "
echo "=========================================="
echo

cd ~/inwistaMobile || exit 1

echo "[1/5] Baixando correção do GitHub..."
git fetch origin
git pull origin claude/setup-dual-apps-easypanel-nginx-011CUrxazNXwAyGMCJhT3i2M

if [ $? -ne 0 ]; then
    echo "❌ Erro ao baixar correção"
    exit 1
fi

echo "[2/5] Fazendo backup do build atual..."
if [ -d "dist/public.backup" ]; then
    rm -rf dist/public.backup
fi
if [ -d "dist/public" ]; then
    cp -r dist/public dist/public.backup
    echo "✓ Backup criado em dist/public.backup"
fi

echo "[3/5] Rebuilding aplicação..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build"
    echo "Restaurando backup..."
    if [ -d "dist/public.backup" ]; then
        rm -rf dist/public
        mv dist/public.backup dist/public
    fi
    exit 1
fi

echo "[4/5] Verificando arquivos críticos..."
MISSING=0
for file in "logo-inwista.png" "card-front.png" "pix-icon.png"; do
    if [ -f "dist/public/attached_assets/$file" ]; then
        SIZE=$(stat -f%z "dist/public/attached_assets/$file" 2>/dev/null || stat -c%s "dist/public/attached_assets/$file" 2>/dev/null)
        echo "  ✓ $file ($SIZE bytes)"
    else
        echo "  ❌ FALTA: $file"
        MISSING=1
    fi
done

if [ $MISSING -eq 1 ]; then
    echo "❌ Arquivos críticos ausentes!"
    exit 1
fi

echo "[5/5] Reiniciando PM2..."
pm2 restart inwistamobile
pm2 save

echo
echo "Aguardando servidor iniciar..."
sleep 5

echo
echo "=========================================="
echo "  TESTANDO IMAGENS...                    "
echo "=========================================="
echo

# Testar imagens
for img in "logo-inwista.png" "card-front.png" "pix-icon.png"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://mobile.192.168.1.15.nip.io/attached_assets/$img")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "  ✓ $img - HTTP $HTTP_CODE"
    else
        echo "  ❌ $img - HTTP $HTTP_CODE"
    fi
done

echo
echo "=========================================="
echo "  CORREÇÃO APLICADA!                     "
echo "=========================================="
echo
echo "Acesse agora no navegador:"
echo "  https://mobile.192.168.1.15.nip.io"
echo
echo "As imagens DEVEM aparecer. Se não aparecerem:"
echo "1. Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)"
echo "2. Teste em modo anônimo/privado"
echo "3. Execute: bash diagnose_images.sh"
echo
