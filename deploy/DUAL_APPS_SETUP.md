# 🚀 Setup Dual Apps - Inwista

Este guia mostra como configurar **inwistasite** e **inwistaMobile** no mesmo servidor.

## 📋 Arquitetura

```
Internet
    ↓
Nginx (porta 80)
    ├─→ 192.168.1.15 → inwistasite (porta 8080)
    └─→ mobile.192.168.1.15.nip.io → inwistaMobile (porta 5000)
```

## 🎯 O que será instalado

1. **inwistasite** (Site institucional)
   - Container Docker na porta 8080
   - Vite + React + TypeScript
   - Nginx Alpine servindo assets estáticos
   - Cor primária: #103549
   - Chat Botpress integrado

2. **inwistaMobile** (Aplicação web)
   - Container Docker na porta 5000
   - Node.js + Express + React
   - PostgreSQL para dados
   - API REST completa

3. **Nginx** (Reverse proxy)
   - Roteia tráfego baseado no hostname
   - Logs separados para cada app
   - Health checks configurados

## 🚀 Deploy Automático

### Pré-requisitos

- Ubuntu 20.04+ ou Debian 11+
- Docker e Docker Compose instalados
- Nginx instalado
- Node.js 20+ instalado
- Acesso root ao servidor

### Executar Setup

```bash
# 1. SSH no servidor
ssh user@192.168.1.15

# 2. Clonar repositório inwistaMobile (contém scripts)
cd /home/user
git clone https://github.com/leandroftv2025/inwistaMobile.git
cd inwistaMobile

# 3. Executar script de setup
sudo deploy/scripts/setup_dual_apps.sh
```

O script faz automaticamente:
- ✅ Clone dos repositórios (inwistasite + inwistaMobile)
- ✅ npm install e build de ambos
- ✅ Build das imagens Docker
- ✅ Deploy dos containers
- ✅ Configuração do Nginx
- ✅ Verificação de health checks

**Tempo estimado**: 5-10 minutos

---

## 🔧 Deploy Manual

### 1. Clonar Repositórios

```bash
cd /home/user

# inwistasite
git clone https://github.com/leandroftv2025/inwistasite.git

# inwistaMobile
git clone https://github.com/leandroftv2025/inwistaMobile.git
```

### 2. Deploy inwistasite

```bash
cd /home/user/inwistasite

# Install e build
npm ci
npm run build

# Docker build
docker build -t inwistasite:latest .

# Run container
docker run -d \
  --name inwistasite \
  --restart unless-stopped \
  -p 8080:8080 \
  inwistasite:latest

# Verificar
curl http://localhost:8080/healthz
```

### 3. Deploy inwistaMobile

```bash
cd /home/user/inwistaMobile

# Configurar .env
cp .env.example .env
nano .env  # Editar variáveis necessárias

# Install e build
npm ci
npm run build

# Docker build
docker build -t inwistamobile:latest .

# Run container
docker run -d \
  --name inwistamobile \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  inwistamobile:latest

# Verificar
curl http://localhost:5000/api/healthz
```

### 4. Configurar Nginx

```bash
# Copiar configuração
sudo cp /home/user/inwistaMobile/deploy/nginx/dual-apps.conf \
  /etc/nginx/sites-available/inwista-dual-apps

# Remover default
sudo rm /etc/nginx/sites-enabled/default

# Ativar site
sudo ln -s /etc/nginx/sites-available/inwista-dual-apps \
  /etc/nginx/sites-enabled/

# Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ Verificar Deploy

### Health Checks

```bash
# inwistasite
curl http://localhost:8080/healthz
curl http://192.168.1.15/

# inwistaMobile
curl http://localhost:5000/api/healthz
curl http://mobile.192.168.1.15.nip.io/
```

### Status dos Containers

```bash
docker ps

# Deve mostrar:
# inwistasite   -> 0.0.0.0:8080->8080/tcp
# inwistamobile -> 0.0.0.0:5000->5000/tcp
```

### Logs

```bash
# Ver logs dos containers
docker logs inwistasite -f
docker logs inwistamobile -f

# Ver logs do Nginx
sudo tail -f /var/log/nginx/inwistasite_access.log
sudo tail -f /var/log/nginx/inwistamobile_access.log
```

---

## 🧪 Testes Completos

### inwistasite (http://192.168.1.15/)

- [ ] Site carrega
- [ ] Cor azul escuro (#103549) visível
- [ ] Chat Botpress no canto inferior direito
- [ ] Menu "Plataforma" → seção "Por que Inwista?"
- [ ] Menu "Cartão Internacional" → seção do cartão
- [ ] Botões "Saiba Mais" abrem o chat
- [ ] Dark mode funciona
- [ ] Mobile responsivo

### inwistaMobile (http://mobile.192.168.1.15.nip.io/)

- [ ] Página de login carrega
- [ ] Pode criar conta
- [ ] Pode fazer login
- [ ] Dashboard mostra saldos
- [ ] Funcionalidades PIX funcionam
- [ ] StableCoin conversões funcionam
- [ ] Investimentos funcionam
- [ ] API responde corretamente

---

## 🔄 Atualizações Futuras

### Atualizar ambos os apps

```bash
cd /home/user/inwistaMobile
sudo deploy/scripts/setup_dual_apps.sh
```

### Atualizar apenas inwistasite

```bash
cd /home/user/inwistasite
git pull origin main
./deploy.sh
```

### Atualizar apenas inwistaMobile

```bash
cd /home/user/inwistaMobile
git pull origin main
npm run build
docker build -t inwistamobile:latest .
docker stop inwistamobile && docker rm inwistamobile
docker run -d --name inwistamobile --restart unless-stopped \
  -p 5000:5000 --env-file .env inwistamobile:latest
```

---

## 🚨 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker logs <container-name>

# Verificar portas em uso
sudo netstat -tlnp | grep -E '8080|5000'

# Reconstruir sem cache
docker build --no-cache -t <image-name> .
```

### Nginx não roteia corretamente

```bash
# Testar configuração
sudo nginx -t

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log

# Verificar se sites estão ativos
ls -la /etc/nginx/sites-enabled/
```

### Site não carrega

```bash
# Testar direto no container
curl http://localhost:8080/
curl http://localhost:5000/

# Testar via Nginx
curl -H "Host: 192.168.1.15" http://localhost/
curl -H "Host: mobile.192.168.1.15.nip.io" http://localhost/
```

### Botpress chat não aparece (inwistasite)

```bash
# Verificar se scripts estão no HTML
docker exec inwistasite cat /usr/share/nginx/html/index.html | grep botpress

# Limpar cache do navegador (Ctrl+Shift+R)
# Verificar Console do DevTools (F12) para erros
```

### Cor não mudou (inwistasite)

```bash
# Verificar CSS buildado
docker exec inwistasite cat /usr/share/nginx/html/assets/*.css | grep "200 65% 18"

# Se não encontrar, rebuild:
cd /home/user/inwistasite
npm run build
docker build --no-cache -t inwistasite:latest .
docker stop inwistasite && docker rm inwistasite
docker run -d --name inwistasite --restart unless-stopped -p 8080:8080 inwistasite:latest
```

---

## 🔐 Adicionar SSL (Opcional)

Para HTTPS com Let's Encrypt:

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificados (requer domínio válido)
sudo certbot --nginx -d inwista.com -d mobile.inwista.com

# Renovação automática já configurada
sudo certbot renew --dry-run
```

---

## 📊 Monitoramento

### Ver status em tempo real

```bash
# CPU/RAM dos containers
docker stats

# Logs em tempo real
docker logs -f inwistasite
docker logs -f inwistamobile

# Requests do Nginx
sudo tail -f /var/log/nginx/inwistasite_access.log
sudo tail -f /var/log/nginx/inwistamobile_access.log
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker logs <container> -f`
2. Verifique health checks: `curl http://localhost:PORT/healthz`
3. Reconstrua sem cache: `docker build --no-cache -t <image> .`
4. Consulte documentações:
   - `/home/user/inwistasite/DEPLOY.md`
   - `/home/user/inwistaMobile/README.md`
   - `/home/user/inwistaMobile/deploy/EASYPANEL.md`

---

**Última atualização**: 2025-11-07
