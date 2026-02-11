"use client";
import { SearchX } from "lucide-react";
import { getProductsByQuery, Product } from "@/lib/actions/search";
import { ProductCard } from "./product-card";
import { useEffect, useState } from "react";

function SearchResults({ query }: { query: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  // const products = await getProductsByQuery(query);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const products = await getProductsByQuery(query);
      setProducts(products);
      setIsLoading(false);
    }
    fetchProducts();
  }, [query]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <h2 className="text-2xl font-bold">Loading...</h2>
      </div>
    );
  }

  if (products.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">No Results Found</h2>
        <p className="text-muted-foreground mt-2">
          We couldn&apos;t find any products matching &quot;{query}&quot;.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-8">
        Found {products.length} result{products.length > 1 ? "s" : ""} for your
        search.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams?.q === "string" ? searchParams.q : "";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Search results for:{" "}
        <span className="text-primary">&quot;{query}&quot;</span>
      </h1>
      <SearchResults query={query} />
    </div>
  );
}
