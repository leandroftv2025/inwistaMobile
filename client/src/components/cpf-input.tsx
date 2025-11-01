import { Input } from "@/components/ui/input";
import { formatCPF } from "@/lib/utils";
import { forwardRef } from "react";

interface CPFInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export const CPFInput = forwardRef<HTMLInputElement, CPFInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCPF(e.target.value);
      onChange(formatted);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        maxLength={14}
        placeholder="000.000.000-00"
        data-testid="input-cpf"
      />
    );
  }
);

CPFInput.displayName = "CPFInput";
