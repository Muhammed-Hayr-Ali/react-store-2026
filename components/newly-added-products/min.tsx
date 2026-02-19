import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  getNewlyAddedProducts,
  ProcessedProduct,
} from "@/lib/actions/newly-added-products";
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
    <div className="container mx-auto">
      <ItemGroup className="grid grid-cols-5 gap-4">
        {products.map((product: ProcessedProduct) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ItemGroup>
    </div>
  );
};

//   return (
//     <section className="py-16 sm:py-24 bg-background/50">
//       <div className="container mx-auto">
//         {/* --- العنوان الرئيسي للقسم --- */}
//         <SectionHeader
//           title="Freshly Added"
//           icon="sparkles"
//         />

//         {/* --- شبكة المنتجات --- */}
//         <ProductGrid products={products} />
//       </div>
//     </section>
//   );
// };

export function ProductCard({ product }: { product: ProcessedProduct }) {
  return (
    <Item key={product.name} variant="outline" className="p-0">
      <ItemHeader>
        <Image
          src={product.main_image_url || "/placeholder.svg"}
          alt={product.name}
          width={128}
          height={128}
          className="aspect-square w-full rounded-t-sm object-cover"
        />
      </ItemHeader>
      <ItemContent className="p-3.5">
        <ItemTitle>{product.name}</ItemTitle>
        <ItemDescription className="flex gap-1">
          <div className="mb-1 text-sm font-semibold text-primary">
            {product.discount_price && product.discount_price < product.price
              ? product.discount_price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })
              : product.price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
          </div>

          <Button size="icon-sm">
            <Plus />
          </Button>
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
