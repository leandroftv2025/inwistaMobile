#!/bin/bash

echo "=========================================="
echo "  TESTE REAL DE IMAGENS NO BROWSER       "
echo "=========================================="
echo

# Gerar HTML de teste simples
cat > /home/user/inwistaMobile/test-images.html <<'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Teste de Imagens - Inwista</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f0f0f0;
        }
        .test-section {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        img {
            max-width: 300px;
            border: 2px solid #ddd;
            margin: 10px;
        }
        .error {
            color: red;
            font-weight: bold;
        }
        .success {
            color: green;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>Teste de Carregamento de Imagens</h1>

    <div class="test-section">
        <h2>1. Caminho Absoluto /attached_assets/</h2>
        <img src="/attached_assets/logo-inwista.png" alt="Logo Inwista"
             onload="this.nextElementSibling.className='success'; this.nextElementSibling.textContent='✓ CARREGOU!'"
             onerror="this.nextElementSibling.className='error'; this.nextElementSibling.textContent='✗ ERRO AO CARREGAR!'">
        <p class="loading">Carregando...</p>
    </div>

    <div class="test-section">
        <h2>2. Logo alternativo</h2>
        <img src="/attached_assets/Logo Inwista_1762037237480.png" alt="Logo Alt"
             onload="this.nextElementSibling.className='success'; this.nextElementSibling.textContent='✓ CARREGOU!'"
             onerror="this.nextElementSibling.className='error'; this.nextElementSibling.textContent='✗ ERRO AO CARREGAR!'">
        <p class="loading">Carregando...</p>
    </div>

    <div class="test-section">
        <h2>3. Card Front</h2>
        <img src="/attached_assets/card-front.png" alt="Card Front"
             onload="this.nextElementSibling.className='success'; this.nextElementSibling.textContent='✓ CARREGOU!'"
             onerror="this.nextElementSibling.className='error'; this.nextElementSibling.textContent='✗ ERRO AO CARREGAR!'">
        <p class="loading">Carregando...</p>
    </div>

    <div class="test-section">
        <h2>4. PIX Icon</h2>
        <img src="/attached_assets/pix-icon.png" alt="PIX Icon"
             onload="this.nextElementSibling.className='success'; this.nextElementSibling.textContent='✓ CARREGOU!'"
             onerror="this.nextElementSibling.className='error'; this.nextElementSibling.textContent='✗ ERRO AO CARREGAR!'">
        <p class="loading">Carregando...</p>
    </div>

    <div class="test-section">
        <h2>Console de Debug</h2>
        <pre id="debug"></pre>
    </div>

    <script>
        // Log todas as tentativas de carregar imagens
        const images = document.querySelectorAll('img');
        const debugLog = document.getElementById('debug');
        let logs = [];

        images.forEach(img => {
            logs.push('Tentando carregar: ' + img.src);

            img.addEventListener('load', () => {
                logs.push('✓ Sucesso: ' + img.src);
                debugLog.textContent = logs.join('\n');
            });

            img.addEventListener('error', () => {
                logs.push('✗ Erro: ' + img.src);
                debugLog.textContent = logs.join('\n');

                // Tentar fazer fetch para ver o erro real
                fetch(img.src)
                    .then(r => {
                        logs.push('  Status: ' + r.status + ' ' + r.statusText);
                        logs.push('  Content-Type: ' + r.headers.get('content-type'));
                        debugLog.textContent = logs.join('\n');
                    })
                    .catch(e => {
                        logs.push('  Erro de rede: ' + e.message);
                        debugLog.textContent = logs.join('\n');
                    });
            });
        });
    </script>
</body>
</html>
EOF

echo "✓ Arquivo de teste criado: /home/user/inwistaMobile/test-images.html"
echo
echo "Para testar:"
echo "1. Copie este arquivo para dist/public/:"
echo "   cp /home/user/inwistaMobile/test-images.html /home/user/inwistaMobile/dist/public/"
echo
echo "2. Acesse no browser:"
echo "   https://mobile.192.168.1.15.nip.io/test-images.html"
echo
echo "Isso mostrará EXATAMENTE se as imagens carregam ou não, e qual é o erro."
echo
