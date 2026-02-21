// app\[locale]\(store)\products\[slug]\page.tsx

import { getProductBySlug } from "@/lib/actions/products";
import { createMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { checkWishlistStatus } from "@/lib/actions/wishlist";

// ✅ 1. استيراد دالة جلب التقييمات فقط
import { getReviewsByProductId } from "@/lib/actions/reviews";
import { getUser } from "@/lib/actions/get-user-action";
import ProductDetails from "@/components/products/ProductDetails";


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

  const userResponse = await getUser();
  const user = userResponse.data;

  let isInitiallyWishlisted = false;

  // ✅ 2. التحقق من قائمة الأمنيات فقط إذا كان المستخدم مسجلاً
  if (user) {
    // استدعاء الدالة مع مصفوفة تحتوي على ID المنتج
    const wishlistResponse = await checkWishlistStatus([product.id]);

    // ✅ التصحيح الهام: الوصول إلى .data أولاً، ثم التعامل مع النتيجة
    if (!wishlistResponse.error && wishlistResponse.data) {
      isInitiallyWishlisted = wishlistResponse.data[product.id] || false;
    } else {
      console.warn("Failed to check wishlist status:", wishlistResponse.error);
      // في حالة الخطأ، نفترض أن المنتج غير موجود في القائمة لتجنب تعطيل الصفحة
      isInitiallyWishlisted = false;
    }
  }



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
        user={user}
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
