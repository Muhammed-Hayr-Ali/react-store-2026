"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, CreditCard, Headset } from "lucide-react";


type Feature = {
  icon: React.ElementType;
  title: string;
  description: string;
};


const features: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Guaranteed Quality",
    description:
      "We carefully select our products from the best suppliers and brands to ensure you get top quality in every order.",
  },
  {
    icon: Truck,
    title: "Fast & Reliable Delivery",
    description:
      "Your orders arrive at your doorstep quickly. Easily track your shipment from the moment it leaves our warehouse.",
  },
  {
    icon: CreditCard,
    title: "Secure & Easy Payments",
    description:
      "Shop with peace of mind with our secure and multiple payment options. Your data is fully encrypted and protected.",
  },
  {
    icon: Headset,
    title: "Excellent Customer Support",
    description:
      "Our team is here to help you every step of the way. Have a question? We're just a message or a call away.",
  },
];


const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } },
} as const;


export const WhyChooseUs = () => {
  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4">

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter">
            An Unmatched Shopping Experience
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            We are committed to providing you with the best service and highest
            quality products.
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={FADE_UP_ANIMATION_VARIANTS}
              className="text-center p-6 bg-card border rounded-xl"
            >
              <div
                className="
                inline-flex 
                items-center 
                justify-center 
                p-4 
                bg-primary/10 
                text-primary 
                rounded-full 
                mb-4
              "
              >
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
