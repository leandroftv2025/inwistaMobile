import { useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export default function PIX() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("send");
  const [copiedKey, setCopiedKey] = useState(false);
  
  const [recipientKey, setRecipientKey] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const pixKeys = [
    { type: "cpf", value: "123.456.789-00" },
    { type: "email", value: "ana@inwista.com" },
    { type: "phone", value: "(11) 98765-4321" },
  ];

  const transactions = [
    {
      id: "1",
      type: "received",
      name: "Maria Silva",
      key: "maria@email.com",
      amount: 250.00,
      date: new Date(),
      status: "completed",
    },
    {
      id: "2",
      type: "sent",
      name: "João Santos",
      key: "123.456.789-00",
      amount: 150.00,
      date: new Date(Date.now() - 86400000),
      status: "completed",
    },
    {
      id: "3",
      type: "received",
      name: "Carlos Oliveira",
      key: "(11) 99999-8888",
      amount: 500.00,
      date: new Date(Date.now() - 172800000),
      status: "completed",
    },
  ];

  const handleSendPix = () => {
    if (!recipientKey || !amount) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha a chave PIX e o valor",
      });
      return;
    }

    toast({
      title: "PIX enviado com sucesso!",
      description: `${formatCurrency(parseFloat(amount))} para ${recipientKey}`,
    });

    setRecipientKey("");
    setAmount("");
    setDescription("");
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    toast({
      title: "Chave copiada!",
      description: "A chave PIX foi copiada para a área de transferência",
    });
    setTimeout(() => setCopiedKey(false), 2000);
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
            <h1 className="font-semibold">PIX</h1>
          </div>
          <ThemeToggle />
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
                      type="number"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                      step="0.01"
                      min="0"
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
                  data-testid="button-send-pix"
                >
                  Enviar PIX
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
                {pixKeys.map((key, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                    data-testid={`pix-key-${key.type}`}
                  >
                    <div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {key.type}
                      </p>
                      <p className="font-mono font-medium">{key.value}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyKey(key.value)}
                      data-testid={`button-copy-${key.type}`}
                    >
                      {copiedKey ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
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
                  <img
                    src={generateQRCode(pixKeys[0].value)}
                    alt="QR Code PIX"
                    className="w-64 h-64 border rounded-md"
                    data-testid="img-qr-code"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" data-testid="button-share-qr">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button variant="outline" className="flex-1" data-testid="button-download-qr">
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
                {transactions.map((transaction) => (
                  <div key={transaction.id} data-testid={`transaction-${transaction.id}`}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${transaction.type === "received" ? "bg-green-500/10" : "bg-muted"}`}>
                          {transaction.type === "received" ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.key}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(transaction.date)}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {transaction.status === "completed" ? "Concluído" : "Pendente"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className={`font-semibold font-mono tabular-nums ${transaction.type === "received" ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
                        {transaction.type === "received" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
