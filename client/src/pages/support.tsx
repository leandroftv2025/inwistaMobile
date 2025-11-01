import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, MessageCircle, Mail, Phone, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Support() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const faqs = [
    {
      question: "Como fazer uma transferência PIX?",
      answer:
        "Para fazer uma transferência PIX, acesse o menu PIX no app, escolha 'Enviar', digite a chave do destinatário, informe o valor e confirme a transação. É rápido, seguro e instantâneo!",
    },
    {
      question: "O que é StableCOIN?",
      answer:
        "StableCOIN é uma moeda digital estável atrelada ao real brasileiro. Você pode converter seus reais em StableCOIN para proteção cambial ou para transações internacionais com taxas reduzidas.",
    },
    {
      question: "Como começar a investir?",
      answer:
        "No menu Investimentos, você encontra diversos produtos adequados ao seu perfil. Escolha o investimento ideal, defina o valor que deseja aplicar e confirme. É simples e seguro!",
    },
    {
      question: "Meus dados estão seguros?",
      answer:
        "Sim! Utilizamos criptografia de ponta e seguimos as melhores práticas de segurança do mercado. Seus dados e transações são protegidos por múltiplas camadas de segurança, incluindo autenticação em duas etapas.",
    },
    {
      question: "Como recuperar minha senha?",
      answer:
        "Na tela de login, clique em 'Esqueci minha senha'. Você receberá um código de verificação por e-mail e SMS para redefinir sua senha com segurança.",
    },
    {
      question: "Posso usar o app em vários dispositivos?",
      answer:
        "Sim! Você pode acessar sua conta Inwista em múltiplos dispositivos. Para sua segurança, será necessário validar cada novo dispositivo com autenticação em duas etapas.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !message) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha o assunto e a mensagem",
      });
      return;
    }

    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve",
    });

    setSubject("");
    setMessage("");
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
            <h1 className="font-semibold">Ajuda e Suporte</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full p-4 bg-primary/10">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Como podemos ajudar?</h2>
                <p className="text-muted-foreground">
                  Estamos aqui para tornar sua experiência incrível. Confira as perguntas frequentes ou entre em contato diretamente conosco.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
            <CardDescription>
              Respostas para as dúvidas mais comuns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger data-testid={`faq-question-${index}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent data-testid={`faq-answer-${index}`}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Envie uma mensagem</CardTitle>
            <CardDescription>
              Nossa equipe responderá em breve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  placeholder="Sobre o que você precisa de ajuda?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  data-testid="input-subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Descreva sua dúvida ou problema em detalhes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                  data-testid="textarea-message"
                />
              </div>

              <Button type="submit" className="w-full" data-testid="button-send-message">
                <MessageCircle className="h-4 w-4 mr-2" />
                Enviar mensagem
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover-elevate">
            <CardContent className="p-6 text-center">
              <div className="rounded-full p-4 bg-primary/10 mx-auto w-fit mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">E-mail</h3>
              <p className="text-sm text-muted-foreground">
                suporte@inwista.com
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6 text-center">
              <div className="rounded-full p-4 bg-primary/10 mx-auto w-fit mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Telefone</h3>
              <p className="text-sm text-muted-foreground">
                0800 123 4567
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6 text-center">
              <div className="rounded-full p-4 bg-primary/10 mx-auto w-fit mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Chat ao vivo</h3>
              <p className="text-sm text-muted-foreground">
                Seg-Sex, 9h-18h
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
