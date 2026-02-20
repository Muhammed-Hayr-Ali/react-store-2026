import { getNewlyAddedProducts } from "@/lib/actions/newly-added-products";
import { RecentProducts } from "./recent-products";

export async function RecentProductsServer() {
  // ✅ جلب البيانات في الخادم
  const { data: products, error } = await getNewlyAddedProducts(4);

  // ✅ تمرير البيانات فقط (بدون أي دوال!)
  return (
    <RecentProducts
      products={products || []}
      isLoading={!products && !error}
      error={error}
      basePath="/products" // ✅ فقط نص
    />
  );
}
