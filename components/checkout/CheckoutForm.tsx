"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { toast } from "sonner";
import { createOrder } from "@/lib/actions/order"; // استيراد وظيفة إنشاء الطلب
import { PlusCircle } from "lucide-react";
import { AddressForm } from "../shared/address-form";
import { AddressCard } from "./address-card";
import { useCartCount } from "@/lib/provider/cart-provider";
import { useRouter } from "next/navigation";
import { UserAddress } from "@/lib/actions/address";
interface CheckoutFormProps {
  savedAddresses: UserAddress[];
}

export function CheckoutForm({ savedAddresses }: CheckoutFormProps) {
  const { refreshCount } = useCartCount();

  const router = useRouter();

  const [view, setView] = useState<"list" | "form">(
    savedAddresses.length > 0 ? "list" : "form",
  );
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    savedAddresses[0]?.id || null,
  );

  const [isPlacingOrder, startPlaceOrderTransition] = useTransition();

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address.");
      return;
    }
    startPlaceOrderTransition(async () => {
      const { data: orderId, error: orderError } =
        await createOrder(selectedAddress);

      if (orderError || !orderId) {
        toast.error(orderError);
        return;
      }

      refreshCount();
      toast.success("Order placed successfully.");
      router.push(`/order-confirmation?order_id=${orderId}`);
    });
  };

  return (
    <div className="space-y-6">
      {view === "list" && savedAddresses.length > 0 && (
        <div className="space-y-4">
          {savedAddresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddress === address.id}
              onSelect={setSelectedAddress}
            />
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setView("form")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add a New Address
          </Button>
        </div>
      )}

      {view === "form" && (
        <>
          <h3 className="text-xl font-bold mb-4">Add a New Address</h3>
          <AddressForm
            onFormSubmit={() => setView("list")} // ✅ الاسم الصحيح
            onCancel={() => savedAddresses.length > 0 && setView("list")}
          />
        </>
      )}

      <div className="border-t pt-6">
        <Button
          onClick={handlePlaceOrder}
          className="w-full"
          size="lg"
          disabled={isPlacingOrder || view === "form" || !selectedAddress}
        >
          {isPlacingOrder ? <Spinner /> : "Place Order"}
        </Button>
      </div>
    </div>
  );
}
