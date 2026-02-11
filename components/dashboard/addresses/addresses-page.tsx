"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AddressForm } from "@/components/shared/address-form";
import { AddressCard } from "./address-card.tsx";
import { UserAddress } from "@/lib/types/account/address.js";

export default function AddressesPage({
  addresses,
}: {
  addresses: UserAddress[];
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<UserAddress | null>(null);

  const handleFormSubmitted = () => {
    setIsAddDialogOpen(false);
    setAddressToEdit(null);
  };

  return (
    <>
      {addresses.length === 0 ? (
        <div className="flex flex-1 h-full items-center justify-center rounded-lg border border-dashed">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-xl font-semibold">No Saved Addresses</h2>
            <p className="text-muted-foreground mt-2">
              Add an address to make checkout faster.
            </p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <button className="mt-4 inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add New Address
                  </div>
                </button>

                {/* <Button className="flex gap-4 mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-md">
                  
                </Button> */}
              </DialogTrigger>
              <DialogContent
                className={cn("h-4/5 sm:max-w-1/2 grid-rows-[auto_1fr]")}
              >
                <DialogHeader>
                  <DialogTitle>Add a New Address</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto -mx-6 px-6">
                  <AddressForm
                    mode="add"
                    onFormSubmit={handleFormSubmitted}
                    onCancel={() => setIsAddDialogOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Addresses</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent
                className={cn("h-4/5 sm:max-w-1/2 grid-rows-[auto_1fr]")}
              >
                <DialogHeader>
                  <DialogTitle>Add a New Address</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto -mx-6 px-6">
                  <AddressForm
                    mode="add"
                    onFormSubmit={handleFormSubmitted}
                    onCancel={() => setIsAddDialogOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => setAddressToEdit(address)}
              />
            ))}
          </div>
        </>
      )}

      <Dialog
        open={!!addressToEdit}
        onOpenChange={(isOpen) => !isOpen && setAddressToEdit(null)}
      >
        <DialogContent
          className={cn("h-4/5 sm:max-w-1/2 grid-rows-[auto_1fr]")}
        >
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto -mx-6 px-6">
            <AddressForm
              mode="edit"
              addressToEdit={addressToEdit!}
              onFormSubmit={handleFormSubmitted}
              onCancel={() => setAddressToEdit(null)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
