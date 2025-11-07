#!/usr/bin/env bash

echo "=========================================="
echo "  DIAGNÓSTICO DE IMAGENS - INWISTA       "
echo "=========================================="
echo ""

# 1. Verificar se os assets existem no build
echo "1. Verificando assets no BUILD (dist/public/attached_assets/):"
echo ""
if [[ -d "dist/public/attached_assets" ]]; then
    echo "✓ Diretório existe"
    echo ""
    echo "Arquivos críticos:"
    for file in "logo-inwista.png" "Logo Inwista_1762037237480.png" "card-front.png" "card-back.png" "pix-icon.png" "qrcode-pix_1762052957607.jpg"; do
        if [[ -f "dist/public/attached_assets/$file" ]]; then
            size=$(ls -lh "dist/public/attached_assets/$file" | awk '{print $5}')
            echo "  ✓ $file ($size)"
        else
            echo "  ✗ $file - NÃO ENCONTRADO!"
        fi
    done
else
    echo "✗ Diretório dist/public/attached_assets/ NÃO EXISTE!"
    echo ""
    echo "Execute: npm run build"
fi

echo ""
echo "=========================================="
echo ""

# 2. Verificar se o PM2 está servindo o build correto
echo "2. Verificando PM2:"
echo ""
pm2 list | grep inwistamobile

echo ""
echo "Diretório de trabalho do PM2:"
pm2 info inwistamobile | grep "cwd" || echo "PM2 não está rodando inwistamobile"

echo ""
echo "=========================================="
echo ""

# 3. Testar se o servidor local está servindo as imagens
echo "3. Testando se o servidor ESTÁ SERVINDO as imagens:"
echo ""

PORT=$(pm2 info inwistamobile | grep "PORT" | grep -oP '\d+' | head -1)
if [[ -z "$PORT" ]]; then
    PORT=5000
fi

echo "Porta detectada: $PORT"
echo ""

for file in "logo-inwista.png" "card-front.png" "pix-icon.png"; do
    HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" "http://localhost:$PORT/attached_assets/$file" 2>/dev/null || echo "000")
    if [[ "$HTTP_CODE" == "200" ]]; then
        echo "  ✓ /attached_assets/$file - HTTP $HTTP_CODE"
    else
        echo "  ✗ /attached_assets/$file - HTTP $HTTP_CODE (ERRO!)"
    fi
done

echo ""
echo "=========================================="
echo ""

# 4. Verificar se o Nginx está repassando corretamente
echo "4. Testando via NGINX (https://mobile.192.168.1.15.nip.io):"
echo ""

for file in "logo-inwista.png" "card-front.png"; do
    HTTP_CODE=$(curl -k -o /dev/null -s -w "%{http_code}" "https://mobile.192.168.1.15.nip.io/attached_assets/$file" 2>/dev/null || echo "000")
    if [[ "$HTTP_CODE" == "200" ]]; then
        echo "  ✓ /attached_assets/$file via Nginx - HTTP $HTTP_CODE"
    else
        echo "  ✗ /attached_assets/$file via Nginx - HTTP $HTTP_CODE (ERRO!)"
    fi
done

echo ""
echo "=========================================="
echo ""

# 5. Verificar logs do PM2
echo "5. Últimas 10 linhas dos logs do PM2:"
echo ""
pm2 logs inwistamobile --nostream --lines 10 2>/dev/null || echo "Sem logs disponíveis"

echo ""
echo "=========================================="
echo "  FIM DO DIAGNÓSTICO                     "
echo "=========================================="
