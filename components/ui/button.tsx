import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-accent active:scale-[0.98]",
      outline:
        "border border-border bg-transparent text-foreground hover:bg-secondary active:scale-[0.98]",
      ghost:
        "bg-transparent text-foreground hover:bg-secondary active:scale-[0.98]",
      destructive:
        "bg-destructive text-primary-foreground hover:opacity-90 active:scale-[0.98]",
    };

    const sizeStyles = {
      default: "h-11 px-6 text-sm",
      sm: "h-9 px-4 text-xs",
      lg: "h-12 px-8 text-base",
      icon: "h-11 w-11 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

