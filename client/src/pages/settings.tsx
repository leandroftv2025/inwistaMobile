import { ThemeToggle } from "@/components/theme-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { useTheme } from "@/lib/theme-provider";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
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
  const { language, setLanguage, t } = useLanguage();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast({
      title: t("settings.logoutConfirm"),
      description: t("settings.logoutMessage"),
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
            <h1 className="font-semibold">{t("settings.title")}</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.account")}</CardTitle>
            <CardDescription>
              {t("settings.accountInfo")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ana Maria Silva</p>
                <p className="text-sm text-muted-foreground">ana@inwista.com</p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-edit-profile">
                {t("common.edit")}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{t("settings.changePassword")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.changePasswordDesc")}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" data-testid="button-change-password">
                {t("common.edit")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.appearance")}</CardTitle>
            <CardDescription>
              {t("settings.appearanceDesc")}
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
                    {t("settings.light")}
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
                    {t("settings.dark")}
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
                    {t("settings.system")}
                  </Label>
                </div>
                <RadioGroupItem value="system" id="system" data-testid="radio-theme-system" />
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.preferences")}</CardTitle>
            <CardDescription>
              {t("settings.preferencesDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-muted">
                  <Globe className="h-4 w-4" />
                </div>
                <p className="font-medium">{t("settings.language")}</p>
              </div>
              
              <RadioGroup value={language} onValueChange={(value) => setLanguage(value as any)}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pt-BR" className="cursor-pointer">
                    Português (Brasil)
                  </Label>
                  <RadioGroupItem value="pt-BR" id="pt-BR" data-testid="radio-language-pt-br" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="en-US" className="cursor-pointer">
                    English (USA)
                  </Label>
                  <RadioGroupItem value="en-US" id="en-US" data-testid="radio-language-en-us" />
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.security")}</CardTitle>
            <CardDescription>
              {t("settings.securityDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2 bg-muted">
                  <Fingerprint className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{t("settings.biometrics")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.biometricsDesc")}
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
                  <p className="font-medium">{t("settings.twoFactor")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.twoFactorDesc")}
                  </p>
                </div>
              </div>
              <Switch defaultChecked data-testid="switch-2fa" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.privacy")}</CardTitle>
            <CardDescription>
              {t("settings.privacyDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-privacy-policy">
              {t("settings.privacyPolicy")}
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-terms">
              {t("settings.termsOfUse")}
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
              {t("settings.logout")}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          {t("settings.version")} 1.0.0
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
