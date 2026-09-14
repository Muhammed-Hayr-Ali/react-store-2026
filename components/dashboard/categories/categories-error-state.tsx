import { CustomButton } from "@/components/ui/custom-button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { DatabaseX } from "lucide-react"

export function CategoriesErrorState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DatabaseX />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>
          We&apos;re sorry, something went wrong. Please try again.{" "}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <CustomButton>Try again</CustomButton>
      </EmptyContent>
    </Empty>
  )
}
