import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CPFInput } from "@/components/cpf-input";
import { useLocation } from "wouter";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    localStorage.removeItem("inwista-pending-auth");
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: { cpf: string; password: string }) => {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao fazer login");
      }
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("inwista-pending-auth", JSON.stringify(data));
      setLocation("/two-fa");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cpf.replace(/\D/g, "").length !== 11) {
      toast({
        variant: "destructive",
        title: "CPF inválido",
        description: "Por favor, digite um CPF válido com 11 dígitos",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha inválida",
        description: "A senha deve ter no mínimo 6 caracteres",
      });
      return;
    }

    loginMutation.mutate({ cpf, password });
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="bg-white">
          <CardHeader className="space-y-4 pt-8 pb-6">
            <div className="space-y-3 text-center">
              <CardTitle className="text-2xl font-medium">Para começar, qual é o número do seu CPF?</CardTitle>
              <CardDescription className="text-base">Digite seu CPF e senha</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-base">CPF</Label>
                <CPFInput
                  id="cpf"
                  value={cpf}
                  onChange={setCpf}
                  disabled={loginMutation.isPending}
                  autoFocus
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">Qual a sua senha de acesso?</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loginMutation.isPending}
                    placeholder="Digite sua senha"
                    className="h-12 text-base pr-12"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-blue-900 mb-1">Credenciais de demonstração:</p>
                  <p className="text-blue-800">CPF: <span className="font-mono font-semibold">123.456.789-00</span></p>
                  <p className="text-blue-800">Senha: <span className="font-mono font-semibold">123456</span></p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full min-h-12 text-base font-medium"
                disabled={loginMutation.isPending}
                data-testid="button-submit"
              >
                {loginMutation.isPending ? "Entrando..." : "Continuar"}
              </Button>

              <button
                type="button"
                className="w-full text-base text-primary hover:underline"
                onClick={() => {
                  toast({
                    title: "Recuperação de senha",
                    description: "Esta funcionalidade será implementada em breve",
                  });
                }}
                data-testid="link-forgot-password"
              >
                Esqueci minha senha
              </button>
            </form>

            <div className="mt-8 pt-6 border-t">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
