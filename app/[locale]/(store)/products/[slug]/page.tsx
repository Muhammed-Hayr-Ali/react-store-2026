// app\[locale]\(store)\products\[slug]\page.tsx

import { getProductBySlug } from "@/lib/actions/products";
import { createMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/products/ProductDetails";

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

  const response = await getProduct(slug);


  if (!response || !response.data || !response.data.product) {
    notFound();
  }

  return (
    <main className="container mx-auto pb-8 md:pb-12 px-4">
      <ProductDetails data={response.data} />
    </main>
  );
}
