"use client";

import { AnimatePresence } from "framer-motion"; // لإضافة تأثيرات حركية جميلة
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CircleX, Heart } from "lucide-react";
import { MiniProduct } from "@/lib/actions/wishlist"; // تأكد من أن هذا النوع صحيح
import ProductCard from "./product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface WishlistPageProps {
  wishlistItems: MiniProduct[] | undefined;
  error?: string;
}

// function AddToCartButton({ products, error }: WishlistPageProps) {
//   const { refreshCount } = useCartCount();
//   const [isAdding, setIsAdding] = useState(false);

//   const handleAddToCart = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (product.stock_quantity <= 0) {
//       toast.error("Sorry, this product is out of stock.");
//       return;
//     }
//     setIsAdding(true);
//     const { error } = await addItemToCart({
//       variantId: product.variant_id,
//       quantity: 1,
//     });
//     if (error) {
//       toast.error("Failed to add to cart: " + error);
//     } else {
//       toast.success(`${product.name} added to cart successfully!`);
//       refreshCount();
//     }
//     setIsAdding(false);
//   };

//   return (
//     <Button
//       size="icon-sm"
//       className="cursor-pointer"
//       onClick={handleAddToCart}
//       disabled={isAdding}
//     >
//       {isAdding ? <Spinner /> : <ShoppingCart />}
//     </Button>
//   );
// }

// function ProductCard({
//   product,
//   basePath = "/products",
//   onRemove,
// }: {
//   product: ProcessedProduct;
//   basePath?: string;
//   onRemove: (productId: string) => void;
// }) {
//   const [isRemoving, startRemoveTransition] = useTransition();

//   const router = useRouter(); // ✅ استخدام الروتر داخلياً

//   const handleView = () => {
//     router.push(`${basePath}/${product.slug}`);
//   };

//   const handleRemove = () => {
//     startRemoveTransition(async () => {
//       const { error } = await removeFromWishlist(product.id!);
//       if (error) {
//         toast.error("Failed to remove item from wishlist.");
//         return;
//       }
//       onRemove(product.id!);
//     });
//   };

//   return (
//     <Card
//       onClick={handleView}
//       key={product.slug}
//       className=" h-full overflow-hidden  p-1  transition-all duration-300 hover:shadow-lg hover:-translate-y-1 gap-3"
//     >
//       <AspectRatio
//         key={product.id}
//         ratio={1 / 1}
//         className="relative bg-muted overflow-hidden rounded-lg"
//       >
//         {product.discountPercentage && (
//           <Badge variant="default" className="absolute top-2 left-2 z-10">
//             Discount {`${product.discountPercentage}%`}
//           </Badge>
//         )}

//         <div className="absolute top-2 right-2 z-10">
//           <Button
//             size="icon-sm"
//             onClick={handleRemove}
//             disabled={isRemoving}
//             className="bg-red-500 hover:bg-red-600 text-white "
//           >
//             {isRemoving ? <Spinner /> : <Trash />}
//           </Button>
//         </div>

//         <img
//           src={product.main_image_url || "/placeholder.svg"}
//           alt="Photo"
//           className=" object-cover object-center  h-full w-full"
//         />
//       </AspectRatio>
//       <CardHeader className="px-2 pt-2">
//         <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
//         {product.total_reviews > 0 && (
//           <CardAction>
//             <Badge variant="secondary">
//               <div className="flex items-center gap-1 text-sm text-yellow-500">
//                 <Star className="w-4 h-4 fill-current" />
//                 <span className="text-muted-foreground">
//                   {product.average_rating}
//                 </span>
//               </div>
//             </Badge>
//           </CardAction>
//         )}
//       </CardHeader>
//       <CardDescription className="px-2 grow">
//         {product.short_description}
//       </CardDescription>
//       <CardFooter className="flex justify-between items-center px-2 pb-2 ">
//         <div className="space-x-2">
//           {product.discount_price ? (
//             <div className="flex items-center gap-2">
//               <span className="text-base font-bold text-primary">
//                 ${product.discount_price}
//               </span>
//               <span className="text-sm text-muted-foreground line-through">
//                 ${product.price}
//               </span>
//             </div>
//           ) : (
//             <span className="font-bold">${product.price}</span>
//           )}
//         </div>
//         <AddToCartButton product={product} />
//       </CardFooter>
//     </Card>
//   );
// }

export function WishlistPage({ wishlistItems, error }: WishlistPageProps) {
  if (error) {
    <Empty className="min-h-[60vh]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleX />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>{error}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/">Go Back</Link>
        </Button>
      </EmptyContent>
    </Empty>;
  }

  if (wishlistItems === undefined || wishlistItems.length === 0) {
    return (
      <Empty className="min-h-[60vh]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Heart />
          </EmptyMedia>
          <EmptyTitle>Your Wishlist is empty</EmptyTitle>
          <EmptyDescription>
            Looks like you have no items in your wishlist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <main className="container mx-auto min-h-[50vh] px-4 mb-8">
      <h1 className="text-3xl font-bold">Wishlist ({wishlistItems.length})</h1>
      {/* ✅ التحسين: استخدام AnimatePresence لتغليف الشبكة للسماح بتأثير الخروج */}
      <AnimatePresence>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 py-6">
          {wishlistItems.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </AnimatePresence>
    </main>
  );
}
