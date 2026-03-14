import { getBestSellingProducts } from "@/lib/actions/best_selling_products";
import { BestSellingProducts } from "./best-selling-products";

export async function BestSellingProductsServer() {
  // ✅ جلب البيانات في الخادم
  const { data: bestSellingProducts, error } = await getBestSellingProducts(4);

  // ✅ تمرير البيانات فقط (بدون أي دوال!)
  return (
    <BestSellingProducts
      products={bestSellingProducts || []}
      isLoading={!bestSellingProducts && !error}
      error={error}
      basePath="/products" // ✅ فقط نص
    />
  );
}
