// File: app/[locale]/(store)/(account)/wishlist/page.tsx

import { WishlistPage } from "@/components/dashboard/wishlist/wishlist-page";
import { getWishlistItems } from "@/lib/actions/wishlist";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Your Wishlist",
  description: "A collection of products you love and want to save for later.",
});

// هذه الصفحة هي Server Component
export default async function Page() {
  // 1. جلب البيانات من الخادم
  const wishlistItems = await getWishlistItems();

  // 2. تمرير البيانات إلى مكون العميل
  return <WishlistPage initialItems={wishlistItems} />;
}
