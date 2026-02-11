"use client";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { ModeToggleIcon } from "./icons";

export function ModeToggle() {
  const { setTheme } = useTheme();

  const handleToggle = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  return (
    <Button variant="ghost" size="icon" className="shadow-none h-8" onClick={handleToggle}>
      <ModeToggleIcon />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
