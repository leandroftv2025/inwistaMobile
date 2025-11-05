import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/logo-inwista.png";

interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
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
    if (step === 4 && formData.cpf.replace(/\D/g, "").length !== 11) {
      toast({
        title: "CPF inválido",
        description: "Por favor, informe um CPF válido.",
        variant: "destructive",
      });
      return;
    }

    if (step < 5) {
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
    createAccountMutation.mutate(formData);
  };

  const handleEdit = (editStep: number) => {
    setStep(editStep);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#103549] via-[#1a4d68] to-[#103549] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl p-8 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-full"
              data-testid="button-back"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <img src={logoPath} alt="Logo" className="h-12" />
          </div>

          {/* Step 1: Nome completo */}
          {step === 1 && (
            <div className="space-y-16 animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-medium text-foreground">
                Qual é o seu nome completo?
              </h1>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm text-muted-foreground">
                    Nome e Sobrenome
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative flex-1">
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
          )}

          {/* Step 2: E-mail */}
          {step === 2 && (
            <div className="space-y-16 animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-medium text-foreground">
                Qual é o seu e-mail?
              </h1>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm text-muted-foreground">
                    E-mail
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
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
          )}

          {/* Step 3: Telefone */}
          {step === 3 && (
            <div className="space-y-16 animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-medium text-foreground">
                Qual é o número do seu celular?
              </h1>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-sm text-muted-foreground">
                    Número com DDD
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative flex-1">
                      <Input
                        id="phone"
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
                    </div>
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
          )}

          {/* Step 4: CPF */}
          {step === 4 && (
            <div className="space-y-16 animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-3xl font-medium text-foreground">
                Qual é o seu CPF?
              </h1>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cpf" className="text-sm text-muted-foreground">
                    CPF
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="cpf"
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
          )}

          {/* Step 5: Confirmação */}
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h1 className="text-2xl font-medium text-foreground mb-2">
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
                      <Label className="text-sm font-medium text-muted-foreground">
                        CPF
                      </Label>
                      <p
                        className="text-base mt-1 text-muted-foreground"
                        data-testid="text-confirm-cpf"
                      >
                        {formData.cpf}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(4)}
                      className="text-muted-foreground"
                      data-testid="button-edit-cpf"
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
      </div>
    </div>
  );
}
