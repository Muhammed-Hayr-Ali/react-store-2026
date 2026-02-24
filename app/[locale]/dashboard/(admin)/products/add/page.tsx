// app\[locale]\dashboard\(admin)\products\add\page.tsx
import { AddProductForm } from "@/components/dashboard/products/AddProductForm/add-product-form";
import { getBrands } from "@/lib/actions/brands";
import { getCategories } from "@/lib/actions/category";
import { getProductOptionValues } from "@/lib/actions/product-option-values";
import { getProductOptions } from "@/lib/actions/product-options";

async function getInitialData() {
  // استخدم Promise.allSettled لجلب كل البيانات بشكل متزامن وآمن
  const results = await Promise.allSettled([
    getCategories(),
    getBrands(),
    getProductOptions(),
    getProductOptionValues(),
  ]);

  // التعامل مع نتائج كل طلب على حدة
  const categoriesResult = results[0];
  const brandsResult = results[1];
  const optionsResult = results[2];
  const optionValuesResult = results[3];

  // استخراج البيانات مع التحقق من النجاح، وإرجاع مصفوفة فارغة في حالة الفشل
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value.data : [];
  const brands =
    brandsResult.status === "fulfilled" ? brandsResult.value.data : [];
  const options =
    optionsResult.status === "fulfilled" ? optionsResult.value.data : [];
  const optionValues =
    optionValuesResult.status === "fulfilled"
      ? optionValuesResult.value.data
      : [];

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Error fetching data at index ${index}:`, result.reason);
    }
  });


  return {
    categories: categories || [],
    brands: brands || [],
    options: options || [],
    optionValues: optionValues || [],
  };
}

export default async function AddProductPage() {
  const { categories, brands, options, optionValues } = await getInitialData();

  

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold my-10">Add New Product</h1>
      <AddProductForm
        categories={categories}
        brands={brands}
        options={options}
        optionValues={optionValues}
      />
    </div>
  );
}
