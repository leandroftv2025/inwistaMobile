# ⚡ Quick Start - Deploy VPS em 3 Comandos

**Para quem tem pressa!** 🚀

---

## 📋 Antes de Começar

1. ✅ Tenha acesso SSH ao servidor: `ssh root@161.97.96.29`
2. ✅ Configure DNS no Cloudflare (leva 2 minutos):
   - `inwista.com` → A → `161.97.96.29`
   - `www.inwista.com` → CNAME → `inwista.com`
   - `app.inwista.com` → A → `161.97.96.29`

---

## 🚀 Instalação Completa (3 Comandos)

```bash
# 1️⃣ Preparar servidor (5 min)
curl -fsSL https://raw.githubusercontent.com/leandroftv2025/inwistaMobile/main/deploy/scripts/1-prepare-server.sh | sudo bash

# 2️⃣ Instalar aplicações (10 min)
curl -fsSL https://raw.githubusercontent.com/leandroftv2025/inwistaMobile/main/deploy/scripts/2-install-apps.sh | sudo bash

# 3️⃣ Configurar SSL (2 min) - OPCIONAL, já é feito no passo 2
# curl -fsSL https://raw.githubusercontent.com/leandroftv2025/inwistaMobile/main/deploy/scripts/3-setup-ssl.sh | sudo bash
```

**Pronto!** Acesse:
- 🌐 https://www.inwista.com
- 📱 https://app.inwista.com

---

## 🔄 Atualizar (1 Comando)

```bash
curl -fsSL https://raw.githubusercontent.com/leandroftv2025/inwistaMobile/main/deploy/scripts/atualizar-simples.sh | sudo bash
```

---

## 📊 Ver Status (1 Comando)

```bash
bash /opt/inwista/scripts/status.sh
```

---

## 📖 Guia Completo

Quer entender cada passo? Leia: [GUIA_INSTALACAO_VPS.md](./GUIA_INSTALACAO_VPS.md)

---

**É isso! Simples assim.** ✨
