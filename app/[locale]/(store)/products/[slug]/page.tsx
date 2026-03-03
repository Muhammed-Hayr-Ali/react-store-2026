// app\[locale]\(store)\products\[slug]\page.tsx

import { getProductBySlug } from "@/lib/actions/products";
import { createMetadata } from "@/lib/metadata";
import ProductDetails from "@/components/products/ProductDetails";
import { BreadcrumbSegment, DynamicBreadcrumb } from "@/components/custom-ui/dynamic-breadcrumb";

async function getProduct(slug: string) {
  const response = await getProductBySlug(slug);
  if (!response.data) return null;

  return response;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;

  const response = await getProduct(slug);

  if (!response || !response.data || !response.data.product) {
    return createMetadata({
      title: "Product Not Found",
      description: "Product not found",
    });
  }

  const product = response.data.product;

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

  const productData = await getProduct(slug);

  if (!productData || !productData.data || !productData.data.product) {
    return (
      <main className="container mx-auto pb-8 md:pb-12 px-4">
        Product not found
      </main>
    );
  }

  const category = productData.data.product.category;

  // 2. بناء مصفوفة الأجزاء المخصصة
  const breadcrumbSegments: BreadcrumbSegment[] = [];

  // أضف الأب إذا كان موجودًا
  if (category && category.parent) {
    breadcrumbSegments.push({
      title: category.parent.name,
      href: `/categories/${category.parent.slug}`, // رابط صفحة التصنيف الأب
    });
  }

  if (category) {
    breadcrumbSegments.push({
      title: category.name,
      href: `/categories/${category.slug}`, // رابط صفحة التصنيف الابن
    });
  }

  breadcrumbSegments.push({
    title: productData.data.product.name,
  });


  return (
    <main className="container mx-auto pb-8 md:pb-12 px-4">
      <DynamicBreadcrumb extraSegments={breadcrumbSegments} />

      <ProductDetails data={productData.data} />
    </main>
  );
}
