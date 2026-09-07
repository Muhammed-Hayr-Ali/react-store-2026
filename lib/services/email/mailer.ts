// lib/services/email/mailer.ts
/**
 * @file Configures and initializes the email sending service using Nodemailer.
 * This file creates a reusable "transporter" object that can be used anywhere
 * in the application to send emails.
 */
import nodemailer from "nodemailer"

// Verify that the essential environment variables for sending email are present.
// If they are missing, the application will throw an error on startup,
// making it easy to diagnose configuration issues.
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  throw new Error("Missing EMAIL_USER or EMAIL_PASSWORD environment variables")
}

// Create and export the Nodemailer transporter.
// This object is responsible for the actual email sending.
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com", // SMTP server (e.g., smtp.gmail.com)
  port: Number(process.env.EMAIL_PORT) || 587, // Standard port for SMTP with STARTTLS
  secure: false, // `false` for port 587 (uses STARTTLS), `true` for port 465 (uses SSL/TLS)
  auth: {
    user: process.env.EMAIL_USER, // Username for the email account
    pass: process.env.EMAIL_PASSWORD, // Password or app-specific password
  },
})
