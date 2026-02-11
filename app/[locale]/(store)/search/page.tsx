import SearchPage from "@/components/search/search-page";
import { createMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return createMetadata({
    title: "Unsubscribe",
    description: "Unsubscribe from our newsletter",
  });
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const query = (await searchParams).q;


  return <SearchPage searchParams={{ q: query }} />;
}
