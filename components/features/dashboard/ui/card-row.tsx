import { cn } from "@/lib/utils";
import React from "react";

interface CardRowProps {
  icon?: React.ReactNode;
  iconBackground?: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function CardRow({
  icon,
  iconBackground,
  label,
  children,
  className,
}: CardRowProps) {
  return (
    <div className={cn("flex items-center justify-between p-4", className)}>
      <div className="flex items-center gap-4">
        {icon && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg bg-muted",
              iconBackground,
            )}
          >
            {icon}
          </div>
        )}
        <span className="font-medium">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
