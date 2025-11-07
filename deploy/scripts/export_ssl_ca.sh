#!/usr/bin/env bash

###############################################################################
# Script: export_ssl_ca.sh
# Descrição: Exporta o certificado CA do mkcert para instalar em outros dispositivos
# Uso: sudo bash deploy/scripts/export_ssl_ca.sh
###############################################################################

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script precisa ser executado como root (use sudo)"
   exit 1
fi

echo "=========================================="
echo "  Exportar Certificado CA do mkcert"
echo "=========================================="
echo ""

# Diretório de destino para exportação
EXPORT_DIR="/var/www/html/ssl-ca"
NGINX_HTML_DIR="/var/www/html"

# Criar diretório se não existir
log_info "Criando diretório de exportação..."
mkdir -p "$EXPORT_DIR"

# Encontrar o CA root do mkcert
log_info "Localizando certificado CA do mkcert..."

# Tentar diferentes localizações
CAROOT=""
if command -v mkcert &> /dev/null; then
    CAROOT=$(mkcert -CAROOT)
elif [[ -d "/root/.local/share/mkcert" ]]; then
    CAROOT="/root/.local/share/mkcert"
elif [[ -d "$HOME/.local/share/mkcert" ]]; then
    CAROOT="$HOME/.local/share/mkcert"
fi

if [[ -z "$CAROOT" ]] || [[ ! -f "$CAROOT/rootCA.pem" ]]; then
    log_error "Certificado CA do mkcert não encontrado!"
    log_info "Tentando localizações comuns:"
    find /root -name "rootCA.pem" 2>/dev/null || true
    find /home -name "rootCA.pem" 2>/dev/null || true
    exit 1
fi

log_success "CA encontrado em: $CAROOT"

# Copiar certificados
log_info "Copiando certificados..."
cp "$CAROOT/rootCA.pem" "$EXPORT_DIR/rootCA.pem"
cp "$CAROOT/rootCA.pem" "$EXPORT_DIR/inwista-ca.crt"  # Cópia com extensão .crt para Android

# Ajustar permissões
chmod 644 "$EXPORT_DIR/rootCA.pem"
chmod 644 "$EXPORT_DIR/inwista-ca.crt"

log_success "Certificados exportados para: $EXPORT_DIR"

# Criar página HTML de instruções
log_info "Criando página de instruções..."

cat > "$EXPORT_DIR/index.html" <<'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalação do Certificado SSL - Inwista</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            padding: 40px;
        }
        h1 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .download-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .download-btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 1.2em;
            margin: 10px;
            transition: background 0.3s;
        }
        .download-btn:hover {
            background: #5568d3;
        }
        .platform {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        .platform h2 {
            color: #495057;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .platform-icon {
            font-size: 1.5em;
            margin-right: 10px;
        }
        ol, ul {
            margin-left: 20px;
            margin-top: 10px;
        }
        li {
            margin: 8px 0;
        }
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            color: #e83e8c;
        }
        .success {
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Certificado SSL Inwista</h1>
        <p class="subtitle">Instale o certificado CA para acessar a aplicação sem avisos de segurança</p>

        <div class="warning">
            <strong>⚠️ Por que preciso instalar este certificado?</strong><br>
            A aplicação usa HTTPS com certificados locais (mkcert). Para que seu navegador/dispositivo confie nos certificados,
            você precisa instalar o Certificado de Autoridade (CA) root.
        </div>

        <div class="download-section">
            <h3>📥 Download do Certificado</h3>
            <a href="rootCA.pem" class="download-btn" download>Baixar rootCA.pem</a>
            <a href="inwista-ca.crt" class="download-btn" download>Baixar inwista-ca.crt (Android)</a>
        </div>

        <div class="platform">
            <h2><span class="platform-icon">🪟</span>Windows</h2>
            <ol>
                <li>Baixe o arquivo <code>rootCA.pem</code></li>
                <li>Clique duas vezes no arquivo</li>
                <li>Clique em "Instalar Certificado"</li>
                <li>Escolha "Máquina Local"</li>
                <li>Selecione "Colocar todos os certificados no repositório a seguir"</li>
                <li>Clique em "Procurar" e escolha "Autoridades de Certificação Raiz Confiáveis"</li>
                <li>Clique em "Avançar" e "Concluir"</li>
                <li>Reinicie o navegador</li>
            </ol>
        </div>

        <div class="platform">
            <h2><span class="platform-icon">🍎</span>macOS</h2>
            <ol>
                <li>Baixe o arquivo <code>rootCA.pem</code></li>
                <li>Clique duas vezes no arquivo (abre o "Acesso às Chaves")</li>
                <li>Encontre o certificado "mkcert" na lista</li>
                <li>Clique duas vezes nele</li>
                <li>Expanda "Confiança"</li>
                <li>Altere "Ao usar este certificado" para "Sempre Confiar"</li>
                <li>Feche a janela (vai pedir sua senha)</li>
                <li>Reinicie o navegador</li>
            </ol>
        </div>

        <div class="platform">
            <h2><span class="platform-icon">🐧</span>Linux (Ubuntu/Debian)</h2>
            <ol>
                <li>Baixe o arquivo <code>rootCA.pem</code></li>
                <li>Abra o terminal e execute:</li>
            </ol>
            <code style="display: block; padding: 10px; margin: 10px 0;">
sudo cp ~/Downloads/rootCA.pem /usr/local/share/ca-certificates/inwista-ca.crt<br>
sudo update-ca-certificates<br>
            </code>
            <p>Para Firefox no Linux:</p>
            <ol start="3">
                <li>Abra o Firefox → Preferências → Privacidade e Segurança</li>
                <li>Role até "Certificados" → "Ver Certificados"</li>
                <li>Aba "Autoridades" → "Importar"</li>
                <li>Selecione o arquivo <code>rootCA.pem</code></li>
                <li>Marque "Confiar nesta CA para identificar sites"</li>
            </ol>
        </div>

        <div class="platform">
            <h2><span class="platform-icon">🤖</span>Android</h2>
            <ol>
                <li>Baixe o arquivo <code>inwista-ca.crt</code> no seu dispositivo</li>
                <li>Vá em Configurações → Segurança → Criptografia e credenciais</li>
                <li>Toque em "Instalar um certificado"</li>
                <li>Escolha "Certificado CA"</li>
                <li>Navegue até o arquivo <code>inwista-ca.crt</code> baixado</li>
                <li>Digite o PIN/senha do dispositivo se solicitado</li>
                <li>Reinicie o navegador</li>
            </ol>
            <div class="warning">
                <strong>Nota:</strong> Android 7+ exige que apps confiem explicitamente em CAs de usuário.
                Navegadores como Chrome devem funcionar, mas apps nativos podem não confiar automaticamente.
            </div>
        </div>

        <div class="platform">
            <h2><span class="platform-icon">📱</span>iOS/iPhone/iPad</h2>
            <ol>
                <li>Baixe o arquivo <code>rootCA.pem</code> no Safari do iPhone/iPad</li>
                <li>Vai aparecer "Perfil Baixado" → toque em "Fechar"</li>
                <li>Abra Ajustes → Geral → VPN e Gerenciamento de Dispositivos</li>
                <li>Toque no perfil "mkcert"</li>
                <li>Toque em "Instalar" (pode pedir seu código)</li>
                <li>Toque em "Instalar" novamente para confirmar</li>
                <li>Agora vá em Ajustes → Geral → Sobre → Configurações de Confiança do Certificado</li>
                <li>Ative o botão ao lado de "mkcert"</li>
                <li>Confirme tocando em "Continuar"</li>
                <li>Reinicie o Safari</li>
            </ol>
        </div>

        <div class="success">
            <strong>✅ Certificado instalado com sucesso?</strong><br>
            Acesse <a href="https://mobile.192.168.1.15.nip.io" target="_blank">https://mobile.192.168.1.15.nip.io</a>
            e verifique se não há mais avisos de segurança!
        </div>

        <div class="warning">
            <strong>🔐 Segurança:</strong><br>
            Este certificado é válido apenas para a rede local (192.168.1.15).
            Ele NÃO expõe sua segurança em sites externos da internet.
        </div>
    </div>
</body>
</html>
EOF

chmod 644 "$EXPORT_DIR/index.html"

log_success "Página de instruções criada!"

# Configurar Nginx para servir os certificados
log_info "Configurando Nginx para servir certificados..."

cat > /etc/nginx/sites-available/ssl-ca <<EOF
server {
    listen 80;
    server_name 192.168.1.15 *.192.168.1.15.nip.io;

    location /ssl-ca {
        alias $EXPORT_DIR;
        index index.html;
        autoindex on;

        # Permitir download
        add_header Content-Disposition 'attachment';

        # CORS para permitir download de qualquer origem
        add_header Access-Control-Allow-Origin *;
    }
}
EOF

# Ativar site se não estiver ativo
if [[ ! -L /etc/nginx/sites-enabled/ssl-ca ]]; then
    ln -s /etc/nginx/sites-available/ssl-ca /etc/nginx/sites-enabled/ssl-ca
    log_success "Site Nginx ativado!"
fi

# Testar configuração do Nginx
log_info "Testando configuração do Nginx..."
if nginx -t 2>&1 | grep -q "successful"; then
    log_success "Configuração do Nginx válida!"

    # Recarregar Nginx
    systemctl reload nginx
    log_success "Nginx recarregado!"
else
    log_error "Erro na configuração do Nginx!"
    nginx -t
    exit 1
fi

echo ""
echo "=========================================="
log_success "Certificados exportados com sucesso!"
echo "=========================================="
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Acesse de qualquer dispositivo na rede:"
echo "   http://192.168.1.15/ssl-ca"
echo ""
echo "2. Baixe o certificado apropriado:"
echo "   - Windows/Mac/Linux: rootCA.pem"
echo "   - Android: inwista-ca.crt"
echo ""
echo "3. Siga as instruções na página para instalar"
echo ""
echo "4. Após instalar, acesse sem avisos de segurança:"
echo "   https://mobile.192.168.1.15.nip.io"
echo ""
echo "=========================================="
