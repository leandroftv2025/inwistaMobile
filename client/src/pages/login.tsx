import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CPFInput } from "@/components/cpf-input";
import { useLocation } from "wouter";
import { ArrowLeft, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/two-fa");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/")}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <Logo size="md" />
            </div>
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl">Para começar, qual é o número do seu CPF?</CardTitle>
              <CardDescription>Digite seu CPF</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <CPFInput
                  id="cpf"
                  value={cpf}
                  onChange={setCpf}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Qual a sua senha de acesso?</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Digite sua senha"
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading ? "Entrando..." : "Continuar"}
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full text-sm"
                onClick={() => {
                  toast({
                    title: "Recuperação de senha",
                    description: "Esta funcionalidade será implementada em breve",
                  });
                }}
                data-testid="link-forgot-password"
              >
                Esqueci minha senha
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
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

            <div className="fixed bottom-4 right-4">
              <Button variant="outline" size="icon" className="rounded-full h-14 w-14" data-testid="button-help">
                <HelpCircle className="h-6 w-6" />
              </Button>
              <p className="text-xs text-center mt-1">Precisa de<br />ajuda?</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
