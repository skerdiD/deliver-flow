import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

type FormStatusProps = {
  message?: string;
  success?: boolean;
};

export function FormStatus({ message, success = false }: FormStatusProps) {
  if (!message) {
    return null;
  }

  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <Alert variant={success ? "default" : "destructive"} aria-live="polite">
      <Icon className="size-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
