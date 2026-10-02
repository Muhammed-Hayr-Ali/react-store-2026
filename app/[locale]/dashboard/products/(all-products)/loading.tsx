import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <main className="flex h-full min-h-screen w-full items-center justify-center">
      <Spinner />
    </main>
  )
}
