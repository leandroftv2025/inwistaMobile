# 🎯 Relatório de Melhorias - inwistaMobile

## 📊 Resumo Executivo

Este documento lista melhorias priorizadas (P0/P1/P2) para **segurança, performance, observabilidade, confiabilidade e DX** do inwistaMobile, **SEM alterar layout/design/estética**.

---

## 🔴 P0 - CRÍTICAS (Implementar Imediatamente)

### 1. Segurança - Password Hashing

**Status Atual**: ❌ Senhas em texto puro no database

**Impacto**:
- **Risco CRÍTICO**: Vazamento de banco expõe todas as senhas
- **Compliance**: Viola LGPD/GDPR

**Solução**:
```typescript
// server/routes.ts
import bcrypt from 'bcrypt';

// No registro
const hashedPassword = await bcrypt.hash(password, 10);
await storage.createUser({ ...data, password: hashedPassword });

// No login
const match = await bcrypt.compare(password, user.password);
```

**Esforço**: 2 horas
**Dependência**: `npm install bcrypt @types/bcrypt`

---

### 2. Segurança - Rate Limiting

**Status Atual**: ❌ Sem limitação de requisições

**Impacto**:
- Ataques de brute force em `/api/auth/login`
- DoS simples

**Solução**:
```typescript
// server/index.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Muitas requisições, tente novamente mais tarde'
});

app.use('/api/', limiter);

// Rate limit mais restritivo para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentativas de login por 15min
  skipSuccessfulRequests: true
});

app.use('/api/auth/login', authLimiter);
```

**Esforço**: 1 hora
**Dependência**: `npm install express-rate-limit`

---

### 3. Segurança - Input Validation

**Status Atual**: ⚠️ Validação parcial (Zod em alguns endpoints)

**Impacto**:
- SQL injection potencial
- XSS attacks
- Data corruption

**Solução**:
```typescript
// Aplicar Zod em TODOS os endpoints
// Já existe em: login, register, pix, stablecoin
// Falta em: user-by-cpf, validate-keypad

// Adicionar sanitização
import validator from 'validator';

const sanitizeCPF = (cpf: string) => validator.escape(cpf.replace(/\D/g, ''));
```

**Esforço**: 3 horas
**Dependência**: `npm install validator`

---

### 4. Segurança - CSRF Protection

**Status Atual**: ❌ Sem proteção CSRF

**Impacto**:
- Ataques cross-site request forgery
- Transações não autorizadas

**Solução**:
```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// No frontend, incluir token em requests
// axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
```

**Esforço**: 2 horas
**Dependência**: `npm install csurf cookie-parser`

---

## 🟡 P1 - ALTAS (Implementar em 1-2 sprints)

### 5. Performance - Database Connection Pooling

**Status Atual**: ⚠️ Usando in-memory storage (sem pooling)

**Impacto**:
- Muitas conexões simultâneas ao PostgreSQL
- Timeouts em alta carga

**Solução**:
```typescript
// drizzle.config.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool);
```

**Esforço**: 2 horas

---

### 6. Performance - HTTP Caching Headers

**Status Atual**: ❌ Sem cache headers

**Impacto**:
- Assets re-baixados em toda requisição
- Banda desperdiçada
- App mais lenta

**Solução** (Nginx):
```nginx
# Já implementado em deploy/nginx/local-inwistamobile.conf
location ~* \.(js|css|png|jpg|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Solução** (Express):
```typescript
import compression from 'compression';
app.use(compression());

// Cache stático
app.use(express.static('dist/public', {
  maxAge: '1y',
  immutable: true
}));
```

**Esforço**: 1 hora
**Dependência**: `npm install compression`

---

### 7. Observabilidade - Structured Logging

**Status Atual**: ❌ `console.log()` simples

**Impacto**:
- Logs difíceis de parsear
- Sem correlation IDs
- Sem níveis de log

**Solução**:
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Uso
logger.info({ userId, action: 'login' }, 'User logged in');
logger.error({ err, userId }, 'Login failed');
```

**Esforço**: 3 horas
**Dependência**: `npm install pino pino-pretty`

---

### 8. Observabilidade - Request Tracing

**Status Atual**: ❌ Sem correlation entre requests

**Impacto**:
- Difícil debugar issues em produção
- Sem rastreamento de requisições

**Solução**:
```typescript
import { v4 as uuidv4 } from 'uuid';

app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// No log
logger.info({ requestId: req.id }, 'Processing request');
```

**Esforço**: 2 horas
**Dependência**: `npm install uuid`

---

### 9. Confiabilidade - Error Handling Middleware

**Status Atual**: ⚠️ Try-catch em cada endpoint (inconsistente)

**Impacto**:
- Stack traces vazam em produção
- Sem tratamento centralizado

**Solução**:
```typescript
// server/middleware/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  logger.error({ err, requestId: req.id }, 'Unhandled error');

  if (process.env.NODE_ENV === 'production') {
    // Não vazar stack trace
    res.status(err.status || 500).json({
      error: 'Internal server error',
      requestId: req.id
    });
  } else {
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack
    });
  }
};

app.use(errorHandler);
```

**Esforço**: 2 horas

---

### 10. DX - Environment Validation

**Status Atual**: ⚠️ Sem validação de .env no startup

**Impacto**:
- App inicia com config inválida
- Erros só aparecem em runtime

**Solução**:
```typescript
// server/config.ts
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
});

export const config = envSchema.parse(process.env);
```

**Esforço**: 1 hora

---

## 🟢 P2 - MÉDIAS (Implementar quando possível)

### 11. Performance - Database Query Optimization

**Impacto**: Queries N+1, sem índices

**Solução**:
- Adicionar índices: `cpf`, `email`, `userId` (foreign keys)
- Usar Drizzle's eager loading
- Implementar query caching (Redis)

**Esforço**: 4 horas

---

### 12. Performance - Image Optimization

**Impacto**: Assets grandes (hero-banner.png = 2.28MB)

**Solução**:
```bash
# Comprimir imagens
npm install sharp
# Converter para WebP
# Lazy loading no frontend
```

**Esforço**: 2 horas

---

### 13. Observabilidade - APM Integration

**Impacto**: Sem métricas de performance

**Solução**: Integrar Sentry, DataDog ou New Relic

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Esforço**: 3 horas
**Custo**: Variável (Sentry free tier: 5k eventos/mês)

---

### 14. Confiabilidade - Circuit Breaker

**Impacto**: Sem proteção contra serviços externos falhando

**Solução**:
```typescript
import CircuitBreaker from 'opossum';

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const breaker = new CircuitBreaker(externalAPICall, options);
```

**Esforço**: 3 horas

---

### 15. DX - Git Hooks (Husky + Lint-Staged)

**Impacto**: Commits com erros de lint/tipos

**Solução**:
```bash
npm install -D husky lint-staged

# .husky/pre-commit
npx lint-staged

# package.json
"lint-staged": {
  "*.{ts,tsx}": ["npm run check", "git add"]
}
```

**Esforço**: 1 hora

---

### 16. DX - API Documentation (Swagger)

**Impacto**: Sem documentação da API

**Solução**:
```typescript
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

**Esforço**: 4 horas

---

## 📈 Estimativa Total

| Prioridade | Itens | Esforço | Impacto |
|------------|-------|---------|---------|
| **P0** | 4 | 8 horas | 🔴 CRÍTICO |
| **P1** | 6 | 14 horas | 🟡 ALTO |
| **P2** | 6 | 17 horas | 🟢 MÉDIO |
| **TOTAL** | **16** | **39 horas** | - |

---

## 🎯 Roadmap Sugerido

### Sprint 1 (1 semana) - P0
- [ ] Password hashing (bcrypt)
- [ ] Rate limiting
- [ ] Input validation completa
- [ ] CSRF protection

### Sprint 2 (1 semana) - P1 (parte 1)
- [ ] Database pooling
- [ ] HTTP caching
- [ ] Structured logging

### Sprint 3 (1 semana) - P1 (parte 2)
- [ ] Request tracing
- [ ] Error handling middleware
- [ ] Environment validation

### Sprint 4+ - P2
- [ ] Query optimization
- [ ] Image optimization
- [ ] APM integration
- [ ] Circuit breaker
- [ ] Git hooks
- [ ] API docs

---

## ✅ Benefícios Esperados

### Segurança
- ✅ Conformidade LGPD/GDPR
- ✅ Proteção contra top 10 OWASP
- ✅ Auditoria aprovada

### Performance
- ✅ 50% redução no tempo de carregamento
- ✅ 70% redução de bandwidth
- ✅ Suporte a 10x mais usuários simultâneos

### Observabilidade
- ✅ Debugging 5x mais rápido
- ✅ Detecção proativa de problemas
- ✅ SLA tracking

### Confiabilidade
- ✅ Uptime 99.9%
- ✅ Graceful degradation
- ✅ Auto-recovery

### DX
- ✅ Onboarding 2x mais rápido
- ✅ Menos bugs em produção
- ✅ Documentação completa

---

**Última atualização**: 2025-11-06
