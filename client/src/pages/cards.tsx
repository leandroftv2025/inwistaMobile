import { useState } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, CreditCard, Lock, TrendingUp, ChevronRight, HelpCircle, Eye, EyeOff, Copy, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import cardFrontPath from "@assets/card-front.png";
import cardBackPath from "@assets/card-back.png";

interface User {
  name: string;
  [key: string]: unknown;
}

export default function Cards() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const { toast } = useToast();
  const [showCardBack, setShowCardBack] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [cardLocked, setCardLocked] = useState(false);

  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  // Dados simulados de cartões
  const cards = [
    {
      id: "1",
      name: "Cartão de Crédito",
      type: "Crédito",
      lastDigits: "9678",
      brand: "mastercard",
    },
  ];

  // Dados simulados de transações que totalizam R$ 5.433,14
  const transactions = [
    {
      id: "1",
      date: "05 de novembro",
      merchant: "Mercado Livre",
      type: "compra online",
      amount: -1250.00,
    },
    {
      id: "2",
      date: "05 de novembro",
      merchant: "Amazon",
      type: "compra online",
      amount: -845.90,
    },
    {
      id: "3",
      date: "04 de novembro",
      merchant: "Posto Ipiranga",
      type: "combustível",
      amount: -320.50,
    },
    {
      id: "4",
      date: "04 de novembro",
      merchant: "Restaurante Fogo de Chão",
      type: "alimentação",
      amount: -567.80,
    },
    {
      id: "5",
      date: "03 de novembro",
      merchant: "Magazine Luiza",
      type: "compra parcelada",
      amount: -1150.00,
    },
    {
      id: "6",
      date: "03 de novembro",
      merchant: "Uber",
      type: "transporte",
      amount: -48.50,
    },
    {
      id: "7",
      date: "02 de novembro",
      merchant: "Netflix",
      type: "assinatura",
      amount: -44.90,
    },
    {
      id: "8",
      date: "02 de novembro",
      merchant: "Spotify",
      type: "assinatura",
      amount: -21.90,
    },
    {
      id: "9",
      date: "01 de novembro",
      merchant: "Farmácia São Paulo",
      type: "saúde",
      amount: -285.40,
    },
    {
      id: "10",
      date: "01 de novembro",
      merchant: "Supermercado Extra",
      type: "supermercado",
      amount: -898.24,
    },
  ];

  const currentCard = cards[currentCardIndex];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(value));
  };

  const handleCopyCardNumber = () => {
    toast({
      title: "Número copiado",
      description: "Número do cartão copiado para a área de transferência",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/home")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-medium">Cartões</h1>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSettings(true)}
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-help">
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Card Carousel */}
          <div className="relative">
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-4 snap-x snap-mandatory">
                {cards.map((card, index) => (
                  <div
                    key={card.id}
                    className="flex-shrink-0 w-[85vw] max-w-[380px] snap-center"
                    onClick={() => setCurrentCardIndex(index)}
                  >
                    <div
                      className="relative aspect-[1.586/1] cursor-pointer bg-black rounded-2xl overflow-hidden"
                      onClick={() => setShowCardBack(!showCardBack)}
                      data-testid={`card-${index}`}
                    >
                      {/* Front Card Image */}
                      <img
                        src={cardFrontPath}
                        alt="Frente do cartão"
                        className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-300 ${
                          showCardBack ? 'opacity-0 invisible' : 'opacity-100 visible'
                        }`}
                      />
                      
                      {/* Back Card Image */}
                      <img
                        src={cardBackPath}
                        alt="Verso do cartão"
                        className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-300 ${
                          showCardBack ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                      />
                      
                      {/* Nome do usuário sobreposto */}
                      {userData && !showCardBack && (
                        <div className="absolute bottom-[22%] left-[10%] text-white text-[10px] font-medium uppercase tracking-wide z-10">
                          {userData.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Fatura Aberta */}
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fatura aberta</p>
                <p className="text-2xl font-semibold">R$ 5.433,14</p>
                <p className="text-xs text-muted-foreground">
                  Melhor data de compra: <span className="font-medium">21 nov</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Débito automático <span className="text-green-600 font-medium">ativado</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                data-testid="button-access-invoice"
              >
                Acessar fatura
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Limite Disponível */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Limite disponível</p>
                <p className="text-xl font-semibold">R$ 500.000,00</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* Milhas e Benefícios */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Milhas e Benefícios</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                data-testid="button-access-benefits"
              >
                Acessar
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Antecipar Pagamento */}
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            data-testid="button-advance-payment"
          >
            Antecipar pagamento
          </Button>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4">
            <button
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover-elevate active-elevate-2"
              data-testid="button-card-management"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-center leading-tight">Gestão do cartão</span>
            </button>

            <button
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover-elevate active-elevate-2"
              data-testid="button-virtual-card"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-center leading-tight">Cartão virtual</span>
            </button>

            <button
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover-elevate active-elevate-2"
              data-testid="button-card-limit"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-center leading-tight">Limite do cartão</span>
            </button>

            <button
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover-elevate active-elevate-2"
              data-testid="button-card-security"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-center leading-tight">Segurança do cartão</span>
            </button>
          </div>

          {/* Últimos Lançamentos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Últimos lançamentos</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                data-testid="button-filters"
              >
                <Settings className="w-4 h-4 mr-1" />
                Filtros
              </Button>
            </div>

            {/* Transactions by Date */}
            <div className="space-y-4">
              {Object.entries(
                transactions.reduce((acc, transaction) => {
                  const date = transaction.date;
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(transaction);
                  return acc;
                }, {} as Record<string, typeof transactions>)
              ).map(([date, dayTransactions]) => (
                <div key={date} className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">{date}</p>
                  {dayTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{transaction.merchant}</p>
                        <p className="text-xs text-muted-foreground">{transaction.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatCurrency(transaction.amount)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* View All Button */}
            <Button
              variant="outline"
              className="w-full h-12 text-base"
              data-testid="button-view-all"
            >
              Acessar todos
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Configurações do Cartão</SheetTitle>
            <SheetDescription>
              Gerencie as configurações e segurança do seu cartão
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {/* Bloquear/Desbloquear Cartão */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {cardLocked ? (
                    <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                      <Lock className="w-5 h-5 text-red-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Lock className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {cardLocked ? "Cartão bloqueado" : "Cartão desbloqueado"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cardLocked ? "Nenhuma compra será autorizada" : "Compras autorizadas normalmente"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={cardLocked ? "default" : "destructive"}
                  size="sm"
                  onClick={() => {
                    setCardLocked(!cardLocked);
                    toast({
                      title: cardLocked ? "Cartão desbloqueado" : "Cartão bloqueado",
                      description: cardLocked 
                        ? "Seu cartão foi desbloqueado e pode ser usado normalmente" 
                        : "Seu cartão foi bloqueado temporariamente",
                    });
                  }}
                  data-testid="button-toggle-lock"
                >
                  {cardLocked ? "Desbloquear" : "Bloquear"}
                </Button>
              </div>
            </div>

            {/* Ver Senha */}
            <button
              className="w-full bg-card border rounded-lg p-4 flex items-center justify-between hover-elevate active-elevate-2"
              onClick={() => {
                toast({
                  title: "Senha do cartão",
                  description: "Por segurança, verifique sua identidade no app",
                });
              }}
              data-testid="button-view-password"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Ver senha</p>
                  <p className="text-xs text-muted-foreground">Consulte a senha do seu cartão</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Copiar Número do Cartão */}
            <button
              className="w-full bg-card border rounded-lg p-4 flex items-center justify-between hover-elevate active-elevate-2"
              onClick={() => {
                toast({
                  title: "Número copiado",
                  description: "Número do cartão copiado para área de transferência",
                });
              }}
              data-testid="button-copy-number"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Copy className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Copiar número do cartão</p>
                  <p className="text-xs text-muted-foreground">Final {currentCard.lastDigits}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Alterar Limite */}
            <button
              className="w-full bg-card border rounded-lg p-4 flex items-center justify-between hover-elevate active-elevate-2"
              onClick={() => {
                toast({
                  title: "Alterar limite",
                  description: "Você pode solicitar aumento ou redução do limite",
                });
              }}
              data-testid="button-change-limit"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Alterar limite</p>
                  <p className="text-xs text-muted-foreground">Limite atual: R$ 500.000,00</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Cancelar Cartão */}
            <button
              className="w-full bg-card border rounded-lg p-4 flex items-center justify-between hover-elevate active-elevate-2"
              onClick={() => {
                toast({
                  title: "Cancelar cartão",
                  description: "Esta ação não pode ser desfeita. Confirme com nossa central",
                  variant: "destructive",
                });
              }}
              data-testid="button-cancel-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm text-red-600">Cancelar cartão</p>
                  <p className="text-xs text-muted-foreground">Cancelamento permanente</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Compras Online */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Compras online</p>
                    <p className="text-xs text-muted-foreground">Habilitado</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" data-testid="button-toggle-online">
                  Desabilitar
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
