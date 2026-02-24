import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "gradient" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-secondary border border-primary hover:opacity-90 focus-visible:ring-primary",
  gradient:
    "bg-gradient-to-r from-primaryGradientStart to-primaryGradientEnd text-secondary border border-primaryGradientEnd hover:opacity-90 focus-visible:ring-primaryGradientStart",
  ghost:
    "bg-transparent text-foreground border border-border hover:border-primary hover:text-primary focus-visible:ring-primary",
};

export function buttonStyles(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    className
  );
}

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonStyles(variant, className)} {...props} />;
}
