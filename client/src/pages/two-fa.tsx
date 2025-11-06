import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import logoPath from "@assets/logo-inwista.png";

export default function TwoFA() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [code, setCode] = useState("");
  const [pendingAuth, setPendingAuth] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("inwista-pending-auth");
    if (stored) {
      setPendingAuth(JSON.parse(stored));
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!pendingAuth?.userId) {
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      }
      const response = await apiRequest("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, userId: pendingAuth.userId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao verificar código");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      localStorage.removeItem("inwista-pending-auth");
      
      // Atualiza o estado de autenticação ANTES de redirecionar
      login(data.user.id, data.user);
      
      toast({
        title: "Verificação concluída!",
        description: "Bem-vindo à Inwista",
      });
      
      // Pequeno delay para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      setLocation("/home");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro na verificação",
        description: error.message,
      });
      setCode("");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 8) {
      toast({
        variant: "destructive",
        title: "Código inválido",
        description: "Por favor, digite o código de 8 dígitos",
      });
      return;
    }

    verifyMutation.mutate(code);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setCode(value);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header com logo no canto superior direito */}
      <header className="p-4 flex items-center justify-end">
        <img src={logoPath} alt="Logo" className="h-8 sm:h-10" />
      </header>

      {/* Conteúdo principal em tela cheia */}
      <main className="flex-1 flex flex-col justify-center px-6 pb-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-2xl font-normal text-left">
              Vamos ativar o token no seu novo dispositivo
            </h1>
            <p className="text-sm text-muted-foreground">
              É só continuar para receber um código de validação por e-mail e SMS.
            </p>
          </div>

          <div className="space-y-6">
            <Button
              variant="default"
              className="w-full min-h-12 text-base font-medium bg-[#103549] hover:bg-[#1a4d68]"
              onClick={() => {
                toast({
                  title: "Código enviado!",
                  description: "Verifique seu e-mail e SMS",
                });
              }}
              data-testid="button-send-code"
            >
              Continuar
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou digite o código
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="code" className="text-base">
                  É só digitar o código de 8 dígitos que enviamos por SMS e e-mail
                </Label>
                <div className="text-sm text-muted-foreground">
                  <a href="#" className="text-primary hover:underline">
                    Conferir e-mail ou celular cadastrado
                  </a>
                </div>
                <Input
                  id="code"
                  type="tel"
                  inputMode="numeric"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="Digite o código"
                  maxLength={8}
                  disabled={verifyMutation.isPending}
                  data-testid="input-code"
                  className="text-center text-lg tracking-widest font-mono h-14"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  O código foi enviado. Você pode pedir um novo em 17 segundos.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Para demonstração:</p>
                  <p className="text-blue-800 dark:text-blue-200">Digite qualquer código de <span className="font-mono font-semibold">8 dígitos</span></p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full min-h-12 text-base font-medium bg-[#103549] hover:bg-[#1a4d68]"
                disabled={verifyMutation.isPending || code.length !== 8}
                data-testid="button-verify"
              >
                {verifyMutation.isPending ? "Verificando..." : "Verificar código"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
