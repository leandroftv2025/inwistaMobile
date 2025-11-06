# Security Policy - inwistaMobile

## 🔒 Reporting Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Instead, please report security issues to: **security@inwista.com** (ou criar canal privado)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## 🛡️ Security Measures Implemented

### Authentication & Authorization
- [x] Password validation (currently basic - **NEEDS IMPROVEMENT**)
- [x] 2FA verification (8-digit code)
- [ ] **TODO**: Implement bcrypt password hashing
- [ ] **TODO**: Implement JWT tokens
- [ ] **TODO**: Implement rate limiting on auth endpoints
- [ ] **TODO**: Add CSRF protection

### Data Protection
- [x] Environment variables for sensitive data
- [x] `.env` files gitignored
- [ ] **TODO**: Encrypt sensitive data at rest
- [ ] **TODO**: Implement proper session management
- [ ] **TODO**: Add database connection pooling with secrets rotation

### Network Security
- [x] HTTPS/TLS support via Nginx
- [x] Security headers configured in Nginx
- [ ] **TODO**: Implement CORS policies
- [ ] **TODO**: Add rate limiting (nginx or express-rate-limit)
- [ ] **TODO**: Implement request validation middleware

### Infrastructure
- [x] Docker container isolation
- [x] Non-root user in Docker
- [x] UFW firewall configuration
- [x] Fail2ban for brute force protection
- [x] Health checks for monitoring
- [ ] **TODO**: Implement secrets management (Vault/Docker Secrets)
- [ ] **TODO**: Add monitoring and alerting

## ⚠️ Known Security Issues (MVP)

### CRITICAL (P0)
1. **Passwords stored in plaintext**
   - Impact: High
   - Current: Stored as-is in database
   - Fix: Implement bcrypt hashing

2. **No CSRF protection**
   - Impact: High
   - Current: No CSRF tokens
   - Fix: Add csurf middleware

3. **No rate limiting**
   - Impact: Medium-High
   - Current: Unlimited requests
   - Fix: Add express-rate-limit

### HIGH (P1)
4. **Session secret in code**
   - Impact: Medium
   - Current: Hardcoded in example
   - Fix: Use environment variable

5. **SQL injection potential**
   - Impact: Medium
   - Current: Using ORM (Drizzle) but not validated
   - Fix: Add input validation with Zod

6. **No request logging**
   - Impact: Low-Medium
   - Current: Basic console logs
   - Fix: Implement structured logging (Winston/Pino)

## 🔧 Security Best Practices

### For Developers

```bash
# Never commit sensitive data
git secrets --scan

# Audit dependencies regularly
npm audit
npm audit fix

# Use environment variables
cp .env.example .env
# Edit .env with real credentials (NEVER commit!)
```

### For Production

```bash
# Strong session secret
openssl rand -base64 32

# Rotate secrets regularly
# Use secret management system

# Keep dependencies updated
npm update
npm audit

# Monitor logs
tail -f /var/log/nginx/access.log
pm2 logs inwistamobile
```

## 📋 Security Checklist for Production

- [ ] Implement password hashing (bcrypt)
- [ ] Add JWT authentication
- [ ] Implement CSRF protection
- [ ] Add rate limiting (100 req/min per IP)
- [ ] Configure CORS properly
- [ ] Enable HTTPS only (disable HTTP)
- [ ] Rotate session secrets
- [ ] Implement request validation on all endpoints
- [ ] Add logging and monitoring (Sentry/DataDog)
- [ ] Setup automated backups
- [ ] Implement proper error handling (no stack traces in production)
- [ ] Add helmet.js for security headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Implement API versioning
- [ ] Add request/response encryption for sensitive data
- [ ] Setup intrusion detection
- [ ] Regular security audits
- [ ] Penetration testing

## 🔐 Secure Configuration Examples

### Nginx Security Headers

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;
```

### Express Security Middleware (Recommended)

```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
app.use(mongoSanitize());
```

## 📞 Security Contacts

- Security Team: security@inwista.com
- Emergency: +55 (11) XXXX-XXXX
- PGP Key: [Link to public key]

## 📜 Compliance

- [ ] LGPD (Lei Geral de Proteção de Dados) - Brazil
- [ ] PCI-DSS (for payment processing)
- [ ] ISO 27001 (future)

---

Last updated: 2025-11-06
