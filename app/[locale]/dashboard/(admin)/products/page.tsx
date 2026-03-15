// app/dashboard/products/page.tsx
import ProductsManagePage from "@/components/dashboard/products/products-manage/products-manage-page";
import { getProducts } from "@/lib/actions/products-manager";

// ✅ منع التخزين المؤقت للصفحة
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: PageProps) {
  const page = (await searchParams).page as string;
  const pageSize = (await searchParams).pageSize as string;

  const currentPage = Number(page) || 1;
  const pSize = Number(pageSize) || 10;

  const { data: response, error } = await getProducts(currentPage, pSize);

  if (error) {
    console.error("Error fetching products:", error);
    return <span>Error: {error}</span>;
  }

  const totalPages = Math.max(
    1,
    Math.ceil((response?.totalCount || 0) / pSize),
  );
  // ✅ ضمان أن currentPage لا تتجاوز totalPages
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);

  return (
    <ProductsManagePage
      errors={error}
      products={response?.products}
      currentPage={safeCurrentPage}
      totalPages={totalPages}
      pageSize={pSize}
    />
  );
}
