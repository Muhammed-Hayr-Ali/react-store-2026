"use client";

import { SearchX } from "lucide-react";
import { Product } from "@/lib/actions/search";
import { ProductCard } from "./product-card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "../ui/button";
import Link from "next/link";
interface SearchProps {
  query: string;
  products: Product[] | [];
}

function SearchResults({ query, products }: SearchProps) {
  if (products.length === 0 || !products) {
    return (
      <Empty className="h-[60vh]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX className="rtl:rotate-y-180" />
          </EmptyMedia>
          <EmptyTitle>No Results Found</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            We couldn&apos;t find any products matching &quot;{query}&quot;.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <Link
              href="/"
              className="flex gap-2 items-center rtl:flex-row-reverse"
            >
              <p> Continue Shopping</p>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
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

export default function SearchPage({ query, products }: SearchProps) {
  return (
      <SearchResults query={query} products={products} />
    
  );
}
