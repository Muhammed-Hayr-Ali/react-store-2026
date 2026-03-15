import SearchPage from "@/components/search/search-page";
import { getProductsByQuery } from "@/lib/actions/search";
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

  const products = await getProductsByQuery(query);

  return <SearchPage query={query} products={products} />;
}
