import { getRecentProducts } from "@/lib/actions/recent-products";
import { RecentProducts } from "./recent-products";

export async function RecentProductsServer() {
  const { data: products, error } = await getRecentProducts(4);

  return (
    <RecentProducts
      products={products || []}
      isLoading={!products && !error}
      error={error}
      basePath="/products" // ✅ فقط نص
    />
  );
}
