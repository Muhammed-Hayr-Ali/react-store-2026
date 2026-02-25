import { Spinner } from "@/components/ui/spinner";

export default function LoadingPage() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Spinner />
    </div>
  );
}
