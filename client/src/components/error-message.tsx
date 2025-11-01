import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = "Erro",
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className="my-4" data-testid="alert-error">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {message}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={onRetry}
            data-testid="button-retry"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
