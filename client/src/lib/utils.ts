import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9)
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

export function formatCurrency(value: number | string, currency: string = "BRL"): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (currency === "BRL") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  }
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(numValue);
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return "--/--/----";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "--/--/----";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return "--/--/---- --:--";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "--/--/---- --:--";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatPixKey(keyType: string, keyValue: string): string {
  if (keyType === "cpf") return formatCPF(keyValue);
  if (keyType === "phone") {
    const numbers = keyValue.replace(/\D/g, "");
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return keyValue;
  }
  return keyValue;
}

export function generateQRCode(pixKey: string | undefined): string {
  const keyText = pixKey ? pixKey.substring(0, 20) : "---";
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="white"/>
      <rect x="16" y="16" width="224" height="224" fill="black" opacity="0.1"/>
      <text x="128" y="128" text-anchor="middle" font-family="monospace" font-size="12" fill="black">
        QR Code: ${keyText}
      </text>
    </svg>
  `)}`;
}
