// app\[locale]\(store)\products\[slug]\page.tsx

import { getProductBySlug } from "@/lib/actions/products";
import { createMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { checkWishlistStatus } from "@/lib/actions/wishlist";

// ✅ 1. استيراد دالة جلب التقييمات فقط
import { getReviewsByProductId } from "@/lib/actions/reviews";
import { getUser } from "@/lib/actions/get-user-action";
import ProductDetails, { ProductInfo } from "@/components/products/ProductDetails";

// ... (دالة generateMetadata لم تتغير) ...
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;

  const data = await getProductBySlug(slug);
  const product = data.data;

  if (!product) {
    return createMetadata({
      title: "Product Not Found",
      description: "Product not found",
    });
  }

  return createMetadata({
    title: product?.name ?? "",
    description: product?.description ?? "",
    image: product?.main_image_url ?? "",
  });
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  // Get slug from params
  const { slug } = await params;

  // Get product by slug
  const data = await getProductBySlug(slug);
  const product = data.data;

  if (!product) {
    notFound();
  }

  // Get user data
  const user = await getUser();

  // import checkWishlistStatus
  const wishlistStatus = (await checkWishlistStatus([product.id]));

  // Check if the product is initially wishlisted
  const isInitiallyWishlisted = wishlistStatus[product.id] || false;

  // Get reviews
  const { data: dataReviews, error: errorReviews } =
    await getReviewsByProductId(product.id);

  // Calculate average rating
  const totalReviews = dataReviews?.length || 0;
  const averageRating =
    totalReviews > 0
      ? dataReviews!.reduce((acc, review) => acc + review.rating, 0) /
        totalReviews
      : 0;

  return (
    <main className="container mx-auto pb-8 md:pb-12 px-4">
      <ProductDetails
        user={user.data}
        product={product}
        isInitiallyWishlisted={isInitiallyWishlisted}
        averageRating={averageRating}
        totalReviews={totalReviews}
        reviews={dataReviews || []}
        errorReviews={errorReviews}
      />
    </main>
  );
}
