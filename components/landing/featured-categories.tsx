"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Bean,
  Wheat,
  CookingPot,
  Cookie,
  CupSoda,
  Milk,
} from "lucide-react";

type Category = {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
};

const categories: Category[] = [
  {
    name: "Canned Goods & Legumes",
    href: "/categories/canned-goods",
    icon: Bean,
    description: "Beans, vegetables, and ready-to-eat meals.",
  },
  {
    name: "Grains & Bakery",
    href: "/categories/grains",
    icon: Wheat,
    description: "Rice, pasta, flour, and fresh bread.",
  },
  {
    name: "Oils & Sauces",
    href: "/categories/oils-sauces",
    icon: CookingPot,
    description: "Olive oil, ketchup, and exotic spices.",
  },
  {
    name: "Sweets & Snacks",
    href: "/categories/snacks",
    icon: Cookie,
    description: "Chocolates, chips, and healthy snacks.",
  },
  {
    name: "Beverages",
    href: "/categories/beverages",
    icon: CupSoda,
    description: "Juices, soft drinks, and mineral water.",
  },
  {
    name: "Dairy & Cheese",
    href: "/categories/dairy",
    icon: Milk,
    description: "Milk, yogurt, and a variety of cheeses.",
  },
];

// --- تم تصحيح هذا الجزء ---
const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } },
} as const;

// ====================================================================
// المكون الرئيسي للقسم
// ====================================================================
export const FeaturedCategories = () => {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4">
        
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter">
            Browse by Category
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            Find everything you need, from pantry staples to gourmet treats.
          </p>
        </motion.div>

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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.name} variants={FADE_UP_ANIMATION_VARIANTS}>
              <Link href={category.href}  className="
                  group
                  block 
                  p-6 
                  bg-card 
                  border 
                  rounded-xl 
                  h-full 
                  transition-all 
                  duration-300 
                  hover:border-primary 
                  hover:shadow-lg 
                  hover:-translate-y-1
                ">
                  <div className="flex items-center gap-4">
                    <div className="
                      p-3 
                      bg-primary/10 
                      rounded-lg 
                      text-primary 
                      transition-colors 
                      group-hover:bg-primary 
                      group-hover:text-primary-foreground
                    ">
                      <category.icon className="h-8 w-8" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
