# 📘 Guia de Deploy com EasyPanel

## 🎯 O que é EasyPanel?

EasyPanel é uma plataforma de orquestração de containers moderna e simples, alternativa ao Portainer/cPanel, com:
- Interface web intuitiva
- Deploy automático de Git
- Gerenciamento de containers Docker
- Configuração de domínios e SSL
- Monitoramento e logs
- Backups automáticos

**Site oficial**: https://easypanel.io

---

## 🛠️ 1. Instalação do EasyPanel

### No Servidor Ubuntu (192.168.1.15)

```bash
# Método 1: Script automático (recomendado)
sudo bash deploy/scripts/setup_easypanel.sh

# Método 2: Instalação manual
curl -sSL https://get.easypanel.io | sh

# Aguardar instalação (2-5 minutos)
```

### Acessar Interface Web

```
http://192.168.1.15:3000
```

Crie sua conta de administrador no primeiro acesso.

---

## 📦 2. Criar Projeto: inwistaMobile

### 2.1 Criar Novo Projeto

1. No dashboard do EasyPanel, clique em **"New Project"**
2. Nome: `inwistamobile`
3. Tipo: **Docker**

### 2.2 Configurar Source

- **Source Type**: GitHub
- **Repository**: `https://github.com/leandroftv2025/inwistaMobile.git`
- **Branch**: `main` (ou `develop`)
- **Auto Deploy**: ✅ Enabled (deploy automático em push)

### 2.3 Configurar Build

- **Dockerfile**: `Dockerfile` (na raiz)
- **Build Context**: `.` (raiz do repo)
- **Build Args**: (deixar vazio)

### 2.4 Configurar Runtime

**Porta Interna**: `5000`

**Environment Variables**:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://inwista:senha_segura@postgres:5432/inwistamobile
SESSION_SECRET=<gerar-com-openssl-rand-base64-32>
LOG_LEVEL=info
```

**Recursos**:
- **CPU**: 1 core (ajustar conforme necessário)
- **Memory**: 512MB (mínimo), 1GB (recomendado)

### 2.5 Configurar Health Check

- **Path**: `/api/healthz`
- **Interval**: 30s
- **Timeout**: 5s
- **Retries**: 3

### 2.6 Persistência de Dados

Se usar PostgreSQL externo:
- **Volumes**: Nenhum necessário (app stateless)

Se usar PostgreSQL no EasyPanel:
- Criar serviço PostgreSQL separado (ver abaixo)

---

## 📦 3. Criar Projeto: inwistasite

### 3.1 Criar Novo Projeto

1. **New Project**
2. Nome: `inwistasite`
3. Tipo: **Docker**

### 3.2 Configurar Source

- **Repository**: `https://github.com/leandroftv2025/inwistasite.git`
- **Branch**: `main`
- **Auto Deploy**: ✅ Enabled

### 3.3 Configurar Build

- **Dockerfile**: `Dockerfile`
- **Build Context**: `.`

### 3.4 Configurar Runtime

**Porta Interna**: `8080`

**Environment Variables**:
```env
NODE_ENV=production
VITE_SITE_URL=https://inwista.com
```

**Recursos**:
- **CPU**: 0.5 core
- **Memory**: 256MB

### 3.5 Health Check

- **Path**: `/healthz`
- **Interval**: 30s
- **Timeout**: 3s

---

## 🗄️ 4. Adicionar PostgreSQL (Opcional)

### Se quiser PostgreSQL gerenciado pelo EasyPanel

1. **New Service** → **Database** → **PostgreSQL**
2. Nome: `inwista-postgres`
3. Versão: `16-alpine`
4. **Configuração**:
   ```
   Database: inwistamobile
   User: inwista
   Password: <senha-forte>
   ```

5. **Persistence**:
   - Volume: `/var/lib/postgresql/data`
   - Size: 10GB

6. **Conectar ao inwistaMobile**:
   - Atualizar variável `DATABASE_URL` no projeto inwistaMobile:
   ```
   DATABASE_URL=postgresql://inwista:senha@inwista-postgres:5432/inwistamobile
   ```

---

## 🌐 5. Configurar Domínios e Portas

### Opção A: Portas Internas (Nginx como Proxy)

**EasyPanel apenas gerencia os containers:**
- `inwistaMobile`: porta interna `5000`
- `inwistasite`: porta interna `8080`

**Nginx faz o proxy reverso:**
- `https://192.168.1.15/` → `inwistasite:8080`
- `https://mobile.192.168.1.15.nip.io/` → `inwistaMobile:5000`

### Opção B: Domínios no EasyPanel

Se quiser que EasyPanel gerencie SSL também:

1. **inwistaMobile**:
   - Domain: `mobile.192.168.1.15.nip.io`
   - SSL: Manual (copiar cert mkcert) ou Disable (usar Nginx)

2. **inwistasite**:
   - Domain: `192.168.1.15` ou `inwista.local`
   - SSL: Manual ou Disable

---

## 📊 6. Monitoramento e Logs

### Ver Logs em Tempo Real

1. No dashboard, clique no projeto
2. Tab **"Logs"**
3. Filtrar por severity (info/error/debug)

### Métricas

1. Tab **"Metrics"**
2. Ver CPU, RAM, Network
3. Configurar alertas (opcional)

### Health Status

- Ícone verde: ✅ Healthy
- Ícone amarelo: ⚠️ Unhealthy (restarting)
- Ícone vermelho: ❌ Failed

---

## 🔄 7. Deploy e Atualizações

### Deploy Manual

1. No projeto, clique **"Deploy"**
2. Selecione branch/commit
3. Confirme

### Deploy Automático (CI/CD)

Com **Auto Deploy** habilitado:
- Faz `git push` para o GitHub
- EasyPanel detecta push
- Build automático
- Deploy com zero-downtime

### Rollback

1. Tab **"Deployments"**
2. Ver histórico de deploys
3. Clique em deploy anterior
4. **"Rollback to this version"**

---

## 🔐 8. Secrets Management

### Gerenciar Secrets

1. Projeto → **"Environment"**
2. Adicionar variáveis sensíveis
3. **"Secret"** checkbox: ✅ (oculta valor na UI)

**Secrets importantes**:
- `DATABASE_URL`
- `SESSION_SECRET`
- `API_KEYS` (futuras integrações)

### Rotação de Secrets

1. Atualizar variável no EasyPanel
2. Restart container (automático)

---

## 🚨 9. Troubleshooting

### Container não inicia

**Ver logs**:
1. Projeto → Logs
2. Verificar erros de build ou runtime

**Causas comuns**:
- Dockerfile inválido
- Porta incorreta
- Variáveis de ambiente faltando

### Build falha

**Verificar**:
- `Dockerfile` existe na raiz
- Dependências no `package.json`
- Build local funciona: `docker build -t test .`

### Health check falhando

**Testar localmente**:
```bash
docker run -p 5000:5000 --env-file .env inwistamobile:latest
curl http://localhost:5000/api/healthz
```

### Out of Memory

**Aumentar limite**:
- Projeto → Settings → Resources
- Memory: 1GB → 2GB

---

## 📋 10. Checklist de Deploy

- [ ] EasyPanel instalado e acessível
- [ ] Projeto `inwistamobile` criado
- [ ] Projeto `inwistasite` criado
- [ ] Variáveis de ambiente configuradas
- [ ] Health checks funcionando
- [ ] PostgreSQL configurado (se externo)
- [ ] Auto-deploy habilitado
- [ ] Logs verificados
- [ ] Nginx configurado como reverse proxy
- [ ] Certificados SSL configurados (mkcert)
- [ ] Firewall (UFW) configurado
- [ ] Testes de conectividade:
  - [ ] `curl -k https://192.168.1.15/healthz`
  - [ ] `curl -k https://mobile.192.168.1.15.nip.io/api/healthz`

---

## 📞 Suporte

- **Docs EasyPanel**: https://easypanel.io/docs
- **Community**: https://github.com/easypanel-io/easypanel
- **Discord**: https://discord.gg/easypanel

---

**Última atualização**: 2025-11-06
