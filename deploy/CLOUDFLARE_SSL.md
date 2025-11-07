# 🔒 SSL com Cloudflare - Guia Completo

## 📋 Você Tem 3 Opções de SSL

### Opção 1: Cloudflare SSL (Flexible) ⚠️

**Como funciona:**
```
Usuário → [HTTPS] → Cloudflare → [HTTP] → Seu Servidor
```

✅ **Vantagens:**
- Mais simples
- Não precisa configurar certificado no servidor
- SSL "grátis" via Cloudflare

❌ **Desvantagens:**
- ⚠️ **NÃO É SEGURO!** Entre Cloudflare e seu servidor é HTTP (sem criptografia)
- Dados sensíveis trafegam sem proteção
- **NÃO RECOMENDADO PARA PRODUÇÃO**

---

### Opção 2: Cloudflare SSL (Full) ⚡ **RECOMENDADO**

**Como funciona:**
```
Usuário → [HTTPS] → Cloudflare → [HTTPS] → Seu Servidor
```

✅ **Vantagens:**
- ✅ **SEGURO de ponta a ponta**
- Cloudflare valida certificado do seu servidor
- Melhor performance (cache do Cloudflare)
- DDoS protection
- Firewall WAF gratuito

✅ **O que você precisa:**
- Certificado auto-assinado NO SERVIDOR (criaremos para você)
- Cloudflare em modo "Full (strict)"

**👍 ESTA É A OPÇÃO RECOMENDADA!**

---

### Opção 3: Let's Encrypt no Servidor (Sem Cloudflare Proxy)

**Como funciona:**
```
Usuário → [HTTPS] → Seu Servidor (Let's Encrypt)
```

✅ **Vantagens:**
- Certificado válido e reconhecido
- Controle total
- Sem intermediários

❌ **Desvantagens:**
- Sem cache do Cloudflare
- Sem DDoS protection
- IP do servidor exposto
- Menos performance

---

## 🎯 RECOMENDAÇÃO: Cloudflare Full (Opção 2)

**Melhor de ambos os mundos:**
- ✅ Segurança ponta a ponta
- ✅ Performance (cache global)
- ✅ DDoS protection
- ✅ Fácil de configurar

---

## 🔧 Como Configurar (Cloudflare Full)

### PASSO 1: Criar Certificado Auto-Assinado no Servidor

Execute no servidor:

```bash
# Criar diretório para certificados
mkdir -p /etc/ssl/inwista
cd /etc/ssl/inwista

# Gerar certificado auto-assinado (válido por 10 anos)
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout inwista.key \
  -out inwista.crt \
  -subj "/C=BR/ST=SP/L=SaoPaulo/O=Inwista/CN=*.inwista.com"

# Permissões corretas
chmod 600 inwista.key
chmod 644 inwista.crt
```

✅ Certificado criado em:
- Chave privada: `/etc/ssl/inwista/inwista.key`
- Certificado: `/etc/ssl/inwista/inwista.crt`

---

### PASSO 2: Configurar Nginx

**Arquivo:** `/etc/nginx/sites-available/inwista`

```nginx
# Site institucional - www.inwista.com
server {
    listen 80;
    listen [::]:80;
    server_name inwista.com www.inwista.com;

    # Redirecionar HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name inwista.com www.inwista.com;

    # Certificado auto-assinado
    ssl_certificate /etc/ssl/inwista/inwista.crt;
    ssl_certificate_key /etc/ssl/inwista/inwista.key;

    # Configurações SSL básicas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Proxy para inwistasite
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Aplicação - app.inwista.com
server {
    listen 80;
    listen [::]:80;
    server_name app.inwista.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.inwista.com;

    ssl_certificate /etc/ssl/inwista/inwista.crt;
    ssl_certificate_key /etc/ssl/inwista/inwista.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    add_header Strict-Transport-Security "max-age=31536000" always;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Testar e recarregar:

```bash
nginx -t
systemctl reload nginx
```

---

### PASSO 3: Configurar Cloudflare

1. **Acesse:** https://dash.cloudflare.com
2. **Selecione:** inwista.com
3. **Vá em:** SSL/TLS

#### 3.1. SSL/TLS Mode

```
┌─────────────────────────────────────┐
│ SSL/TLS encryption mode             │
├─────────────────────────────────────┤
│ ○ Off                               │
│ ○ Flexible ← NÃO USE!               │
│ ● Full     ← SELECIONE ESTA!        │
│ ○ Full (strict)                     │
└─────────────────────────────────────┘
```

**Selecione:** **Full**

**Por que não "Full (strict)"?**
- Full (strict) requer certificado válido (Let's Encrypt)
- Full aceita certificado auto-assinado
- Ambos são seguros (HTTPS ponta a ponta)

---

#### 3.2. Always Use HTTPS

Vá em: **SSL/TLS** > **Edge Certificates**

```
Always Use HTTPS: [ON] ← Ativar
```

Isso redireciona HTTP → HTTPS automaticamente.

---

#### 3.3. Automatic HTTPS Rewrites

Ainda em **Edge Certificates**:

```
Automatic HTTPS Rewrites: [ON] ← Ativar
```

Links HTTP no site viram HTTPS automaticamente.

---

#### 3.4. Ativar Proxy (Nuvem Laranja)

Vá em: **DNS** > **Records**

Para cada registro DNS:

```
┌──────┬──────────┬─────────────────┬────────────┐
│ Type │   Name   │     Content     │   Status   │
├──────┼──────────┼─────────────────┼────────────┤
│  A   │    @     │  161.97.96.29   │ 🟧 Proxied │ ← Ativar
│CNAME │   www    │   inwista.com   │ 🟧 Proxied │ ← Ativar
│  A   │   app    │  161.97.96.29   │ 🟧 Proxied │ ← Ativar
└──────┴──────────┴─────────────────┴────────────┘
```

Clique na nuvem 🟠 para mudar para 🟧 (Proxied).

---

### PASSO 4: Testar

1. **Acesse:** https://www.inwista.com
2. **Verifique:**
   - ✅ Cadeado verde no navegador
   - ✅ HTTPS ativo
   - ✅ Site carrega rápido

3. **Teste SSL:**
   - Acesse: https://www.ssllabs.com/ssltest/
   - Digite: `www.inwista.com`
   - **Esperado:** A ou A+ (pode ser B por ser Cloudflare)

---

## 🤔 Comparação: Full vs Let's Encrypt

| Critério | Cloudflare Full | Let's Encrypt |
|----------|-----------------|---------------|
| **Segurança** | ✅ HTTPS ponta a ponta | ✅ HTTPS ponta a ponta |
| **Certificado** | Auto-assinado (10 anos) | Válido (3 meses) |
| **Performance** | ✅ Cache global | ❌ Sem cache |
| **DDoS** | ✅ Proteção incluída | ❌ Sem proteção |
| **CDN** | ✅ Sim | ❌ Não |
| **IP oculto** | ✅ Sim | ❌ Exposto |
| **Manutenção** | ✅ Zero (cert nunca expira) | ⚠️ Renovar a cada 3 meses |
| **Complexidade** | ✅ Simples | ⚠️ Mais complexo |

**Veredito:** Cloudflare Full é melhor para produção! 🏆

---

## 🔧 Script Automatizado

Criei um script que faz tudo automaticamente:

```bash
curl -fsSL https://raw.githubusercontent.com/leandroftv2025/inwistaMobile/main/deploy/scripts/2-install-apps-cloudflare.sh | bash
```

Este script:
- ✅ Cria certificado auto-assinado
- ✅ Configura Nginx com HTTPS
- ✅ Deploy das aplicações
- ✅ Sem Let's Encrypt

---

## ⚠️ IMPORTANTE: Cloudflare Flexible é INSEGURO!

**NUNCA use Flexible em produção!**

```
Usuário → [HTTPS] → Cloudflare → [HTTP] → Servidor
                                   ↑
                              SEM CRIPTOGRAFIA!
```

Dados sensíveis (senhas, cartões, etc) trafegam em texto puro entre Cloudflare e seu servidor.

**Hacker na mesma rede pode interceptar tudo!**

---

## 📊 Velocidade: Cloudflare Full

Com Cloudflare Full + Proxy ativo, você ganha:

✅ **Cache distribuído globalmente**
- Brasil: ~20ms
- EUA: ~50ms
- Europa: ~80ms
- Ásia: ~150ms

✅ **DDoS protection**
- Ataques bloqueados automaticamente

✅ **Firewall WAF**
- Proteção contra SQL injection, XSS, etc

✅ **Bandwidth ilimitado**
- Cloudflare não cobra tráfego

---

## 🎯 Checklist

Configuração correta:

- [ ] Certificado auto-assinado criado no servidor
- [ ] Nginx configurado para HTTPS (porta 443)
- [ ] Cloudflare em modo **Full** (não Flexible!)
- [ ] Always Use HTTPS ativado
- [ ] Proxy ativado (🟧 nuvem laranja)
- [ ] Testado: https://www.inwista.com carrega
- [ ] Testado: Cadeado verde no navegador

---

## 🚨 Troubleshooting

### "Erro 525: SSL Handshake Failed"

**Causa:** Nginx não está configurado para HTTPS

**Solução:**
```bash
# Verificar se Nginx está ouvindo na porta 443
netstat -tlnp | grep :443

# Se não estiver, recarregar Nginx
systemctl reload nginx
```

---

### "Too Many Redirects"

**Causa:** Loop de redirecionamento

**Solução:**
1. Cloudflare deve estar em modo **Full** (não Off ou Flexible)
2. Nginx deve aceitar HTTPS (porta 443)

---

### Certificado "Inválido" no navegador

**Causa:** Acessando direto pelo IP (sem Cloudflare)

**Solução:**
- Acesse pelo domínio: `https://www.inwista.com`
- Não pelo IP: `https://161.97.96.29`
- Cloudflare precisa estar no meio (proxy ativo 🟧)

---

## 💡 Resumo

### Se você quer:

**Performance + Segurança + Simplicidade**
→ Use **Cloudflare Full** com certificado auto-assinado

**Controle total + Certificado válido**
→ Use **Let's Encrypt** sem proxy Cloudflare

**Para Inwista:**
→ Recomendo **Cloudflare Full** 🏆

---

## 📞 Próximos Passos

1. ✅ Configure Cloudflare em modo **Full**
2. ✅ Execute script de instalação (já com SSL)
3. ✅ Ative proxy Cloudflare (🟧)
4. ✅ Teste seus sites

---

**SSL configurado = Sites seguros e rápidos!** 🚀🔒

---

**Última atualização**: 2025-11-07
