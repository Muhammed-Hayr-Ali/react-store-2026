/**
 * @file components/shared/loading_states_animation.tsx
 * @description Centralized Rive animation component mapping authentication and process states
 * (Fetching status, success, fail) smoothly and professionally.
 */

"use client"

import * as React from "react"
import {
  useRive,
  Layout,
  Fit,
  Alignment,
  StateMachineInputType,
} from "@rive-app/react-canvas"
import { cn } from "@/lib/utils"

export type ProcessStatus = "loading" | "success" | "error"

interface LoadingStatusAnimationProps {
  status: ProcessStatus
  className?: string
}

// Number input: 0 = loading, 1 = success, -1 = error
const NUMBER_INPUT_NAME = "status"
const STATUS_VALUE: Record<ProcessStatus, number> = {
  loading: 0,
  success: 1,
  error: -1,
}

// أسماء الأنيميشنات داخل الملف (بديل إذا لم يوجد State Machine)
const ANIMATION_BY_STATUS: Record<ProcessStatus, string> = {
  loading: "Fetching status",
  success: "success",
  error: "fail",
}

const STATUS_LABEL: Record<ProcessStatus, string> = {
  loading: "Loading",
  success: "Completed successfully",
  error: "Something went wrong",
}

export function LoadingStatusAnimation({
  status,
  className,
}: LoadingStatusAnimationProps) {
  // لا نمرّر اسم State Machine ثابتًا: نقرأ الاسم الفعلي من الملف بعد التحميل
  const { rive, RiveComponent } = useRive({
    src: "/rive/auth-states.riv",
    autoplay: false,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  })

  const internal = React.useRef<{
    applied: ProcessStatus | null
    machine: string | null
  }>({ applied: null, machine: null })

  // إعادة التعيين عند إعادة إنشاء Rive (مثل Strict Mode أو Fast Refresh)
  React.useEffect(() => {
    internal.current = { applied: null, machine: null }
  }, [rive])

  React.useEffect(() => {
    if (!rive || internal.current.applied === status) return

    const machineName = rive.stateMachineNames[0]

    // لا يوجد State Machine: شغّل الأنيميشن المطابق مباشرة
    if (!machineName) {
      rive.stop()
      rive.play(ANIMATION_BY_STATUS[status])
      internal.current.applied = status
      return
    }

    // شغّل الـ State Machine مرة واحدة حتى تصبح الـ Inputs متاحة
    if (internal.current.machine !== machineName) {
      rive.play(machineName)
      internal.current.machine = machineName
    }

    const inputs = rive.stateMachineInputs(machineName) ?? []

    // 1) Number input (باسم "status"، أو الوحيد الموجود إن اختلف الاسم)
    const numberInputs = inputs.filter(
      (i) => i.type === StateMachineInputType.Number
    )
    const numberInput =
      numberInputs.find((i) => i.name === NUMBER_INPUT_NAME) ??
      (numberInputs.length === 1 ? numberInputs[0] : undefined)

    if (numberInput) {
      numberInput.value = STATUS_VALUE[status]
      internal.current.applied = status
      return
    }

    // 2) Trigger باسم الحالة (بدون حساسية لحالة الأحرف)
    const wanted = ANIMATION_BY_STATUS[status].toLowerCase()
    const trigger = inputs.find(
      (i) =>
        i.type === StateMachineInputType.Trigger &&
        i.name.toLowerCase() === wanted
    )
    if (trigger) {
      trigger.fire()
      internal.current.applied = status
      return
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Rive] No matching input found. State machine:",
        machineName,
        "Inputs:",
        JSON.stringify(inputs.map((i) => `${i.name} (type ${i.type})`))
      )
    }
  }, [status, rive])

  return (
    <div
      role="status"
      aria-label={STATUS_LABEL[status]}
      className={cn("flex size-24 items-center justify-center", className)}
    >
      <RiveComponent className="size-full" />
    </div>
  )
}