# ====================================
# INWISTAMOBILE - MULTI-STAGE DOCKERFILE
# ====================================
# Build otimizado para Node.js 22 + TypeScript + Vite + Express
# Imagem final: ~300MB (Alpine-based)

# ----------------------------------------
# STAGE 1: Base com dependências do sistema
# ----------------------------------------
FROM node:22.12-alpine AS base

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Definir diretório de trabalho
WORKDIR /app

# Configurar npm para cache eficiente
RUN npm config set fetch-retries 3 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 60000

# ----------------------------------------
# STAGE 2: Instalar dependências
# ----------------------------------------
FROM base AS deps

# Copiar apenas package files para aproveitar cache do Docker
COPY package.json package-lock.json ./

# Instalar dependências de produção + dev (para build)
RUN npm ci --legacy-peer-deps && \
    npm cache clean --force

# ----------------------------------------
# STAGE 3: Build da aplicação
# ----------------------------------------
FROM base AS builder

# Copiar dependências instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar código-fonte
COPY . .

# Criar arquivo .env de build (se necessário)
ENV NODE_ENV=production

# Build frontend (Vite) e backend (esbuild)
RUN npm run build && \
    # Verificar se o build foi bem-sucedido
    test -f dist/index.js && \
    test -d dist/public && \
    echo "✅ Build completed successfully"

# ----------------------------------------
# STAGE 4: Instalar apenas dependências de produção
# ----------------------------------------
FROM base AS prod-deps

COPY package.json package-lock.json ./

# Instalar APENAS dependências de produção (sem devDependencies)
RUN npm ci --omit=dev --legacy-peer-deps && \
    npm cache clean --force

# ----------------------------------------
# STAGE 5: Imagem final de produção
# ----------------------------------------
FROM node:22.12-alpine AS runner

# Instalar apenas runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar dependências de produção
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar build artifacts
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copiar arquivos de dados (catálogo de produtos)
COPY --from=builder --chown=nodejs:nodejs /app/catalog ./catalog

# Copiar package.json para versioning
COPY --chown=nodejs:nodejs package.json ./

# Configurar variáveis de ambiente
ENV NODE_ENV=production \
    PORT=5000 \
    # Otimizações do Node.js
    NODE_OPTIONS="--max-old-space-size=512 --enable-source-maps"

# Expor porta da aplicação
EXPOSE 5000

# Health check (usando a rota implementada)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/api/healthz || exit 1

# Trocar para usuário não-root
USER nodejs

# Usar dumb-init para lidar com sinais corretamente
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicialização
CMD ["node", "dist/index.js"]

# ----------------------------------------
# LABELS (metadata)
# ----------------------------------------
LABEL maintainer="InwistaMobile Team" \
      version="1.0.0" \
      description="InwistaMobile - Fintech Full-stack Application" \
      org.opencontainers.image.source="https://github.com/leandroftv2025/inwistaMobile"

# ----------------------------------------
# BUILD INSTRUCTIONS
# ----------------------------------------
# Development:
#   docker build --target builder -t inwistamobile:dev .
#
# Production:
#   docker build -t inwistamobile:latest .
#
# Com build args:
#   docker build --build-arg NODE_ENV=production -t inwistamobile:prod .
#
# Run:
#   docker run -p 5000:5000 --env-file .env inwistamobile:latest
