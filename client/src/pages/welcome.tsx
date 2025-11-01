import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, TrendingUp, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-chart-2/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Que bom te ver aqui!
          </h1>
          <p className="text-muted-foreground">
            Vamos começar sua jornada financeira
          </p>
        </div>

        <div className="space-y-4">
          <Card className="hover-elevate">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">PIX Instantâneo</h3>
                <p className="text-sm text-muted-foreground">
                  Transferências rápidas e seguras
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-chart-2/10 p-3">
                <Shield className="h-6 w-6 text-chart-2" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">StableCOIN</h3>
                <p className="text-sm text-muted-foreground">
                  Conversão BRL com segurança
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-chart-3/10 p-3">
                <TrendingUp className="h-6 w-6 text-chart-3" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Investimentos</h3>
                <p className="text-sm text-muted-foreground">
                  Faça seu dinheiro render
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => setLocation("/login")}
          data-testid="button-get-started"
        >
          Vamos começar!
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <a href="#" className="underline hover:text-foreground">
            Termos de uso
          </a>{" "}
          e{" "}
          <a href="#" className="underline hover:text-foreground">
            Política de privacidade
          </a>
        </p>
      </div>
    </div>
  );
}
