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
import Link from "next/link";

interface OrderSummaryProps {
  subtotal: number;
}

export function OrderSummary({ subtotal }: OrderSummaryProps) {
  return (
    <Card className="sticky bg-muted/50">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t border-dashed">
          <span>Shipping</span>
          <span className="text-right">Calculated at checkout</span>
        </div>

        {/* Taxes */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Taxes</span>
          <span className="text-right">Calculated at checkout</span>
        </div>

        {/* Total Estimate */}
        <div className="flex justify-between font-bold text-lg pt-4 border-t border-dashed">
          <span>Estimated Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button asChild className="w-full" size="lg">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
