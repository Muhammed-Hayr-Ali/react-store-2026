"use client"

import { IconFolderCode } from "@tabler/icons-react"

import { CustomButton } from "@/components/ui/custom-button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import CreateCategorySheet from "./create-category"
import { Category } from "./categories-table"
import React from "react"
import { useRouter } from "next/navigation"

export function CategoriesEmptyState() {
  const router = useRouter()

  // Dialog & sheet state for delete confirmation
  const [actions, setActions] = React.useState<{
    isOpen: string | null
    item: Category | null
    items: Category[] | null
  }>({
    isOpen: null,
    item: null,
    items: null,
  })

  const resetActions = () => {
    setActions({ isOpen: null, item: null, items: null })
    router.refresh()
  }

  return (
    <>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconFolderCode />
          </EmptyMedia>
          <EmptyTitle>No Categories Yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any categories yet. Get started by creating
            your first category.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <CustomButton onClick={() => setActions({ isOpen: "create", item: null, items: null })}>Create Category</CustomButton>
        </EmptyContent>
      </Empty>

      <CreateCategorySheet
        isOpen={actions.isOpen}
        onOpenChange={resetActions}
        items={null}
        onSuccess={resetActions}
      />
    </>
  )
}
