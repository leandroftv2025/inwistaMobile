import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime, generateQRCode } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  Copy,
  Check,
  Share2,
  Download,
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, PixKey, PixTransaction } from "@shared/schema";

export default function PIX() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isInitialized } = useAuth();
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState("send");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [recipientKey, setRecipientKey] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isInitialized, isAuthenticated, setLocation]);

  // Fetch user data for balance validation
  const { data: userData } = useQuery<User>({
    queryKey: [`/api/user/${userId}`],
    enabled: !!userId,
  });

  // Format currency input with Brazilian formatting
  const formatBRLInput = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) return '';
    
    // Converte para centavos
    const cents = parseInt(numbers, 10);
    
    // Formata com separadores brasileiros
    const reais = (cents / 100).toFixed(2);
    const [intPart, decPart] = reais.split('.');
    
    // Adiciona pontos de milhar
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formattedInt},${decPart}`;
  };

  // Parse Brazilian formatted currency to number
  const parseBRLInput = (value: string): number => {
    if (!value) return 0;
    // Remove pontos e substitui vírgula por ponto
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBRLInput(e.target.value);
    setAmount(formatted);
  };

  const { data: pixKeys = [], isLoading: isLoadingKeys, error: keysError } = useQuery<PixKey[]>({
    queryKey: [`/api/pix/keys/${userId}`],
    enabled: !!userId,
  });

  const { data: transactions = [], isLoading: isLoadingTransactions, error: transactionsError } = useQuery<PixTransaction[]>({
    queryKey: [`/api/pix/transactions/${userId}`],
    enabled: !!userId,
  });

  const sendPixMutation = useMutation({
    mutationFn: async (data: { userId: string; recipientKey: string; amount: string; description?: string }) => {
      const response = await apiRequest("/api/pix/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao enviar PIX");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/pix/transactions/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      const numericAmount = parseBRLInput(amount);
      toast({
        title: "PIX enviado com sucesso!",
        description: `${formatCurrency(numericAmount)} para ${recipientKey}`,
      });
      setRecipientKey("");
      setAmount("");
      setDescription("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao enviar PIX",
        description: error.message,
      });
    },
  });

  const handleSendPix = () => {
    if (!recipientKey || !amount) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha a chave PIX e o valor",
      });
      return;
    }

    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Faça login novamente",
      });
      return;
    }

    // Validar saldo
    const numericAmount = parseBRLInput(amount);
    if (numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "O valor deve ser maior que zero",
      });
      return;
    }

    if (userData) {
      const userBalance = parseFloat(userData.balanceBRL);
      if (numericAmount > userBalance) {
        toast({
          variant: "destructive",
          title: "Saldo insuficiente",
          description: `Você possui apenas ${formatCurrency(userBalance)} disponível`,
        });
        return;
      }
    }

    sendPixMutation.mutate({
      userId: userId!,
      recipientKey,
      amount: numericAmount.toString(),
      description: description || undefined,
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast({
      title: "Chave copiada!",
      description: "A chave PIX foi copiada para a área de transferência",
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadQRCode = () => {
    if (pixKeys.length === 0) return;
    
    const qrCodeUrl = generateQRCode(pixKeys[0].keyValue);
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qrcode-pix.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code baixado!",
      description: "O QR Code foi salvo com sucesso",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/home")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="font-semibold">PIX</h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send" data-testid="tab-send">
              Enviar
            </TabsTrigger>
            <TabsTrigger value="receive" data-testid="tab-receive">
              Receber
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enviar PIX</CardTitle>
                <CardDescription>
                  Transferências instantâneas para qualquer chave PIX
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient-key">Chave PIX do destinatário</Label>
                  <Input
                    id="recipient-key"
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    value={recipientKey}
                    onChange={(e) => setRecipientKey(e.target.value)}
                    data-testid="input-recipient-key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      value={amount}
                      onChange={handleAmountChange}
                      className="pl-10"
                      data-testid="input-amount"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Input
                    id="description"
                    placeholder="Para que é essa transferência?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    data-testid="input-description"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSendPix}
                  disabled={sendPixMutation.isPending}
                  data-testid="button-send-pix"
                >
                  {sendPixMutation.isPending ? "Enviando..." : "Enviar PIX"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Minhas chaves PIX</CardTitle>
                <CardDescription>
                  Compartilhe suas chaves para receber transferências
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingKeys ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : keysError ? (
                  <p className="text-center text-destructive py-8">
                    Erro ao carregar chaves PIX. Tente novamente.
                  </p>
                ) : pixKeys.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma chave PIX cadastrada
                  </p>
                ) : (
                  pixKeys.map((key, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                      data-testid={`pix-key-${key.keyType}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground capitalize">
                          {key.keyType === 'cpf' ? 'CPF' : key.keyType === 'random' ? 'Chave Aleatória' : key.keyType}
                        </p>
                        <p className="font-mono font-medium break-all">{key.keyValue}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyKey(key.keyValue)}
                        data-testid={`button-copy-${key.keyType}`}
                        className="ml-2 shrink-0"
                      >
                        {copiedKey === key.keyValue ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>
                  Gere um QR Code para receber pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  {isLoadingKeys ? (
                    <Skeleton className="w-64 h-64" />
                  ) : pixKeys.length > 0 ? (
                    <img
                      src={generateQRCode(pixKeys[0].keyValue)}
                      alt="QR Code PIX"
                      className="w-64 h-64 border rounded-md"
                      data-testid="img-qr-code"
                    />
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Cadastre uma chave PIX para gerar QR Code
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    disabled={pixKeys.length === 0}
                    data-testid="button-share-qr"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={downloadQRCode}
                    disabled={pixKeys.length === 0}
                    data-testid="button-download-qr"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de transações</CardTitle>
                <CardDescription>
                  Todas as suas transferências PIX
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingTransactions ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : transactionsError ? (
                  <p className="text-center text-destructive py-8">
                    Erro ao carregar transações. Tente novamente.
                  </p>
                ) : transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma transação encontrada
                  </p>
                ) : (
                  transactions.map((transaction) => {
                    const isReceived = transaction.type === "received";
                    const amountNum = parseFloat(transaction.amount);
                    return (
                      <div key={transaction.id} data-testid={`transaction-${transaction.id}`}>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${isReceived ? "bg-green-500/10" : "bg-muted"}`}>
                              {isReceived ? (
                                <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.recipientKey || transaction.senderKey || 'PIX'}</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.description || '—'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {formatDateTime(new Date(transaction.createdAt))}
                                </p>
                                <Badge variant="secondary" className="text-xs">
                                  {transaction.status === "completed" ? "Concluído" : transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <p className={`font-semibold font-mono tabular-nums ${isReceived ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
                            {isReceived ? "+" : "-"}
                            {formatCurrency(amountNum)}
                          </p>
                        </div>
                        <Separator />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
