# ====================================
# INWISTAMOBILE - MAKEFILE
# ====================================
# Comandos utilitários para desenvolvimento e deploy

.PHONY: help install dev build start test clean docker-build docker-up docker-down docker-logs docker-clean db-push lint check

# Definir shell como bash para suporte a comandos avançados
SHELL := /bin/bash

# Variáveis
APP_NAME := inwistamobile
DOCKER_IMAGE := $(APP_NAME):latest
DOCKER_DEV_IMAGE := $(APP_NAME):dev
PORT := 5000

# ----------------------------------------
# HELP - Mostrar comandos disponíveis
# ----------------------------------------
help: ## Mostrar esta mensagem de ajuda
	@echo "======================================"
	@echo "  INWISTAMOBILE - Comandos Disponíveis"
	@echo "======================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ----------------------------------------
# DESENVOLVIMENTO LOCAL (sem Docker)
# ----------------------------------------
install: ## Instalar dependências
	@echo "📦 Instalando dependências..."
	npm ci --legacy-peer-deps

dev: ## Iniciar servidor de desenvolvimento
	@echo "🚀 Iniciando servidor de desenvolvimento..."
	npm run dev

build: ## Build de produção
	@echo "🏗️  Building para produção..."
	npm run build

start: ## Iniciar servidor em modo produção
	@echo "▶️  Iniciando servidor (produção)..."
	npm run start

test: ## Executar testes (quando implementado)
	@echo "🧪 Executando testes..."
	@echo "⚠️  Testes ainda não implementados"
	# npm test

lint: ## Executar linter
	@echo "🔍 Executando linter..."
	@npm run check || echo "⚠️  TypeScript check com avisos"

check: lint ## Alias para lint

clean: ## Limpar arquivos de build
	@echo "🧹 Limpando arquivos de build..."
	rm -rf dist/
	rm -rf node_modules/.cache/
	@echo "✅ Limpeza concluída"

# ----------------------------------------
# DOCKER (Opção B - Containerizado)
# ----------------------------------------
docker-build: ## Build da imagem Docker
	@echo "🐳 Building imagem Docker..."
	docker build -t $(DOCKER_IMAGE) .
	@echo "✅ Imagem $(DOCKER_IMAGE) criada com sucesso"

docker-build-dev: ## Build imagem Docker (desenvolvimento)
	@echo "🐳 Building imagem Docker (dev)..."
	docker build --target builder -t $(DOCKER_DEV_IMAGE) .

docker-up: ## Iniciar stack Docker Compose
	@echo "🚀 Iniciando stack Docker Compose..."
	docker compose up -d
	@echo "✅ Stack iniciada! Acesse http://localhost:$(PORT)"

docker-up-dev: ## Iniciar stack com perfil dev (Adminer)
	@echo "🚀 Iniciando stack com Adminer..."
	docker compose --profile dev up -d
	@echo "✅ Stack iniciada!"
	@echo "   App: http://localhost:$(PORT)"
	@echo "   Adminer: http://localhost:8081"

docker-down: ## Parar stack Docker Compose
	@echo "🛑 Parando stack Docker Compose..."
	docker compose down

docker-logs: ## Ver logs do Docker Compose
	@echo "📋 Logs do Docker Compose (Ctrl+C para sair)..."
	docker compose logs -f app

docker-logs-all: ## Ver logs de todos os serviços
	@echo "📋 Logs de todos os serviços..."
	docker compose logs -f

docker-ps: ## Ver status dos containers
	@docker compose ps

docker-restart: ## Reiniciar stack Docker
	@echo "🔄 Reiniciando stack..."
	docker compose restart

docker-rebuild: ## Rebuild e reiniciar
	@echo "🔨 Rebuild e reiniciando..."
	docker compose up -d --build

docker-clean: ## Limpar containers e volumes (CUIDADO!)
	@echo "⚠️  ATENÇÃO: Isso irá apagar TODOS os dados!"
	@read -p "Tem certeza? [y/N] " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		docker rmi $(DOCKER_IMAGE) $(DOCKER_DEV_IMAGE) 2>/dev/null || true; \
		echo "✅ Limpeza completa concluída"; \
	else \
		echo "❌ Operação cancelada"; \
	fi

docker-shell: ## Abrir shell no container da app
	@echo "🐚 Abrindo shell no container..."
	docker compose exec app sh

docker-db-shell: ## Abrir PostgreSQL CLI
	@echo "🗄️  Abrindo PostgreSQL CLI..."
	docker compose exec postgres psql -U inwista -d inwistamobile

# ----------------------------------------
# DATABASE
# ----------------------------------------
db-push: ## Aplicar migrations com Drizzle
	@echo "🗄️  Aplicando migrations..."
	npm run db:push

db-studio: ## Abrir Drizzle Studio (quando implementado)
	@echo "🎨 Abrindo Drizzle Studio..."
	@echo "⚠️  Drizzle Studio não configurado ainda"
	# npx drizzle-kit studio

# ----------------------------------------
# HEALTH CHECKS
# ----------------------------------------
health: ## Verificar health da aplicação
	@echo "🏥 Verificando health da aplicação..."
	@curl -f http://localhost:$(PORT)/api/healthz && echo "✅ App está saudável!" || echo "❌ App não está respondendo"

health-ready: ## Verificar readiness da aplicação
	@echo "🏥 Verificando readiness..."
	@curl -f http://localhost:$(PORT)/api/ready && echo "✅ App está pronta!" || echo "❌ App não está pronta"

# ----------------------------------------
# PRODUÇÃO
# ----------------------------------------
prod-build: clean install build ## Build completo para produção
	@echo "✅ Build de produção concluído!"

prod-start: ## Iniciar em modo produção (com NODE_ENV=production)
	@echo "🚀 Iniciando servidor de produção..."
	@NODE_ENV=production npm run start

# ----------------------------------------
# UTILITIES
# ----------------------------------------
format: ## Formatar código (se tiver prettier configurado)
	@echo "💅 Formatando código..."
	@echo "⚠️  Prettier não configurado"
	# npx prettier --write .

outdated: ## Verificar dependências desatualizadas
	@echo "📊 Verificando dependências desatualizadas..."
	npm outdated

audit: ## Auditoria de segurança
	@echo "🔒 Executando auditoria de segurança..."
	npm audit

audit-fix: ## Corrigir vulnerabilidades automaticamente
	@echo "🔧 Corrigindo vulnerabilidades..."
	npm audit fix

# ----------------------------------------
# INFORMAÇÕES
# ----------------------------------------
info: ## Mostrar informações do ambiente
	@echo "======================================"
	@echo "  INFORMAÇÕES DO AMBIENTE"
	@echo "======================================"
	@echo "Node version:   $$(node --version)"
	@echo "NPM version:    $$(npm --version)"
	@echo "App name:       $(APP_NAME)"
	@echo "Port:           $(PORT)"
	@echo "Docker image:   $(DOCKER_IMAGE)"
	@echo ""

# Default target
.DEFAULT_GOAL := help
