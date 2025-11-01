import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Moon, Sun, Monitor, Globe, Fingerprint, Lock, Shield, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    setTimeout(() => {
      setLocation("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/home")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo size="sm" />
            <h1 className="font-semibold">Configurações</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
            <CardDescription>
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ana Maria Silva</p>
                <p className="text-sm text-muted-foreground">ana@inwista.com</p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-edit-profile">
                Editar
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Alterar senha</p>
                  <p className="text-sm text-muted-foreground">
                    Atualize sua senha de acesso
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" data-testid="button-change-password">
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>
              Personalize a interface do aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={theme} onValueChange={(value) => setTheme(value as any)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 bg-muted">
                    <Sun className="h-4 w-4" />
                  </div>
                  <Label htmlFor="light" className="cursor-pointer">
                    Claro
                  </Label>
                </div>
                <RadioGroupItem value="light" id="light" data-testid="radio-theme-light" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 bg-muted">
                    <Moon className="h-4 w-4" />
                  </div>
                  <Label htmlFor="dark" className="cursor-pointer">
                    Escuro
                  </Label>
                </div>
                <RadioGroupItem value="dark" id="dark" data-testid="radio-theme-dark" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 bg-muted">
                    <Monitor className="h-4 w-4" />
                  </div>
                  <Label htmlFor="system" className="cursor-pointer">
                    Sistema
                  </Label>
                </div>
                <RadioGroupItem value="system" id="system" data-testid="radio-theme-system" />
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
            <CardDescription>
              Ajuste suas preferências de uso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-muted">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Idioma</p>
                  <p className="text-sm text-muted-foreground">
                    Português (Brasil)
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" data-testid="button-change-language">
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>
              Proteja sua conta com recursos avançados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-muted">
                  <Fingerprint className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Biometria</p>
                  <p className="text-sm text-muted-foreground">
                    Acesso rápido com impressão digital
                  </p>
                </div>
              </div>
              <Switch defaultChecked data-testid="switch-biometrics" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-muted">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Autenticação em duas etapas</p>
                  <p className="text-sm text-muted-foreground">
                    Camada extra de proteção
                  </p>
                </div>
              </div>
              <Switch defaultChecked data-testid="switch-2fa" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacidade</CardTitle>
            <CardDescription>
              Gerencie seus dados e privacidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-privacy-policy">
              Política de privacidade
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-terms">
              Termos de uso
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardContent className="p-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da conta
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Versão 1.0.0
        </p>
      </main>
    </div>
  );
}
