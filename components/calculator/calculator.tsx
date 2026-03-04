"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCalculator } from "@/hooks/useCalculator";
import { motion } from "framer-motion";
import { CalcButton } from "./calculator-button";

interface CompactCalculatorProps {
  onResult?: (value: string) => void;
  initialValue?: string;
}

export function CompactCalculator({
  onResult,
  initialValue,
}: CompactCalculatorProps) {
  const {
    display,
    previousValue,
    operation,
    handleNumber,
    handleOperation,
    handleEqual,
    handleClear,
    handleDelete,
    handleDecimal,
    handlePercentage,
    handleToggleSign,
    setValue,
  } = useCalculator({ initialValue });

  // تنسيق العرض للأرقام
  const formatDisplay = (value: string) => {
    if (value === "Error") return "Error";
    const num = parseFloat(value);
    if (isNaN(num)) return "0";

    if (value.includes(".") && value.endsWith(".")) return value;

    if (value.includes(".")) {
      const [int, dec] = value.split(".");
      return `${parseFloat(int).toLocaleString()}.${dec}`;
    }

    if (Math.abs(num) >= 1e9) return num.toExponential(4);

    return num.toLocaleString("en-US", { maximumFractionDigits: 8 });
  };

  const handleEqualWithCallback = () => {
    handleEqual();
    if (onResult) {
      setTimeout(() => {
        onResult(display);
      }, 0);
    }
  };

  // ✅ Ref لتخزين دوال المعالجة (لتجنب إعادة إضافة مستمع الأحداث)
  const handlersRef = useRef({
    handleNumber,
    handleDecimal,
    handleOperation,
    handleEqualWithCallback,
    handleClear,
    handleDelete,
    handlePercentage,
  });

  // ✅ تحديث الـ Ref عند تغير الدوال
  useEffect(() => {
    handlersRef.current = {
      handleNumber,
      handleDecimal,
      handleOperation,
      handleEqualWithCallback,
      handleClear,
      handleDelete,
      handlePercentage,
    };
  }, [
    handleNumber,
    handleDecimal,
    handleOperation,
    handleEqualWithCallback,
    handleClear,
    handleDelete,
    handlePercentage,
  ]);

  // ✅ Keyboard support: Fixed with useEffect + useRef
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key;
      const h = handlersRef.current; // ✅ الآن .current تعمل بشكل صحيح

      if (key >= "0" && key <= "9") {
        e.preventDefault();
        h.handleNumber(key);
      }
      if (key === ".") {
        e.preventDefault();
        h.handleDecimal();
      }
      if (key === "+" || key === "-") {
        e.preventDefault();
        h.handleOperation(key as "+" | "-");
      }
      if (key === "*") {
        e.preventDefault();
        h.handleOperation("×");
      }
      if (key === "/") {
        e.preventDefault();
        h.handleOperation("÷");
      }
      if (key === "Enter" || key === "=") {
        e.preventDefault();
        h.handleEqualWithCallback();
      }
      if (key === "Escape") {
        e.preventDefault();
        h.handleClear();
      }
      if (key === "Backspace") {
        e.preventDefault();
        h.handleDelete();
      }
      if (key === "%") {
        e.preventDefault();
        h.handlePercentage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // ✅ مصفوفة فارغة: المستمع يُضاف مرة واحدة فقط

  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg">
      <CardContent className="py-4 px-4 space-y-3">
        {/* شاشة العرض */}
        <motion.div
          key={display}
          initial={{ opacity: 0.8, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          className="bg-muted/50 rounded-xl p-4 text-right space-y-1 border border-border/50"
        >
          <div className="text-[11px] text-muted-foreground h-4 font-medium truncate opacity-80">
            {previousValue && operation && (
              <span>
                {formatDisplay(previousValue)} {operation}
              </span>
            )}
          </div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight truncate text-foreground dir-ltr text-right">
            {formatDisplay(display)}
          </div>
        </motion.div>

        {/* شبكة الأزرار */}
        <div className="grid grid-cols-4 gap-2">
          {/* الصف الأول */}
          <CalcButton
            label="AC"
            onClick={handleClear}
            variant="outline"
            className="text-red-500 font-bold"
            ariaLabel="Clear all"
          />
          <CalcButton
            label="±"
            onClick={handleToggleSign}
            variant="outline"
            ariaLabel="Toggle sign"
          />
          <CalcButton
            label="%"
            onClick={handlePercentage}
            variant="outline"
            ariaLabel="Percentage"
          />
          <CalcButton
            label="÷"
            onClick={() => handleOperation("÷")}
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
            ariaLabel="Divide"
          />

          {/* الصف الثاني */}
          <CalcButton label="7" onClick={() => handleNumber("7")} />
          <CalcButton label="8" onClick={() => handleNumber("8")} />
          <CalcButton label="9" onClick={() => handleNumber("9")} />
          <CalcButton
            label="×"
            onClick={() => handleOperation("×")}
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
            ariaLabel="Multiply"
          />

          {/* الصف الثالث */}
          <CalcButton label="4" onClick={() => handleNumber("4")} />
          <CalcButton label="5" onClick={() => handleNumber("5")} />
          <CalcButton label="6" onClick={() => handleNumber("6")} />
          <CalcButton
            label="-"
            onClick={() => handleOperation("-")}
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
            ariaLabel="Subtract"
          />

          {/* الصف الرابع */}
          <CalcButton label="1" onClick={() => handleNumber("1")} />
          <CalcButton label="2" onClick={() => handleNumber("2")} />
          <CalcButton label="3" onClick={() => handleNumber("3")} />
          <CalcButton
            label="+"
            onClick={() => handleOperation("+")}
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
            ariaLabel="Add"
          />

          {/* الصف الخامس */}
          <CalcButton
            label="0"
            onClick={() => handleNumber("0")}
            span={2}
            className="col-span-2"
          />
          <CalcButton
            label="."
            onClick={handleDecimal}
            ariaLabel="Decimal point"
          />
          <CalcButton
            label="="
            onClick={handleEqualWithCallback}
            variant="default"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            ariaLabel="Calculate"
          />
        </div>
      </CardContent>
    </Card>
  );
}
