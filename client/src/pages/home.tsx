import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Coins,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  PiggyBank,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showBalance, setShowBalance] = useState(true);
  
  const balance = 15420.50;
  const totalInvested = 8500.00;
  const returnAmount = 425.75;

  const products = [
    {
      slug: "pix",
      name: "PIX",
      icon: Zap,
      description: "Transferências instantâneas",
      enabled: true,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      slug: "stablecoin",
      name: "StableCOIN",
      icon: Coins,
      description: "BRL ↔ stable conversion",
      enabled: true,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      slug: "investments",
      name: "Investimentos",
      icon: TrendingUp,
      description: "Aplicações e retornos",
      enabled: true,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      slug: "card",
      name: "Cartão",
      icon: CreditCard,
      description: "Débito e crédito",
      enabled: false,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    {
      slug: "fx-remittance",
      name: "Câmbio",
      icon: Globe,
      description: "Envios internacionais",
      enabled: false,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  const recentActivity = [
    {
      id: "1",
      type: "pix-received",
      description: "Transferência recebida",
      name: "Maria Silva",
      amount: 250.00,
      date: new Date(),
      positive: true,
    },
    {
      id: "2",
      type: "investment",
      description: "Rendimento",
      name: "CDB Liquidez Diária",
      amount: 42.50,
      date: new Date(Date.now() - 86400000),
      positive: true,
    },
    {
      id: "3",
      type: "pix-sent",
      description: "Transferência enviada",
      name: "João Santos",
      amount: -150.00,
      date: new Date(Date.now() - 172800000),
      positive: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <Badge variant="secondary" className="hidden sm:flex">
              Olá, Ana
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/settings")}
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Patrimônio</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-3xl font-bold font-mono tabular-nums" data-testid="text-balance">
                    {showBalance ? formatCurrency(balance) : "••••••"}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBalance(!showBalance)}
                    data-testid="button-toggle-balance"
                  >
                    {showBalance ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total investido</p>
                <p className="text-lg font-semibold font-mono tabular-nums" data-testid="text-invested">
                  {showBalance ? formatCurrency(totalInvested) : "••••••"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rendimento</p>
                <p className="text-lg font-semibold font-mono tabular-nums text-green-600 dark:text-green-400" data-testid="text-return">
                  {showBalance ? `+${formatCurrency(returnAmount)}` : "••••••"}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="default" className="flex-1" onClick={() => setLocation("/pix")} data-testid="button-quick-pix">
                <Zap className="h-4 w-4 mr-2" />
                PIX
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setLocation("/investments")} data-testid="button-quick-invest">
                <PiggyBank className="h-4 w-4 mr-2" />
                Investir
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Produtos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card
                key={product.slug}
                className={`hover-elevate ${!product.enabled ? "opacity-60" : "cursor-pointer active-elevate-2"}`}
                onClick={() => product.enabled && setLocation(`/${product.slug}`)}
                data-testid={`card-product-${product.slug}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-full p-3 ${product.bgColor}`}>
                      <product.icon className={`h-6 w-6 ${product.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        {!product.enabled && (
                          <Badge variant="secondary" className="text-xs">
                            Em breve
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Atividades</CardTitle>
            <CardDescription>Transações recentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
                data-testid={`activity-${activity.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${activity.positive ? "bg-green-500/10" : "bg-muted"}`}>
                    {activity.positive ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(activity.date)}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold font-mono tabular-nums ${activity.positive ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
                  {activity.amount > 0 ? "+" : ""}
                  {formatCurrency(Math.abs(activity.amount))}
                </p>
              </div>
            ))}

            <Button variant="link" className="w-full" data-testid="button-view-all">
              Ver todas as atividades
            </Button>
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-4 right-4">
        <Button
          variant="default"
          size="icon"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setLocation("/support")}
          data-testid="button-help"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
