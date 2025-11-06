import { useState } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Info, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface User {
  name: string;
  balanceBRL: number;
  [key: string]: unknown;
}

export default function Cambio() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const [isSending, setIsSending] = useState(true); // true = enviar, false = receber
  const [sendToMyAccount, setSendToMyAccount] = useState(true);
  const [amount, setAmount] = useState("1000.00");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const { data: userData } = useQuery<User>({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  // Taxa de câmbio simulada (VET - Valor Efetivo Total)
  const exchangeRates = {
    send: 5.6048, // BRL por USD ao enviar
    receive: 5.2559, // BRL por USD ao receber
  };

  const currentRate = isSending ? exchangeRates.send : exchangeRates.receive;
  
  const calculateConversion = () => {
    const numAmount = parseFloat(amount.replace(",", ".")) || 0;
    if (isSending) {
      // Enviando USD, pagando BRL
      return (numAmount * currentRate).toFixed(2);
    } else {
      // Recebendo USD, resgatando BRL
      return (numAmount * currentRate).toFixed(2);
    }
  };

  const formatCurrency = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9,]/g, "");
    setAmount(value);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-4 p-4 border-b">
        <button
          onClick={() => setLocation("/home")}
          className="p-2 hover-elevate active-elevate-2 rounded-lg"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* Título */}
          <h1 className="text-2xl font-semibold">
            {isSending ? "Quanto você quer enviar?" : "Quanto você vai receber?"}
          </h1>

          {/* Toggle Enviar/Receber */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setIsSending(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isSending
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover-elevate"
              }`}
              data-testid="button-send"
            >
              Enviar
            </button>
            <button
              onClick={() => setIsSending(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isSending
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover-elevate"
              }`}
              data-testid="button-receive"
            >
              Receber
            </button>
          </div>

          {/* Enviar para conta própria */}
          {isSending && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Vou enviar para uma conta minha</span>
              <Switch
                checked={sendToMyAccount}
                onCheckedChange={setSendToMyAccount}
                data-testid="switch-my-account"
              />
            </div>
          )}

          {/* Seleção de Moeda */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Moeda</label>
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  🇺🇸
                </div>
                <span className="font-medium">USD - Dólar americano</span>
              </div>
              <button className="p-1 hover-elevate active-elevate-2 rounded" data-testid="button-change-currency">
                <Edit className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>

          {/* Valor a enviar/receber */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              {isSending ? "Você vai enviar" : "Você recebe"}
            </label>
            <div className="flex items-center justify-between py-3 border-b">
              <Input
                type="text"
                value={formatCurrency(amount)}
                onChange={handleAmountChange}
                className="text-2xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                placeholder="0,00"
                data-testid="input-amount"
              />
              <div className="flex items-center gap-2 text-lg font-medium">
                <span>{selectedCurrency}</span>
                <span className="text-xl">🇺🇸</span>
              </div>
            </div>
          </div>

          {/* Valor a pagar/resgatar */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {isSending ? "Você vai pagar" : "Você vai resgatar"}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold">
                {formatCurrency(calculateConversion())}
              </span>
              <div className="flex items-center gap-2 text-lg font-medium">
                <span>BRL</span>
                <span className="text-xl">🇧🇷</span>
              </div>
            </div>
          </div>

          {/* Taxa de Câmbio */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Câmbio final (VET)</span>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="font-medium">
              1 USD = {currentRate.toFixed(4)} BRL
            </span>
          </div>

          {/* Botão Conferir Detalhes */}
          <Button
            variant="outline"
            className="w-full text-primary border-primary hover:bg-primary/5"
            data-testid="button-check-details"
          >
            Conferir detalhes
          </Button>

          {/* Info sobre taxa reduzida */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transações em dias úteis, das 9h05 às 17h00, têm taxa reduzida
            </p>
          </div>

          {/* Atualização de cotação */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>A cotação será atualizada em 03:58</span>
          </div>

          {/* Botão Continuar */}
          <Button
            className="w-full h-12 text-base"
            data-testid="button-continue"
          >
            Continuar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
