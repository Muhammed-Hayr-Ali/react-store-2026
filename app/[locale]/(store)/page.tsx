import { Wrench } from "lucide-react"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Under Maintenance",
    description:
      "Our website is currently under maintenance. We will be back soon.",
  })
}

export default function Page() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="flex size-32 items-center justify-center rounded-[50%] corner-squircle bg-muted p-6">
        <Wrench className="size-full text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Under Maintenance
        </h1>
        <p className="max-w-125 text-lg text-muted-foreground">
          We are currently performing scheduled maintenance to improve your
          experience. We&apos;ll be back online shortly. Thank you for your
          patience!
        </p>
      </div>
    </div>
  )
}
