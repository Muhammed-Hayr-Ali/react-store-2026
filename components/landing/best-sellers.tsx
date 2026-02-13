"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// 1. تعريف أنواع البيانات للمنتج
type Product = {
  id: string;
  name: string;
  href: string;
  imageSrc: string;
  brand: string;
  price: string;
  rating: number;
};

// 2. بيانات المنتجات (بيانات وهمية للتوضيح)
// في تطبيق حقيقي، ستأتي هذه البيانات من API
const bestSellers: Product[] = [
  {
    id: "1",
    name: "Premium Sunflower Oil",
    href: "/products/premium-sunflower-oil",
    imageSrc: "/images/bestSellers/sunflower-oil.png", // استبدل بالمسار الصحيح لصورك
    brand: "Brand A",
    price: "$12.99",
    rating: 4.5,
  },
  {
    id: "2",
    name: "Organic Pasta",
    href: "/products/organic-pasta",
    imageSrc: "/images/bestSellers/pasta.png",
    brand: "Brand B",
    price: "$3.49",
    rating: 4.8,
  },
  {
    id: "3",
    name: "Artisanal Honey",
    href: "/products/artisanal-honey",
    imageSrc: "/images/bestSellers/honey.png",
    brand: "Brand C",
    price: "$8.99",
    rating: 4.9,
  },
  {
    id: "4",
    name: "Gourmet Coffee Beans",
    href: "/products/gourmet-coffee",
    imageSrc: "/images/bestSellers/gourmet-coffee.png",
    brand: "Brand D",
    price: "$15.99",
    rating: 4.7,
  },
];

// 3. تعريف متغيرات الحركة (مع استخدام as const لتجنب أخطاء TypeScript)
const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } },
} as const;

// ====================================================================
// المكون الرئيسي للقسم
// ====================================================================
export const BestSellers = () => {
  return (
    <section className="py-16 sm:py-24 bg-background/50">
      <div className="container mx-auto">
        {/* --- العنوان الرئيسي للقسم --- */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter">
            Our Best Sellers
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the products our customers love the most.
          </p>
        </motion.div>

        {/* --- شبكة المنتجات --- */}
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
          {bestSellers.map((product) => (
            <motion.div
              key={product.id}
              variants={FADE_UP_ANIMATION_VARIANTS}
              className="group relative flex flex-col bg-card border rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-xl"
            >
              {/* --- الصورة والشارة --- */}
              <div className="relative">
                <Link href={product.href} className="block">
                  <Image
                    src={product.imageSrc}
                    alt={product.name}
                    width={512}
                    height={512}
                    className="
                      w-full 
                      object-cover 
                      object-center 
                      aspect-square 
                      transition-transform 
                      duration-300 
                      group-hover:scale-105
                    "
                  />
                </Link>
                <Badge variant="default" className="absolute top-3 right-3">
                  Best Seller
                </Badge>
              </div>

              {/* --- تفاصيل المنتج --- */}
              <div className="p-4 flex flex-col grow">
                <p className="text-sm text-muted-foreground">{product.brand}</p>
                <h3 className="mt-1 font-semibold text-lg leading-tight">
                  <Link
                    href={product.href}
                    className="hover:text-primary transition-colors"
                  >
                    {product.name}
                  </Link>
                </h3>

                {/* التقييم */}
                <div className="mt-2 flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-muted-foreground">
                    {product.rating}
                  </span>
                </div>

                {/* السعر وزر الإضافة للسلة */}
                <div className="mt-4 flex  justify-between grow items-end">
                  <p className="text-xl font-bold text-foreground">
                    {product.price}
                  </p>
                  <Button
                    size="icon"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
