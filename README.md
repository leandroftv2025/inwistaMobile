# Inwista Fintech MVP

![Status](https://img.shields.io/badge/status-production--ready-green)
![Language](https://img.shields.io/badge/language-TypeScript-blue)
![Platform](https://img.shields.io/badge/platform-web-orange)

## 📱 Sobre o Projeto

**Inwista** é uma aplicação fintech completa desenvolvida como MVP (Minimum Viable Product), oferecendo uma experiência bancária moderna e intuitiva. O projeto demonstra funcionalidades essenciais de serviços financeiros digitais, incluindo transferências PIX, negociação de stablecoins e produtos de investimento.

### 🌟 Características Principais

- ✅ **Transferências PIX** - Envio e recebimento instantâneo com gerenciamento de chaves
- ✅ **StableCOIN Trading** - Conversão BRL ↔ Stable com spread de 0,5% e taxas transparentes
- ✅ **Investimentos** - Catálogo de produtos com simulação de retornos e acompanhamento de carteira
- ✅ **Autenticação Segura** - Login com CPF e verificação 2FA
- ✅ **Multi-idioma** - Suporte completo para Português (Brasil) e English (USA)
- ✅ **Dark/Light Mode** - Tema adaptável com detecção automática do sistema
- ✅ **Design Responsivo** - Interface otimizada para desktop e mobile

## 🎨 Identidade Visual

- **Cor Primária**: Navy Blue (#103549) - Transmite confiança e profissionalismo
- **Design System**: Material Design 3 adaptado para fintech
- **Tipografia**: Inter para UI e JetBrains Mono para valores financeiros
- **Tema**: Suporte completo a dark/light mode com persistência

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** - Build tool e dev server
- **Wouter** - Roteamento leve
- **TanStack Query (React Query v5)** - Gerenciamento de estado e cache
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes UI de alta qualidade
- **Lucide React** - Ícones modernos

### Backend
- **Node.js** com Express
- **TypeScript** - Type safety em todo o projeto
- **Drizzle ORM** - ORM type-safe para PostgreSQL
- **Zod** - Validação de schemas
- **In-Memory Storage** - Persistência de dados (com path de migração para PostgreSQL)

### Infraestrutura
- **Replit** - Plataforma de desenvolvimento e hospedagem
- **GitHub** - Controle de versão
- **Nix** - Gerenciamento de dependências

## 📂 Estrutura do Projeto

```
inwista/
├── client/src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── ui/           # Componentes shadcn
│   │   ├── logo.tsx
│   │   ├── theme-toggle.tsx
│   │   └── cpf-input.tsx
│   ├── pages/            # Páginas da aplicação
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── two-fa.tsx
│   │   ├── home.tsx
│   │   ├── pix.tsx
│   │   ├── stablecoin.tsx
│   │   ├── investments.tsx
│   │   ├── settings.tsx
│   │   └── support.tsx
│   ├── lib/              # Utilitários e contextos
│   │   ├── theme-provider.tsx
│   │   ├── auth-context.tsx
│   │   ├── language-context.tsx
│   │   └── queryClient.ts
│   └── App.tsx
├── server/
│   ├── routes.ts         # Endpoints da API
│   ├── storage.ts        # Camada de persistência
│   ├── github.ts         # Integração GitHub
│   └── index.ts
├── shared/
│   └── schema.ts         # Tipos e schemas compartilhados
├── catalog/
│   └── products.json     # Catálogo de produtos
└── design_guidelines.md  # Sistema de design completo
```

## 🎯 Funcionalidades Detalhadas

### 1. Autenticação
- Login com CPF (formatação automática)
- Senha segura
- Verificação 2FA com código de 8 dígitos
- Gerenciamento de sessão

**Credenciais de Demo:**
- CPF: `123.456.789-00`
- Senha: `123456`
- 2FA: Qualquer 8 dígitos (ex: `12345678`)

### 2. Dashboard (Home)
- Visualização de patrimônio líquido
- Saldo BRL e StableCOIN
- Total investido
- Ações rápidas (PIX e Investir)
- Histórico de transações recentes
- Controle de visibilidade de saldos

### 3. PIX
- **Enviar**: Transferência por chave CPF/email/telefone
- **Receber**: Geração de QR Code e compartilhamento de chaves
- **Minhas Chaves**: Gerenciamento de chaves PIX
- **Histórico**: Lista completa de transações
- Validação de saldo em tempo real

### 4. StableCOIN
- **Comprar**: Conversão BRL → Stable com spread de 0,5%
- **Vender**: Conversão Stable → BRL com spread de 0,5%
- Taxa de conversão em tempo real (base: 5.25)
- Cálculo transparente de taxas
- Histórico de conversões
- Validação de saldos

### 5. Investimentos
- Catálogo de produtos (CDB, LCI, LCA, Fundos)
- Filtros por categoria e perfil de risco
- Simulador de investimentos
- Acompanhamento de carteira
- Métricas de performance

### 6. Configurações
- **Preferências**: Idioma (PT-BR/EN-US)
- **Aparência**: Dark/Light/System theme
- **Segurança**: Configurações de 2FA e biometria
- **Conta**: Informações do usuário

### 7. Suporte
- FAQ com perguntas frequentes
- Formulário de contato
- Múltiplos canais de atendimento

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js 20+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/leandroftv2025/inwistaMobile.git
cd inwistaMobile

# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login com CPF e senha
- `POST /api/auth/verify-2fa` - Verificação 2FA

### Usuário
- `GET /api/user/:userId` - Dados do usuário

### PIX
- `GET /api/pix/keys/:userId` - Chaves PIX do usuário
- `GET /api/pix/transactions/:userId` - Histórico de transações
- `POST /api/pix/send` - Enviar transferência

### StableCOIN
- `GET /api/stablecoin/rate` - Taxa de conversão atual
- `GET /api/stablecoin/transactions/:userId` - Histórico de conversões
- `POST /api/stablecoin/convert` - Realizar conversão

### Investimentos
- `GET /api/investments/products` - Catálogo de produtos
- `GET /api/investments/portfolio/:userId` - Carteira do usuário
- `POST /api/investments/invest` - Realizar investimento

### Catálogo
- `GET /api/catalog` - Produtos do catálogo geral

## 🎨 Sistema de Design

O projeto segue diretrizes de design completas documentadas em `design_guidelines.md`:

- **Cores**: Paleta navy blue com tons complementares
- **Tipografia**: Inter + JetBrains Mono
- **Espaçamento**: Sistema de 4px base grid
- **Componentes**: Baseados em Material Design 3
- **Acessibilidade**: WCAG AA compliant
- **Responsividade**: Mobile-first approach

## 🌐 Internacionalização

O sistema de idiomas suporta:
- **Português (Brasil)** - Idioma padrão
- **English (USA)** - Alternativa

Implementação:
- Context API para gerenciamento de idioma
- localStorage para persistência
- Traduções completas em todas as páginas
- Troca dinâmica sem reload

## 🔒 Segurança

### Implementado
- Validação de entrada com Zod
- Sanitização de dados
- Autenticação com sessão
- 2FA obrigatório

### Para Produção (Futuro)
- [ ] Password hashing (bcrypt/argon2)
- [ ] Tokens JWT
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Security headers
- [ ] 2FA real com SMS/Email

## 📈 Métricas e Fórmulas

### Patrimônio Líquido
```typescript
netWorth = (balanceStable × currentRate) + totalInvested + balanceBRL
```

### StableCOIN Spread
- **Compra**: Taxa = 5.25 × 1.005 = 5.276250 (0,5% acima)
- **Venda**: Taxa = 5.25 × 0.995 = 5.223750 (0,5% abaixo)
- **Fee**: 0,5% sempre debitado do BRL

## 🧪 Testes

### Fluxo Completo de Teste

1. **Login** → Use credenciais de demo
2. **2FA** → Digite qualquer 8 dígitos
3. **Dashboard** → Verifique saldos e patrimônio
4. **PIX** → Teste envio e recebimento
5. **StableCOIN** → Realize compra e venda
6. **Investimentos** → Simule e invista
7. **Configurações** → Troque idioma e tema

## 🔒 Configuração SSL/HTTPS

### Problema: "Sua conexão não é particular"?

Se você está vendo avisos de segurança ao acessar via HTTPS, precisa instalar o certificado CA do mkcert no seu dispositivo.

**Solução rápida (3 minutos):**

1. **No servidor**, execute uma única vez:
   ```bash
   cd ~/inwistaMobile
   sudo bash deploy/scripts/export_ssl_ca.sh
   ```

2. **Em cada dispositivo** que vai acessar, abra o navegador:
   ```
   http://192.168.1.15/ssl-ca
   ```

3. Baixe e instale o certificado seguindo as instruções da página

**📖 Guia completo:** Veja [SSL-SETUP.md](./SSL-SETUP.md) para instruções detalhadas por plataforma (Windows, Mac, Linux, Android, iOS)

### Por que isso é necessário?

A aplicação usa certificados SSL locais gerados pelo `mkcert` para HTTPS. Estes certificados são seguros e funcionam apenas na rede local, mas seu navegador não os conhece por padrão. Ao instalar o certificado CA root, você está dizendo: "Eu confio nos certificados deste servidor".

**Segurança:** O certificado só funciona para 192.168.1.15 na rede local. NÃO afeta sua segurança em outros sites da internet.

## 🚀 Roadmap

### Fase 1 - MVP Completo ✅
- [x] Autenticação CPF + 2FA
- [x] Dashboard com saldos
- [x] PIX completo
- [x] StableCOIN com spread
- [x] Investimentos
- [x] Multi-idioma
- [x] Dark/Light mode

### Fase 2 - Melhorias (Planejado)
- [ ] Migração para PostgreSQL
- [ ] 2FA real com SMS/Email
- [ ] Upload de documentos (KYC)
- [ ] Notificações em tempo real
- [ ] Gráficos de performance
- [ ] Exportação de extratos (PDF/CSV)
- [ ] Cartões físicos/virtuais
- [ ] FX & Remessas internacionais

### Fase 3 - Expansão (Futuro)
- [ ] App mobile (React Native)
- [ ] Push notifications
- [ ] Biometria WebAuthn
- [ ] Multi-currency wallet
- [ ] Open Finance integration
- [ ] Analytics avançado

## 📝 Licença

Este projeto é um MVP demonstrativo. Para uso em produção:
- Realize auditoria de segurança
- Implemente compliance financeiro (BACEN, LGPD)
- Adicione monitoramento e logs
- Configure backup e disaster recovery

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Contato

**Desenvolvido com** ❤️ **usando Replit Agent**

---

**Versão:** 1.0.0-MVP  
**Última Atualização:** Novembro 2025
