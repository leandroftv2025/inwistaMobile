# 🚀 inwistaMobile - Guia de Desenvolvimento Local

## 📋 Índice
- [Stack Tecnológico](#stack-tecnológico)
- [Pré-requisitos](#pré-requisitos)
- [Opção A: Sem Docker](#opção-a-sem-docker-desenvolvimento-direto)
- [Opção B: Com Docker](#opção-b-com-docker-recomendado)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Troubleshooting](#troubleshooting)

---

## 🛠️ Stack Tecnológico

| Componente | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | 22.21.0 | Runtime JavaScript |
| **TypeScript** | 5.6.3 | Type safety |
| **React** | 18.3.1 | Frontend framework |
| **Express** | 4.21.2 | Backend framework |
| **Vite** | 5.4.20 | Build tool e dev server |
| **Drizzle ORM** | 0.39.1 | Database ORM |
| **PostgreSQL** | 16 | Database (recomendado) |
| **Tailwind CSS** | 3.4.17 | CSS framework |

**Portas**:
- Frontend/Backend: `5000` (unified)
- PostgreSQL: `5432`
- Adminer (dev): `8081`

---

## 📦 Pré-requisitos

```bash
# Node.js 22+ (via NVM recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 22
nvm use 22

# PostgreSQL 16 (opcional, pode usar Docker)
sudo apt install postgresql-16

# Docker & Docker Compose (para opção B)
sudo apt install docker.io docker-compose-plugin
```

---

## 🏗️ Opção A: Sem Docker (Desenvolvimento Direto)

### 1. Clonar e Instalar

```bash
# Clonar repositório
git clone https://github.com/leandroftv2025/inwistaMobile.git
cd inwistaMobile

# Instalar dependências
npm ci --legacy-peer-deps
```

### 2. Configurar Banco de Dados (opcional)

```bash
# Criar banco PostgreSQL
sudo -u postgres createdb inwistamobile
sudo -u postgres createuser inwista -P  # Defina uma senha

# Criar .env
cp .env.example .env

# Editar .env com suas credenciais
nano .env
```

**.env mínimo**:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://inwista:sua_senha@localhost:5432/inwistamobile
SESSION_SECRET=your-secret-key-change-in-production
```

### 3. Executar Migrations (se usar PostgreSQL)

```bash
npm run db:push
```

### 4. Iniciar Desenvolvimento

```bash
# Modo desenvolvimento (hot reload)
npm run dev

# Acessar aplicação
open http://localhost:5000
```

### 5. Build e Produção

```bash
# Build
npm run build

# Verificar TypeScript
npm run check

# Iniciar produção
npm run start
```

---

## 🐳 Opção B: Com Docker (Recomendado)

### Vantagens
- ✅ Isolamento completo
- ✅ PostgreSQL incluído
- ✅ Adminer (interface DB)
- ✅ Volumes persistentes
- ✅ Fácil reset/cleanup

### 1. Clonar Repositório

```bash
git clone https://github.com/leandroftv2025/inwistaMobile.git
cd inwistaMobile
```

### 2. Configurar Ambiente

```bash
# Copiar .env
cp .env.example .env

# .env já está pré-configurado para Docker
# DATABASE_URL=postgresql://inwista:inwista_password@postgres:5432/inwistamobile
```

### 3. Iniciar Stack Completa

```bash
# Iniciar todos os serviços
docker compose up -d

# Com Adminer (interface de DB)
docker compose --profile dev up -d

# Ver logs
docker compose logs -f app
```

### 4. Acessar Serviços

- **App**: http://localhost:5000
- **Adminer**: http://localhost:8081 (se usar --profile dev)
  - Server: `postgres`
  - Username: `inwista`
  - Password: `inwista_password`
  - Database: `inwistamobile`

### 5. Comandos Úteis

```bash
# Ver status
docker compose ps

# Parar
docker compose down

# Rebuild
docker compose up -d --build

# Ver logs
docker compose logs -f

# Shell no container
docker compose exec app sh

# PostgreSQL CLI
docker compose exec postgres psql -U inwista -d inwistamobile

# Limpar TUDO (⚠️ apaga dados!)
docker compose down -v
```

---

## 🎯 Usando Makefile (Atalhos)

```bash
# Ver todos os comandos
make help

# Desenvolvimento sem Docker
make install          # Instalar dependências
make dev              # Iniciar dev server
make build            # Build produção
make clean            # Limpar arquivos

# Docker
make docker-up        # Iniciar stack
make docker-down      # Parar stack
make docker-logs      # Ver logs
make docker-rebuild   # Rebuild e reiniciar
make docker-clean     # Limpar tudo

# Health checks
make health           # Verificar /api/healthz
make health-ready     # Verificar /api/ready

# Utilitários
make lint             # TypeScript check
make audit            # Auditoria segurança
```

---

## 🔐 Variáveis de Ambiente

Ver `.env.example` para lista completa. Principais:

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `PORT` | Não | `5000` | Porta do servidor |
| `NODE_ENV` | Não | `development` | Ambiente |
| `DATABASE_URL` | **Sim*** | - | URL do PostgreSQL |
| `SESSION_SECRET` | **Sim** | - | Secret para sessions |

*Se não configurar `DATABASE_URL`, usa in-memory storage (apenas dev)

---

## 📝 Scripts Disponíveis

```bash
npm run dev         # Desenvolvimento (tsx + hot reload)
npm run build       # Build produção (Vite + esbuild)
npm run start       # Iniciar produção
npm run check       # TypeScript validation
npm run db:push     # Aplicar migrations Drizzle
```

---

## 🗄️ Database

### In-Memory (Padrão - Desenvolvimento)

Se não configurar `DATABASE_URL`, a aplicação usa storage em memória:

```typescript
// server/storage.ts
// Dados resetados a cada restart
// Usuário padrão: CPF 123.456.789-00, Senha: 123456
```

### PostgreSQL (Produção)

```bash
# Criar banco
sudo -u postgres createdb inwistamobile

# Configurar .env
DATABASE_URL=postgresql://inwista:senha@localhost:5432/inwistamobile

# Rodar migrations
npm run db:push
```

### Drizzle Studio (Futuro)

```bash
# Interface visual para DB
npx drizzle-kit studio
```

---

## 🧪 Testes

**Status**: ❌ Não implementado

**TODO**:
```bash
# Implementar testes
npm test                # Testes unitários (Jest/Vitest)
npm run test:e2e        # Testes E2E (Playwright)
npm run test:coverage   # Coverage
```

---

## 🚀 Deploy (Servidor Local 192.168.1.15)

### Pré-requisitos no Servidor

```bash
# No servidor Ubuntu 192.168.1.15
git clone https://github.com/leandroftv2025/inwistaMobile.git
cd inwistaMobile

# Executar provisionamento
sudo bash deploy/scripts/provision_local.sh

# Instalar EasyPanel (opcional)
sudo bash deploy/scripts/setup_easypanel.sh
```

### Deploy via PM2

```bash
# Build
npm ci --legacy-peer-deps
npm run build

# Iniciar PM2
pm2 start ecosystem.config.cjs --env production

# Salvar configuração
pm2 save
```

### Deploy via Docker

```bash
# Build e iniciar
docker compose -f docker-compose.prod.yml up -d --build

# Verificar
curl -k https://192.168.1.15/mobile/api/healthz
```

---

## 🔍 Troubleshooting

Ver `TROUBLESHOOTING.md` para guia completo.

### Problemas Comuns

**Port em uso (5000)**:
```bash
lsof -i :5000
kill -9 <PID>
```

**Build falha**:
```bash
rm -rf node_modules dist
npm ci --legacy-peer-deps
npm run build
```

**Database não conecta**:
```bash
# Testar conexão
psql $DATABASE_URL

# Verificar PostgreSQL
sudo systemctl status postgresql
```

**Health check falha**:
```bash
curl http://localhost:5000/api/healthz
curl http://localhost:5000/api/health
curl http://localhost:5000/api/ready
```

**Aviso de segurança HTTPS ("Sua conexão não é particular")**:
```bash
# 1. No servidor, exporte o certificado CA
sudo bash deploy/scripts/export_ssl_ca.sh

# 2. Em cada dispositivo, acesse pelo navegador:
# http://192.168.1.15/ssl-ca

# 3. Baixe e instale o certificado conforme instruções
```

📖 **Guia completo de SSL**: Veja [SSL-SETUP.md](./SSL-SETUP.md) para instruções detalhadas por plataforma.

---

## 📚 Documentação Adicional

- [SSL-SETUP.md](./SSL-SETUP.md) - **Configuração de certificados SSL/HTTPS**
- [SECURITY.md](./SECURITY.md) - Política de segurança
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Guia completo de troubleshooting
- [deploy/README.md](./deploy/README.md) - Guia de deploy
- [.env.example](./.env.example) - Variáveis de ambiente

---

## 🤝 Contribuindo

```bash
# Criar branch
git checkout -b feature/minha-feature

# Commit
git add .
git commit -m "feat: minha feature"

# Push
git push origin feature/minha-feature

# Abrir PR no GitHub
```

---

## 📞 Suporte

- **Issues**: https://github.com/leandroftv2025/inwistaMobile/issues
- **Email**: support@inwista.com
- **Docs**: https://inwista.com/docs

---

**Última atualização**: 2025-11-06
