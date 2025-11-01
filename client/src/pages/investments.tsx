import { useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, TrendingUp, Shield, Clock, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Investments() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");

  const products = [
    {
      id: "1",
      name: "CDB Liquidez Diária",
      category: "Renda Fixa",
      risk: "Baixo",
      expectedReturn: 12.5,
      minimum: 100,
      liquidity: "Liquidez diária",
      description: "Invista com segurança e liquidez imediata",
    },
    {
      id: "2",
      name: "Fundo Multimercado",
      category: "Fundos",
      risk: "Médio",
      expectedReturn: 15.8,
      minimum: 500,
      liquidity: "D+30",
      description: "Diversificação com gestão profissional",
    },
    {
      id: "3",
      name: "Tesouro Selic",
      category: "Renda Fixa",
      risk: "Baixo",
      expectedReturn: 11.2,
      minimum: 50,
      liquidity: "D+1",
      description: "Investimento mais seguro do Brasil",
    },
    {
      id: "4",
      name: "Ações Tech",
      category: "Renda Variável",
      risk: "Alto",
      expectedReturn: 22.5,
      minimum: 1000,
      liquidity: "D+2",
      description: "Potencial de alta rentabilidade",
    },
  ];

  const myInvestments = [
    {
      id: "1",
      productName: "CDB Liquidez Diária",
      amount: 5000,
      currentValue: 5287.50,
      return: 287.50,
      returnPercentage: 5.75,
    },
    {
      id: "2",
      productName: "Tesouro Selic",
      amount: 3500,
      currentValue: 3638.25,
      return: 138.25,
      returnPercentage: 3.95,
    },
  ];

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

    const product = products.find(p => p.id === selectedProduct);
    if (product && parseFloat(investmentAmount) < product.minimum) {
      toast({
        variant: "destructive",
        title: "Valor mínimo",
        description: `O valor mínimo para este investimento é ${formatCurrency(product.minimum)}`,
      });
      return;
    }

    toast({
      title: "Investimento realizado!",
      description: `${formatCurrency(parseFloat(investmentAmount))} aplicado com sucesso`,
    });

    setSelectedProduct(null);
    setInvestmentAmount("");
  };

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
                {products.map((product) => (
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
                            +{product.expectedReturn}%
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
                            {formatCurrency(product.minimum)}
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
                                min={product.minimum}
                                data-testid="input-investment-amount"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Mínimo: {formatCurrency(product.minimum)}
                            </p>
                          </div>

                          {investmentAmount && parseFloat(investmentAmount) >= product.minimum && (
                            <Card className="bg-muted">
                              <CardContent className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground">Rendimento estimado (1 ano)</p>
                                  <p className="font-semibold font-mono tabular-nums text-green-600 dark:text-green-400">
                                    +{formatCurrency(parseFloat(investmentAmount) * (product.expectedReturn / 100))}
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
                            data-testid="button-confirm-investment"
                          >
                            Investir agora
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <Card className="bg-gradient-to-br from-chart-3/10 via-chart-3/5 to-transparent">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total investido</p>
                    <p className="text-2xl font-bold font-mono tabular-nums" data-testid="text-total-invested">
                      {formatCurrency(myInvestments.reduce((sum, inv) => sum + inv.amount, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rendimento total</p>
                    <p className="text-2xl font-bold font-mono tabular-nums text-green-600 dark:text-green-400" data-testid="text-total-return">
                      +{formatCurrency(myInvestments.reduce((sum, inv) => sum + inv.return, 0))}
                    </p>
                  </div>
                </div>
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
                {myInvestments.map((investment) => (
                  <div key={investment.id} data-testid={`investment-${investment.id}`}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full p-2 bg-chart-3/10">
                          <TrendingUp className="h-4 w-4 text-chart-3" />
                        </div>
                        <div>
                          <p className="font-medium">{investment.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Investido: {formatCurrency(investment.amount)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold font-mono tabular-nums">
                          {formatCurrency(investment.currentValue)}
                        </p>
                        <p className="text-sm font-semibold font-mono tabular-nums text-green-600 dark:text-green-400">
                          +{formatCurrency(investment.return)} ({investment.returnPercentage.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
