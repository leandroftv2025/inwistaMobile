import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
import avatarImage from "@assets/Avatar_1762372356219.jpg";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-primary flex flex-col relative">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
        <Logo className="h-24 md:h-32" />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-end px-6 pb-8 pt-24 md:pt-32">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center">
            <img 
              src={avatarImage} 
              alt="Homem de negócios"
              className="w-48 h-auto md:w-64 object-contain"
            />
          </div>

          <div className="text-left space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
              Sua Conta<br/>Genial
            </h1>
            <p className="text-base md:text-lg text-white/90">
              A conta digital 100% grátis que traz<br/>
              seus investimentos para o centro da<br/>
              sua vida financeira.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full bg-white hover:bg-white/95 text-primary border-0 text-base font-semibold min-h-14 rounded-full uppercase"
              onClick={() => setLocation("/login")}
              data-testid="button-open-account"
            >
              Quero abrir uma conta
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent hover:bg-white/10 text-white border-2 border-white text-base font-semibold min-h-14 rounded-full uppercase"
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
