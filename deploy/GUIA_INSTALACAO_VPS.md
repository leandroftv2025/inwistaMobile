# 🚀 Guia Completo de Instalação - VPS Contabo

## 📋 Informações do Servidor

- **Servidor**: VPS Contabo
- **IP**: 161.97.96.29
- **Domínios**:
  - Site institucional: `www.inwista.com` e `inwista.com`
  - Aplicação web: `app.inwista.com`
- **DNS**: Cloudflare
- **SSL**: Let's Encrypt (gratuito e automático)

---

## 🎯 O que será instalado

Este guia irá configurar:

1. ✅ **Servidor VPS** totalmente configurado e seguro
2. ✅ **inwistasite** - Site institucional em www.inwista.com
3. ✅ **inwistaMobile** - Aplicação web em app.inwista.com
4. ✅ **HTTPS** automático com certificados SSL
5. ✅ **Cache e otimizações** para velocidade máxima
6. ✅ **Atualização simples** com 1 comando

**Tempo total**: 15-20 minutos

---

## 📝 Pré-requisitos

- [ ] Acesso root ao VPS Contabo (161.97.96.29)
- [ ] Conta no Cloudflare com o domínio inwista.com
- [ ] Cliente SSH (PuTTY no Windows ou Terminal no Mac/Linux)

---

## 🔧 Passo 1: Conectar ao Servidor

### No Windows (PuTTY)

1. Baixe o PuTTY: https://www.putty.org/
2. Abra o PuTTY
3. Em "Host Name": `161.97.96.29`
4. Em "Port": `22`
5. Clique em "Open"
6. Login: `root`
7. Senha: (fornecida pela Contabo)

### No Mac/Linux (Terminal)

```bash
ssh root@161.97.96.29
# Digite a senha quando solicitado
```

✅ **Você está conectado quando vê o prompt**: `root@servidor:~#`

---

## 🌐 Passo 2: Configurar DNS no Cloudflare

**MUITO IMPORTANTE**: Faça isso ANTES de instalar!

### 2.1. Acessar Cloudflare

1. Acesse: https://dash.cloudflare.com
2. Faça login na sua conta
3. Clique no domínio **inwista.com**
4. Vá em **DNS** > **Records**

### 2.2. Adicionar Registros DNS

Adicione os seguintes registros (clique em "Add record"):

#### Registro 1: inwista.com

- **Type**: `A`
- **Name**: `@` (ou deixe em branco)
- **IPv4 address**: `161.97.96.29`
- **Proxy status**: 🟠 **DNS only** (desligado)
- **TTL**: Auto
- Clique em **Save**

#### Registro 2: www.inwista.com

- **Type**: `CNAME`
- **Name**: `www`
- **Target**: `inwista.com`
- **Proxy status**: 🟠 **DNS only** (desligado)
- **TTL**: Auto
- Clique em **Save**

#### Registro 3: app.inwista.com

- **Type**: `A`
- **Name**: `app`
- **IPv4 address**: `161.97.96.29`
- **Proxy status**: 🟠 **DNS only** (desligado)
- **TTL**: Auto
- Clique em **Save**

### 2.3. Verificar Configuração

Seus registros DNS devem estar assim:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | 161.97.96.29 | DNS only |
| CNAME | www | inwista.com | DNS only |
| A | app | 161.97.96.29 | DNS only |

⏰ **Aguarde 5-10 minutos** para o DNS propagar.

### 2.4. Testar DNS (opcional)

No seu computador, abra o terminal e teste:

```bash
# Windows (CMD)
nslookup inwista.com
nslookup www.inwista.com
nslookup app.inwista.com

# Mac/Linux
dig inwista.com
dig www.inwista.com
dig app.inwista.com
```

Todos devem retornar **161.97.96.29**.

---

## 🛠️ Passo 3: Preparar o Servidor

**Conectado via SSH**, execute os comandos abaixo:

### 3.1. Baixar Scripts de Instalação

```bash
# Criar diretório temporário
mkdir -p /tmp/inwista-install
cd /tmp/inwista-install

# Baixar script de preparação
curl -O https://raw.githubusercontent.com/leandroftv2025/inwistaMobile/main/deploy/scripts/1-prepare-server.sh

# Dar permissão de execução
chmod +x 1-prepare-server.sh
```

### 3.2. Executar Preparação do Servidor

```bash
bash 1-prepare-server.sh
```

Este script irá:
- ✅ Atualizar o sistema operacional
- ✅ Instalar Docker, Node.js, Nginx
- ✅ Configurar firewall
- ✅ Configurar segurança (Fail2Ban)
- ✅ Criar estrutura de diretórios
- ✅ Otimizar o sistema

**Tempo estimado**: 5-7 minutos

⏸️ **O script irá pausar e pedir confirmação**. Pressione ENTER para continuar.

✅ **Quando ver**: "✅ SERVIDOR PREPARADO COM SUCESSO!" - prossiga para o próximo passo.

---

## 📦 Passo 4: Instalar as Aplicações

### 4.1. Baixar Script de Instalação

```bash
# Baixar script de instalação
curl -O https://raw.githubusercontent.com/leandroftv2025/inwistaMobile/main/deploy/scripts/2-install-apps.sh

# Dar permissão de execução
chmod +x 2-install-apps.sh
```

### 4.2. Executar Instalação

```bash
bash 2-install-apps.sh
```

Este script irá:
- ✅ Clonar os repositórios (inwistasite + inwistaMobile)
- ✅ Instalar dependências
- ✅ Compilar as aplicações
- ✅ Criar containers Docker
- ✅ Configurar Nginx
- ✅ **Obter certificados SSL automáticos**

**Tempo estimado**: 8-10 minutos

### 4.3. Durante a Instalação

O script irá fazer algumas perguntas:

#### Pergunta 1: DNS está configurado?

```
DNS está configurado? (s/N):
```

**Resposta**: Digite `s` e pressione ENTER
(Você configurou o DNS no Passo 2)

#### Pergunta 2: Configurar .env?

```
Deseja editar o .env agora? (s/N):
```

**Resposta**: Digite `n` e pressione ENTER
(Você pode configurar depois)

#### Pergunta 3: Obter SSL agora?

```
Deseja obter os certificados agora? (S/n):
```

**Resposta**: Digite `s` e pressione ENTER
(Vai configurar HTTPS automaticamente)

✅ **Quando ver**: "✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!" - Seus sites estão no ar!

---

## 🔒 Passo 5: Verificar SSL (se não configurou no Passo 4)

Se você pulou o SSL na instalação, configure agora:

```bash
# Baixar script SSL
curl -O https://raw.githubusercontent.com/leandroftv2025/inwistaMobile/main/deploy/scripts/3-setup-ssl.sh

# Dar permissão
chmod +x 3-setup-ssl.sh

# Executar
bash 3-setup-ssl.sh
```

Responda `S` para continuar.

✅ **Quando ver**: "✅ SSL CONFIGURADO COM SUCESSO!" - HTTPS ativo!

---

## ✅ Passo 6: Testar os Sites

### No navegador, acesse:

1. **Site institucional**: https://www.inwista.com
2. **Aplicação web**: https://app.inwista.com

### Verificações:

#### Site Institucional (www.inwista.com)

- [ ] Site carrega corretamente
- [ ] HTTPS ativo (cadeado verde no navegador)
- [ ] Cor azul escuro (#103549) visível
- [ ] Chat Botpress aparece no canto inferior direito
- [ ] Menu funciona corretamente
- [ ] Carrega rápido

#### Aplicação Web (app.inwista.com)

- [ ] Página de login carrega
- [ ] HTTPS ativo (cadeado verde)
- [ ] Design responsivo
- [ ] Funciona no mobile

---

## 🔄 Como Atualizar (MUITO SIMPLES!)

Sempre que houver atualizações no código:

### Método 1: Script Simples (Recomendado)

```bash
# Conectar via SSH
ssh root@161.97.96.29

# Executar atualização
bash /opt/inwista/scripts/atualizar-simples.sh
```

**Pronto!** Ambos os sites foram atualizados.

### Método 2: Manual (se preferir)

```bash
# Site institucional
cd /var/www/inwista/inwistasite
git pull origin main
npm ci && npm run build
docker build -t inwistasite:latest .
docker stop inwistasite && docker rm inwistasite
docker run -d --name inwistasite --restart unless-stopped -p 8080:8080 inwistasite:latest

# Aplicação web
cd /var/www/inwista/inwistaMobile
git pull origin main
npm ci && npm run build
docker build -t inwistamobile:latest .
docker stop inwistamobile && docker rm inwistamobile
docker run -d --name inwistamobile --restart unless-stopped -p 5000:5000 --env-file .env inwistamobile:latest
```

---

## 📊 Comandos Úteis

### Ver Status do Servidor

```bash
bash /opt/inwista/scripts/status.sh
```

Mostra:
- Uso de CPU, RAM, Disco
- Status dos containers
- Status do Nginx

### Ver Logs

```bash
# Logs do site institucional
docker logs -f inwistasite

# Logs da aplicação web
docker logs -f inwistamobile

# Logs do Nginx
tail -f /var/log/inwista/inwistasite_access.log
tail -f /var/log/inwista/inwistamobile_access.log
```

### Reiniciar Containers

```bash
# Site institucional
docker restart inwistasite

# Aplicação web
docker restart inwistamobile

# Ambos
docker restart inwistasite inwistamobile
```

### Criar Backup

```bash
bash /opt/inwista/scripts/backup.sh
```

Backups salvos em: `/opt/inwista/backups/`

### Verificar Certificados SSL

```bash
sudo certbot certificates
```

### Renovar SSL Manualmente

```bash
sudo certbot renew
```

(Renovação automática já está configurada)

---

## 🚨 Solução de Problemas

### Site não carrega

```bash
# Ver se containers estão rodando
docker ps

# Se não estiverem, iniciar
docker start inwistasite
docker start inwistamobile

# Ver logs para identificar erro
docker logs inwistasite
docker logs inwistamobile
```

### Erro de SSL

```bash
# Reconfigurar SSL
bash /opt/inwista/scripts/3-setup-ssl.sh
```

### DNS não resolve

- Aguarde mais tempo (pode levar até 24h)
- Verifique configuração no Cloudflare
- Teste com: `nslookup inwista.com`

### Container não inicia

```bash
# Ver erro detalhado
docker logs <nome-do-container>

# Reconstruir container
cd /var/www/inwista/<app>
docker build -t <app>:latest .
docker stop <app> && docker rm <app>
docker run -d --name <app> --restart unless-stopped -p <porta>:<porta> <app>:latest
```

### Site lento

```bash
# Limpar cache do Nginx
rm -rf /var/cache/nginx/inwista/*
systemctl reload nginx

# Verificar uso de recursos
htop
```

### Firewall bloqueando

```bash
# Ver regras do firewall
ufw status

# Abrir portas necessárias
ufw allow 80/tcp
ufw allow 443/tcp
```

---

## 🔐 Configurar .env (inwistaMobile)

Para configurar as variáveis de ambiente da aplicação web:

```bash
# Editar .env
nano /var/www/inwista/inwistaMobile/.env
```

Configurações importantes:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/inwista

# Session
SESSION_SECRET=<gerado-automaticamente>

# API Keys (se necessário)
# ...
```

Após editar:
- Pressione `Ctrl+X`
- Digite `Y`
- Pressione `ENTER`

Reinicie o container:

```bash
docker restart inwistamobile
```

---

## 📈 Otimizações Implementadas

✅ **Já configurado automaticamente**:

### Performance

- ✅ Gzip compression
- ✅ Cache de assets estáticos (1 ano)
- ✅ Cache de API (5 minutos)
- ✅ HTTP/2 ativado
- ✅ Keepalive connections
- ✅ Buffer otimizados

### Segurança

- ✅ HTTPS forçado (redirect HTTP → HTTPS)
- ✅ HSTS headers
- ✅ Security headers (XSS, MIME, etc)
- ✅ Rate limiting
- ✅ Firewall (UFW)
- ✅ Fail2Ban ativo
- ✅ SSL A+ rating

### Monitoramento

- ✅ Logs estruturados
- ✅ Health checks
- ✅ Auto-restart containers
- ✅ Backup automático disponível

---

## 🎯 Arquitetura Final

```
Internet
    ↓
Cloudflare DNS
    ↓
161.97.96.29 (VPS Contabo)
    ↓
Nginx (Reverse Proxy + Cache + SSL)
    ├─→ www.inwista.com → Docker:8080 (inwistasite)
    └─→ app.inwista.com → Docker:5000 (inwistaMobile)
```

---

## 📁 Estrutura de Arquivos

```
/var/www/inwista/
├── inwistasite/          # Site institucional
│   ├── src/
│   ├── dist/             # Build compilado
│   ├── Dockerfile
│   └── ...
└── inwistaMobile/        # Aplicação web
    ├── client/
    ├── server/
    ├── dist/             # Build compilado
    ├── .env              # Variáveis de ambiente
    ├── Dockerfile
    └── ...

/opt/inwista/
├── scripts/
│   ├── status.sh         # Ver status
│   ├── atualizar.sh      # Atualizar apps
│   └── backup.sh         # Criar backup
└── backups/              # Backups salvos aqui

/var/log/inwista/
├── inwistasite_access.log
├── inwistasite_error.log
├── inwistamobile_access.log
└── inwistamobile_error.log
```

---

## 💡 Dicas para Leigos

### Como atualizar os sites?

```bash
# 1. Conectar ao servidor
ssh root@161.97.96.29

# 2. Rodar comando de atualização
bash /opt/inwista/scripts/atualizar-simples.sh

# 3. Pronto!
```

### Como ver se está tudo funcionando?

```bash
# Ver status
bash /opt/inwista/scripts/status.sh
```

### Como fazer backup?

```bash
# Criar backup
bash /opt/inwista/scripts/backup.sh

# Backups ficam em: /opt/inwista/backups/
```

### Esqueci onde ficam os comandos!

Todos os comandos úteis estão neste arquivo:

```bash
# No servidor
cat /var/www/inwista/inwistaMobile/deploy/GUIA_INSTALACAO_VPS.md
```

---

## 🆘 Suporte

### Logs para debugar

```bash
# Ver últimas 50 linhas do log
docker logs inwistasite --tail 50
docker logs inwistamobile --tail 50

# Ver logs em tempo real
docker logs -f inwistasite
docker logs -f inwistamobile
```

### Referenciar

- SSL: https://letsencrypt.org/docs/
- Docker: https://docs.docker.com/
- Nginx: https://nginx.org/en/docs/
- Cloudflare: https://support.cloudflare.com/

---

## ✅ Checklist Final

- [ ] DNS configurado no Cloudflare
- [ ] Servidor preparado (Script 1)
- [ ] Aplicações instaladas (Script 2)
- [ ] SSL configurado (HTTPS funcionando)
- [ ] www.inwista.com carregando
- [ ] app.inwista.com carregando
- [ ] Certificados renovam automaticamente
- [ ] Sei como atualizar (`atualizar-simples.sh`)
- [ ] Sei como ver status (`status.sh`)
- [ ] Sei como fazer backup (`backup.sh`)

---

## 🎉 Parabéns!

Seus sites estão no ar com:

- ✅ HTTPS seguro
- ✅ Performance otimizada
- ✅ Cache configurado
- ✅ Atualização simples
- ✅ Backup disponível
- ✅ Monitoramento ativo

**Aproveite suas aplicações Inwista!** 🚀

---

**Última atualização**: 2025-11-07
**Versão**: 1.0
