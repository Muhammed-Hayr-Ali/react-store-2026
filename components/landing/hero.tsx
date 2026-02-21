"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

export const Hero = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // --- تعريف متغيرات الحركة مع إضافة "as const" ---
  const FADE_UP_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  } as const; // <-- الحل هنا

  return (
    <section className="relative isolate container flex items-center justify-center mx-auto w-full min-h-screen overflow-hidden">
      {/* الخلفيات (تبقى كما هي) */}
      <div
        className="
        absolute inset-0 -z-30 
        bg-[linear-gradient(to_right,--theme(--color-border/0.4)_1px,transparent_1px),linear-gradient(to_bottom,--theme(--color-border/0.4)_1px,transparent_1px)]          dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] 
        bg-size-[3rem_3rem] "
      />
      <div
        className="pointer-events-none absolute inset-0 -z-20 transition-all duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0), var(--color-background) 40%)`,
        }}
      />

      {/* المحتوى الرئيسي مع الحركة */}
      <motion.div
        initial="hidden"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        className="relative z-10 flex flex-col space-y-4 items-center text-center"
      >
        <motion.h1
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70"
        >
          Fill Your Cart
        </motion.h1>

        <motion.h2
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="text-3xl md:text-5xl tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70"
        >
          Fulfill Your Life.
        </motion.h2>

        <motion.p
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Shop thousands of products from the best global and local brands.
        </motion.p>

        <motion.div
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <Button size="lg" className="group">
            Start Shopping
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Special Offers
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};
