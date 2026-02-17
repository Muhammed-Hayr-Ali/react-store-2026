"use client"; // ✅ هذا المكون يستخدم Framer Motion، لذا يجب أن يكون مكون عميل

import { motion } from "framer-motion";
import { FullProduct } from "@/lib/types";
import ProductCard from "./product-card";


interface ProductGridProps {
  products: FullProduct[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{
        show: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </motion.div>
  );
};
