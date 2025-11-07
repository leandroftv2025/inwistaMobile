# 🔒 Segurança: Usuários no Servidor

## ⚠️ USAR ROOT É INSEGURO!

### Por que NÃO usar root?

❌ **Riscos de usar root direto:**

1. **Sem proteção contra erros**
   ```bash
   # Como root, você pode destruir tudo sem aviso:
   rm -rf /    # Apaga o sistema inteiro!
   ```

2. **Alvo de hackers**
   - Root é o primeiro usuário que hackers tentam invadir
   - Se invadirem, têm controle TOTAL do servidor

3. **Sem auditoria**
   - Difícil rastrear quem fez o quê
   - Vários admins usando mesmo usuário

4. **Sem sudo (proteção extra)**
   - Comandos perigosos executam sem confirmação
   - Nenhuma camada de proteção

5. **Logs confusos**
   - Tudo aparece como "root"
   - Impossível saber quem executou

---

## ✅ SOLUÇÃO: Criar Usuário Dedicado

### Opção 1: Usuário "inwista" (Recomendado) 👍

**Para quê serve:**
- Deploy e gerenciamento das aplicações Inwista
- Rodar containers Docker
- Atualizar código

**Vantagens:**
- ✅ Nome descritivo (fácil identificar)
- ✅ Permissões apenas para o necessário
- ✅ Proteção contra erros acidentais

---

### Opção 2: Usuário "deploy"

**Para quê serve:**
- Deploy genérico de aplicações
- Útil se você gerencia múltiplos projetos

---

## 🚀 CRIAÇÃO AUTOMÁTICA (Recomendado)

Execute este script **COMO ROOT** (só uma vez):

```bash
# Baixar e executar script de criação de usuário
curl -fsSL https://raw.githubusercontent.com/leandroftv2025/inwistaMobile/main/deploy/scripts/0-create-user.sh | bash
```

**O que o script faz:**

1. ✅ Cria usuário "inwista"
2. ✅ Adiciona ao grupo sudo (poderes administrativos quando necessário)
3. ✅ Adiciona ao grupo docker (pode rodar containers)
4. ✅ Cria chave SSH (login seguro)
5. ✅ Configura senha forte
6. ✅ Desabilita login root via SSH (segurança)

**Após executar:**
- Você terá um usuário seguro "inwista"
- Pode logar com: `ssh inwista@161.97.96.29`
- Usa sudo quando precisa de permissões: `sudo comando`

---

## 🔧 CRIAÇÃO MANUAL (Passo a Passo)

Se preferir fazer manualmente:

### Passo 1: Criar Usuário

**Como root**, execute:

```bash
# Criar usuário 'inwista' com home directory
adduser inwista

# Vai pedir para criar senha (use uma senha FORTE!)
# Pode pular os outros campos (Enter, Enter, Enter...)
```

**Senha forte:**
- Mínimo 12 caracteres
- Letras maiúsculas e minúsculas
- Números e símbolos
- Exemplo: `Inw!st@2025#Secur3`

---

### Passo 2: Adicionar ao Sudo

```bash
# Permite que usuário execute comandos administrativos
usermod -aG sudo inwista
```

Agora "inwista" pode usar `sudo comando` quando precisar.

---

### Passo 3: Adicionar ao Docker

```bash
# Permite rodar containers Docker sem sudo
usermod -aG docker inwista
```

Agora "inwista" pode usar `docker ps`, `docker run`, etc.

---

### Passo 4: Testar Login

**Abra NOVA janela SSH** (não feche a atual ainda!):

```bash
ssh inwista@161.97.96.29
```

Digite a senha que você criou.

**Teste sudo:**

```bash
sudo whoami
# Deve retornar: root
```

Se funcionar, você está pronto! ✅

---

### Passo 5: Desabilitar Root SSH (IMPORTANTE!)

**Ainda como root**, edite:

```bash
nano /etc/ssh/sshd_config
```

Encontre e altere:

```bash
# De:
PermitRootLogin yes

# Para:
PermitRootLogin no
```

Salve (Ctrl+X, Y, Enter) e reinicie SSH:

```bash
systemctl restart sshd
```

**Agora root não pode mais logar via SSH!** 🔒

⚠️ **ATENÇÃO:** Certifique-se que o usuário "inwista" está funcionando ANTES de fazer isso!

---

## 🎯 Como Usar o Novo Usuário

### Conectar ao Servidor

**Ao invés de:**
```bash
ssh root@161.97.96.29
```

**Use:**
```bash
ssh inwista@161.97.96.29
```

---

### Executar Comandos Normais

```bash
# Comandos normais (não precisa sudo)
cd /var/www/inwista
ls -la
docker ps
git pull
```

---

### Executar Comandos Administrativos

Quando precisar de permissões de root:

```bash
# Adicione 'sudo' antes do comando
sudo systemctl restart nginx
sudo apt-get update
sudo docker build -t app .
```

Vai pedir sua senha na primeira vez (válida por 15 minutos).

---

## 🔐 Segurança Extra: Chaves SSH

**Ainda mais seguro que senha!**

### No seu computador (Windows/Mac/Linux):

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "inwista@vps"

# Pressione Enter 3 vezes (usa valores padrão)
```

Isso cria:
- Chave privada: `~/.ssh/id_ed25519` (NUNCA compartilhe!)
- Chave pública: `~/.ssh/id_ed25519.pub`

---

### Copiar Chave para Servidor

**Opção A: Comando automático**

```bash
ssh-copy-id inwista@161.97.96.29
```

Digite a senha do usuário inwista.

---

**Opção B: Manual**

1. Ver sua chave pública:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. Copiar o texto que aparecer

3. No servidor, como usuário "inwista":
   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   nano ~/.ssh/authorized_keys
   ```

4. Cole a chave pública, salve (Ctrl+X, Y, Enter)

5. Ajustar permissões:
   ```bash
   chmod 600 ~/.ssh/authorized_keys
   ```

---

### Testar Chave SSH

```bash
ssh inwista@161.97.96.29
```

Agora **NÃO** deve pedir senha! 🎉

---

### Desabilitar Login por Senha (Máxima Segurança)

**Apenas após confirmar que chave SSH funciona!**

No servidor, como root ou com sudo:

```bash
sudo nano /etc/ssh/sshd_config
```

Alterar:

```bash
PasswordAuthentication no
```

Reiniciar SSH:

```bash
sudo systemctl restart sshd
```

**Agora APENAS chave SSH funciona!** 🔐

---

## 📊 Comparação

| Item | Root Direto | Usuário Dedicado + Sudo |
|------|-------------|-------------------------|
| **Segurança** | ❌ Muito baixa | ✅ Alta |
| **Auditoria** | ❌ Impossível | ✅ Rastreável |
| **Proteção contra erros** | ❌ Nenhuma | ✅ Sudo pede confirmação |
| **Alvo de hackers** | ❌ Primeiro alvo | ✅ Mais difícil |
| **Boas práticas** | ❌ Não recomendado | ✅ Padrão da indústria |

---

## 🎯 Estrutura Recomendada

```
Servidor VPS
│
├── root (bloqueado para SSH)
│   └── Apenas para emergências locais
│
└── inwista (usuário principal)
    ├── Grupo: sudo (pode executar comandos admin)
    ├── Grupo: docker (pode rodar containers)
    ├── Login: SSH com chave
    └── Gerencia: Aplicações Inwista
```

---

## 🚀 Fluxo de Trabalho

### Deploy Inicial (primeira vez)

```bash
# 1. Como ROOT, criar usuário
ssh root@161.97.96.29
curl -fsSL https://raw.githubusercontent.com/.../0-create-user.sh | bash
exit

# 2. Logar como INWISTA
ssh inwista@161.97.96.29

# 3. Executar instalação
curl -fsSL https://raw.githubusercontent.com/.../1-prepare-server.sh | bash
curl -fsSL https://raw.githubusercontent.com/.../2-install-apps.sh | bash
```

---

### Atualizações Futuras

```bash
# Sempre como INWISTA
ssh inwista@161.97.96.29
bash /opt/inwista/scripts/atualizar-simples.sh
```

---

## ✅ Checklist de Segurança

- [ ] Usuário "inwista" criado
- [ ] Usuário no grupo sudo
- [ ] Usuário no grupo docker
- [ ] Testei login com usuário inwista
- [ ] Testei sudo (funciona)
- [ ] Testei docker (funciona)
- [ ] Chave SSH configurada (opcional mas recomendado)
- [ ] Login root via SSH desabilitado
- [ ] Login por senha desabilitado (se usando chave SSH)

---

## 🚨 Troubleshooting

### "inwista is not in the sudoers file"

**Solução:**
```bash
# Como root
usermod -aG sudo inwista

# Verificar
groups inwista
# Deve mostrar: inwista sudo docker
```

---

### "permission denied" ao rodar docker

**Solução:**
```bash
# Como root
usermod -aG docker inwista

# Usuário inwista precisa relogar
exit
ssh inwista@161.97.96.29

# Testar
docker ps
```

---

### Esqueci senha do usuário inwista

**Solução:**
```bash
# Como root
passwd inwista
# Digite nova senha
```

---

### Me tranquei fora! (desabilitei root antes de testar)

**Solução:**

1. Acesse console VPS via painel Contabo (web)
2. Logue como root localmente
3. Habilite root SSH temporariamente:
   ```bash
   nano /etc/ssh/sshd_config
   # PermitRootLogin yes
   systemctl restart sshd
   ```
4. Conserte o problema
5. Desabilite root SSH novamente

---

## 💡 Boas Práticas Adicionais

### 1. Firewall

```bash
# Apenas portas necessárias
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

### 2. Fail2Ban

```bash
# Bloqueia IPs após tentativas de login falhas
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

### 3. Atualizar Sistema

```bash
# Manter servidor atualizado
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get autoremove -y
```

---

### 4. Trocar Porta SSH (Opcional)

Dificulta ataques automatizados:

```bash
sudo nano /etc/ssh/sshd_config

# Mudar de:
Port 22

# Para (exemplo):
Port 2222

sudo systemctl restart sshd
```

Logar com:
```bash
ssh -p 2222 inwista@161.97.96.29
```

---

## 📖 Resumo

### ✅ O que fazer:

1. **Criar usuário "inwista"** (com script automático ou manual)
2. **Adicionar ao sudo e docker**
3. **Testar login e permissões**
4. **Desabilitar root SSH**
5. **Configurar chave SSH** (recomendado)

### ❌ O que NÃO fazer:

1. ❌ Usar root para deploy do dia-a-dia
2. ❌ Desabilitar root SSH antes de testar outro usuário
3. ❌ Usar senhas fracas
4. ❌ Compartilhar chaves SSH privadas

---

## 🎯 Próximos Passos

1. Execute o script de criação de usuário:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/leandroftv2025/inwistaMobile/main/deploy/scripts/0-create-user.sh | bash
   ```

2. Logue com o novo usuário:
   ```bash
   ssh inwista@161.97.96.29
   ```

3. Execute a instalação:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/.../1-prepare-server.sh | bash
   curl -fsSL https://raw.githubusercontent.com/.../2-install-apps.sh | bash
   ```

---

**Servidor seguro = Aplicações seguras!** 🔒🚀

---

**Última atualização**: 2025-11-07
