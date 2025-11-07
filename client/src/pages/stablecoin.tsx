import { useState, useEffect, type ChangeEvent } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PasswordAuthorization } from "@/components/password-authorization";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ArrowLeft, ArrowDownUp, TrendingUp, TrendingDown } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function StableCOIN() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isInitialized } = useAuth();
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState("trade");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isInitialized, isAuthenticated, setLocation]);

  // Format currency input with Brazilian formatting
  const formatBRLInput = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) return '';
    
    // Converte para centavos
    const cents = parseInt(numbers, 10);
    
    // Formata com separadores brasileiros
    const reais = (cents / 100).toFixed(2);
    const [intPart, decPart] = reais.split('.');
    
    // Adiciona pontos de milhar
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formattedInt},${decPart}`;
  };

  // Parse Brazilian formatted currency to number
  const parseBRLInput = (value: string): number => {
    if (!value) return 0;
    // Remove pontos e substitui vírgula por ponto
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBRLInput(e.target.value);
    setAmount(formatted);
  };

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/user/${userId}`],
    enabled: isInitialized && isAuthenticated && !!userId,
  });

  const { data: rateData, isLoading: isLoadingRate } = useQuery({
    queryKey: ['/api/stablecoin/rate'],
    enabled: isInitialized && isAuthenticated && !!userId,
  });

  const { data: transactions = [], isLoading: isLoadingTransactions, error: transactionsError } = useQuery({
    queryKey: [`/api/stablecoin/transactions/${userId}`],
    enabled: isInitialized && isAuthenticated && !!userId,
  });

  const balanceBRL = typeof userData?.balanceBRL === 'number' ? userData.balanceBRL : parseFloat(userData?.balanceBRL ?? "0");
  const balanceStable = typeof userData?.balanceStable === 'number' ? userData.balanceStable : parseFloat(userData?.balanceStable ?? "0");
  const rate = parseFloat(rateData?.rate ?? "5.25");

  const convertMutation = useMutation({
    mutationFn: async (data: { userId: string; type: "buy" | "sell"; amount: string }) => {
      const response = await apiRequest("/api/stablecoin/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
        throw new Error(errorData.message || "Erro ao processar conversão");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/stablecoin/transactions/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      
      toast({
        title: `${tradeType === "buy" ? "Compra" : "Venda"} realizada!`,
        description: `Conversão concluída com sucesso`,
      });
      
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro na conversão",
        description: error.message || "Não foi possível realizar a conversão",
      });
    },
  });

  const handleTrade = () => {
    const numericAmount = parseBRLInput(amount);
    
    if (!amount || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "Digite um valor válido para a conversão",
      });
      return;
    }

    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado",
      });
      return;
    }

    setPendingTransaction({
      userId,
      type: tradeType,
      amount: numericAmount.toString(),
    });
    setShowPasswordDialog(true);
  };

  const handlePasswordAuthorization = async (password: string) => {
    if (!userId || !pendingTransaction) return;

    try {
      const validateResponse = await apiRequest("/api/auth/validate-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      if (!validateResponse.ok) {
        const error = await validateResponse.json();
        toast({
          variant: "destructive",
          title: "Senha inválida",
          description: error.message || "A senha informada está incorreta",
        });
        return;
      }

      setShowPasswordDialog(false);
      convertMutation.mutate(pendingTransaction);
      setPendingTransaction(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao validar senha",
        description: "Tente novamente",
      });
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-10 w-10" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 pb-24 max-w-4xl space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/home")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">StableCOIN</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 max-w-4xl space-y-6">
        <Card className="bg-gradient-to-br from-chart-2/10 via-chart-2/5 to-transparent">
          <CardContent className="p-6 space-y-4">
            {isLoadingUser ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Separator />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Saldo BRL</p>
                    <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums break-words" data-testid="text-balance-brl">
                      {formatCurrency(balanceBRL)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Saldo Stable</p>
                    <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums break-words" data-testid="text-balance-stable">
                      {new Intl.NumberFormat("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(balanceStable)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Taxa atual</p>
                  {isLoadingRate ? (
                    <Skeleton className="h-8 w-40" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold font-mono tabular-nums" data-testid="text-rate">
                        {formatCurrency(rate)} / Stable
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{(parseFloat(rateData?.spread ?? "0.005") * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trade" data-testid="tab-trade">
              Negociar
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Converter moeda</CardTitle>
                <CardDescription>
                  Compre ou venda StableCOIN com taxa competitiva
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as "buy" | "sell")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy" data-testid="button-buy">
                      Comprar
                    </TabsTrigger>
                    <TabsTrigger value="sell" data-testid="button-sell">
                      Vender
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        {tradeType === "buy" ? "Valor em BRL" : "Valor em Stable"}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {tradeType === "buy" ? "R$" : ""}
                        </span>
                        <Input
                          id="amount"
                          type="text"
                          inputMode="numeric"
                          placeholder="0,00"
                          value={amount}
                          onChange={handleAmountChange}
                          className={tradeType === "buy" ? "pl-10" : ""}
                          data-testid="input-amount"
                        />
                      </div>
                    </div>

                    {amount && parseBRLInput(amount) > 0 && (
                      <Card className="bg-muted">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">
                              {tradeType === "buy" ? "Você receberá" : "Você receberá"}
                            </p>
                            <p className="font-semibold font-mono tabular-nums" data-testid="text-converted">
                              {tradeType === "buy"
                                ? formatCurrency(parseBRLInput(amount) / rate, "STABLE")
                                : formatCurrency(parseBRLInput(amount) * rate)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <p className="text-muted-foreground">Taxa</p>
                            <p className="font-mono tabular-nums">
                              {formatCurrency(parseBRLInput(amount) * 0.005)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      className="w-full"
                      onClick={handleTrade}
                      disabled={convertMutation.isPending}
                      data-testid="button-confirm-trade"
                    >
                      {convertMutation.isPending ? "Processando..." : `${tradeType === "buy" ? "Comprar" : "Vender"} StableCOIN`}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Taxa de conversão: {formatCurrency(rate)} / Stable
                      <br />
                      Spread: 0.5%
                    </p>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de conversões</CardTitle>
                <CardDescription>
                  Todas as suas transações de StableCOIN
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingTransactions ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : transactionsError ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-destructive">
                      Erro ao carregar transações.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/stablecoin/transactions/${userId}`] })}
                      data-testid="button-retry-transactions"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma transação encontrada
                  </p>
                ) : (
                  transactions.map((transaction: any) => (
                    <div key={transaction.id} data-testid={`transaction-${transaction.id}`}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full p-2 ${transaction.type === "buy" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                            <ArrowDownUp className={`h-4 w-4 ${transaction.type === "buy" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} />
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.type === "buy" ? "Compra" : "Venda"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Taxa: {formatCurrency(parseFloat(transaction.rate))} / Stable
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(new Date(transaction.timestamp))}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                Concluído
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold font-mono tabular-nums">
                            {transaction.type === "buy" ? "-" : "+"}
                            {formatCurrency(parseFloat(transaction.amountBRL))}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono tabular-nums">
                            {transaction.type === "buy" ? "+" : "-"}
                            {formatCurrency(parseFloat(transaction.amountStable), "STABLE")}
                          </p>
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
      <PasswordAuthorization
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onAuthorize={handlePasswordAuthorization}
        title="Autorizar conversão"
        description={`Digite sua senha para confirmar a ${tradeType === "buy" ? "compra" : "venda"} de StableCOIN`}
      />
    </div>
  );
}
