import { createMetadata } from "@/lib/metadata";
import NotFoundPage from "@/components/features/others/not-found-page";

export function generateMetadata() {
  return createMetadata({
    title: "404 Not Found",
    description: "The requested page could not be found.",
  });
}

export default function Page() {
  return <NotFoundPage />;
}
