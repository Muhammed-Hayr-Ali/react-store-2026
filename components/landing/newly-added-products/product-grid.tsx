"use client"; // ✅ هذا المكون يستخدم Framer Motion، لذا يجب أن يكون مكون عميل

import { motion, Variants } from "framer-motion";
import { FullProduct } from "@/lib/types";
import ProductCard from "./product-card";

const FADE_UP_ANIMATION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } },
};


interface ProductGridProps {
  products: FullProduct[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={FADE_UP_ANIMATION_VARIANTS}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={FADE_UP_ANIMATION_VARIANTS}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};




