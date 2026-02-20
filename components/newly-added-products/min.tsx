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
import { Badge } from "../ui/badge";
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
      <ItemHeader className="relative">
        <Image
          src={product.main_image_url || "/placeholder.svg"}
          alt={product.name}
          width={128}
          height={128}
          className="aspect-square w-full rounded-t-sm object-cover"
        />{" "}
        {product.discountPercentage && (
          <Badge className="absolute top-2 left-2 z-10">
            {product.discountPercentage}%
          </Badge>
        )}
      </ItemHeader>
      <ItemContent className="p-3.5">
        <ItemTitle>{product.name}</ItemTitle>
        <ItemDescription className="flex gap-1">
          {product.discountPercentage ? (
            <>
              <p>{product.discount_price}</p>
              <span className="line-through text-muted-foreground">
                {product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <p>{product.price.toFixed(2)}</p>
          )}

          <Button size="icon-sm">
            <Plus />
          </Button>
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
