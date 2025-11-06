import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, Pencil, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/logo-inwista.png";

interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  confirmPassword: string;
}

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  
  // CPF de demonstração - exceção à regra
  if (cleanCPF === "12345678900") return true;
  
  if (cleanCPF.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;
  
  if (parseInt(cleanCPF.charAt(9)) !== firstDigit) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;
  
  if (parseInt(cleanCPF.charAt(10)) !== secondDigit) return false;
  
  return true;
};

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    confirmPassword: "",
  });

  // Verifica se há CPF pré-preenchido vindo do login
  useEffect(() => {
    const storedCPF = localStorage.getItem("inwista-register-cpf");
    if (storedCPF) {
      setFormData(prev => ({ ...prev, cpf: storedCPF }));
      // Inicia do step 1 (nome), mas com CPF já preenchido
      localStorage.removeItem("inwista-register-cpf");
    }
  }, []);

  const createAccountMutation = useMutation({
    mutationFn: async (data: Omit<RegistrationData, "confirmPassword">) => {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login na sua conta.",
      });
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{0,4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const handleNext = () => {
    if (step === 1 && !formData.fullName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu nome completo.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && (!formData.email.trim() || !formData.email.includes("@"))) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, informe um e-mail válido.",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && formData.phone.replace(/\D/g, "").length < 10) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, informe um telefone válido.",
        variant: "destructive",
      });
      return;
    }
    if (step === 4) {
      if (!validateCPF(formData.cpf)) {
        toast({
          title: "CPF inválido",
          description: "Por favor, informe um CPF válido.",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 5) {
      if (!formData.password || formData.password.length !== 6) {
        toast({
          title: "Senha inválida",
          description: "A senha deve ter exatamente 6 dígitos numéricos.",
          variant: "destructive",
        });
        return;
      }
      if (!/^\d{6}$/.test(formData.password)) {
        toast({
          title: "Senha inválida",
          description: "A senha deve conter apenas números.",
          variant: "destructive",
        });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Senhas não conferem",
          description: "Por favor, certifique-se de que as senhas são iguais.",
          variant: "destructive",
        });
        return;
      }
    }

    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setLocation("/");
    }
  };

  const handleConfirm = () => {
    const { confirmPassword, ...dataToSend } = formData;
    createAccountMutation.mutate(dataToSend);
  };

  const handleEdit = (editStep: number) => {
    setStep(editStep);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header com botão voltar à esquerda e logo no canto superior direito */}
      <header className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="w-12 h-12 flex items-center justify-center text-foreground hover:text-primary transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-4">
          <img src={logoPath} alt="Logo" className="h-8 sm:h-10" />
        </div>
      </header>

      {/* Conteúdo principal em tela cheia */}
      <main className="flex-1 flex flex-col justify-center px-6 pb-12">
        <div className="w-full max-w-md mx-auto">
          {/* Step 1: Nome completo */}
          {step === 1 && (
            <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
                Qual é o seu nome completo?
              </h1>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm text-muted-foreground">
                    Nome e Sobrenome
                  </Label>
                  <div className="mt-2">
                    <div className="relative">
                      <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Seu nome completo"
                        className="pl-10 text-base border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary"
                        data-testid="input-fullname"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={handleNext}
                        size="icon"
                        className="rounded-full h-12 w-12 bg-[#103549] hover:bg-[#1a4d68]"
                        data-testid="button-next-step1"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: E-mail */}
          {step === 2 && (
            <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
                Qual é o seu e-mail?
              </h1>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm text-muted-foreground">
                    E-mail
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="nome@email.com"
                      className="text-base border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary"
                      data-testid="input-email"
                      autoFocus
                    />
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={handleNext}
                        size="icon"
                        className="rounded-full h-12 w-12 bg-[#103549] hover:bg-[#1a4d68]"
                        data-testid="button-next-step2"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Telefone */}
          {step === 3 && (
            <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
                Qual é o número do seu celular?
              </h1>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-sm text-muted-foreground">
                    Número com DDD
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: formatPhone(e.target.value) })
                      }
                      placeholder="(00) 00000-0000"
                      className="text-base border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary"
                      data-testid="input-phone"
                      maxLength={15}
                      autoFocus
                    />
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={handleNext}
                        size="icon"
                        className="rounded-full h-12 w-12 bg-[#103549] hover:bg-[#1a4d68]"
                        data-testid="button-next-step3"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: CPF */}
          {step === 4 && (
            <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
                Qual é o seu CPF?
              </h1>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cpf" className="text-sm text-muted-foreground">
                    CPF
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="cpf"
                      type="tel"
                      inputMode="numeric"
                      value={formData.cpf}
                      onChange={(e) =>
                        setFormData({ ...formData, cpf: formatCPF(e.target.value) })
                      }
                      placeholder="000.000.000-00"
                      className="text-base border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary"
                      data-testid="input-cpf"
                      maxLength={14}
                      autoFocus
                    />
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={handleNext}
                        size="icon"
                        className="rounded-full h-12 w-12 bg-[#103549] hover:bg-[#1a4d68]"
                        data-testid="button-next-step4"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Senha */}
          {step === 5 && (
            <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
                  Crie sua senha de acesso
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Apenas 6 dígitos numéricos
                </p>
              </div>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="password" className="text-sm text-muted-foreground">
                    Criar senha (6 dígitos)
                  </Label>
                  <div className="mt-2">
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "tel" : "password"}
                        inputMode="numeric"
                        pattern="\d*"
                        value={formData.password}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 6) {
                            setFormData({ ...formData, password: value });
                            if (value.length === 6) {
                              setTimeout(() => {
                                confirmPasswordRef.current?.focus();
                              }, 100);
                            }
                          }
                        }}
                        placeholder="••••••"
                        maxLength={6}
                        className="text-base border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary pr-10"
                        data-testid="input-password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">
                    Confirmar senha (6 dígitos)
                  </Label>
                  <div className="mt-2">
                    <div className="relative">
                      <Input
                        ref={confirmPasswordRef}
                        id="confirmPassword"
                        type={showConfirmPassword ? "tel" : "password"}
                        inputMode="numeric"
                        pattern="\d*"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 6) {
                            setFormData({ ...formData, confirmPassword: value });
                          }
                        }}
                        placeholder="••••••"
                        maxLength={6}
                        className="text-base border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary pr-10"
                        data-testid="input-confirm-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        data-testid="button-toggle-confirm-password"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={handleNext}
                        size="icon"
                        disabled={
                          !formData.password ||
                          !formData.confirmPassword ||
                          formData.password.length !== 6 ||
                          formData.confirmPassword.length !== 6 ||
                          formData.password !== formData.confirmPassword
                        }
                        className="rounded-full h-12 w-12 bg-[#103549] hover:bg-[#1a4d68] disabled:opacity-50"
                        data-testid="button-next-step5"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Confirmação */}
          {step === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h1 className="text-xl sm:text-2xl font-medium text-foreground mb-2">
                  Verifique suas informações
                </h1>
                <p className="text-sm text-muted-foreground">
                  Após a confirmação destes dados, eles não poderão mais ser alterados.
                </p>
              </div>

              <div className="space-y-6">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Nome e Sobrenome</Label>
                      <p className="text-base mt-1" data-testid="text-confirm-name">
                        {formData.fullName}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(1)}
                      className="text-primary"
                      data-testid="button-edit-name"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">E-mail</Label>
                      <p className="text-base mt-1" data-testid="text-confirm-email">
                        {formData.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(2)}
                      className="text-primary"
                      data-testid="button-edit-email"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Telefone</Label>
                      <p className="text-base mt-1" data-testid="text-confirm-phone">
                        {formData.phone}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(3)}
                      className="text-primary"
                      data-testid="button-edit-phone"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">CPF</Label>
                      <p className="text-base mt-1" data-testid="text-confirm-cpf">
                        {formData.cpf}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(4)}
                      className="text-primary"
                      data-testid="button-edit-cpf"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Senha</Label>
                      <p className="text-base mt-1" data-testid="text-confirm-password">
                        ••••••••
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(5)}
                      className="text-primary"
                      data-testid="button-edit-password"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full bg-[#103549] hover:bg-[#1a4d68] text-white text-base font-medium min-h-14 rounded-xl"
                disabled={createAccountMutation.isPending}
                data-testid="button-confirm-registration"
              >
                {createAccountMutation.isPending ? "Criando conta..." : "CONFIRMAR"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
