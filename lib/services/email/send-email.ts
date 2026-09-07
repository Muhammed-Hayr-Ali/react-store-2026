// lib/services/email/send-email.ts
"use server"

/**
 * @file A Server Action to send emails using a React component as the template.
 * It leverages Nodemailer and @react-email/render.
 */

import { transporter } from "./mailer"
import { render } from "@react-email/render"
import { ApiResult } from "@/lib/database/types/utils"
import React from "react"

// Defines the parameters required for the sendEmail function.
export interface SendEmailParams {
  to: string
  subject: string
  reactComponent: React.ReactElement
}

/**
 * Sends an email by rendering a React component to HTML.
 * @param data The email data, including recipient, subject, and the React component.
 * @returns An `ApiResult` containing the messageId on success, or an error code on failure.
 */
export async function sendEmail(
  data: SendEmailParams
): Promise<ApiResult<{ messageId: string }>> {
  try {
    // 1. Validate that all required fields are provided.
    if (!data.to || !data.subject || !data.reactComponent) {
      return { success: false, error: "MISSING_EMAIL_FIELDS" }
    }

    // 2. Render the React component into an HTML string.
    const htmlContent = await render(data.reactComponent, {
      pretty: true,
    })

    // 3. Send the email using the pre-configured Nodemailer transporter.
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Use the correct 'from' address from environment variables
      to: data.to,
      subject: data.subject,
      html: htmlContent,
    })

    // 4. Return a success response with the unique message ID.
    return { success: true, data: { messageId: info.messageId } }
  } catch (error) {
    // 5. Catch and log any unexpected errors during the process.
    console.error("❌ Error in sendEmail action:", error)
    return { success: false, error: "FAILED_TO_SEND_EMAIL" }
  }
}
