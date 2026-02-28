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
}

export function useCalculator(): UseCalculatorReturn {
  const [display, setDisplay] = useState("0");
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
          return b !== 0 ? a / b : 0;
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
    setDisplay(String(parseFloat(display) / 100));
    setIsNewNumber(true);
  }, [display]);

  const handleToggleSign = useCallback(() => {
    setDisplay(String(-parseFloat(display)));
  }, [display]);

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
  };
}
