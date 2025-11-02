import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";

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
    onSuccess: (data) => {
      localStorage.removeItem("inwista-pending-auth");
      login(data.user.id, data.user);
      toast({
        title: "Verificação concluída!",
        description: "Bem-vindo à Inwista",
      });
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card>
          <CardHeader className="space-y-3 px-4 py-6 md:px-6 md:py-8">
            <div className="space-y-2">
              <CardTitle className="text-lg md:text-xl leading-tight">Vamos ativar o token no seu novo dispositivo</CardTitle>
              <CardDescription className="text-sm md:text-base">
                É só continuar para receber um código de validação por e-mail e SMS.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-6 md:px-6 md:pb-8">
            <Button
              variant="default"
              className="w-full min-h-11 md:min-h-12 text-base font-medium"
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

            <div className="relative my-5 md:my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Ou digite o código
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="code" className="text-sm md:text-base leading-snug">É só digitar o código de 8 dígitos que enviamos por SMS e e-mail</Label>
                <div className="text-xs md:text-sm text-muted-foreground">
                  <a href="#" className="text-primary hover:underline">
                    Conferir e-mail ou celular cadastrado
                  </a>
                </div>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="Digite o código"
                  maxLength={8}
                  disabled={verifyMutation.isPending}
                  data-testid="input-code"
                  className="text-center text-base md:text-lg tracking-widest font-mono h-12 md:h-14"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  O código foi enviado. Você pode pedir um novo em 17 segundos.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs md:text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Para demonstração:</p>
                  <p className="text-blue-800 dark:text-blue-200">Digite qualquer código de <span className="font-mono font-semibold">8 dígitos</span></p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full min-h-11 md:min-h-12 text-base font-medium"
                disabled={verifyMutation.isPending || code.length !== 8}
                data-testid="button-verify"
              >
                {verifyMutation.isPending ? "Verificando..." : "Verificar código"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
