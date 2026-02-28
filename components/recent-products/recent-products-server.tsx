import { getRecentProducts } from "@/lib/actions/recent-products";
import { RecentProducts } from "./recent-products";
import { siteConfig } from "@/lib/config/site";

export async function RecentProductsServer() {
  const { data: products, error } = await getRecentProducts(siteConfig.RecentProductsLimit);
if(error){
  return <span>{error}</span>
}
  return (
    <RecentProducts
      products={products || []}
      isLoading={!products && !error}
      error={error}
      basePath="/products" // ✅ فقط نص
    />
  );
}
