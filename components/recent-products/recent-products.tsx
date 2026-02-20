"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ShoppingCart, Star, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";
import { ItemGroup } from "@/components/ui/item";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { AspectRatio } from "../ui/aspect-ratio";

// ✅ استيراد Server Action مباشرة (لا تمرره كـ prop)

export type ProcessedProduct = {
  id?: string;
  name: string;
  slug: string; // ✅ مهم جداً للملاحة
  short_description: string | null;
  main_image_url: string | null;
  price: number;
  discount_price: number | null;
  discountPercentage: number | null;
  stock_quantity: number;
  average_rating: number;
  total_reviews: number;
};

interface RecentProductsProps {
  products: ProcessedProduct[];
  isLoading?: boolean;
  error?: string | null;
  basePath?: string; // ✅ فقط مسار نصي، وليس دالة
}

// ================================================================================
// Product Card - يستخدم useRouter داخلياً
// ================================================================================
// function ProductCard({
//   product,
//   basePath = "/products",
// }: {
//   product: ProcessedProduct;
//   basePath?: string;
// }) {
//   const router = useRouter(); // ✅ استخدام الروتر داخلياً
//   const [isAdding, setIsAdding] = useState(false);

//   // ✅ دالة التنقل: تستخدم router.push مباشرة
//   const handleView = () => {
//     router.push(`${basePath}/${product.slug}`);
//   };

//   // ✅ دالة الإضافة: تستدعي Server Action المستورد مباشرة
//   const handleAddToCart = async (e: React.MouseEvent) => {
//     e.stopPropagation(); // منع تفعيل التنقل عند الضغط على زر الإضافة
//     if (product.stock_quantity <= 0) {
//       toast.error("غير متوفر");
//       return;
//     }
//     setIsAdding(true);
//     try {
//       // delay to simulate network request
//       await new Promise((res) => setTimeout(res, 1000));
//       toast.success("تمت الإضافة للسلة");
//     } catch {
//       toast.error("فشل الإضافة");
//     } finally {
//       setIsAdding(false);
//     }
//   };

//   return (
//     <Card
//       className="group relative h-full overflow-hidden rounded-3xl p-2  transition-all duration-300 hover:shadow-lg hover:-translate-y-1 gap-0 cursor-pointer gap-4"
//       onClick={handleView}
//     >
//       {/* الصورة */}
//       <div className="relative bg-muted  aspect-square overflow-hidden rounded-2xl">
//         <AspectRatio ratio={9 / 16} className="bg-muted rounded-lg">
//           <Image
//             src={ "/placeholder.svg"}
//             alt={product.name}
//             fill
//             className="object-cover group-hover:scale-105 transition-transform"
//           />{" "}
//         </AspectRatio>

//         {product.discountPercentage && (
//           <Badge
//             variant="secondary"
//             className="absolute top-2 left-2 z-30  px-3 py-1.5 flex items-center gap-1.5"
//           >
//             Discount {product.discountPercentage}%
//           </Badge>
//         )}
//         {/* أزرار سريعة تظهر عند التحويم */}
//         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
//           <Button
//             size="sm"
//             variant="secondary"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleView();
//             }}
//           >
//             <Eye className="w-4 h-4" />
//           </Button>
//           <Button size="sm" onClick={handleAddToCart} disabled={isAdding}>
//             {isAdding ? (
//               <span className="animate-spin">⏳</span>
//             ) : (
//               <Plus className="w-4 h-4" />
//             )}
//           </Button>
//         </div>
//       </div>

//       {/* المحتوى */}
//       <CardHeader className="px-4 pt-2">
//         <h1 className="font-bold text-lg">{product.name}</h1>
//       </CardHeader>

//       <CardHeader className="px-4 pt-2">
//         {product.total_reviews > 0 && (
//           <div className="flex items-center gap-1 text-sm text-yellow-500">
//             <Star className="w-4 h-4 fill-current" />
//             <span className="text-muted-foreground">
//               ({product.total_reviews})
//             </span>
//           </div>
//         )}
//       </CardHeader>

//       <CardDescription className="flex-1 px-4 text-sm text-muted-foreground line-clamp-2">
//         {product.short_description}
//       </CardDescription>

//       {/* السعر والزر */}
//       <CardFooter className="px-2 pt-0 pb-1 flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           {product.discount_price ? (
//             <>
//               <span className="font-bold text-primary">
//                 ${product.discount_price}
//               </span>
//               <span className="text-xs text-muted-foreground line-through block">
//                 ${product.price}
//               </span>
//             </>
//           ) : (
//             <span className="font-bold">{product.price} ر.س</span>
//           )}
//         </div>
//         <Button
//           size="icon-sm"
//           onClick={handleAddToCart}
//           className="rounded-full"
//         >
//           <ShoppingCart className="w-4 h-4" />
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }


function ProductCard({
  product,
  basePath = "/products",
}: {
  product: ProcessedProduct;
  basePath?: string;
}) {
  const router = useRouter(); // ✅ استخدام الروتر داخلياً
  const [isAdding, setIsAdding] = useState(false);

  // ✅ دالة التنقل: تستخدم router.push مباشرة
  const handleView = () => {
    router.push(`${basePath}/${product.slug}`);
  };

  // ✅ دالة الإضافة: تستدعي Server Action المستورد مباشرة
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // منع تفعيل التنقل عند الضغط على زر الإضافة
    if (product.stock_quantity <= 0) {
      toast.error("غير متوفر");
      return;
    }
    setIsAdding(true);
    try {
      // delay to simulate network request
      await new Promise((res) => setTimeout(res, 1000));
      toast.success("تمت الإضافة للسلة");
    } catch {
      toast.error("فشل الإضافة");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="relative mx-auto w-full max-w-sm pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <img
        src="https://avatar.vercel.sh/shadcn1"
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">Featured</Badge>
        </CardAction>
        <CardTitle>Design systems meetup</CardTitle>
        <CardDescription>
          A practical talk on component APIs, accessibility, and shipping
          faster.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">View Event</Button>
      </CardFooter>
    </Card>
  );
}





// ================================================================================

export function CardImage({
  product,
  basePath = "/products",
}: {
  product: ProcessedProduct;
  basePath?: string;
}) {
  return (
    <Card className="relative mx-auto w-full max-w-sm pt-0">
      <div className="absolute inset-0 z-30  " />
      <img
        src={product.main_image_url || "/placeholder.svg"}
        alt="Event cover"
        className="relative z-20  w-full object-cover"
      />
      <CardHeader>
        {product.discountPercentage && (
          <CardAction>
            <Badge variant="destructive">
              Discount {product.discountPercentage}%
            </Badge>
          </CardAction>
        )}
        <CardTitle>{product.name}</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <span className="font-bold">
          {product.discount_price
            ? `$${product.discount_price}`
            : `${product.price} ر.س`}
        </span>
        {product.discount_price && (
          <span className="text-xs text-muted-foreground line-through">
            ${product.price}
          </span>
        )}
        <Button size="icon" variant="outline">
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// ================================================================================
// المكون الرئيسي
// ================================================================================
export function RecentProducts({
  products,
  isLoading = false,
  error = null,
  basePath = "/products",
}: RecentProductsProps) {
  if (error)
    return (
      <div className="p-8 text-center text-destructive">حدث خطأ: {error}</div>
    );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!products?.length)
    return (
      <div className="p-8 text-center text-muted-foreground">
        لا توجد منتجات
      </div>
    );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            id="new-products-heading"
            className="text-2xl md:text-3xl font-bold tracking-tight"
          >
            ✨ أحدث المنتجات
          </h2>
          <p className="text-muted-foreground mt-1">
            اكتشف تشكيلتنا الجديدة المختارة بعناية
          </p>
        </div>
        {/* زر عرض الكل (اختياري) */}
        <Button variant="ghost" className="hidden sm:flex items-center gap-1">
          عرض الكل
          <span className="text-xs">→</span>
        </Button>
      </div>

      <div className="flex w-full ">
        <div className="grid grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              basePath={basePath}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
