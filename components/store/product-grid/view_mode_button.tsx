"use client"

/**
 * @file components/store/view-mode.tsx
 * @description View mode toggle component (grid or list) with default value and change callback.
 */

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { saveViewMode } from "@/lib/actions/shared/save-view-mode"
import { LayoutGridIcon, ListIcon } from "lucide-react"

interface ViewModeButtonProps {
  initValue: "grid" | "list"
  onChange: (value: "grid" | "list") => void
}

export default function ViewModeButton({ initValue, onChange }: ViewModeButtonProps) {
  const handleOnValueChange = (value: string) => {
    if (value !== "grid" && value !== "list") return
    saveViewMode(value)
    onChange(value as "grid" | "list")
  }

  return (
    <Tabs
      defaultValue={initValue}
      onValueChange={handleOnValueChange}
      className="w-fit"
    >
      <TabsList>
        <TabsTrigger value="grid" aria-label="Grid view">
          <LayoutGridIcon className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="list" aria-label="List view">
          <ListIcon className="size-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
