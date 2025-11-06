#!/usr/bin/env bash

###############################################################################
# CORREÇÃO URGENTE NGINX + SSL
###############################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}ERRO: Execute com sudo${NC}"
   exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CORREÇÃO NGINX + SSL URGENTE         ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Criar diretório para certificados
echo -e "${YELLOW}[1/7] Criando diretórios...${NC}"
mkdir -p /var/www/html/ssl-ca
mkdir -p /var/www/html
chmod 755 /var/www/html
chmod 755 /var/www/html/ssl-ca

# 2. Encontrar certificado CA do mkcert
echo -e "${YELLOW}[2/7] Localizando certificado mkcert...${NC}"

CAROOT=""
if command -v mkcert &> /dev/null; then
    CAROOT=$(mkcert -CAROOT 2>/dev/null || echo "")
fi

if [[ -z "$CAROOT" ]] || [[ ! -f "$CAROOT/rootCA.pem" ]]; then
    # Tentar localizar manualmente
    CAROOT_FILE=$(find /root -name "rootCA.pem" 2>/dev/null | head -1)
    if [[ -z "$CAROOT_FILE" ]]; then
        CAROOT_FILE=$(find /home -name "rootCA.pem" 2>/dev/null | head -1)
    fi

    if [[ -z "$CAROOT_FILE" ]]; then
        echo -e "${RED}ERRO: Certificado mkcert não encontrado!${NC}"
        echo -e "${YELLOW}Execute: mkcert -install${NC}"
        exit 1
    fi

    CAROOT=$(dirname "$CAROOT_FILE")
fi

echo -e "${GREEN}✓ CA encontrado: $CAROOT${NC}"

# 3. Copiar certificados
echo -e "${YELLOW}[3/7] Copiando certificados...${NC}"
cp "$CAROOT/rootCA.pem" /var/www/html/ssl-ca/rootCA.pem
cp "$CAROOT/rootCA.pem" /var/www/html/ssl-ca/inwista-ca.crt
chmod 644 /var/www/html/ssl-ca/rootCA.pem
chmod 644 /var/www/html/ssl-ca/inwista-ca.crt
echo -e "${GREEN}✓ Certificados copiados${NC}"

# 4. Criar página HTML simples
echo -e "${YELLOW}[4/7] Criando página HTML...${NC}"

cat > /var/www/html/ssl-ca/index.html <<'HTMLEOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificados SSL - Inwista</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #2c3e50; }
        .download-btn {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
            font-size: 16px;
        }
        .download-btn:hover {
            background: #2980b9;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: #ecf0f1;
            border-radius: 5px;
        }
        ol { margin-left: 20px; }
        li { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Certificados SSL - Inwista</h1>
        <p>Baixe e instale o certificado para acessar a aplicação sem avisos de segurança.</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="rootCA.pem" class="download-btn" download>📥 Baixar rootCA.pem</a>
            <a href="inwista-ca.crt" class="download-btn" download>📥 Baixar inwista-ca.crt (Android)</a>
        </div>

        <div class="section">
            <h2>🪟 Windows</h2>
            <ol>
                <li>Baixe <strong>rootCA.pem</strong></li>
                <li>Duplo-clique no arquivo</li>
                <li>Clique em "Instalar Certificado"</li>
                <li>Escolha "Máquina Local"</li>
                <li>Selecione "Autoridades de Certificação Raiz Confiáveis"</li>
                <li>Clique em "Concluir"</li>
                <li>Reinicie o navegador</li>
            </ol>
        </div>

        <div class="section">
            <h2>🍎 macOS</h2>
            <ol>
                <li>Baixe <strong>rootCA.pem</strong></li>
                <li>Duplo-clique (abre Acesso às Chaves)</li>
                <li>Encontre "mkcert" e duplo-clique</li>
                <li>Em "Confiança", escolha "Sempre Confiar"</li>
                <li>Reinicie o navegador</li>
            </ol>
        </div>

        <div class="section">
            <h2>🤖 Android</h2>
            <ol>
                <li>Baixe <strong>inwista-ca.crt</strong></li>
                <li>Configurações → Segurança → Instalar certificado CA</li>
                <li>Selecione o arquivo baixado</li>
                <li>Reinicie o navegador</li>
            </ol>
        </div>

        <div class="section">
            <h2>📱 iOS (iPhone/iPad)</h2>
            <ol>
                <li>Baixe <strong>rootCA.pem</strong> no Safari</li>
                <li>Ajustes → Geral → VPN e Gerenciamento</li>
                <li>Instale o perfil "mkcert"</li>
                <li>Ajustes → Geral → Sobre → Configurações de Confiança</li>
                <li>Ative "mkcert"</li>
                <li>Reinicie o Safari</li>
            </ol>
        </div>

        <div class="section" style="background: #d4edda;">
            <h2>✅ Teste</h2>
            <p>Após instalar, acesse:</p>
            <p><strong><a href="https://mobile.192.168.1.15.nip.io" target="_blank">https://mobile.192.168.1.15.nip.io</a></strong></p>
            <p>Você deve ver o cadeado 🔒 verde sem avisos!</p>
        </div>
    </div>
</body>
</html>
HTMLEOF

chmod 644 /var/www/html/ssl-ca/index.html
echo -e "${GREEN}✓ Página HTML criada${NC}"

# 5. Criar configuração Nginx SIMPLES
echo -e "${YELLOW}[5/7] Configurando Nginx...${NC}"

cat > /etc/nginx/sites-available/ssl-ca.conf <<'NGINXEOF'
server {
    listen 80;
    server_name 192.168.1.15 *.192.168.1.15.nip.io;

    location /ssl-ca {
        alias /var/www/html/ssl-ca;
        index index.html;
        autoindex on;

        # Permitir download
        types {
            application/x-pem-file pem;
            application/x-x509-ca-cert crt;
        }
    }
}
NGINXEOF

# Remover link antigo se existir
rm -f /etc/nginx/sites-enabled/ssl-ca.conf
rm -f /etc/nginx/sites-enabled/ssl-ca

# Criar novo link
ln -sf /etc/nginx/sites-available/ssl-ca.conf /etc/nginx/sites-enabled/ssl-ca.conf

echo -e "${GREEN}✓ Nginx configurado${NC}"

# 6. Testar configuração
echo -e "${YELLOW}[6/7] Testando configuração Nginx...${NC}"
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓ Configuração válida!${NC}"
else
    echo -e "${RED}✗ ERRO na configuração Nginx:${NC}"
    nginx -t
    exit 1
fi

# 7. Recarregar Nginx
echo -e "${YELLOW}[7/7] Recarregando Nginx...${NC}"
systemctl reload nginx

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx recarregado com sucesso!${NC}"
else
    echo -e "${RED}✗ ERRO: Nginx não está rodando!${NC}"
    systemctl status nginx
    exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  ✅ CONFIGURAÇÃO COMPLETA!            ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Acesse agora de qualquer dispositivo:${NC}"
echo -e "  ${BLUE}http://192.168.1.15/ssl-ca${NC}"
echo ""
echo -e "${GREEN}Baixe e instale o certificado!${NC}"
echo ""
