import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "ghost" | "white";
  loading?: boolean;
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ children, size = "md", variant = "primary", loading = false, className, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const variantClasses = {
      primary: "btn-primary rounded-xl font-semibold",
      outline: "btn-outline rounded-xl font-semibold",
      ghost: "bg-transparent text-primary-600 hover:bg-primary-50 border-none rounded-xl font-semibold",
      white: "bg-white text-primary-700 hover:bg-primary-50 shadow-lg rounded-xl font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          "transition-all duration-300 inline-flex items-center gap-2",
          loading && "opacity-70 cursor-not-allowed",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          children
        )}
      </button>
    );
  }
);

GradientButton.displayName = "GradientButton";
