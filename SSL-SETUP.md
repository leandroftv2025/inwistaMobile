# 🔒 Guia de Configuração SSL/HTTPS

## Problema: "Sua conexão não é particular" ou "Certificado não confiável"

Quando você acessa `https://mobile.192.168.1.15.nip.io` e vê um aviso de segurança, é porque o certificado SSL local (mkcert) não está instalado no seu dispositivo.

## ✅ Solução Rápida (3 minutos)

### 1️⃣ No Servidor (192.168.1.15)

Execute este comando **uma única vez** no servidor:

```bash
cd ~/inwistaMobile
sudo bash deploy/scripts/export_ssl_ca.sh
```

Este script:
- ✅ Exporta o certificado CA do mkcert
- ✅ Cria uma página web com instruções
- ✅ Configura o Nginx para servir os certificados

### 2️⃣ Em Cada Dispositivo que Vai Acessar

Abra o navegador e acesse:

```
http://192.168.1.15/ssl-ca
```

Você verá uma página com:
- 📥 Botões para baixar o certificado
- 📖 Instruções específicas para seu sistema operacional
- ✅ Guia passo-a-passo de instalação

### 3️⃣ Siga as Instruções da Página

A página tem instruções detalhadas para:
- 🪟 Windows
- 🍎 macOS
- 🐧 Linux
- 🤖 Android
- 📱 iOS/iPhone/iPad

---

## 🚀 Resumo por Plataforma

### Windows
1. Baixe `rootCA.pem`
2. Duplo-clique → Instalar Certificado
3. Escolha "Autoridades de Certificação Raiz Confiáveis"
4. Reinicie o navegador

### macOS
1. Baixe `rootCA.pem`
2. Duplo-clique (abre Acesso às Chaves)
3. Encontre "mkcert" → Duplo-clique
4. Expanda "Confiança" → "Sempre Confiar"
5. Reinicie o navegador

### Linux (Ubuntu/Debian)
```bash
sudo cp ~/Downloads/rootCA.pem /usr/local/share/ca-certificates/inwista-ca.crt
sudo update-ca-certificates
```

### Android
1. Baixe `inwista-ca.crt`
2. Configurações → Segurança → Instalar certificado CA
3. Selecione o arquivo baixado
4. Reinicie o navegador

### iOS/iPhone/iPad
1. Baixe `rootCA.pem` no Safari
2. Ajustes → Geral → VPN e Gerenciamento → Instalar perfil
3. Ajustes → Geral → Sobre → Configurações de Confiança do Certificado
4. Ative "mkcert"
5. Reinicie o Safari

---

## 🔍 Verificar se Funcionou

Após instalar o certificado, acesse:

```
https://mobile.192.168.1.15.nip.io
```

**Sucesso:** Você vê o cadeado 🔒 verde e nenhum aviso de segurança!

---

## ❓ Perguntas Frequentes

### P: Por que preciso instalar este certificado?

**R:** A aplicação usa HTTPS com certificados gerados localmente pelo `mkcert`. Estes certificados são seguros, mas seu navegador não os conhece. Ao instalar o certificado CA root, você está dizendo ao seu dispositivo: "Eu confio nos certificados gerados por este servidor".

### P: Isso é seguro?

**R:** **Sim!** Este certificado só funciona para a rede local (192.168.1.15). Ele NÃO permite que ninguém intercepte suas conexões com sites externos da internet.

### P: Preciso instalar em todos os dispositivos?

**R:** Sim, cada dispositivo que vai acessar a aplicação precisa ter o certificado instalado. Por exemplo:
- Seu computador pessoal
- Seu celular
- Tablet
- Computador do escritório

### P: O que acontece se eu não instalar?

**R:** A aplicação vai funcionar, mas você vai ver avisos de segurança toda vez que acessar. Você terá que clicar em "Avançado" → "Aceitar o risco" toda vez.

### P: Quanto tempo o certificado é válido?

**R:** O certificado CA do mkcert é válido por 10 anos. Os certificados individuais são válidos até **6 de fevereiro de 2028**.

### P: Preciso fazer isso de novo se reinstalar o servidor?

**R:** Sim, se você reinstalar o mkcert no servidor, ele vai gerar uma nova CA. Você precisará:
1. Remover o certificado antigo dos dispositivos
2. Executar `export_ssl_ca.sh` novamente no servidor
3. Reinstalar o novo certificado em todos os dispositivos

### P: E se eu quiser remover o certificado depois?

**R:** Você pode remover o certificado "mkcert" ou "inwista-ca" das configurações de certificados do seu sistema a qualquer momento.

---

## 🛠️ Troubleshooting

### Problema: Ainda vejo aviso de segurança após instalar

**Soluções:**
1. Certifique-se de que instalou no repositório correto:
   - Windows: "Autoridades de Certificação Raiz Confiáveis"
   - macOS: Definiu como "Sempre Confiar"
   - Linux: Executou `update-ca-certificates`

2. **Reinicie completamente o navegador** (feche todas as janelas)

3. Limpe o cache do navegador:
   - Chrome: Ctrl+Shift+Delete → Limpar cache
   - Firefox: Ctrl+Shift+Delete → Cache

4. Verifique se está acessando o domínio correto:
   - ✅ `https://mobile.192.168.1.15.nip.io`
   - ❌ Não use apenas o IP: `https://192.168.1.15:5000`

### Problema: Não consigo acessar http://192.168.1.15/ssl-ca

**Soluções:**
1. Verifique se o Nginx está rodando:
   ```bash
   sudo systemctl status nginx
   ```

2. Execute o script de export novamente:
   ```bash
   sudo bash deploy/scripts/export_ssl_ca.sh
   ```

3. Verifique os logs do Nginx:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Problema: Android ainda não confia no certificado

**Explicação:** Android 7+ exige que aplicativos declarem explicitamente que confiam em CAs de usuário. Navegadores modernos (Chrome, Firefox) funcionam, mas apps nativos podem não funcionar.

**Solução para navegadores:** Funciona normalmente após instalar o certificado.

**Solução para apps nativos:** Requer modificação do app (fora do escopo desta configuração).

---

## 📚 Referências

- [mkcert - Certificados SSL locais válidos](https://github.com/FiloSottile/mkcert)
- [nip.io - DNS curinga para IPs](https://nip.io/)
- [Como funcionam certificados SSL](https://www.cloudflare.com/learning/ssl/what-is-ssl/)

---

## 🆘 Suporte

Se após seguir todos os passos você ainda tiver problemas:

1. Verifique os logs do servidor:
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   pm2 logs inwistamobile --lines 50
   ```

2. Teste a conectividade:
   ```bash
   curl -v https://mobile.192.168.1.15.nip.io/api/health
   ```

3. Verifique o firewall:
   ```bash
   sudo ufw status
   # Deve mostrar: 80/tcp ALLOW, 443/tcp ALLOW
   ```

---

**Última atualização:** 2025-11-06
