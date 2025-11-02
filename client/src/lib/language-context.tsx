import { createContext, useContext, useState, useEffect } from "react";

type Language = "pt-BR" | "en-US";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "pt-BR";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

const translations = {
  "pt-BR": {
    common: {
      back: "Voltar",
      save: "Salvar",
      cancel: "Cancelar",
      confirm: "Confirmar",
      edit: "Editar",
      delete: "Excluir",
      search: "Buscar",
      filter: "Filtrar",
      loading: "Carregando...",
      error: "Erro",
      success: "Sucesso",
      hello: "Olá",
    },
    home: {
      title: "Início",
      balance: "Saldo BRL",
      netWorth: "Patrimônio",
      totalInvested: "Total investido",
      quickActions: "Ações rápidas",
      recentTransactions: "Transações recentes",
      viewAll: "Ver todas",
      noTransactions: "Nenhuma transação recente",
    },
    pix: {
      title: "PIX",
      send: "Enviar",
      receive: "Receber",
      myKeys: "Minhas chaves",
      history: "Histórico",
      sendPix: "Enviar PIX",
      receivePix: "Receber PIX",
      recipientKey: "Chave do destinatário",
      amount: "Valor",
      description: "Descrição",
      optional: "Opcional",
      confirmSend: "Confirmar envio",
      pixSent: "PIX enviado",
      pixSentSuccess: "PIX enviado com sucesso!",
      generateQRCode: "Gerar QR Code",
      shareKey: "Compartilhar chave",
      transactionType: "Tipo",
      sent: "Enviada",
      received: "Recebida",
      insufficientBalance: "Saldo insuficiente",
    },
    stablecoin: {
      title: "StableCOIN",
      buy: "Comprar",
      sell: "Vender",
      history: "Histórico",
      rate: "Taxa de conversão",
      fee: "Taxa",
      wallet: "Carteira STABLE",
      youPay: "Você paga",
      youReceive: "Você recebe",
      confirmPurchase: "Confirmar compra",
      confirmSale: "Confirmar venda",
      purchaseSuccess: "Compra realizada com sucesso!",
      saleSuccess: "Venda realizada com sucesso!",
      spread: "Spread aplicado",
    },
    investments: {
      title: "Investimentos",
      products: "Produtos",
      portfolio: "Minha carteira",
      risk: "Risco",
      low: "Baixo",
      medium: "Médio",
      high: "Alto",
      returnRate: "Retorno anual",
      liquidity: "Liquidez",
      daily: "Diária",
      monthly: "Mensal",
      maturity: "No vencimento",
      minimumInvestment: "Investimento mínimo",
      invest: "Investir",
      confirmInvestment: "Confirmar investimento",
      investmentSuccess: "Investimento realizado com sucesso!",
      totalAmount: "Valor total",
      currentValue: "Valor atual",
    },
    settings: {
      title: "Configurações",
      account: "Conta",
      accountInfo: "Informações da sua conta",
      appearance: "Aparência",
      appearanceDesc: "Personalize a interface do aplicativo",
      preferences: "Preferências",
      preferencesDesc: "Ajuste suas preferências de uso",
      security: "Segurança",
      securityDesc: "Proteja sua conta com recursos avançados",
      privacy: "Privacidade",
      privacyDesc: "Gerencie seus dados e privacidade",
      theme: "Tema",
      light: "Claro",
      dark: "Escuro",
      system: "Sistema",
      language: "Idioma",
      changePassword: "Alterar senha",
      changePasswordDesc: "Atualize sua senha de acesso",
      biometrics: "Biometria",
      biometricsDesc: "Acesso rápido com impressão digital",
      twoFactor: "Autenticação em duas etapas",
      twoFactorDesc: "Camada extra de proteção",
      privacyPolicy: "Política de privacidade",
      termsOfUse: "Termos de uso",
      logout: "Sair da conta",
      logoutConfirm: "Logout realizado",
      logoutMessage: "Até logo!",
      version: "Versão",
    },
    support: {
      title: "Suporte",
      faq: "Perguntas frequentes",
      contact: "Fale conosco",
      contactDesc: "Nossa equipe está pronta para ajudar",
      email: "E-mail",
      phone: "Telefone",
      chat: "Chat online",
    },
  },
  "en-US": {
    common: {
      back: "Back",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      edit: "Edit",
      delete: "Delete",
      search: "Search",
      filter: "Filter",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      hello: "Hello",
    },
    home: {
      title: "Home",
      balance: "BRL Balance",
      netWorth: "Net Worth",
      totalInvested: "Total Invested",
      quickActions: "Quick Actions",
      recentTransactions: "Recent Transactions",
      viewAll: "View All",
      noTransactions: "No recent transactions",
    },
    pix: {
      title: "PIX",
      send: "Send",
      receive: "Receive",
      myKeys: "My Keys",
      history: "History",
      sendPix: "Send PIX",
      receivePix: "Receive PIX",
      recipientKey: "Recipient Key",
      amount: "Amount",
      description: "Description",
      optional: "Optional",
      confirmSend: "Confirm Send",
      pixSent: "PIX Sent",
      pixSentSuccess: "PIX sent successfully!",
      generateQRCode: "Generate QR Code",
      shareKey: "Share Key",
      transactionType: "Type",
      sent: "Sent",
      received: "Received",
      insufficientBalance: "Insufficient balance",
    },
    stablecoin: {
      title: "StableCOIN",
      buy: "Buy",
      sell: "Sell",
      history: "History",
      rate: "Conversion Rate",
      fee: "Fee",
      wallet: "STABLE Wallet",
      youPay: "You Pay",
      youReceive: "You Receive",
      confirmPurchase: "Confirm Purchase",
      confirmSale: "Confirm Sale",
      purchaseSuccess: "Purchase completed successfully!",
      saleSuccess: "Sale completed successfully!",
      spread: "Spread Applied",
    },
    investments: {
      title: "Investments",
      products: "Products",
      portfolio: "My Portfolio",
      risk: "Risk",
      low: "Low",
      medium: "Medium",
      high: "High",
      returnRate: "Annual Return",
      liquidity: "Liquidity",
      daily: "Daily",
      monthly: "Monthly",
      maturity: "At Maturity",
      minimumInvestment: "Minimum Investment",
      invest: "Invest",
      confirmInvestment: "Confirm Investment",
      investmentSuccess: "Investment completed successfully!",
      totalAmount: "Total Amount",
      currentValue: "Current Value",
    },
    settings: {
      title: "Settings",
      account: "Account",
      accountInfo: "Your account information",
      appearance: "Appearance",
      appearanceDesc: "Customize the app interface",
      preferences: "Preferences",
      preferencesDesc: "Adjust your usage preferences",
      security: "Security",
      securityDesc: "Protect your account with advanced features",
      privacy: "Privacy",
      privacyDesc: "Manage your data and privacy",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
      language: "Language",
      changePassword: "Change Password",
      changePasswordDesc: "Update your access password",
      biometrics: "Biometrics",
      biometricsDesc: "Quick access with fingerprint",
      twoFactor: "Two-Factor Authentication",
      twoFactorDesc: "Extra layer of protection",
      privacyPolicy: "Privacy Policy",
      termsOfUse: "Terms of Use",
      logout: "Sign Out",
      logoutConfirm: "Logged out",
      logoutMessage: "See you soon!",
      version: "Version",
    },
    support: {
      title: "Support",
      faq: "Frequently Asked Questions",
      contact: "Contact Us",
      contactDesc: "Our team is ready to help",
      email: "Email",
      phone: "Phone",
      chat: "Online Chat",
    },
  },
} as const;
