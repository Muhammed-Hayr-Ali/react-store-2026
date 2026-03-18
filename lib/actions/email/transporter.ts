import nodemailer from "nodemailer"

// ===============================================================================
// Nodemailer Transporter (Gmail SMTP)
// ===============================================================================

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // false for port 587, true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // لتجنب مشاكل الشهادات
  },
})

// التحقق من الاتصال عند البدء
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error)
  } else {
    console.log("✅ Email transporter is ready to send messages")
  }
})
