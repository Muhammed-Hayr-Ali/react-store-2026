"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { createOrder } from "@/lib/actions/order";
import { PlusCircle } from "lucide-react";
import { AddressForm } from "../shared/address-form";
import { AddressCard } from "./address-card";
import { useRouter } from "next/navigation";
import { UserAddress } from "@/lib/actions/address";

interface CheckoutFormProps {
  savedAddresses: UserAddress[];
}

export function CheckoutForm({ savedAddresses }: CheckoutFormProps) {
  const router = useRouter();

  const [view, setView] = useState<"list" | "form">(
    savedAddresses.length > 0 ? "list" : "form",
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.length > 0 ? savedAddresses[0].id || null : null,
  );

  const [isPlacingOrder, startPlaceOrderTransition] = useTransition();

  // **المنطق الجديد: حساب العنوان النشط أثناء التصير**
  // 1. تحقق مما إذا كان العنوان المختار يدويًا لا يزال صالحًا.
  const isSelectedAddressValid = savedAddresses.some(
    (addr) => addr.id === selectedAddressId,
  );

  // 2. حدد العنوان النشط: إما العنوان المختار الصالح، أو أول عنوان في القائمة.
  const activeAddressId = isSelectedAddressValid
    ? selectedAddressId
    : savedAddresses.length > 0
      ? savedAddresses[0].id
      : null;

  const handlePlaceOrder = () => {
    if (!activeAddressId) {
      toast.error("Please select a shipping address.");
      return;
    }
    startPlaceOrderTransition(async () => {
      const { data: orderId, error: orderError } =
        await createOrder(activeAddressId);

      if (orderError || !orderId) {
        toast.error(orderError);
        return;
      }
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
              isSelected={activeAddressId === address.id}
              onSelect={setSelectedAddressId}
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
            onFormSubmit={async () => setView("list")}
            onCancel={() => savedAddresses.length > 0 && setView("list")}
          />
        </>
      )}

      <div className="border-t pt-6">
        <Button
          onClick={handlePlaceOrder}
          className="w-full"
          size="lg"
          disabled={isPlacingOrder || view === "form" || !activeAddressId}
        >
          {isPlacingOrder ? <Spinner /> : "Place Order"}
        </Button>
      </div>
    </div>
  );
}
