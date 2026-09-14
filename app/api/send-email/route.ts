// app/api/send-email/route.ts
import { NextRequest, NextResponse } from "next/server"
import { transporter } from "@/lib/services/email/mailer"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text, html } = await request.json()

    // التحقق من البيانات المطلوبة
    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { error: "Missing required email fields" },
        { status: 400 }
      )
    }

    // إرسال البريد الإلكتروني
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html, // يمكنك استخدام HTML لتنسيق الرسالة بشكل جميل
    })

    return NextResponse.json(
      { message: "Email sent successfully", messageId: info.messageId },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
