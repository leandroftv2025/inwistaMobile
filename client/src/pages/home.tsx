import { ThemeToggle } from "@/components/theme-toggle";
import { BottomNav } from "@/components/bottom-nav";
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
  Settings,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import type { User, PixTransaction, StablecoinTransaction, Investment } from "@shared/schema";
import pixIconPath from "@assets/pix-icon.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showBalance, setShowBalance] = useState(true);
  const { user, isAuthenticated, isInitialized } = useAuth();
  const { t } = useLanguage();
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

  const allTransactions = [
    ...pixTransactions.map((tx) => ({
      id: `pix-${tx.id}`,
      type: tx.type === 'sent' ? 'pix-sent' : 'pix-received',
      description: tx.type === 'sent' ? t('pix.transferSent') : t('pix.transferReceived'),
      name: tx.recipientKey || tx.description || 'PIX',
      amount: tx.type === 'sent' ? -parseFloat(tx.amount) : parseFloat(tx.amount),
      date: new Date(tx.createdAt),
      positive: tx.type === 'received',
    })),
    ...stablecoinTransactions.map((tx) => ({
      id: `stable-${tx.id}`,
      type: 'stablecoin',
      description: tx.type === 'buy' ? t('stablecoin.purchaseDescription') : t('stablecoin.saleDescription'),
      name: 'StableCOIN',
      amount: tx.type === 'buy' ? -parseFloat(tx.amountBRL || '0') : parseFloat(tx.amountBRL || '0'),
      date: new Date(tx.createdAt),
      positive: tx.type === 'sell',
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const quickActions = [
    {
      slug: 'pix',
      icon: pixIconPath,
      name: 'PIX',
      description: 'Transferências',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      enabled: true,
      isImage: true,
    },
    {
      slug: 'stablecoin',
      icon: Coins,
      name: 'StableCOIN',
      description: 'BRL ↔ Stable',
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      enabled: true,
      isImage: false,
    },
    {
      slug: 'investments',
      icon: TrendingUp,
      name: 'Investimentos',
      description: 'Aplicar',
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
      enabled: true,
      isImage: false,
    },
    {
      slug: 'card',
      icon: CreditCard,
      name: 'Cartão',
      description: 'Débito e crédito',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      enabled: false,
      isImage: false,
    },
    {
      slug: 'fx-remittance',
      icon: Globe,
      name: 'Câmbio e Remessas',
      description: 'Envios internacionais',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      enabled: false,
      isImage: false,
    },
  ];

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
              {t("common.hello")}, {userData?.name?.split(' ')[0] || 'Usuário'}
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

      <main className="container mx-auto px-4 py-6 pb-24 max-w-6xl space-y-6">
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
                    <p className="text-sm text-muted-foreground">{t("home.balance")}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-3xl font-semibold tabular-nums tracking-tight" data-testid="text-balance-brl">
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
                    <p className="text-sm text-muted-foreground">{t("home.netWorth")}</p>
                    <p className="text-lg font-semibold tabular-nums tracking-tight" data-testid="text-networth">
                      {showBalance ? formatCurrency(netWorth) : "••••••"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("home.totalInvested")}</p>
                    <p className="text-lg font-semibold tabular-nums tracking-tight" data-testid="text-invested">
                      {showBalance ? formatCurrency(totalInvested) : "••••••"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-3 min-w-max">
            {quickActions.map((action) => (
              <button
                key={action.slug}
                onClick={() => action.enabled && setLocation(`/${action.slug}`)}
                disabled={!action.enabled}
                className={`flex-shrink-0 bg-card rounded-2xl p-4 flex flex-col items-center gap-2 min-w-[140px] border transition-all ${
                  action.enabled 
                    ? 'hover-elevate active-elevate-2 cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                data-testid={`button-quick-${action.slug}`}
              >
                <div className={`rounded-full p-3 ${action.bgColor}`}>
                  {action.isImage ? (
                    <img src={action.icon as string} alt={action.name} className="h-6 w-6" />
                  ) : (
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{action.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("home.recentTransactions")}</CardTitle>
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
                {t("home.noActivity")}
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
                  <p className={`font-semibold tabular-nums tracking-tight ${activity.positive ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
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
      </main>

      <BottomNav />
    </div>
  );
}
