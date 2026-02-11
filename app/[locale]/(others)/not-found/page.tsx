import NotFoundPage from "@/components/others/not-found-page";
import { createMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return createMetadata({
    title: "404 Not Found",
    description: "The requested page could not be found.",
  });
}

export default function Page() {
  return <NotFoundPage />;
}
