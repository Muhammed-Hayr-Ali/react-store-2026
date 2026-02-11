import { cn } from "@/lib/utils";
import React from "react";

interface CardGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function CardGroup({
  title,
  description,
  children,
  className,
}: CardGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      {description && (
        <p className="px-4 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="overflow-hidden rounded-lg border bg-card text-card-foreground">
        <div className="divide-y">{children}</div>
      </div>
    </div>
  );
}
