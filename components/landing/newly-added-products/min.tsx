import { SectionHeader } from "@/components/dashboard/profile/ui/section-header";
import { ProductGrid } from "./section-header";
import { getNewlyAddedProducts } from "@/lib/actions/landing";

/**
 * @description قسم يعرض أحدث المنتجات المضافة في المتجر.
 * هذا مكون خادم (Server Component) يقوم بجلب البيانات مباشرة.
 */
export const NewlyAddedProducts = async () => {
  // ✅ 2. جلب أحدث 4 منتجات من قاعدة البيانات
  const { data: products, error } = await getNewlyAddedProducts(4);

  if (error || !products || products.length === 0) {
    // يمكنك عرض رسالة خطأ أو مكون فارغ هنا إذا أردت
    return null;
  }

  return (
    <section className="py-16 sm:py-24 bg-background/50">
      <div className="container mx-auto">
        {/* --- العنوان الرئيسي للقسم --- */}
        <SectionHeader
          title="Freshly Added"
          icon="sparkles"
        />

        {/* --- شبكة المنتجات --- */}
        <ProductGrid products={products} />
      </div>
    </section>
  );
};
