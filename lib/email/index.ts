// =====================================================
// 📧 Email Module — إعادة تصدير
// =====================================================

// Types
export type { Lang } from "./templates"

// Transporter (منخفض المستوى)
export { getTransporter, sendEmail, type EmailOptions } from "./transporter"

// Service (وظائف ذات مستوى عالٍ)
export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendSupportTicketEmail,
  testEmailConnection,
} from "./service"

// Server Actions
export {
  sendVerificationAction,
  sendPasswordResetAction,
  sendWelcomeAction,
  sendOrderConfirmationAction,
  sendSupportTicketAction,
  testEmailConnectionAction,
} from "./actions"

// Templates
export {
  emailVerificationTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  orderConfirmationTemplate,
  supportTicketTemplate,
} from "./templates"
