# Troubleshooting Guide - inwistaMobile

## 🔧 Common Issues and Solutions

### 1. Build Failures

#### Error: `Cannot find module '@shared/schema'`

**Causa**: TypeScript paths não configurados corretamente

**Solução**:
```bash
# Verificar tsconfig.json
cat tsconfig.json | grep -A 5 "paths"

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

#### Error: `ESBUILD failed`

**Causa**: Versão incompatível do Node.js

**Solução**:
```bash
# Verificar versão do Node (deve ser 22+)
node --version

# Instalar versão correta via NVM
nvm install 22
nvm use 22
nvm alias default 22
```

---

### 2. Database Issues

#### Error: `connection to server failed`

**Causa**: PostgreSQL não está rodando ou DATABASE_URL incorreta

**Solução**:
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
sudo systemctl start postgresql

# Testar conexão
psql -h localhost -U inwista -d inwistamobile

# Verificar .env
cat .env | grep DATABASE_URL

# Formato correto:
# DATABASE_URL=postgresql://user:password@host:5432/database
```

#### Storage usando in-memory (desenvolvimento)

**Causa**: DATABASE_URL não configurada

**Solução**:
```bash
# Configurar banco de dados
sudo -u postgres createdb inwistamobile
sudo -u postgres createuser inwista -P

# Atualizar .env
echo "DATABASE_URL=postgresql://inwista:senha@localhost:5432/inwistamobile" >> .env

# Rodar migrations
npm run db:push
```

---

### 3. Port Conflicts

#### Error: `EADDRINUSE: address already in use :::5000`

**Causa**: Porta 5000 já está em uso

**Solução**:
```bash
# Encontrar processo usando porta 5000
lsof -i :5000
# ou
netstat -tulpn | grep 5000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=5001 npm run dev
```

---

### 4. Docker Issues

#### Error: `Cannot connect to the Docker daemon`

**Causa**: Docker não está rodando

**Solução**:
```bash
# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

#### Container keeps restarting

**Causa**: Erro na aplicação ou health check falhando

**Solução**:
```bash
# Ver logs
docker compose logs -f app

# Verificar health check
docker inspect inwistamobile-app | grep -A 10 Health

# Desabilitar temporariamente health check
# Comentar healthcheck no docker-compose.yml
```

---

### 5. Nginx Issues

#### Error: `nginx: [emerg] cannot load certificate`

**Causa**: Certificados SSL não encontrados

**Solução**:
```bash
# Gerar certificados com mkcert
sudo apt install mkcert
mkcert -install
mkcert 192.168.1.15 localhost

# Mover certificados
sudo mkdir -p /etc/nginx/ssl
sudo mv *.pem /etc/nginx/ssl/

# Ajustar permissões
sudo chmod 600 /etc/nginx/ssl/*.pem

# Testar configuração
sudo nginx -t
```

#### Error: `502 Bad Gateway`

**Causa**: Backend não está rodando ou porta incorreta

**Solução**:
```bash
# Verificar se app está rodando
curl http://localhost:5000/api/healthz

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar upstream no Nginx
sudo nginx -T | grep upstream
```

---

### 6. Permission Issues

#### Error: `EACCES: permission denied`

**Causa**: Permissões de arquivo incorretas

**Solução**:
```bash
# Ajustar ownership
sudo chown -R $USER:$USER .

# Ajustar permissões
chmod 755 deploy/scripts/*.sh
chmod 644 .env
```

---

### 7. NPM Issues

#### Error: `ERESOLVE unable to resolve dependency tree`

**Causa**: Conflitos de dependências

**Solução**:
```bash
# Usar --legacy-peer-deps
npm install --legacy-peer-deps

# Ou limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

### 8. PM2 Issues

#### App não inicia com PM2

**Causa**: Arquivo dist/ não existe ou .env não carregada

**Solução**:
```bash
# Build primeiro
npm run build

# Verificar se dist/ existe
ls -la dist/

# Iniciar PM2
pm2 start ecosystem.config.cjs

# Ver logs
pm2 logs inwistamobile
```

---

### 9. Health Check Failures

#### Health check returns 503

**Causa**: Storage não inicializado ou database offline

**Solução**:
```bash
# Verificar logs
pm2 logs inwistamobile

# Testar health endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/healthz
curl http://localhost:5000/api/ready

# Verificar DATABASE_URL
echo $DATABASE_URL
```

---

### 10. Memory Issues

#### Error: `JavaScript heap out of memory`

**Causa**: Node.js sem memória suficiente

**Solução**:
```bash
# Aumentar heap size
export NODE_OPTIONS="--max-old-space-size=4096"

# Ou no PM2 ecosystem.config.cjs
interpreter_args: '--max-old-space-size=4096'

# Ou no Docker
ENV NODE_OPTIONS="--max-old-space-size=2048"
```

---

## 🔍 Debugging Tools

### Check Application Status

```bash
# PM2
pm2 status
pm2 monit
pm2 info inwistamobile

# Docker
docker compose ps
docker stats
docker compose logs -f

# Systemd (se configurado)
sudo systemctl status inwistamobile
sudo journalctl -u inwistamobile -f
```

### Network Debugging

```bash
# Testar portas
netstat -tulpn | grep -E '(5000|8080|80|443)'

# Testar conectividade
curl -v http://localhost:5000/api/healthz
curl -k -v https://192.168.1.15/api/healthz

# DNS local (nip.io)
curl -k https://mobile.192.168.1.15.nip.io/api/healthz
```

### Log Analysis

```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs inwistamobile --lines 100

# Docker logs
docker compose logs -f --tail=100

# System logs
sudo journalctl -xe
```

---

## 📞 Getting Help

1. Check logs first (PM2, Docker, Nginx)
2. Search this troubleshooting guide
3. Check GitHub Issues
4. Contact support: support@inwista.com

---

## 🆘 Emergency Recovery

### Complete Reset

```bash
# CUIDADO: Isso apaga TUDO!

# Parar todos os serviços
pm2 delete all
docker compose down -v

# Limpar arquivos
rm -rf node_modules dist

# Reinstalar
npm ci --legacy-peer-deps
npm run build

# Reiniciar
pm2 start ecosystem.config.cjs
# ou
docker compose up -d --build
```

### Rollback to Previous Version

```bash
# Ver commits recentes
git log --oneline -10

# Rollback para commit anterior
git checkout <commit-hash>
npm ci --legacy-peer-deps
npm run build
pm2 restart inwistamobile
```

---

Last updated: 2025-11-06
