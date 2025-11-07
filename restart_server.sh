#!/bin/bash

echo "=========================================="
echo "  REINICIANDO SERVIDOR INWISTA          "
echo "=========================================="

echo ""
echo "[1/2] Reiniciando PM2..."
pm2 restart inwistamobile
pm2 save

echo ""
echo "[2/2] Aguardando servidor iniciar..."
sleep 3

echo ""
echo "=========================================="
echo "  SERVIDOR REINICIADO!                   "
echo "=========================================="

echo ""
echo "Acesse agora no navegador:"
echo "  https://mobile.192.168.1.15.nip.io"
echo ""
echo "IMPORTANTE: Limpe o cache do navegador!"
echo "  - Chrome/Edge: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)"
echo "  - Ou teste em modo anônimo"
echo ""
