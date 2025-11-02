import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Shield,
  User,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { User as UserType } from "@shared/schema";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isInitialized } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isInitialized, isAuthenticated, setLocation]);

  const { data: userData, isLoading: isLoadingUser } = useQuery<UserType>({
    queryKey: [`/api/user/${userId}`],
    enabled: !!userId,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/home")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Perfil</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Avatar and Basic Info */}
        <Card>
          <CardContent className="p-6">
            {isLoadingUser ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" alt={userData?.name || 'Usuário'} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {userData?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'US'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h2 className="text-2xl font-bold" data-testid="text-user-name">
                    {userData?.name || 'Usuário'}
                  </h2>
                  <p className="text-sm text-muted-foreground" data-testid="text-user-email">
                    {userData?.email || 'email@inwista.com'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Badge variant="secondary">Cliente Inwista</Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Conta Ativa
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Seus dados cadastrados na Inwista</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingUser ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 rounded-lg hover-elevate" data-testid="info-cpf">
                  <div className="p-2 rounded-md bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{userData?.cpf || '123.456.789-00'}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3 p-3 rounded-lg hover-elevate" data-testid="info-email">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{userData?.email || 'ana.silva@email.com'}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3 p-3 rounded-lg hover-elevate" data-testid="info-phone">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">(11) 98765-4321</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3 p-3 rounded-lg hover-elevate" data-testid="info-address">
                  <div className="p-2 rounded-md bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium">São Paulo, SP - Brasil</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3 p-3 rounded-lg hover-elevate" data-testid="info-member-since">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Cliente desde</p>
                    <p className="font-medium">Janeiro 2024</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Resumo Financeiro
            </CardTitle>
            <CardDescription>Seus saldos e investimentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingUser ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" data-testid="summary-balance-brl">
                  <p className="text-sm text-muted-foreground">Saldo em Reais (BRL)</p>
                  <p className="text-2xl font-bold font-mono tabular-nums mt-1">
                    {formatCurrency(parseFloat(userData?.balanceBRL || '0'))}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-chart-2/10 via-chart-2/5 to-transparent" data-testid="summary-balance-stable">
                  <p className="text-sm text-muted-foreground">Saldo em StableCOIN</p>
                  <p className="text-2xl font-bold font-mono tabular-nums mt-1">
                    {formatCurrency(parseFloat(userData?.balanceStable || '0'))} USDT
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-chart-3/10 via-chart-3/5 to-transparent" data-testid="summary-investments">
                  <p className="text-sm text-muted-foreground">Total Investido</p>
                  <p className="text-2xl font-bold font-mono tabular-nums mt-1">
                    {formatCurrency(parseFloat(userData?.totalInvested || '0'))}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setLocation("/settings")}
            data-testid="button-edit-profile"
          >
            Editar Perfil
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setLocation("/support")}
            data-testid="button-contact-support"
          >
            Falar com Suporte
          </Button>
        </div>
      </main>
    </div>
  );
}
