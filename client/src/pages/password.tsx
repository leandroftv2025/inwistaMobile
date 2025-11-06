import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, Delete, Shield } from "lucide-react";
import logoPath from "@assets/logo-inwista.png";

export default function Password() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [pressedButton, setPressedButton] = useState<number | null>(null);

  useEffect(() => {
    const storedCpf = localStorage.getItem("inwista-cpf");
    if (!storedCpf) {
      setLocation("/login");
      return;
    }
    setCpf(storedCpf);
  }, [setLocation]);

  const { data: userData } = useQuery<{ name: string }>({
    queryKey: [`/api/auth/user-by-cpf/${cpf}`],
    enabled: !!cpf,
  });

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
        title: "Senha incorreta",
        description: error.message,
      });
      setPassword("");
    },
  });

  const handleNumberPress = (digit: string, buttonIndex: number) => {
    if (password.length < 6) {
      setPressedKey(digit);
      setPressedButton(buttonIndex);
      setTimeout(() => {
        setPressedKey(null);
        setPressedButton(null);
      }, 150);
      setPassword(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPressedKey("backspace");
    setTimeout(() => setPressedKey(null), 150);
    setPassword(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (password.length !== 6) {
      toast({
        variant: "destructive",
        title: "Senha incompleta",
        description: "Digite todos os 6 dígitos da senha",
      });
      return;
    }

    loginMutation.mutate({ cpf, password });
  };

  useEffect(() => {
    if (password.length === 6) {
      handleSubmit();
    }
  }, [password]);

  const keypadButtons = [
    { label: "5 ou 8", digits: ["5", "8"] },
    { label: "4 ou 0", digits: ["4", "0"] },
    { label: "6 ou 1", digits: ["6", "1"] },
    { label: "3 ou 2", digits: ["3", "2"] },
    { label: "9 ou 7", digits: ["9", "7"] },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="w-12 h-12">
          <img src={logoPath} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="text-center flex-1">
          <p className="text-sm text-muted-foreground">{userData?.name || "Carregando..."}</p>
          <button
            className="text-xs text-primary hover:underline"
            onClick={() => setLocation("/login")}
            data-testid="link-change-account"
          >
            TROCAR CONTA
          </button>
        </div>
        <div className="w-12" /> {/* Spacer for alignment */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Password Dots */}
        <div className="flex gap-3 mb-12">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < password.length ? "bg-foreground" : "bg-muted"
              }`}
              data-testid={`password-dot-${i}`}
            />
          ))}
        </div>

        <h2 className="text-xl font-normal mb-16 text-center">Digite sua senha.</h2>

        {/* Numeric Keypad */}
        <div className="w-full max-w-sm space-y-4">
          {/* First Row */}
          <div className="grid grid-cols-3 gap-4">
            {keypadButtons.slice(0, 3).map((btn, idx) => (
              <div 
                key={idx} 
                className={`relative aspect-square rounded-full flex items-center justify-center p-2 transition-all ${
                  pressedButton === idx
                    ? "bg-[#103549]"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-center justify-center gap-2 w-full h-full">
                  {btn.digits.map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleNumberPress(digit, idx)}
                      className={`min-h-11 min-w-11 rounded-full text-base font-medium transition-colors flex items-center justify-center ${
                        pressedButton === idx
                          ? "text-white"
                          : "text-foreground"
                      }`}
                      data-testid={`button-key-${digit}`}
                    >
                      {digit}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-3 gap-4">
            {keypadButtons.slice(3).map((btn, idx) => {
              const buttonIndex = idx + 3;
              return (
                <div 
                  key={idx} 
                  className={`relative aspect-square rounded-full flex items-center justify-center p-2 transition-all ${
                    pressedButton === buttonIndex
                      ? "bg-[#103549]"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 w-full h-full">
                    {btn.digits.map((digit) => (
                      <button
                        key={digit}
                        onClick={() => handleNumberPress(digit, buttonIndex)}
                        className={`min-h-11 min-w-11 rounded-full text-base font-medium transition-colors flex items-center justify-center ${
                          pressedButton === buttonIndex
                            ? "text-white"
                            : "text-foreground"
                        }`}
                        data-testid={`button-key-${digit}`}
                      >
                        {digit}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <button
              onClick={handleBackspace}
              className={`aspect-square rounded-full flex items-center justify-center transition-all ${
                pressedKey === "backspace"
                  ? "bg-[#103549] text-white"
                  : "bg-muted text-foreground"
              }`}
              data-testid="button-backspace"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={password.length !== 6 || loginMutation.isPending}
              className="w-24 h-24 rounded-full bg-[#0a1f2e] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#103549] transition-colors"
              data-testid="button-submit"
            >
              <ArrowRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 pb-8 flex items-center justify-center gap-1 text-sm">
        <button
          onClick={() => {
            toast({
              title: "Gerar Token",
              description: "Esta funcionalidade será implementada em breve",
            });
          }}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          data-testid="button-generate-token"
        >
          <Shield className="w-4 h-4" />
          <span>GERAR TOKEN</span>
        </button>
        <span className="text-muted-foreground mx-2">|</span>
        <button
          onClick={() => {
            toast({
              title: "Recuperação de senha",
              description: "Esta funcionalidade será implementada em breve",
            });
          }}
          className="text-foreground hover:text-primary transition-colors"
          data-testid="button-forgot-password"
        >
          ESQUECI A SENHA
        </button>
      </footer>

    </div>
  );
}
