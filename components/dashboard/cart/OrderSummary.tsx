// components/cart/OrderSummary.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

interface OrderSummaryProps {
  subtotal: number;
}

export function OrderSummary({ subtotal }: OrderSummaryProps) {
  return (
    <Card className="sticky top-24 bg-linear-to-br from-muted/50 to-muted/10">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Shipping</span>
          <span>Calculated at next step</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Taxes</span>
          <span>Calculated at next step</span>
        </div>
        <div className="flex justify-between font-bold text-lg py-4 border-t border-dashed border-f">
          <span>Order Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <Button asChild className="w-full" size="lg">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-muted-foreground">
          Secure payment processing.
        </p>
      </CardFooter>
    </Card>
  );
}
