# 🛡️ Melhores Práticas de Segurança - Inwista

Guia de segurança para seu servidor VPS.

---

## 🎯 Resumo Executivo

### ✅ O QUE FAZER

1. **Usuário dedicado** (não usar root)
2. **Chave SSH** (não usar apenas senha)
3. **Firewall** configurado (apenas portas necessárias)
4. **Fail2Ban** ativo (bloqueio de ataques)
5. **Cloudflare SSL Full** (HTTPS ponta a ponta)
6. **Atualizações** regulares (segurança do sistema)

### ❌ O QUE NÃO FAZER

1. ❌ Usar root para operações do dia-a-dia
2. ❌ Senha fraca (mínimo 12 caracteres)
3. ❌ Cloudflare SSL Flexible (inseguro!)
4. ❌ Portas desnecessárias abertas
5. ❌ Sistema desatualizado
6. ❌ Logs não monitorados

---

## 🔐 1. Usuários e Acesso

### Estrutura Recomendada

```
┌─────────────────────────────────────┐
│ SERVIDOR VPS                         │
├─────────────────────────────────────┤
│                                      │
│ 👤 root                              │
│    ├─ Bloqueado para SSH ❌          │
│    └─ Apenas emergências locais      │
│                                      │
│ 👤 inwista (você usa este!)          │
│    ├─ SSH com chave 🔑               │
│    ├─ Grupo: sudo ✅                 │
│    ├─ Grupo: docker ✅               │
│    └─ Deploy de aplicações           │
│                                      │
└─────────────────────────────────────┘
```

### Como Configurar

**Passo 1: Criar usuário dedicado**

```bash
# Como root (APENAS uma vez)
ssh root@161.97.96.29

# Execute script de criação
curl -fsSL https://raw.githubusercontent.com/leandroftv2025/inwistaMobile/main/deploy/scripts/0-create-user.sh | bash
```

**Passo 2: Testar novo usuário**

```bash
# Nova janela SSH
ssh inwista@161.97.96.29

# Testar sudo
sudo whoami
# Deve retornar: root
```

**Passo 3: Desabilitar root SSH**

```bash
# No servidor, como inwista
sudo nano /etc/ssh/sshd_config

# Alterar para:
PermitRootLogin no

# Salvar e reiniciar
sudo systemctl restart sshd
```

✅ **Agora root não pode mais logar via SSH!**

---

## 🔑 2. Chave SSH (Altamente Recomendado)

### Por que usar chave SSH?

✅ **Vantagens:**
- Impossível quebrar por força bruta
- Não precisa digitar senha
- Pode ter múltiplas chaves (um por dispositivo)
- Padrão da indústria

❌ **Senha:**
- Pode ser descoberta por força bruta
- Pode ser interceptada (keyloggers)
- Reutilização em outros serviços

---

### Como Configurar

**No seu computador (Windows/Mac/Linux):**

```bash
# Gerar chave
ssh-keygen -t ed25519 -C "inwista-vps"

# Pressione Enter 3x (usa padrões)
# Cria: ~/.ssh/id_ed25519 (privada) e ~/.ssh/id_ed25519.pub (pública)
```

**Copiar chave para servidor:**

```bash
ssh-copy-id inwista@161.97.96.29
# Digite senha do usuário inwista
```

**Testar:**

```bash
ssh inwista@161.97.96.29
# Não deve pedir senha!
```

---

### Desabilitar Login por Senha

**APENAS após confirmar que chave funciona!**

```bash
sudo nano /etc/ssh/sshd_config

# Alterar:
PasswordAuthentication no

# Salvar e reiniciar
sudo systemctl restart sshd
```

✅ **Agora APENAS chave SSH funciona!**

---

## 🔥 3. Firewall (UFW)

### Portas Necessárias

- **22** (SSH) - Acesso ao servidor
- **80** (HTTP) - Redirecionamento para HTTPS
- **443** (HTTPS) - Sites seguros

### Configuração

```bash
# Reset (limpar regras antigas)
sudo ufw --force reset

# Padrões
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir portas necessárias
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Ativar
sudo ufw enable

# Ver status
sudo ufw status verbose
```

**Resultado:**

```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere        # SSH
80/tcp                     ALLOW       Anywhere        # HTTP
443/tcp                    ALLOW       Anywhere        # HTTPS
```

---

### Trocar Porta SSH (Opcional - Segurança Extra)

Dificulta ataques automatizados:

```bash
sudo nano /etc/ssh/sshd_config

# Trocar:
Port 2222  # Ao invés de 22

# Salvar
sudo systemctl restart sshd
```

**Atualizar firewall:**

```bash
sudo ufw allow 2222/tcp comment 'SSH (custom port)'
sudo ufw delete allow 22/tcp
```

**Conectar com nova porta:**

```bash
ssh -p 2222 inwista@161.97.96.29
```

---

## 🛡️ 4. Fail2Ban

Bloqueia IPs após tentativas de login falhas.

### Instalação

```bash
sudo apt-get update
sudo apt-get install -y fail2ban
```

### Configuração

```bash
sudo nano /etc/fail2ban/jail.local
```

**Conteúdo:**

```ini
[DEFAULT]
# Ban por 1 hora
bantime = 3600

# Janela de 10 minutos
findtime = 600

# 5 tentativas permitidas
maxretry = 5

# Email de notificação (opcional)
destemail = seu@email.com
sendername = Fail2Ban
action = %(action_mw)s

[sshd]
enabled = true
port = ssh  # ou 2222 se trocou porta
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
logpath = /var/log/nginx/error.log
```

**Ativar:**

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

**Ver bans:**

```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

---

## 🔒 5. SSL/TLS (Cloudflare Full)

### Configuração Recomendada

**No Cloudflare:**

1. **SSL/TLS Mode:** Full
   - ✅ HTTPS ponta a ponta
   - Aceita certificado auto-assinado

2. **Always Use HTTPS:** ON
   - Redireciona HTTP → HTTPS

3. **Automatic HTTPS Rewrites:** ON
   - Links HTTP viram HTTPS

4. **HSTS:** Ativado
   - Força HTTPS no navegador
   - Max-Age: 12 months
   - Include subdomains: Yes
   - Preload: Yes

---

**No Servidor:**

```bash
# Criar certificado auto-assinado
sudo mkdir -p /etc/ssl/inwista
cd /etc/ssl/inwista

sudo openssl req -x509 -nodes -days 3650 \
  -newkey rsa:2048 \
  -keyout inwista.key \
  -out inwista.crt \
  -subj "/C=BR/ST=SP/L=SaoPaulo/O=Inwista/CN=*.inwista.com"

sudo chmod 600 inwista.key
sudo chmod 644 inwista.crt
```

Nginx já configurado para usar esses certificados.

---

## 🔄 6. Atualizações

### Automáticas (Recomendado)

```bash
# Instalar unattended-upgrades
sudo apt-get install -y unattended-upgrades

# Configurar
sudo dpkg-reconfigure -plow unattended-upgrades
# Selecione "Yes"
```

**Editar configuração:**

```bash
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

**Descomentar:**

```
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
```

Servidor atualiza e reinicia automaticamente às 3h da manhã.

---

### Manuais

```bash
# Atualizar lista de pacotes
sudo apt-get update

# Ver atualizações disponíveis
apt list --upgradable

# Aplicar atualizações
sudo apt-get upgrade -y

# Remover pacotes não usados
sudo apt-get autoremove -y

# Limpar cache
sudo apt-get clean
```

**Recomendado:** 1x por semana

---

## 📊 7. Monitoramento

### Logs Importantes

```bash
# SSH (tentativas de login)
sudo tail -f /var/log/auth.log

# Nginx (acessos)
sudo tail -f /var/log/nginx/access.log

# Nginx (erros)
sudo tail -f /var/log/nginx/error.log

# Fail2Ban
sudo tail -f /var/log/fail2ban.log

# Sistema
sudo tail -f /var/log/syslog
```

---

### Ferramentas de Monitoramento

**1. htop (uso de recursos)**

```bash
sudo apt-get install -y htop
htop
```

Mostra CPU, RAM, processos em tempo real.

---

**2. netstat (conexões)**

```bash
# Portas abertas
sudo netstat -tlnp

# Conexões ativas
sudo netstat -anp | grep ESTABLISHED
```

---

**3. iptables (firewall)**

```bash
# Ver regras
sudo iptables -L -v -n
```

---

**4. fail2ban-client**

```bash
# Status geral
sudo fail2ban-client status

# Status SSH
sudo fail2ban-client status sshd

# Desbanir IP
sudo fail2ban-client set sshd unbanip 1.2.3.4
```

---

## 🚨 8. Detecção de Intrusão

### Verificar Logins Suspeitos

```bash
# Últimos logins bem-sucedidos
last

# Últimas tentativas de login (incluindo falhas)
lastb
```

---

### Processos Suspeitos

```bash
# Ver todos os processos
ps aux

# Processos usando mais CPU
ps aux --sort=-%cpu | head

# Processos usando mais RAM
ps aux --sort=-%mem | head
```

---

### Arquivos Modificados Recentemente

```bash
# Arquivos alterados nas últimas 24h
find /home -type f -mtime -1

# Arquivos criados nas últimas 24h
find /var/www -type f -ctime -1
```

---

## 🔐 9. Backups

### Backup Automático

Script já criado: `/opt/inwista/scripts/backup.sh`

**Agendar (cron):**

```bash
# Editar crontab
crontab -e

# Adicionar (backup diário às 2h)
0 2 * * * /opt/inwista/scripts/backup.sh > /dev/null 2>&1
```

---

### Backup Manual

```bash
bash /opt/inwista/scripts/backup.sh
```

Backups em: `/opt/inwista/backups/`

---

### Backup Offsite (Recomendado)

Copiar backups para outro servidor:

```bash
# No seu computador
scp inwista@161.97.96.29:/opt/inwista/backups/inwista_backup_*.tar.gz ~/backups/
```

Ou usar serviço cloud (Dropbox, Google Drive, AWS S3).

---

## ✅ Checklist de Segurança

### Configuração Inicial

- [ ] Usuário dedicado criado
- [ ] Root SSH desabilitado
- [ ] Chave SSH configurada
- [ ] Login por senha desabilitado (se chave SSH ativa)
- [ ] Firewall (UFW) configurado
- [ ] Fail2Ban instalado e ativo
- [ ] Cloudflare SSL Full configurado
- [ ] Certificado auto-assinado no servidor

---

### Manutenção Regular

- [ ] Atualizar sistema semanalmente
- [ ] Verificar logs de erro
- [ ] Verificar Fail2Ban (IPs banidos)
- [ ] Testar backups mensalmente
- [ ] Renovar senhas trimestralmente
- [ ] Auditar usuários semestralmente

---

### Monitoramento

- [ ] Verificar uso de CPU/RAM
- [ ] Verificar espaço em disco
- [ ] Verificar logs de acesso suspeitos
- [ ] Verificar processos desconhecidos
- [ ] Verificar portas abertas

---

## 🎯 Níveis de Segurança

### Nível 1: Básico (Mínimo)

✅ Firewall ativo
✅ Senha forte
✅ Fail2Ban instalado
✅ Cloudflare SSL Full

**Tempo:** ~15 minutos
**Segurança:** Adequada para maioria

---

### Nível 2: Recomendado

✅ Tudo do Nível 1
✅ Usuário dedicado (não root)
✅ Chave SSH
✅ Login por senha desabilitado
✅ Atualizações automáticas

**Tempo:** ~30 minutos
**Segurança:** Alta

---

### Nível 3: Paranóico

✅ Tudo do Nível 2
✅ Porta SSH customizada
✅ Two-factor authentication (2FA)
✅ Intrusion Detection System (IDS)
✅ Security auditing (Lynis)
✅ Backups offsite automáticos

**Tempo:** ~2 horas
**Segurança:** Máxima

---

## 📚 Recursos Adicionais

### Testar Segurança

**1. SSL Labs**
- https://www.ssllabs.com/ssltest/
- Digite: www.inwista.com
- Target: A+

**2. Security Headers**
- https://securityheaders.com/
- Digite: www.inwista.com
- Target: A+

**3. Lynis (auditoria)**

```bash
# Instalar
sudo apt-get install -y lynis

# Executar auditoria
sudo lynis audit system
```

---

### Documentação

- SSH: https://www.ssh.com/academy/ssh
- UFW: https://help.ubuntu.com/community/UFW
- Fail2Ban: https://www.fail2ban.org/
- Cloudflare: https://developers.cloudflare.com/ssl/

---

## 🚨 Em Caso de Invasão

Se suspeitar que foi invadido:

1. **Desconecte da internet**
   ```bash
   sudo ufw deny out from any to any
   ```

2. **Revise logs**
   ```bash
   sudo grep -i "failed\|invalid\|break" /var/log/auth.log
   ```

3. **Verifique processos**
   ```bash
   ps aux
   ```

4. **Troque todas as senhas**

5. **Reinstale o servidor do zero** (mais seguro)

6. **Restaure a partir de backup limpo**

---

## 💡 Resumo

### Configuração Mínima (Nível 1)

```bash
# 1. Firewall
sudo ufw allow 22,80,443/tcp
sudo ufw enable

# 2. Fail2Ban
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban

# 3. Cloudflare SSL Full
# Configurar no painel Cloudflare
```

---

### Configuração Recomendada (Nível 2)

```bash
# 1. Criar usuário
curl -fsSL https://.../0-create-user.sh | bash

# 2. Configurar chave SSH
ssh-keygen -t ed25519
ssh-copy-id inwista@161.97.96.29

# 3. Desabilitar root e senha
# (feito no script acima)

# 4. Executar instalação como usuário inwista
ssh inwista@161.97.96.29
curl -fsSL https://.../1-prepare-server.sh | bash
curl -fsSL https://.../2-install-apps.sh | bash
```

---

**Servidor seguro = Negócio protegido!** 🛡️🚀

---

**Última atualização**: 2025-11-07
