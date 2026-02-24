"use client";

import { useMemo } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { getOrganizedOptions, Option, VariantsProps } from "./ProductDetails";

export function Variants({
  options,
  selectedOptions = {},
  onOptionSelect = () => {},
  variants = [],
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
            {option.values.map((item) => {
              // التحقق من الاختيار باستخدام القيمة فقط
              const isSelected = selectedOptions[option.name] === item.value;
              return (
                <Button
                  key={item.value}
                  type="button"
                  variant={isSelected ? "outline" : "secondary"} // نستخدم outline أو أي لون محايد لأننا سنضيف الحدود الحمراء يدوياً
                  onClick={() => onOptionSelect(option.name, item.value)}
                  size="sm"
                  className={`
                            rounded-none relative h-9 px-4
                            ${isSelected ? "border-foreground border text-foreground" : "border-transparent"}
                            transition-all duration-200
                  `}
                >
                  {/* عرض القيمة والوحدة */}
                  <span className="flex items-center">
                    {item.value}
                    {item.unit && (
                      <span className="ml-1 rtl:mr-1 text-xs font-normal opacity-70">
                        {item.unit}
                      </span>
                    )}
                  </span>

                  {/* رسم المثلث في الزاوية عند التحديد */}
                  {isSelected && (
                    <div
                      className="absolute top-0 right-0 w-0 h-0 
                      border-t-8 border-t-foreground 
                      border-l-8 border-l-transparent"
                      aria-hidden="true"
                    />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
