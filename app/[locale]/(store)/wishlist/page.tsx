// File: app/[locale]/(store)/(account)/wishlist/page.tsx

import { createMetadata } from "@/lib/metadata";
import { getWishlist } from "@/lib/actions/wishlist";
import { WishlistPage } from "@/components/features/wishlist/wishlist-page";

export const metadata = createMetadata({
  title: "Your Wishlist",
  description: "A collection of products you love and want to save for later.",
});


export default async function Page() {

  const { data, error } = await getWishlist();
  




  return <WishlistPage wishlistItems={data} error={error} />;
}
