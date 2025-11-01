import { useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ArrowLeft, ArrowDownUp, TrendingUp, TrendingDown } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function StableCOIN() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("trade");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");

  const balanceBRL = 15420.50;
  const balanceStable = 1250.75;
  const rate = 5.25;

  const transactions = [
    {
      id: "1",
      type: "buy",
      amountBRL: 1000.00,
      amountStable: 190.48,
      rate: 5.25,
      fee: 5.00,
      date: new Date(),
      status: "completed",
    },
    {
      id: "2",
      type: "sell",
      amountBRL: 500.00,
      amountStable: 95.24,
      rate: 5.25,
      fee: 2.50,
      date: new Date(Date.now() - 86400000),
      status: "completed",
    },
  ];

  const handleTrade = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "Digite um valor válido para a conversão",
      });
      return;
    }

    const convertedAmount = tradeType === "buy"
      ? parseFloat(amount) / rate
      : parseFloat(amount) * rate;

    toast({
      title: `${tradeType === "buy" ? "Compra" : "Venda"} realizada!`,
      description: `${formatCurrency(parseFloat(amount))} ${tradeType === "buy" ? "BRL" : "Stable"} convertido para ${formatCurrency(convertedAmount)} ${tradeType === "buy" ? "Stable" : "BRL"}`,
    });

    setAmount("");
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
            <h1 className="font-semibold">StableCOIN</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Card className="bg-gradient-to-br from-chart-2/10 via-chart-2/5 to-transparent">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Saldo BRL</p>
                <p className="text-2xl font-bold font-mono tabular-nums" data-testid="text-balance-brl">
                  {formatCurrency(balanceBRL)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Stable</p>
                <p className="text-2xl font-bold font-mono tabular-nums" data-testid="text-balance-stable">
                  {formatCurrency(balanceStable, "STABLE")}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Taxa atual</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold font-mono tabular-nums" data-testid="text-rate">
                  {formatCurrency(rate)} / Stable
                </p>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.5%
                </Badge>
              </div>
            </div>
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
                          type="number"
                          placeholder="0,00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className={tradeType === "buy" ? "pl-10" : ""}
                          step="0.01"
                          min="0"
                          data-testid="input-amount"
                        />
                      </div>
                    </div>

                    {amount && parseFloat(amount) > 0 && (
                      <Card className="bg-muted">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">
                              {tradeType === "buy" ? "Você receberá" : "Você receberá"}
                            </p>
                            <p className="font-semibold font-mono tabular-nums" data-testid="text-converted">
                              {tradeType === "buy"
                                ? formatCurrency(parseFloat(amount) / rate, "STABLE")
                                : formatCurrency(parseFloat(amount) * rate)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <p className="text-muted-foreground">Taxa</p>
                            <p className="font-mono tabular-nums">
                              {formatCurrency(parseFloat(amount) * 0.005)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      className="w-full"
                      onClick={handleTrade}
                      data-testid="button-confirm-trade"
                    >
                      {tradeType === "buy" ? "Comprar" : "Vender"} StableCOIN
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
                {transactions.map((transaction) => (
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
                            Taxa: {formatCurrency(transaction.rate)} / Stable
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(transaction.date)}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {transaction.status === "completed" ? "Concluído" : "Pendente"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold font-mono tabular-nums">
                          {transaction.type === "buy" ? "-" : "+"}
                          {formatCurrency(transaction.amountBRL)}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono tabular-nums">
                          {transaction.type === "buy" ? "+" : "-"}
                          {formatCurrency(transaction.amountStable, "STABLE")}
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
