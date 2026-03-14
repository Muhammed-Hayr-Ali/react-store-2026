import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export default function LoadingPage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full flex items-center justify-center",
        className,
      )}
    >
      <Spinner />
    </div>
  );
}
