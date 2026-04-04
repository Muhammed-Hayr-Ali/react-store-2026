import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"

// =====================================================
// 📧 Nodemailer Transporter
// =====================================================

let transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null

export function getTransporter() {
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Gmail sometimes needs this
    },
  })

  return transporter
}

// =====================================================
// 📬 Send Email (Core)
// =====================================================

export type EmailOptions = {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: Array<{ filename: string; content: Buffer | string }>
}

export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  try {
    const mailer = getTransporter()

    const info = await mailer.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME ?? "Multi-Vendor Platform"}" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Failed to send email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
