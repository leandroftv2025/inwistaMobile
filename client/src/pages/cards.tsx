import { useState } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, CreditCard, Lock, TrendingUp, ChevronRight, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import cardFrontPath from "@assets/card-front.png";
import cardBackPath from "@assets/card-back.png";

export default function Cards() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const { toast } = useToast();
  const [showCardBack, setShowCardBack] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  // Dados simulados de cartões
  const cards = [
    {
      id: "1",
      name: "Latam Pass Itau Black",
      type: "Crédito",
      lastDigits: "9678",
      brand: "mastercard",
    },
    {
      id: "2",
      name: "Personnalite Black",
      type: "Crédito",
      lastDigits: "7111",
      brand: "mastercard",
    },
  ];

  // Dados simulados de transações
  const transactions = [
    {
      id: "1",
      date: "ontem, 04 de novembro",
      merchant: "adobe",
      type: "cartão virtual",
      amount: -47.50,
    },
    {
      id: "2",
      date: "ontem, 04 de novembro",
      merchant: "adobe",
      type: "cartão virtual",
      amount: -47.50,
    },
    {
      id: "3",
      date: "02 de novembro",
      merchant: "netflix.com",
      type: "cartão virtual",
      amount: -44.90,
    },
    {
      id: "4",
      date: "01 de novembro",
      merchant: "netflix.com",
      type: "cartão virtual",
      amount: -44.90,
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
            <Button variant="ghost" size="icon" data-testid="button-sort">
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
                      className="relative aspect-[1.586/1] cursor-pointer"
                      onClick={() => setShowCardBack(!showCardBack)}
                      data-testid={`card-${index}`}
                    >
                      {!showCardBack ? (
                        <div className="relative w-full h-full">
                          <img
                            src={cardFrontPath}
                            alt="Frente do cartão"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                          {/* Nome do usuário sobreposto */}
                          {userData && 'name' in userData && (
                            <div className="absolute bottom-6 left-6 text-white/90 text-sm font-medium uppercase tracking-wider">
                              {(userData as { name: string }).name}
                            </div>
                          )}
                          {/* Info do cartão */}
                          <div className="absolute top-6 left-6 text-white space-y-1">
                            <p className="text-sm font-medium">{card.name}</p>
                            <p className="text-xs opacity-80">{card.type}</p>
                          </div>
                          <div className="absolute top-6 right-6 text-white text-sm font-medium">
                            final {card.lastDigits}
                          </div>
                        </div>
                      ) : (
                        <img
                          src={cardBackPath}
                          alt="Verso do cartão"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pagination dots */}
            <div className="flex justify-center gap-2 mt-2">
              {cards.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentCardIndex
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
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
                <p className="text-xl font-semibold">R$ 32,82</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* Milhas e Benefícios */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Milhas e Benefícios Latam</p>
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

            {/* Alert */}
            <div className="bg-muted/50 border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Alívio para o seu cartão</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aproveite a solução disponível para continuar em dia
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
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
    </div>
  );
}
