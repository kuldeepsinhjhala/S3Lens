import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "dangerGhost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-dark disabled:bg-background-hover disabled:text-text-muted",
  secondary:
    "bg-background-secondary text-text-primary border border-border hover:bg-background-hover disabled:text-text-muted",
  danger:
    "bg-danger text-white hover:bg-danger-dark disabled:bg-background-hover disabled:text-text-muted",
  ghost: "text-brand hover:text-brand-light disabled:text-text-muted",
  dangerGhost: "text-danger hover:bg-danger-background disabled:text-text-muted",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
