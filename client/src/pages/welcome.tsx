import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
