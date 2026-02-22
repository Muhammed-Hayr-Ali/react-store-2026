// app\[locale]\dashboard\(admin)\products\add\page.tsx
import { AddProductForm } from "@/components/dashboard/products/AddProductForm/add-product-form";
import { createServerClient } from "@/lib/supabase/createServerClient";



async function getInitialData() {               
  const supabase = await createServerClient();
  const categoriesData = await supabase.from("categories").select("id, name");
  const brandsData = await supabase.from("brands").select("id, name");
  // options, optionValues,
  const optionsData = await supabase.from("product_options").select("id, name");
  const optionValuesData = await supabase
    .from("product_option_values")
    .select("id, option_id, value");

  return {
    categories: categoriesData.data || [],
    brands: brandsData.data || [],
    options: optionsData.data || [],
    optionValues: optionValuesData.data || [],
  };
}

export default async function AddProductPage() {
  const { categories, brands, options, optionValues } = await getInitialData();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <AddProductForm categories={categories} brands={brands} options={options} optionValues={optionValues}   />
    </div>
  );
}
