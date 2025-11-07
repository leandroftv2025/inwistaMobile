# 📜 Scripts de Deploy - Inwista

Scripts automatizados para deploy no VPS Contabo.

---

## 📦 Scripts Disponíveis

### 1️⃣ `1-prepare-server.sh`

**Preparação inicial do servidor**

Configura o servidor do zero com todas as dependências.

```bash
bash 1-prepare-server.sh
```

**O que faz:**
- Atualiza o sistema operacional
- Instala Docker, Node.js 20, Nginx
- Configura firewall (UFW)
- Configura segurança (Fail2Ban)
- Cria estrutura de diretórios
- Aplica otimizações de sistema

**Tempo**: ~5 minutos

---

### 2️⃣ `2-install-apps.sh`

**Instalação das aplicações**

Instala inwistasite + inwistaMobile com Docker.

```bash
bash 2-install-apps.sh
```

**O que faz:**
- Clona repositórios do GitHub
- Instala dependências (npm ci)
- Compila aplicações (npm run build)
- Cria imagens Docker
- Deploy dos containers
- Configura Nginx
- Obtém certificados SSL (Let's Encrypt)

**Tempo**: ~10 minutos

---

### 3️⃣ `3-setup-ssl.sh`

**Configuração SSL**

Obtém e configura certificados HTTPS.

```bash
bash 3-setup-ssl.sh
```

**O que faz:**
- Verifica DNS
- Obtém certificados Let's Encrypt
- Configura HTTPS
- Ativa renovação automática

**Tempo**: ~2 minutos

**Nota**: Já é executado automaticamente no script 2

---

### ⚡ `atualizar-simples.sh`

**Atualização rápida**

Atualiza ambas as aplicações com 1 comando.

```bash
bash atualizar-simples.sh
```

**O que faz:**
- Git pull das atualizações
- npm install + build
- Rebuild Docker images
- Reinicia containers
- Verifica health checks

**Tempo**: ~3 minutos

---

## 🎯 Ordem de Execução

### Deploy Inicial

```bash
# Passo 1: Preparar servidor
bash 1-prepare-server.sh

# Passo 2: Instalar aplicações + SSL
bash 2-install-apps.sh

# Pronto! Seus sites estão no ar.
```

### Atualizações Futuras

```bash
# Apenas isso:
bash atualizar-simples.sh
```

---

## 📍 Localização dos Scripts

### No servidor, após instalação:

- **Scripts principais**: `/opt/inwista/scripts/`
- **Scripts de deploy**: `/var/www/inwista/inwistaMobile/deploy/scripts/`

### Scripts criados automaticamente:

```
/opt/inwista/scripts/
├── status.sh          # Ver status do servidor
├── atualizar.sh       # Atualizar aplicações
└── backup.sh          # Criar backup
```

---

## 🛠️ Scripts Utilitários

### Ver Status

```bash
bash /opt/inwista/scripts/status.sh
```

Mostra:
- Uptime do servidor
- Uso de CPU/RAM/Disco
- Status dos containers Docker
- Status do Nginx

### Criar Backup

```bash
bash /opt/inwista/scripts/backup.sh
```

Cria backup compactado em: `/opt/inwista/backups/`

---

## 🔧 Customização

### Variáveis de Ambiente

Edite o arquivo `.env` da aplicação:

```bash
nano /var/www/inwista/inwistaMobile/.env
```

Após editar, reinicie o container:

```bash
docker restart inwistamobile
```

### Configuração Nginx

Arquivo principal: `/etc/nginx/sites-available/inwista`

Após editar:

```bash
nginx -t                 # Testar configuração
systemctl reload nginx   # Recarregar
```

---

## 🚨 Troubleshooting

### Script falha com erro

```bash
# Ver log detalhado
bash <script-name>.sh 2>&1 | tee error.log
```

### Container não inicia

```bash
# Ver logs do container
docker logs inwistasite
docker logs inwistamobile

# Reconstruir container
cd /var/www/inwista/<app>
docker build -t <app>:latest .
docker stop <app> && docker rm <app>
docker run -d --name <app> --restart unless-stopped -p <porta>:<porta> <app>:latest
```

### SSL falha

- Verifique se DNS está propagado: `dig inwista.com`
- Verifique se portas 80/443 estão abertas: `ufw status`
- Execute novamente: `bash 3-setup-ssl.sh`

---

## 📖 Documentação Completa

Para guia detalhado com explicações passo a passo:

- [GUIA_INSTALACAO_VPS.md](../GUIA_INSTALACAO_VPS.md)
- [QUICK_START.md](../QUICK_START.md)

---

## 🎓 Entendendo os Scripts

### Estrutura Padrão

Todos os scripts seguem a estrutura:

1. **Cabeçalho**: Descrição e objetivo
2. **Verificação root**: Garante permissões adequadas
3. **Logs coloridos**: Feedback visual claro
4. **Verificações**: Testa cada etapa
5. **Rollback**: Desfaz em caso de erro
6. **Resumo final**: Mostra o que foi feito

### Segurança

- ✅ Verificação de permissões
- ✅ Validação de inputs
- ✅ Backup antes de mudanças críticas
- ✅ Rollback automático em falhas
- ✅ Logs detalhados

---

## 💡 Dicas

### Executar com logs

```bash
bash script.sh | tee script.log
```

### Executar em background

```bash
nohup bash script.sh > script.log 2>&1 &
```

### Ver progresso

```bash
tail -f script.log
```

---

**Desenvolvido por**: Equipe Inwista
**Última atualização**: 2025-11-07
