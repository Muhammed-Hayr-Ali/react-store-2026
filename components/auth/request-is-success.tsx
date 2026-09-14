"use client"

import { CircleCheck, Mail, AlertCircle, Clock, ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"

interface IsSuccessProps {
  onClick: () => void
  email: string
}

export function IsSuccess({ onClick, email }: IsSuccessProps) {
  return (
    <div>
      {/* أيقونة النجاح */}
      <div className="mx-auto mb-6 flex items-center justify-center">
        {/* الأيقونة الرئيسية */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-green-600">
          <CircleCheck className="h-10 w-10 text-white" strokeWidth={1.5} />
        </div>
      </div>

      {/* العنوان الرئيسي */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          Check your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a password reset link to
        </p>
      </div>

      {/* صندوق البريد الإلكتروني */}
      <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50/50 px-4 py-3">
        <Mail className="h-4 w-4 text-green-600" />
        <p className="text-sm font-semibold text-green-900">{email}</p>
      </div>

      {/* معلومات إضافية */}
      <div className="mb-6 space-y-3">
        {/* معلومات السبام */}
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              Didn&apos;t receive the email?
            </p>
            <p>
              Check your spam folder or{" "}
              <button
                onClick={onClick}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                try another email
              </button>
            </p>
          </div>
        </div>

        {/* معلومات الصلاحية */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-4 w-4" />
          <p>The link will expire in 15 minutes</p>
        </div>
      </div>

      {/* زر العودة */}
      <Button onClick={onClick} variant="secondary" className="w-full gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Button>
    </div>
  )
}
