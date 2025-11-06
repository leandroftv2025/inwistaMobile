import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Delete, Shield } from "lucide-react";
import logoPath from "@assets/logo-inwista.png";

function generateRandomKeypadPairs() {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  
  const pairs = [];
  for (let i = 0; i < digits.length; i += 2) {
    pairs.push({
      label: `${digits[i]} ou ${digits[i + 1]}`,
      digits: [digits[i].toString(), digits[i + 1].toString()]
    });
  }
  
  return pairs;
}

export default function Password() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedSequence, setSelectedSequence] = useState<string[][]>([]);
  const [cpf, setCpf] = useState("");
  const [pressedButton, setPressedButton] = useState<number | null>(null);
  
  const keypadButtons = useMemo(() => generateRandomKeypadPairs(), []);

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

  const validateSequenceMutation = useMutation({
    mutationFn: async (data: { cpf: string; sequence: string[][] }) => {
      const response = await apiRequest("/api/auth/validate-keypad-sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sequência inválida");
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
      setSelectedSequence([]);
    },
  });

  const handleBallPress = (pair: string[], buttonIndex: number) => {
    if (selectedSequence.length >= 6 || !cpf) return;

    setPressedButton(buttonIndex);
    setTimeout(() => {
      setPressedButton(null);
    }, 150);

    setSelectedSequence(prev => [...prev, pair]);
  };

  const handleBackspace = () => {
    setSelectedSequence(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (selectedSequence.length === 6) {
      validateSequenceMutation.mutate({ cpf, sequence: selectedSequence });
    }
  }, [selectedSequence]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <img src={logoPath} alt="Logo" className="h-8 sm:h-10" />
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
                i < selectedSequence.length ? "bg-foreground" : "bg-muted"
              }`}
              data-testid={`password-dot-${i}`}
            />
          ))}
        </div>

        <h2 className="text-xl font-normal mb-16 text-center">Digite sua senha.</h2>

        {/* Numeric Keypad */}
        <div className="w-full max-w-sm space-y-4">
          {/* First Row */}
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {keypadButtons.slice(0, 3).map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleBallPress(btn.digits, idx)}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  pressedButton === idx
                    ? "bg-[#103549]"
                    : "bg-muted"
                }`}
                data-testid={`button-ball-${idx}`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`text-2xl font-medium ${
                    pressedButton === idx ? "text-white" : "text-foreground"
                  }`}>
                    {btn.digits[0]}
                  </span>
                  <span className={`text-base font-semibold ${
                    pressedButton === idx ? "text-white/90" : "text-muted-foreground"
                  }`}>
                    ou
                  </span>
                  <span className={`text-2xl font-medium ${
                    pressedButton === idx ? "text-white" : "text-foreground"
                  }`}>
                    {btn.digits[1]}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {keypadButtons.slice(3).map((btn, idx) => {
              const buttonIndex = idx + 3;
              return (
                <button
                  key={idx}
                  onClick={() => handleBallPress(btn.digits, buttonIndex)}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    pressedButton === buttonIndex
                      ? "bg-[#103549]"
                      : "bg-muted"
                  }`}
                  data-testid={`button-ball-${buttonIndex}`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`text-2xl font-medium ${
                      pressedButton === buttonIndex ? "text-white" : "text-foreground"
                    }`}>
                      {btn.digits[0]}
                    </span>
                    <span className={`text-base font-semibold ${
                      pressedButton === buttonIndex ? "text-white/90" : "text-muted-foreground"
                    }`}>
                      ou
                    </span>
                    <span className={`text-2xl font-medium ${
                      pressedButton === buttonIndex ? "text-white" : "text-foreground"
                    }`}>
                      {btn.digits[1]}
                    </span>
                  </div>
                </button>
              );
            })}
            <button
              onClick={handleBackspace}
              className="w-24 h-24 rounded-full flex items-center justify-center transition-all bg-muted text-foreground hover-elevate active-elevate-2"
              data-testid="button-backspace"
            >
              <Delete className="w-6 h-6" />
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
