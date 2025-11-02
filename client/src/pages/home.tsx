import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import type { User, PixTransaction, StablecoinTransaction, Investment } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showBalance, setShowBalance] = useState(true);
  const { user, isAuthenticated, isInitialized } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isInitialized, isAuthenticated, setLocation]);

  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/user/${userId}`],
    enabled: !!userId,
  });

  const { data: pixTransactions = [], isLoading: isLoadingPix } = useQuery<PixTransaction[]>({
    queryKey: [`/api/pix/transactions/${userId}`],
    enabled: !!userId,
  });

  const { data: stablecoinTransactions = [], isLoading: isLoadingStable } = useQuery<StablecoinTransaction[]>({
    queryKey: [`/api/stablecoin/transactions/${userId}`],
    enabled: !!userId,
  });

  const { data: userInvestments = [], isLoading: isLoadingInvestments } = useQuery<Investment[]>({
    queryKey: [`/api/investments/portfolio/${userId}`],
    enabled: !!userId,
  });

  interface CatalogItem {
    slug: string;
    name: string;
    category: string;
    short: string;
    enabled: boolean;
  }

  const { data: catalogData = [], isLoading: isLoadingCatalog } = useQuery<CatalogItem[]>({
    queryKey: ['/api/catalog'],
  });

  interface RateData {
    rate: string;
    spread: string;
    timestamp: string;
  }

  const { data: rateData } = useQuery<RateData>({
    queryKey: ['/api/stablecoin/rate'],
  });

  const balance = parseFloat(userData?.balanceBRL || '0');
  const balanceStable = parseFloat(userData?.balanceStable || '0');
  const conversionRate = parseFloat(rateData?.rate || '5.25');
  const totalInvested = userInvestments
    .filter(inv => inv.status === 'active')
    .reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0);
  const netWorth = (balanceStable * conversionRate) + totalInvested + balance;

  const iconMap: Record<string, any> = {
    "pix": { icon: Zap, color: "text-primary", bgColor: "bg-primary/10" },
    "stablecoin": { icon: Coins, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    "investments": { icon: TrendingUp, color: "text-chart-3", bgColor: "bg-chart-3/10" },
    "card": { icon: CreditCard, color: "text-muted-foreground", bgColor: "bg-muted" },
    "fx-remittance": { icon: Globe, color: "text-muted-foreground", bgColor: "bg-muted" },
    "support": { icon: HelpCircle, color: "text-muted-foreground", bgColor: "bg-muted" },
  };

  const products = catalogData
    .filter((p) => p.slug !== 'support')
    .map((product) => ({
      ...product,
      description: product.short,
      icon: iconMap[product.slug]?.icon || HelpCircle,
      color: product.enabled ? iconMap[product.slug]?.color : "text-muted-foreground",
      bgColor: product.enabled ? iconMap[product.slug]?.bgColor : "bg-muted",
    }));

  const allTransactions = [
    ...pixTransactions.map((tx) => ({
      id: `pix-${tx.id}`,
      type: tx.type === 'sent' ? 'pix-sent' : 'pix-received',
      description: tx.type === 'sent' ? 'Transferência enviada' : 'Transferência recebida',
      name: tx.recipientKey || tx.description || 'PIX',
      amount: tx.type === 'sent' ? -parseFloat(tx.amount) : parseFloat(tx.amount),
      date: new Date(tx.createdAt),
      positive: tx.type === 'received',
    })),
    ...stablecoinTransactions.map((tx) => ({
      id: `stable-${tx.id}`,
      type: 'stablecoin',
      description: tx.type === 'buy' ? 'Compra de stable' : 'Venda de stable',
      name: 'StableCOIN',
      amount: tx.type === 'buy' ? -parseFloat(tx.amountBRL || '0') : parseFloat(tx.amountBRL || '0'),
      date: new Date(tx.createdAt),
      positive: tx.type === 'sell',
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/profile")}
              data-testid="button-profile"
              className="rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={userData?.name || 'Usuário'} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {userData?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'US'}
                </AvatarFallback>
              </Avatar>
            </Button>
            <Badge variant="secondary" className="hidden sm:flex">
              Olá, {userData?.name?.split(' ')[0] || 'Usuário'}
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
            {isLoadingUser ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-64" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo BRL</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-3xl font-bold font-mono tabular-nums" data-testid="text-balance-brl">
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
                    <p className="text-sm text-muted-foreground">Patrimônio</p>
                    <p className="text-lg font-semibold font-mono tabular-nums" data-testid="text-networth">
                      {showBalance ? formatCurrency(netWorth) : "••••••"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total investido</p>
                    <p className="text-lg font-semibold font-mono tabular-nums" data-testid="text-invested">
                      {showBalance ? formatCurrency(totalInvested) : "••••••"}
                    </p>
                  </div>
                </div>
              </>
            )}

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

        <Card>
          <CardHeader>
            <CardTitle>Atividades</CardTitle>
            <CardDescription>Transações recentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingPix || isLoadingStable ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : allTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma atividade recente
              </p>
            ) : (
              allTransactions.map((activity) => (
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
                    {activity.amount > 0 && "+"}
                    {formatCurrency(activity.amount)}
                  </p>
                </div>
              ))
            )}

            <Button variant="ghost" className="w-full" data-testid="button-view-all">
              Ver todas as atividades
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Produtos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingCatalog ? (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            ) : (
              products.map((product: any) => (
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
              ))
            )}
          </div>
        </div>
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
