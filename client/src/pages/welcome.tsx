import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-primary flex flex-col relative">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
        <Logo className="h-32 md:h-48" />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 pt-24 md:pt-32">
        <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
              Que bom te ver aqui!
            </h1>
            <p className="text-2xl md:text-3xl text-white/90">
              Vamos começar?
            </p>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full bg-white hover:bg-white/95 text-primary border-0 text-lg font-medium min-h-14 rounded-lg"
              onClick={() => setLocation("/login")}
              data-testid="button-open-account"
            >
              Quero abrir uma conta
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent hover:bg-white/10 text-white border-2 border-white text-lg font-medium min-h-14 rounded-lg"
              onClick={() => setLocation("/login")}
              data-testid="button-access-account"
            >
              Acessar conta
            </Button>
          </div>
        </div>
      </div>

      <div className="pb-6 px-6 space-y-4">
        <div className="flex justify-center">
          <a 
            href="https://cdn.botpress.cloud/webchat/v3.3/shareable.html?configUrl=https://files.bpcontent.cloud/2025/07/30/19/20250730192657-TWYHIX4W.json"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            data-testid="link-help"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Precisa de ajuda?</span>
          </a>
        </div>
        
        <p className="text-center text-xs text-white/60">
          Ao continuar, você concorda com nossos{" "}
          <a href="#" className="underline hover:text-white/80">
            Termos de uso
          </a>{" "}
          e{" "}
          <a href="#" className="underline hover:text-white/80">
            Política de privacidade
          </a>
        </p>
      </div>
    </div>
  );
}
