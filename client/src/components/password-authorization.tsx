import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface PasswordAuthorizationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthorize: (password: string) => void;
  title?: string;
  description?: string;
}

export function PasswordAuthorization({
  open,
  onOpenChange,
  onAuthorize,
  title = "Autorização necessária",
  description = "Digite sua senha para confirmar esta transação",
}: PasswordAuthorizationProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpa a senha sempre que o diálogo for fechado
  useEffect(() => {
    if (!open) {
      setPassword("");
      setError("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError("Digite sua senha");
      return;
    }

    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);
    
    // Limpa a senha imediatamente após invocar onAuthorize
    const passwordCopy = password;
    setPassword("");
    onAuthorize(passwordCopy);
    
    // Reset isSubmitting após um pequeno delay
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              data-testid="input-authorization-password"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
              data-testid="button-cancel-authorization"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
              data-testid="button-confirm-authorization"
            >
              {isSubmitting ? "Verificando..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
