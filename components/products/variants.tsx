'use client';


import { useMemo } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { getOrganizedOptions, Option, VariantsProps } from "./ProductDetails";

export function Variants({
  options,
  selectedOptions = {},
  onOptionSelect = () => {},
  variants,
}: VariantsProps) {
  const organizedOptions: Option[] = useMemo(() => {
    if (options && options.length > 0) {
      return options;
    }
    if (variants && variants.length > 0) {
      return getOrganizedOptions(variants);
    }
    return [];
  }, [options, variants]);

  if (organizedOptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {organizedOptions.map((option) => (
        <div key={option.name} className="space-y-2">
          <Label className="text-sm font-medium leading-none">
            {option.name}
          </Label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value;
              return (
                <Button
                  key={value}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onOptionSelect(option.name, value)}
                >
                  {value}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

