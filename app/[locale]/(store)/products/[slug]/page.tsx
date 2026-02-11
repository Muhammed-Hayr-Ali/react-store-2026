// app/[locale]/(store)/products/[slug]/page.tsx

import { getProductBySlug } from "@/lib/actions/products";
import { createMetadata } from "@/lib/metadata";
import { ProductDetails } from "@/components/products/ProductDetails";
import { notFound } from "next/navigation";
import { checkWishlistStatus } from "@/lib/actions/wishlist";

// ✅ 1. استيراد دالة جلب التقييمات فقط
import { getReviewsByProductId } from "@/lib/actions/reviews";

// ... (دالة generateMetadata لم تتغير) ...
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return createMetadata({
      title: "Product Not Found",
      description: "The requested product could not be found.",
    });
  }

  return createMetadata({
    title: product.name,
    description: product.short_description || product.description,
    image: product.main_image_url || undefined,
  });
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // --- جلب البيانات الإضافية ---
  const wishlistStatus = await checkWishlistStatus([product.id]);
  const isInitiallyWishlisted = wishlistStatus[product.id] || false;

  // ✅ 2. جلب بيانات التقييمات
  const { data: reviews, error: reviewsError } = await getReviewsByProductId(
    product.id,
  );

  // ✅ 3. حساب ملخص التقييمات
  const totalReviews = reviews?.length || 0;
  const averageRating =
    totalReviews > 0
      ? reviews!.reduce((acc, review) => acc + review.rating, 0) / totalReviews
      : 0;

  return (
    <main className="container mx-auto py-8 md:py-12 px-4">
      {/* ✅ 4. تمرير جميع البيانات اللازمة إلى ProductDetails */}
      <ProductDetails
        product={product}
        isInitiallyWishlisted={isInitiallyWishlisted}
        reviews={reviews || []}
        averageRating={averageRating}
        totalReviews={totalReviews}
        reviewsError={reviewsError}
      />
    </main>
  );
}
