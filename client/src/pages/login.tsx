import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { CPFInput } from "@/components/cpf-input";
import { ArrowLeft } from "lucide-react";
import logoInwista from '/attached_assets/logo-inwista.png?url';

function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "");
  
  // CPF de demonstração - exceção à regra
  if (cleanCPF === "12345678900") return true;
  
  if (cleanCPF.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  if (parseInt(cleanCPF.charAt(9)) !== digit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  if (parseInt(cleanCPF.charAt(10)) !== digit2) return false;
  
  return true;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    localStorage.removeItem("inwista-pending-auth");
    localStorage.removeItem("inwista-cpf");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCPF(cpf)) {
      toast({
        variant: "destructive",
        title: "CPF inválido",
        description: "Por favor, digite um CPF válido",
      });
      return;
    }

    // Verifica se o CPF está cadastrado
    try {
      const response = await fetch(`/api/auth/user-by-cpf/${cpf}`);
      
      if (response.status === 404) {
        // CPF válido mas não cadastrado - redireciona para cadastro
        toast({
          title: "CPF não cadastrado",
          description: "Vamos criar sua conta!",
        });
        localStorage.setItem("inwista-register-cpf", cpf);
        setLocation("/register");
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao verificar CPF");
      }

      // CPF cadastrado - continua para senha
      localStorage.setItem("inwista-cpf", cpf);
      setLocation("/password");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível verificar o CPF. Tente novamente.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={() => setLocation("/")}
          className="w-12 h-12 flex items-center justify-center text-foreground hover:text-primary transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1" />
        <img src={logoInwista} alt="Logo" className="h-8 sm:h-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-6 pb-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-normal text-left">
              Para começar, qual é o número do seu CPF?
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <CPFInput
                id="cpf"
                value={cpf}
                onChange={setCpf}
                autoFocus
                placeholder="000.000.000-00"
                className="h-14 text-lg"
                data-testid="input-cpf"
              />
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-[#103549] text-white rounded-md font-medium text-lg hover:bg-[#0a2838] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cpf.replace(/\D/g, "").length !== 11}
              data-testid="button-submit"
            >
              Continuar
            </button>
          </form>

          <div className="pt-4">
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-1">CPF de demonstração:</p>
              <p className="text-sm text-muted-foreground">
                CPF: <span className="font-mono font-semibold text-foreground">123.456.789-00</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 pb-8">
        <p className="text-sm text-muted-foreground text-center">
          Ao continuar, estou de acordo com a{" "}
          <a href="#" className="text-primary hover:underline">
            Política de privacidade
          </a>{" "}
          e{" "}
          <a href="#" className="text-primary hover:underline">
            Termos de uso
          </a>
        </p>
      </footer>
    </div>
  );
}
