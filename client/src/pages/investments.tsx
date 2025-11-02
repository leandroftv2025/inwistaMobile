import { useState, useEffect } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, TrendingUp, Shield, Clock, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Investments() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isInitialized } = useAuth();
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState("products");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");

  const safeNumber = (value: any): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isInitialized, isAuthenticated, setLocation]);

  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['/api/investments/products'],
    enabled: isInitialized && isAuthenticated && !!userId,
  });

  const { data: myInvestments = [], isLoading: isLoadingPortfolio, error: portfolioError } = useQuery({
    queryKey: [`/api/investments/portfolio/${userId}`],
    enabled: isInitialized && isAuthenticated && !!userId,
  });

  const investMutation = useMutation({
    mutationFn: async (data: { userId: string; productId: string; amount: string }) => {
      const response = await apiRequest("/api/investments/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
        throw new Error(errorData.message || "Erro ao processar investimento");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/investments/portfolio/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      
      toast({
        title: "Investimento realizado!",
        description: `${formatCurrency(parseFloat(investmentAmount))} aplicado com sucesso`,
      });
      
      setSelectedProduct(null);
      setInvestmentAmount("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro no investimento",
        description: error.message || "Não foi possível realizar o investimento",
      });
    },
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Baixo":
        return "text-green-600 dark:text-green-400 bg-green-500/10";
      case "Médio":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10";
      case "Alto":
        return "text-red-600 dark:text-red-400 bg-red-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const handleInvest = () => {
    if (!selectedProduct || !investmentAmount || parseFloat(investmentAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Selecione um produto e informe o valor",
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

    const product = products.find((p: any) => p.id === selectedProduct);
    const minimumAmount = safeNumber(product?.minimum);
    
    if (product && safeNumber(investmentAmount) < minimumAmount) {
      toast({
        variant: "destructive",
        title: "Valor mínimo",
        description: `O valor mínimo para este investimento é ${formatCurrency(minimumAmount)}`,
      });
      return;
    }

    investMutation.mutate({
      userId,
      productId: selectedProduct,
      amount: investmentAmount,
    });
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
        <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
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
            <Logo size="sm" />
            <h1 className="font-semibold">Investimentos</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" data-testid="tab-products">
              Produtos
            </TabsTrigger>
            <TabsTrigger value="portfolio" data-testid="tab-portfolio">
              Minha Carteira
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Produtos disponíveis</CardTitle>
                <CardDescription>
                  Escolha o investimento ideal para você
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingProducts ? (
                  <div className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : productsError ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-destructive">
                      Erro ao carregar produtos.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/investments/products'] })}
                      data-testid="button-retry-products"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum produto disponível no momento
                  </p>
                ) : (
                  products.map((product: any) => (
                  <Card
                    key={product.id}
                    className="hover-elevate cursor-pointer active-elevate-2"
                    onClick={() => setSelectedProduct(product.id)}
                    data-testid={`product-${product.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{product.category}</Badge>
                            <Badge className={getRiskColor(product.risk)}>
                              <Shield className="h-3 w-3 mr-1" />
                              {product.risk}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono tabular-nums">
                            +{safeNumber(product.expectedReturn)}%
                          </p>
                          <p className="text-xs text-muted-foreground">ao ano</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {product.description}
                      </p>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Mínimo</p>
                          <p className="font-semibold font-mono tabular-nums">
                            {formatCurrency(safeNumber(product.minimum))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Liquidez
                          </p>
                          <p className="font-semibold">{product.liquidity}</p>
                        </div>
                      </div>

                      {selectedProduct === product.id && (
                        <div className="mt-4 space-y-4 pt-4 border-t">
                          <div className="space-y-2">
                            <Label htmlFor={`amount-${product.id}`}>Valor do investimento</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                R$
                              </span>
                              <Input
                                id={`amount-${product.id}`}
                                type="number"
                                placeholder="0,00"
                                value={investmentAmount}
                                onChange={(e) => setInvestmentAmount(e.target.value)}
                                className="pl-10"
                                step="0.01"
                                min={safeNumber(product.minimum)}
                                data-testid="input-investment-amount"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Mínimo: {formatCurrency(safeNumber(product.minimum))}
                            </p>
                          </div>

                          {investmentAmount && safeNumber(investmentAmount) >= safeNumber(product.minimum) && (
                            <Card className="bg-muted">
                              <CardContent className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground">Rendimento estimado (1 ano)</p>
                                  <p className="font-semibold font-mono tabular-nums text-green-600 dark:text-green-400">
                                    +{formatCurrency(safeNumber(investmentAmount) * (safeNumber(product.expectedReturn) / 100))}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          <Button
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInvest();
                            }}
                            disabled={investMutation.isPending}
                            data-testid="button-confirm-investment"
                          >
                            {investMutation.isPending ? "Processando..." : "Investir agora"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <Card className="bg-gradient-to-br from-chart-3/10 via-chart-3/5 to-transparent">
              <CardContent className="p-6 space-y-4">
                {isLoadingPortfolio ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total investido</p>
                      <p className="text-2xl font-bold font-mono tabular-nums" data-testid="text-total-invested">
                        {formatCurrency(myInvestments.reduce((sum: number, inv: any) => sum + safeNumber(inv.amount), 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rendimento total</p>
                      <p className="text-2xl font-bold font-mono tabular-nums text-green-600 dark:text-green-400" data-testid="text-total-return">
                        +{formatCurrency(myInvestments.reduce((sum: number, inv: any) => sum + safeNumber(inv.return), 0))}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meus investimentos</CardTitle>
                <CardDescription>
                  Acompanhe seus rendimentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingPortfolio ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : portfolioError ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-destructive">
                      Erro ao carregar portfólio.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/investments/portfolio/${userId}`] })}
                      data-testid="button-retry-portfolio"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : myInvestments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Você ainda não possui investimentos
                  </p>
                ) : (
                  myInvestments.map((investment: any) => (
                    <div key={investment.id} data-testid={`investment-${investment.id}`}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full p-2 bg-chart-3/10">
                            <TrendingUp className="h-4 w-4 text-chart-3" />
                          </div>
                          <div>
                            <p className="font-medium">{investment.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              Investido: {formatCurrency(safeNumber(investment.amount))}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold font-mono tabular-nums">
                            {formatCurrency(safeNumber(investment.currentValue))}
                          </p>
                          <p className="text-sm font-semibold font-mono tabular-nums text-green-600 dark:text-green-400">
                            +{formatCurrency(safeNumber(investment.return))} ({safeNumber(investment.returnPercentage).toFixed(2)}%)
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
    </div>
  );
}
