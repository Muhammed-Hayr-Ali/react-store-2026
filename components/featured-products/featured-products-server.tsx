// src/components/FeaturedProductsServer.tsx (المكون الرئيسي)
"use client";
import { FeaturedProductCard } from "./featured-product-card";
import { MiniProduct } from "@/lib/actions/get-all-mini-products";

interface Props {
  products: MiniProduct[];
}

export default function FeaturedProductsServer({ products }: Props) {
  const mainProduct = products[0];
  const sideProduct1 = products[1];
  const sideProduct2 = products[2];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
      <div className="col-span-1 lg:col-span-2">
        <FeaturedProductCard product={mainProduct} />
      </div>
      <div className="col-span-1 lg:col-span-1 flex flex-row lg:flex-col gap-1">
        <div className="w-1/2 lg:w-full grow">
          <FeaturedProductCard product={sideProduct1} />
        </div>
        <div className="w-1/2 lg:w-full grow">
          <FeaturedProductCard product={sideProduct2} />
        </div>
      </div>
    </div>
  );
}
