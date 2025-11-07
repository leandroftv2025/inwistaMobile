# 🚨 CORREÇÃO URGENTE - IMAGENS NÃO APARECEM

## Problema Identificado

O componente Logo estava usando um arquivo com **ESPAÇOS no nome**:
```
/attached_assets/Logo Inwista_1762037237480.png
```

URLs com espaços causam problemas em proxies, CDNs e alguns navegadores.

## Solução Aplicada

✅ Alterado para usar `logo-inwista.png` (sem espaços)
✅ Build atualizado
✅ Código commitado e enviado ao repositório

## Como Aplicar NO SERVIDOR

Execute estes comandos no servidor `inwistaserver`:

```bash
cd ~/inwistaMobile

# 1. Baixar a correção
git fetch origin
git pull origin claude/setup-dual-apps-easypanel-nginx-011CUrxazNXwAyGMCJhT3i2M

# 2. Rebuild da aplicação
npm run build

# 3. Reiniciar PM2
pm2 restart inwistamobile

# 4. Testar
echo "Aguardando 5 segundos..."
sleep 5

# Testar as imagens
curl -I https://mobile.192.168.1.15.nip.io/attached_assets/logo-inwista.png
curl -I https://mobile.192.168.1.15.nip.io/attached_assets/card-front.png
curl -I https://mobile.192.168.1.15.nip.io/attached_assets/pix-icon.png
```

## Validação

Após executar, acesse no navegador:
- https://mobile.192.168.1.15.nip.io

A logo **DEVE** aparecer na tela de boas-vindas e nas páginas de login/registro.

## Se ainda não funcionar

Execute o diagnóstico novamente:
```bash
bash diagnose_images.sh
```

E me envie o output completo.
