import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { ArrowLeft, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TwoFA() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/home");
    }, 1000);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setCode(value);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/login")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <Logo size="md" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl">Vamos ativar o token no seu novo dispositivo</CardTitle>
              <CardDescription>
                É só continuar para receber um código de validação por e-mail e SMS.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="default"
              className="w-full"
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
                <span className="bg-card px-2 text-muted-foreground">
                  Ou digite o código
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">É só digitar o código de 8 dígitos que enviamos por SMS e e-mail</Label>
                <div className="text-sm text-muted-foreground mb-2">
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
                  disabled={isLoading}
                  data-testid="input-code"
                  className="text-center text-lg tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  O código foi enviado. Você pode pedir um novo em 17 segundos.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || code.length !== 8}
                data-testid="button-verify"
              >
                {isLoading ? "Verificando..." : "Verificar código"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
