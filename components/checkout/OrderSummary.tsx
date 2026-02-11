import { type Cart } from "@/types";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";

interface OrderSummaryProps {
  cart: Cart;
}

export function OrderSummary({ cart }: OrderSummaryProps) {
  const subtotal = cart.cart_items.reduce((acc, item) => {
    const price =
      item.product_variants?.discount_price ??
      item.product_variants?.price ??
      0;
    return acc + price * item.quantity;
  }, 0);

  // يمكنك إضافة تكاليف الشحن والضرائب هنا في المستقبل
  const shippingCosts = 5.0; // مثال
  const taxes = subtotal * 0.1; // مثال
  const total = subtotal + shippingCosts + taxes;

  return (
    <Card className="sticky top-24 h-fit bg-linear-to-br from-muted/50 to-muted/10">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* قائمة المنتجات */}
        <div className="space-y-4">
          {cart.cart_items.map((item) => {
            const variant = item.product_variants;
            const product = variant?.products;
            if (!variant || !product) return null;

            const price = variant.discount_price ?? variant.price;
            const options = variant.variant_option_values
              ?.map((vov) => vov?.product_option_values?.value)
              .filter(Boolean)
              .join(" / ");

            return (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-md border bg-white">
                  <Image
                    src={product.main_image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                  />
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{options}</p>
                </div>
                <p className="font-medium">
                  ${(price * item.quantity).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>

        {/* تفاصيل السعر */}
        <div className="space-y-2 border-t pt-4 border-dashed">
          <div className="flex justify-between">
            <p className="text-muted-foreground">Subtotal</p>
            <p className="font-medium">${subtotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-foreground">Shipping</p>
            <p className="font-medium">${shippingCosts.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-foreground">Taxes</p>
            <p className="font-medium">${taxes.toFixed(2)}</p>
          </div>
        </div>

        {/* الإجمالي النهائي */}
        <div className="flex justify-between border-t pt-4 text-lg font-bold border-dashed">
          <p>Total</p>
          <p>${total.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-muted-foreground">
          Secure payment processing.
        </p>
      </CardFooter>
    </Card>
  );
}
