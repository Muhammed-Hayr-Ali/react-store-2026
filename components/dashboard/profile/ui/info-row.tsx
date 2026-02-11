"use client";

import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
  onEdit?: () => void;
}

export function InfoRow({ label, children, onEdit }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors min-h-14">
      <div className="text-muted-foreground">{label}</div>
      <div className="flex items-center gap-4">
        <div className="font-semibold text-right">
          {children || (
            <span className="italic text-muted-foreground/70">Not set</span>
          )}
        </div>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
