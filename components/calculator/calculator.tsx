// components/calculator/compact-calculator.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCalculator } from "@/hooks/useCalculator";
import { motion } from "framer-motion";
import { CalcButton } from "./calculator-button";

interface CompactCalculatorProps {
  onResult?: (value: string) => void;
  initialValue?: string;
}

export function CompactCalculator({
  onResult,
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
  } = useCalculator();

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
      const result =
        previousValue && operation
          ? String(eval(`${previousValue}${operation}${display}`))
          : display;
      onResult(result);
    }
  };

  // Keyboard support
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key >= "0" && e.key <= "9") handleNumber(e.key);
      if (e.key === ".") handleDecimal();
      if (e.key === "+" || e.key === "-") handleOperation(e.key as "+" | "-");
      if (e.key === "*") handleOperation("×");
      if (e.key === "/") handleOperation("÷");
      if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEqualWithCallback();
      }
      if (e.key === "Escape") handleClear();
      if (e.key === "Backspace") handleDelete();
      if (e.key === "%") handlePercentage();
    });
  }

  return (
    <Card className="w-full">
      

      <CardContent className="py-0 px-4 space-y-2">
        {/* Display */}
        <motion.div
          key={display}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className="bg-muted rounded-lg p-2.5 text-right space-y-0.5"
        >
          <div className="text-[10px] text-muted-foreground h-3.5 truncate">
            {previousValue && operation && (
              <span>
                {formatDisplay(previousValue)} {operation}
              </span>
            )}
          </div>
          <div className="text-lg sm:text-xl font-bold tracking-tight truncate min-h-5">
            {formatDisplay(display)}
          </div>
        </motion.div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {/* Row 1 */}
          <CalcButton
            label="AC"
            onClick={handleClear}
            variant="outline"
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
            variant="default"
            ariaLabel="Divide"
          />

          {/* Row 2 */}
          <CalcButton label="7" onClick={() => handleNumber("7")} />
          <CalcButton label="8" onClick={() => handleNumber("8")} />
          <CalcButton label="9" onClick={() => handleNumber("9")} />
          <CalcButton
            label="×"
            onClick={() => handleOperation("×")}
            variant="default"
            ariaLabel="Multiply"
          />

          {/* Row 3 */}
          <CalcButton label="4" onClick={() => handleNumber("4")} />
          <CalcButton label="5" onClick={() => handleNumber("5")} />
          <CalcButton label="6" onClick={() => handleNumber("6")} />
          <CalcButton
            label="-"
            onClick={() => handleOperation("-")}
            variant="default"
            ariaLabel="Subtract"
          />

          {/* Row 4 */}
          <CalcButton label="1" onClick={() => handleNumber("1")} />
          <CalcButton label="2" onClick={() => handleNumber("2")} />
          <CalcButton label="3" onClick={() => handleNumber("3")} />
          <CalcButton
            label="+"
            onClick={() => handleOperation("+")}
            variant="default"
            ariaLabel="Add"
          />

          {/* Row 5 */}
          <CalcButton label="0" onClick={() => handleNumber("0")} span={2} />
          <CalcButton
            label="."
            onClick={handleDecimal}
            ariaLabel="Decimal point"
          />
          <CalcButton
            label="="
            onClick={handleEqualWithCallback}
            variant="destructive"
            ariaLabel="Calculate"
          />
        </div>
      </CardContent>
    </Card>
  );
}
