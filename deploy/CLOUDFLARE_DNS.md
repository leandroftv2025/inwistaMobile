# ☁️ Configuração DNS - Cloudflare

Guia detalhado para configurar DNS do inwista.com no Cloudflare.

---

## 🎯 Objetivo

Configurar os domínios para apontar para o servidor VPS:

- `inwista.com` → 161.97.96.29
- `www.inwista.com` → inwista.com (CNAME)
- `app.inwista.com` → 161.97.96.29

---

## 📝 Passo a Passo

### 1. Acessar o Cloudflare

1. Abra seu navegador
2. Acesse: https://dash.cloudflare.com
3. Faça login com seu e-mail e senha
4. Você verá uma lista dos seus domínios

### 2. Selecionar o Domínio

1. Clique em **inwista.com** na lista
2. Você será levado para o painel do domínio

### 3. Ir para Configuração DNS

1. No menu lateral esquerdo, clique em **DNS**
2. Clique na aba **Records** (Registros)
3. Você verá uma lista de registros DNS existentes

---

## ➕ Adicionar Registros DNS

### Registro 1: inwista.com (Root/Apex)

Este é o domínio principal sem "www".

**Passo a passo:**

1. Clique no botão **Add record**
2. Preencha os campos:

```
┌─────────────────────────────────────────┐
│ Type: [A]                    ▼          │
├─────────────────────────────────────────┤
│ Name: [@]  (ou deixe em branco)         │
├─────────────────────────────────────────┤
│ IPv4 address: [161.97.96.29]            │
├─────────────────────────────────────────┤
│ Proxy status:                           │
│   ⚪ Proxied  🟠 DNS only  ← selecione   │
├─────────────────────────────────────────┤
│ TTL: [Auto] ▼                           │
└─────────────────────────────────────────┘
```

3. Clique em **Save**

**Importante**:
- `@` significa o domínio raiz (inwista.com)
- **DNS only** (🟠 laranja desligado) é necessário para SSL funcionar

---

### Registro 2: www.inwista.com

Este é o domínio com "www".

**Passo a passo:**

1. Clique no botão **Add record** novamente
2. Preencha os campos:

```
┌─────────────────────────────────────────┐
│ Type: [CNAME]               ▼          │
├─────────────────────────────────────────┤
│ Name: [www]                             │
├─────────────────────────────────────────┤
│ Target: [inwista.com]                   │
├─────────────────────────────────────────┤
│ Proxy status:                           │
│   ⚪ Proxied  🟠 DNS only  ← selecione   │
├─────────────────────────────────────────┤
│ TTL: [Auto] ▼                           │
└─────────────────────────────────────────┘
```

3. Clique em **Save**

**Explicação**:
- CNAME cria um "alias" (apelido)
- `www.inwista.com` aponta para `inwista.com`
- Assim, ambos vão para o mesmo servidor

---

### Registro 3: app.inwista.com

Este é o subdomínio da aplicação web.

**Passo a passo:**

1. Clique no botão **Add record** novamente
2. Preencha os campos:

```
┌─────────────────────────────────────────┐
│ Type: [A]                    ▼          │
├─────────────────────────────────────────┤
│ Name: [app]                             │
├─────────────────────────────────────────┤
│ IPv4 address: [161.97.96.29]            │
├─────────────────────────────────────────┤
│ Proxy status:                           │
│   ⚪ Proxied  🟠 DNS only  ← selecione   │
├─────────────────────────────────────────┤
│ TTL: [Auto] ▼                           │
└─────────────────────────────────────────┘
```

3. Clique em **Save**

---

## ✅ Verificar Configuração

Após adicionar os 3 registros, sua lista deve estar assim:

```
┌──────┬──────────┬─────────────────┬────────────┐
│ Type │   Name   │     Content     │   Proxy    │
├──────┼──────────┼─────────────────┼────────────┤
│  A   │    @     │  161.97.96.29   │  DNS only  │
├──────┼──────────┼─────────────────┼────────────┤
│CNAME │   www    │   inwista.com   │  DNS only  │
├──────┼──────────┼─────────────────┼────────────┤
│  A   │   app    │  161.97.96.29   │  DNS only  │
└──────┴──────────┴─────────────────┴────────────┘
```

**Importante**:
- ✅ Todos devem ter **Proxy status: DNS only** (🟠 nuvem laranja)
- ✅ IPs devem ser **161.97.96.29**
- ✅ CNAME do www aponta para **inwista.com**

---

## ⏰ Tempo de Propagação

Após salvar os registros:

- **Mínimo**: 5-10 minutos
- **Normal**: 1-2 horas
- **Máximo**: até 24 horas (raro)

Durante a propagação, o DNS pode não funcionar ainda.

---

## 🧪 Testar DNS

### No Windows

Abra o **Prompt de Comando (CMD)** e teste:

```cmd
nslookup inwista.com
nslookup www.inwista.com
nslookup app.inwista.com
```

**Resultado esperado**:
```
Address: 161.97.96.29
```

### No Mac/Linux

Abra o **Terminal** e teste:

```bash
dig inwista.com +short
dig www.inwista.com +short
dig app.inwista.com +short
```

**Resultado esperado**:
```
161.97.96.29
```

### Online

Use ferramentas online:

- https://dnschecker.org/
  - Digite: `inwista.com`
  - Tipo: `A`
  - Deve mostrar: `161.97.96.29` globalmente

- https://www.whatsmydns.net/
  - Mesmo processo

---

## 🔧 Configurações Adicionais (Opcional)

### SSL/TLS Mode

**Recomendado**: Full (strict)

1. Vá em **SSL/TLS**
2. Selecione **Full (strict)**
3. Isso garante criptografia end-to-end

### Always Use HTTPS

**Recomendado**: Ativado

1. Vá em **SSL/TLS** > **Edge Certificates**
2. Ative **Always Use HTTPS**
3. HTTP será redirecionado automaticamente para HTTPS

### Automatic HTTPS Rewrites

**Recomendado**: Ativado

1. Ainda em **Edge Certificates**
2. Ative **Automatic HTTPS Rewrites**
3. Links HTTP no site virarão HTTPS

### HSTS

**Recomendado**: Ativado após SSL funcionar

1. Ainda em **Edge Certificates**
2. Clique em **Enable HSTS**
3. Configure:
   - Max Age Header: 12 months
   - Apply HSTS to subdomains: Yes
   - Preload: Yes

---

## ❓ Problemas Comuns

### DNS não resolve

**Causa**: Propagação ainda não completou

**Solução**: Aguarde mais tempo (até 24h)

### Erro "Too Many Redirects"

**Causa**: Proxy Cloudflare ativado com SSL/TLS no modo errado

**Solução**:
1. Vá em **SSL/TLS**
2. Mude para **Full (strict)**
3. OU desative o proxy (🟠 DNS only)

### Certificado SSL inválido

**Causa**: Proxy Cloudflare ativado antes do SSL do servidor

**Solução**:
1. Desative proxy (🟠 DNS only)
2. Configure SSL no servidor (script 3-setup-ssl.sh)
3. Depois pode reativar proxy se desejar

### www não funciona

**Causa**: CNAME apontando errado

**Solução**:
- Verifique se CNAME aponta para `inwista.com`
- Não deve ter ponto final: ❌ `inwista.com.`
- Deve ser: ✅ `inwista.com`

---

## 🎯 Proxy vs DNS Only

### DNS Only (🟠 Recomendado para SSL próprio)

**Vantagens**:
- ✅ SSL funciona direto no servidor
- ✅ Controle total sobre certificados
- ✅ Melhor para Let's Encrypt

**Desvantagens**:
- ❌ Sem cache do Cloudflare
- ❌ IP do servidor fica exposto

### Proxied (☁️ Nuvem laranja)

**Vantagens**:
- ✅ Cache do Cloudflare
- ✅ DDoS protection
- ✅ IP do servidor oculto

**Desvantagens**:
- ❌ Precisa configurar SSL diferente
- ❌ Pode dar loops de redirect
- ❌ Adiciona latência

**Recomendação**: Use **DNS Only** inicialmente. Após tudo funcionar, pode testar Proxied.

---

## 📞 Suporte Cloudflare

Se tiver problemas:

1. **Community**: https://community.cloudflare.com/
2. **Docs**: https://developers.cloudflare.com/dns/
3. **Status**: https://www.cloudflarestatus.com/

---

## ✅ Checklist

Antes de prosseguir com a instalação:

- [ ] Conta Cloudflare criada
- [ ] Domínio inwista.com adicionado no Cloudflare
- [ ] Registro A para @ (inwista.com) criado
- [ ] Registro CNAME para www criado
- [ ] Registro A para app criado
- [ ] Todos em modo "DNS only" (🟠)
- [ ] Testou com nslookup/dig
- [ ] DNS respondendo 161.97.96.29

---

**Pronto!** Agora pode prosseguir com a instalação do servidor.

Volte para: [GUIA_INSTALACAO_VPS.md](./GUIA_INSTALACAO_VPS.md)

---

**Última atualização**: 2025-11-07
