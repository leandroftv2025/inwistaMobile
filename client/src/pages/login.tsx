import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CPFInput } from "@/components/cpf-input";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

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
    
    if (cpf.replace(/\D/g, "").length !== 11) {
      toast({
        variant: "destructive",
        title: "CPF inválido",
        description: "Por favor, digite um CPF válido com 11 dígitos",
      });
      return;
    }

    localStorage.setItem("inwista-cpf", cpf);
    setLocation("/password");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="bg-white">
          <CardHeader className="space-y-4 pt-8 pb-6">
            <div className="space-y-3 text-center">
              <CardTitle className="text-2xl font-medium">Para começar, qual é o número do seu CPF?</CardTitle>
              <CardDescription className="text-base">Digite seu CPF para continuar</CardDescription>
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
                  autoFocus
                  className="h-12 text-base"
                  data-testid="input-cpf"
                />
              </div>

              <div className="pt-2 space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-blue-900 mb-1">CPF de demonstração:</p>
                  <p className="text-blue-800">CPF: <span className="font-mono font-semibold">123.456.789-00</span></p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full min-h-12 text-base font-medium"
                data-testid="button-submit"
              >
                Continuar
              </Button>
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
