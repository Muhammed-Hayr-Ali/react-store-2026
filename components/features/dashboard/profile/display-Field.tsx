import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface DisplayFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  onEdit: () => void;
}

export function DisplayField({
  icon,
  label,
  value,
  onEdit,
}: DisplayFieldProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-semibold">{value || "Not set"}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
}
