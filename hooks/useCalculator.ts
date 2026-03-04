// hooks/useCalculator.ts
"use client";

import { useState, useCallback } from "react";

export type CalculatorOperation = "+" | "-" | "×" | "÷" | null;

export interface UseCalculatorReturn {
  display: string;
  previousValue: string | null;
  operation: CalculatorOperation;
  handleNumber: (num: string) => void;
  handleOperation: (op: CalculatorOperation) => void;
  handleEqual: () => void;
  handleClear: () => void;
  handleDelete: () => void;
  handleDecimal: () => void;
  handlePercentage: () => void;
  handleToggleSign: () => void;
  setValue: (value: string) => void; // ✅ دالة جديدة للتحكم بالقيمة
}

interface UseCalculatorProps {
  initialValue?: string;
}

export function useCalculator({
  initialValue = "0",
}: UseCalculatorProps = {}): UseCalculatorReturn {
  const [display, setDisplay] = useState(initialValue);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<CalculatorOperation>(null);
  const [isNewNumber, setIsNewNumber] = useState(true);

  const calculate = useCallback(
    (a: number, b: number, op: CalculatorOperation): number => {
      switch (op) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "×":
          return a * b;
        case "÷":
          return b !== 0 ? a / b : 0; // يمكن إرجاع Error بدلاً من 0
        default:
          return b;
      }
    },
    [],
  );

  const handleNumber = useCallback(
    (num: string) => {
      if (isNewNumber) {
        setDisplay(num);
        setIsNewNumber(false);
      } else {
        setDisplay((prev) => (prev === "0" ? num : prev + num));
      }
    },
    [isNewNumber],
  );

  const handleDecimal = useCallback(() => {
    if (isNewNumber) {
      setDisplay("0.");
      setIsNewNumber(false);
    } else if (!display.includes(".")) {
      setDisplay((prev) => prev + ".");
    }
  }, [display, isNewNumber]);

  const handleOperation = useCallback(
    (op: CalculatorOperation) => {
      if (operation && previousValue && !isNewNumber) {
        const result = calculate(
          parseFloat(previousValue),
          parseFloat(display),
          operation,
        );
        setDisplay(String(result));
        setPreviousValue(String(result));
      } else {
        setPreviousValue(display);
      }
      setOperation(op);
      setIsNewNumber(true);
    },
    [display, operation, previousValue, isNewNumber, calculate],
  );

  const handleEqual = useCallback(() => {
    if (!operation || !previousValue) return;
    const result = calculate(
      parseFloat(previousValue),
      parseFloat(display),
      operation,
    );
    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setIsNewNumber(true);
  }, [display, operation, previousValue, calculate]);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setIsNewNumber(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (
      display.length === 1 ||
      (display.length === 2 && display.startsWith("-"))
    ) {
      setDisplay("0");
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  }, [display]);

  const handlePercentage = useCallback(() => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      setDisplay(String(value / 100));
      setIsNewNumber(true);
    }
  }, [display]);

  const handleToggleSign = useCallback(() => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      setDisplay(String(-value));
    }
  }, [display]);

  // ✅ دالة جديدة لضبط القيمة يدوياً (مفيدة لـ initialValue والـ Callbacks)
  const setValue = useCallback((value: string) => {
    setDisplay(value);
    setIsNewNumber(true);
  }, []);

  return {
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
    setValue, // ✅ إرجاع الدالة الجديدة
  };
}
