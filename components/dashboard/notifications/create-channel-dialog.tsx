"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { createNotificationChannel } from "@/lib/actions/notifications"

const channelSchema = z.object({
  slug: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  name_ar: z.string().min(2).max(100),
  description: z.string().optional(),
  description_ar: z.string().optional(),
  isMandatory: z.boolean(),
  defaultEnabled: z.boolean(),
})

type ChannelFormValues = z.infer<typeof channelSchema>

export function CreateChannelDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      slug: "",
      name: "",
      name_ar: "",
      description: "",
      description_ar: "",
      isMandatory: false,
      defaultEnabled: true,
    },
  })

  const isMandatory = watch("isMandatory")
  const defaultEnabled = watch("defaultEnabled")

  async function onSubmit(data: ChannelFormValues) {
    const res = await createNotificationChannel(data)

    if (res.success) {
      toast.success("Notification channel created successfully!")
      reset()
      setOpen(false)
      onSuccess?.()
    } else {
      toast.error(res.error || "Failed to create channel")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 text-xs">
          <PlusIcon className="size-3.5" />
          Add Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Create Notification Channel
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a new subscription channel for users and mass announcements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2">
          <Field data-invalid={Boolean(errors.slug)}>
            <FieldLabel className="text-xs">Slug (Unique identifier)</FieldLabel>
            <Input
              placeholder="e.g. seasonal-deals"
              className="h-8 text-xs"
              {...register("slug")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel className="text-xs">Name (EN)</FieldLabel>
              <Input
                placeholder="Seasonal Deals"
                className="h-8 text-xs"
                {...register("name")}
              />
            </Field>

            <Field data-invalid={Boolean(errors.name_ar)}>
              <FieldLabel className="text-xs">Name (AR)</FieldLabel>
              <Input
                placeholder="عروض المواسم"
                className="h-8 text-xs"
                {...register("name_ar")}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel className="text-xs">Description (EN)</FieldLabel>
            <Input
              placeholder="Alerts for seasonal and holiday discounts"
              className="h-8 text-xs"
              {...register("description")}
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs">Description (AR)</FieldLabel>
            <Input
              placeholder="تنبيهات تخفيضات المواسم والأعياد"
              className="h-8 text-xs"
              {...register("description_ar")}
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg border p-2.5">
            <div className="space-y-0.5">
              <span className="text-xs font-medium">Default Enabled</span>
              <p className="text-[11px] text-muted-foreground">
                Auto-subscribe all new and existing users
              </p>
            </div>
            <Switch
              checked={defaultEnabled}
              onCheckedChange={(val) => setValue("defaultEnabled", val)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-2.5">
            <div className="space-y-0.5">
              <span className="text-xs font-medium">Mandatory Channel</span>
              <p className="text-[11px] text-muted-foreground">
                Users cannot opt out (e.g. system or order updates)
              </p>
            </div>
            <Switch
              checked={isMandatory}
              onCheckedChange={(val) => {
                setValue("isMandatory", val)
                if (val) setValue("defaultEnabled", true)
              }}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="size-3.5" /> : "Save Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}