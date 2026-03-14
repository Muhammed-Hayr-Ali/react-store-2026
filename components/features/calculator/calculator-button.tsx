// components/calculator/calc-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalcButtonProps {
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
  className?: string;
  span?: number;
  ariaLabel?: string;
}

export function CalcButton({
  label,
  onClick,
  variant = "secondary",
  className,
  span = 1,
  ariaLabel,
}: CalcButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={cn(
        "h-8 sm:h-9 text-sm sm:text-base font-medium rounded-lg",
        "min-w-0 px-2 sm:px-3",
        span === 2 ? "col-span-2" : "",
        variant === "default" &&
          "bg-primary/90 hover:bg-primary text-primary-foreground",
        variant === "destructive" && "bg-blue-600 hover:bg-blue-700 text-white",
        className,
      )}
    >
      {label}
    </Button>
  );
}
