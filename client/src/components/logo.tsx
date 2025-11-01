import logoPath from "@assets/Logo Inwista_1762037237480.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  return (
    <img
      src={logoPath}
      alt="Inwista"
      className={`${sizeClasses[size]} ${className}`}
      data-testid="img-logo"
    />
  );
}
