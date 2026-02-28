"use client";

import { CompactCalculator } from "@/components/calculator/calculator";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";

interface DialogProps {
  onClose: () => void;
}

export default function CalculatorDialog({}: DialogProps) {
  return (
    <DialogContent
      className="sm:max-w-[320px] m-0 p-0 border-0 shadow-2xl"
      showCloseButton={false}
    >
      <DialogTitle>
        <CompactCalculator />
      </DialogTitle>
    </DialogContent>
  );
}
