// =====================================================
// 📧 Email Templates — قوالب البريد الإلكتروني
// ✨ Inspired by shadcn/ui — Clean, Minimal, Modern
// =====================================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
const BRAND_NAME = "Marketna"

// shadcn/ui inspired colors (zinc palette)
const ZINC_950 = "#09090b" // primary text / dark bg
const ZINC_900 = "#18181b"
const ZINC_700 = "#3f3f46"
const ZINC_600 = "#52525b" // secondary text
const ZINC_500 = "#71717a"
const ZINC_400 = "#a1a1aa" // muted text
const ZINC_300 = "#d4d4d8"
const ZINC_200 = "#e4e4e7" // borders
const ZINC_100 = "#f4f4f5" // subtle bg
const ZINC_50 = "#fafafa" // page bg
const WHITE = "#ffffff"

// ─── Type & Helpers ───────────────────────────────────

export type Lang = "ar" | "en"

type Translations = {
  layout: {
    brandTagline: string
    footerRights: string
    footerAuto: string
    securityNotice: string
  }
  verification: {
    subject: string
    greeting: (name: string) => string
    bodyText: string
    useCode: string
    clickButton: string
    valid15: string
    copyLink: string
    ignore: string
    buttonText: string
  }
  reset: {
    subject: string
    greeting: (name: string) => string
    bodyText: string
    useCode: string
    clickButton: string
    valid15: string
    copyLink: string
    buttonText: string
  }
  welcome: {
    subject: string
    greeting: (name: string) => string
    bodyText: string
    nowYouCan: string
    browse: string
    createOrders: string
    manageAddresses: string
    contactSupport: string
    buttonText: string
  }
  order: {
    subject: (n: string) => string
    greeting: (name: string) => string
    confirmed: string
    orderNumber: string
    total: string
    status: string
    processing: string
    buttonText: string
  }
  ticket: {
    subject: (n: string) => string
    greeting: (name: string) => string
    created: string
    ticketNumber: string
    topic: string
    status: string
    open: string
    buttonText: string
    replySoon: string
  }
}

const translations: Record<Lang, Translations> = {
  ar: {
    layout: {
      brandTagline: "منصة التجارة الإلكترونية",
      footerRights: "جميع الحقوق محفوظة.",
      footerAuto: "هذا البريد مُرسل تلقائياً. يرجى عدم الرد عليه.",
      securityNotice: "إذا لم تطلب هذا الإجراء، يرجى تجاهل هذا البريد.",
    },
    verification: {
      subject: "تأكيد البريد الإلكتروني",
      greeting: (n) => `مرحباً <strong>${n}</strong>،`,
      bodyText:
        "شكراً لتسجيلك في منصتنا. يرجى تأكيد بريدك الإلكتروني لإتمام عملية التسجيل.",
      useCode: "رمز التأكيد:",
      clickButton: "يمكنك أيضاً الضغط على الزر التالي لتأكيد بريدك:",
      valid15: "هذا الرمز صالح لمدة 15 دقيقة من استلام هذا البريد.",
      copyLink: "أو انسخ الرابط التالي في متصفحك:",
      ignore: "إذا لم تقم بإنشاء حساب، يرجى تجاهل هذا البريد.",
      buttonText: "تأكيد البريد الإلكتروني",
    },
    reset: {
      subject: "إعادة تعيين كلمة المرور",
      greeting: (n) => `مرحباً <strong>${n}</strong>،`,
      bodyText: "لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك.",
      useCode: "رمز إعادة التعيين:",
      clickButton: "يمكنك أيضاً الضغط على الزر التالي:",
      valid15: "هذا الرمز صالح لمدة 15 دقيقة من استلام هذا البريد.",
      copyLink: "أو انسخ الرابط التالي في متصفحك:",
      buttonText: "إعادة تعيين كلمة المرور",
    },
    welcome: {
      subject: "مرحباً بك في Marketna",
      greeting: (n) => `مرحباً <strong>${n}</strong>،`,
      bodyText: "تم تفعيل حسابك بنجاح. نرحّب بك في منصتنا.",
      nowYouCan: "يمكنك الآن:",
      browse: "تصفّح المنتجات والعروض",
      createOrders: "إنشاء الطلبات وتتبعها",
      manageAddresses: "إدارة العناوين والمفضلة",
      contactSupport: "التواصل مع فريق الدعم",
      buttonText: "ابدأ الآن",
    },
    order: {
      subject: (n) => `تأكيد الطلب #${n}`,
      greeting: (n) => `مرحباً <strong>${n}</strong>،`,
      confirmed: "تم تأكيد طلبك بنجاح.",
      orderNumber: "رقم الطلب",
      total: "المبلغ الإجمالي",
      status: "الحالة",
      processing: "قيد المعالجة",
      buttonText: "تتبع الطلب",
    },
    ticket: {
      subject: (n) => `تذكرة دعم فني #${n}`,
      greeting: (n) => `مرحباً <strong>${n}</strong>،`,
      created: "تم إنشاء تذكرة الدعم الفني التالية:",
      ticketNumber: "رقم التذكرة",
      topic: "الموضوع",
      status: "الحالة",
      open: "مفتوحة",
      buttonText: "عرض التذكرة",
      replySoon: "سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.",
    },
  },
  en: {
    layout: {
      brandTagline: "E-Commerce Platform",
      footerRights: "All rights reserved.",
      footerAuto: "This email was sent automatically. Please do not reply.",
      securityNotice: "If you did not request this, please ignore this email.",
    },
    verification: {
      subject: "Verify Your Email Address",
      greeting: (n) => `Dear <strong>${n}</strong>,`,
      bodyText:
        "Thank you for registering. Please verify your email address to complete your registration.",
      useCode: "Verification Code:",
      clickButton: "Or click the button below to verify:",
      valid15: "This code is valid for 15 minutes from receipt.",
      copyLink: "Or copy the following link into your browser:",
      ignore: "If you did not create an account, please ignore this email.",
      buttonText: "Verify Email Address",
    },
    reset: {
      subject: "Reset Your Password",
      greeting: (n) => `Dear <strong>${n}</strong>,`,
      bodyText: "We received a request to reset the password for your account.",
      useCode: "Reset Code:",
      clickButton: "Or click the button below:",
      valid15: "This code is valid for 15 minutes from receipt.",
      copyLink: "Or copy the following link into your browser:",
      buttonText: "Reset Password",
    },
    welcome: {
      subject: "Welcome to Marketna",
      greeting: (n) => `Dear <strong>${n}</strong>,`,
      bodyText: "Your account has been activated successfully. Welcome aboard!",
      nowYouCan: "You can now:",
      browse: "Browse products and deals",
      createOrders: "Create and track orders",
      manageAddresses: "Manage addresses and favorites",
      contactSupport: "Contact our support team",
      buttonText: "Get Started",
    },
    order: {
      subject: (n) => `Order Confirmation #${n}`,
      greeting: (n) => `Dear <strong>${n}</strong>,`,
      confirmed: "Your order has been confirmed successfully.",
      orderNumber: "Order Number",
      total: "Total Amount",
      status: "Status",
      processing: "Processing",
      buttonText: "Track Order",
    },
    ticket: {
      subject: (n) => `Support Ticket #${n}`,
      greeting: (n) => `Dear <strong>${n}</strong>,`,
      created: "Your support ticket has been created:",
      ticketNumber: "Ticket Number",
      topic: "Topic",
      status: "Status",
      open: "Open",
      buttonText: "View Ticket",
      replySoon: "Our team will reply to you as soon as possible.",
    },
  },
}

function t(lang: Lang) {
  return translations[lang]
}

// ─── Base Layout (shadcn/ui inspired) ─────────────────

function baseTemplate(content: string, lang: Lang) {
  const isRtl = lang === "ar"
  const tr = t(lang)
  const dir = isRtl ? "rtl" : "ltr"
  const ta = isRtl ? "right" : "left"
  // Web-safe fonts that work in ALL email clients (Gmail, Outlook, Apple Mail)
  const fontEN =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  const fontAR = "'Segoe UI', Tahoma, Arial, 'Helvetica Neue', sans-serif"
  const font = isRtl ? fontAR : fontEN

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title></title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: ${font}; background-color: ${ZINC_50}; color: ${ZINC_950}; line-height: 1.7; direction: ${dir}; text-align: ${ta}; }
    .wrapper { width: 100%; background-color: ${ZINC_50}; }
    .container { max-width: 560px; margin: 0 auto; background-color: ${WHITE}; border: 1px solid ${ZINC_200}; border-radius: 12px; overflow: hidden; }
    
    /* Header — minimal */
    .header { padding: 32px 36px 28px; border-bottom: 1px solid ${ZINC_100}; text-align: center; }
    .logo { font-size: 20px; font-weight: 700; color: ${ZINC_950}; letter-spacing: -0.5px; margin-bottom: 4px; }
    .tagline { font-size: 13px; color: ${ZINC_500}; font-weight: 400; }
    
    /* Body */
    .body { padding: 36px; }
    
    /* Typography */
    .text { font-size: 15px; color: ${ZINC_600}; line-height: 1.7; margin-bottom: 16px; text-align: ${ta}; }
    .text-sm { font-size: 13px; color: ${ZINC_500}; text-align: ${ta}; }
    .text-xs { font-size: 12px; color: ${ZINC_400}; text-align: ${ta}; }
    .text-strong { font-weight: 600; color: ${ZINC_900}; }
    
    /* Code Box — shadcn badge style */
    .code-box { text-align: center; margin: 24px 0; }
    .code-inner { display: inline-block; background-color: ${ZINC_100}; border: 1px solid ${ZINC_200}; border-radius: 8px; padding: 14px 28px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 24px; font-weight: 700; letter-spacing: 5px; color: ${ZINC_900}; }
    
    /* Button — shadcn primary */
    .btn-wrap { text-align: center; margin: 24px 0; }
    .btn { display: inline-block; background-color: ${ZINC_900}; color: ${WHITE} !important; text-decoration: none; border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 500; text-align: center; transition: background-color 0.15s; }
    
    /* Link */
    .link-wrap { margin-top: 12px; }
    .link-text { font-size: 12px; color: ${ZINC_400}; word-break: break-all; text-align: ${ta}; }
    .link-url { color: ${ZINC_600}; text-decoration: underline; }
    
    /* Card — shadcn card style */
    .card { background-color: ${WHITE}; border: 1px solid ${ZINC_200}; border-radius: 10px; margin: 20px 0; overflow: hidden; }
    .card-row { padding: 14px 20px; border-bottom: 1px solid ${ZINC_100}; text-align: ${ta}; }
    .card-row:last-child { border-bottom: none; }
    .card-label { font-size: 12px; color: ${ZINC_500}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
    .card-value { font-size: 15px; color: ${ZINC_900}; font-weight: 600; margin-top: 2px; }
    
    /* Badge — shadcn badge */
    .badge { display: inline-block; background-color: ${ZINC_100}; color: ${ZINC_700}; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
    .badge-green { background-color: #ecfdf5; color: #065f46; }
    
    /* Separator */
    .sep { height: 1px; background-color: ${ZINC_100}; margin: 20px 0; }
    
    /* Notice */
    .notice { font-size: 13px; color: ${ZINC_500}; text-align: ${ta}; padding: 12px 16px; background-color: ${ZINC_50}; border-radius: 8px; margin: 16px 0; border: 1px solid ${ZINC_100}; }
    
    /* Feature list */
    .feature { padding: 6px 0; font-size: 14px; color: ${ZINC_600}; text-align: ${ta}; }
    
    /* Footer */
    .footer { padding: 24px 36px; border-top: 1px solid ${ZINC_100}; text-align: center; background-color: ${ZINC_50}; }
    
    @media only screen and (max-width: 580px) {
      .body, .header, .footer { padding: 24px 20px !important; }
      .code-inner { font-size: 20px !important; padding: 10px 20px !important; }
      .container { border-radius: 0 !important; border: none !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" class="wrapper" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr><td align="center" style="padding: 32px 16px;">
      <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px;">
        <!-- Header -->
        <tr>
          <td class="header" style="padding: 32px 36px 28px; border-bottom: 1px solid ${ZINC_100}; text-align: center;">
            <div class="logo" style="font-size: 20px; font-weight: 700; color: ${ZINC_950}; letter-spacing: -0.5px;">${BRAND_NAME}</div>
            <div class="tagline" style="font-size: 13px; color: ${ZINC_500};">${tr.layout.brandTagline}</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td class="body" style="padding: 36px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td class="footer" style="padding: 24px 36px; border-top: 1px solid ${ZINC_100}; text-align: center; background-color: ${ZINC_50};">
            <p class="text-xs" style="font-size: 12px; color: ${ZINC_400}; margin: 0 0 4px;">&copy; ${new Date().getFullYear()} ${BRAND_NAME}. ${tr.layout.footerRights}</p>
            <p class="text-xs" style="font-size: 11px; color: ${ZINC_400}; margin: 0;">${tr.layout.footerAuto}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Email Verification ───────────────────────────────

export function emailVerificationTemplate(
  userName: string,
  verificationUrl: string,
  code?: string,
  lang: Lang = "ar"
) {
  const tr = t(lang).verification
  const isRtl = lang === "ar"
  const ta = isRtl ? "right" : "left"

  const content = code
    ? `
      <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.greeting(userName)}</p>
      <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.bodyText}</p>
      
      <p class="text text-strong" style="font-size: 14px; color: ${ZINC_700}; font-weight: 600; text-align: ${ta}; margin-top: 20px;">${tr.useCode}</p>
      
      <div class="code-box" style="text-align: center; margin: 20px 0;">
        <span class="code-inner" style="display: inline-block; background-color: ${ZINC_100}; border: 1px solid ${ZINC_200}; border-radius: 8px; padding: 14px 28px; font-family: 'SF Mono', monospace; font-size: 24px; font-weight: 700; letter-spacing: 5px; color: ${ZINC_900};">${code}</span>
      </div>
      
      <div class="notice" style="font-size: 13px; color: ${ZINC_500}; text-align: ${ta}; padding: 12px 16px; background-color: ${ZINC_50}; border-radius: 8px; border: 1px solid ${ZINC_100}; margin: 16px 0;">
        ${tr.valid15}
      </div>
      
      <p class="text" style="font-size: 14px; color: ${ZINC_600}; text-align: ${ta}; margin-top: 20px;">${tr.clickButton}</p>
      
      <div class="btn-wrap" style="text-align: center; margin: 20px 0;">
        <a href="${verificationUrl}" class="btn" style="display: inline-block; background-color: ${ZINC_900}; color: ${WHITE} !important; text-decoration: none; border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 500;">${tr.buttonText}</a>
      </div>
      
      <div class="link-wrap" style="margin-top: 12px;">
        <p class="link-text" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">${tr.copyLink}</p>
        <p class="link-text" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">
          <a href="${verificationUrl}" class="link-url" style="color: ${ZINC_500}; text-decoration: underline;">${verificationUrl}</a>
        </p>
      </div>
      
      <div class="sep" style="height: 1px; background-color: ${ZINC_100}; margin: 20px 0;"></div>
      <p class="text-xs" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">${tr.ignore}</p>
    `
    : `
      <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.greeting(userName)}</p>
      <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.bodyText}</p>
      
      <p class="text" style="font-size: 14px; color: ${ZINC_600}; text-align: ${ta}; margin-top: 16px;">${tr.clickButton}</p>
      
      <div class="btn-wrap" style="text-align: center; margin: 20px 0;">
        <a href="${verificationUrl}" class="btn" style="display: inline-block; background-color: ${ZINC_900}; color: ${WHITE} !important; text-decoration: none; border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 500;">${tr.buttonText}</a>
      </div>
      
      <div class="notice" style="font-size: 13px; color: ${ZINC_500}; text-align: ${ta}; padding: 12px 16px; background-color: ${ZINC_50}; border-radius: 8px; border: 1px solid ${ZINC_100}; margin: 16px 0;">
        ${tr.valid15}
      </div>
      
      <div class="link-wrap" style="margin-top: 12px;">
        <p class="link-text" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">${tr.copyLink}</p>
        <p class="link-text" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">
          <a href="${verificationUrl}" class="link-url" style="color: ${ZINC_500}; text-decoration: underline;">${verificationUrl}</a>
        </p>
      </div>
      
      <div class="sep" style="height: 1px; background-color: ${ZINC_100}; margin: 20px 0;"></div>
      <p class="text-xs" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">${tr.ignore}</p>
    `

  return { html: baseTemplate(content, lang), subject: tr.subject }
}

// ─── Password Reset ───────────────────────────────────

export function passwordResetTemplate(
  userName: string,
  resetUrl: string,
  code?: string,
  lang: Lang = "ar"
) {
  const tr = t(lang).reset
  const isRtl = lang === "ar"
  const ta = isRtl ? "right" : "left"

  const content = code
    ? `
      <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.greeting(userName)}</p>
      <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.bodyText}</p>
      
      <p class="text text-strong" style="font-size: 14px; color: ${ZINC_700}; font-weight: 600; text-align: ${ta}; margin-top: 20px;">${tr.useCode}</p>
      
      <div class="code-box" style="text-align: center; margin: 20px 0;">
        <span class="code-inner" style="display: inline-block; background-color: ${ZINC_100}; border: 1px solid ${ZINC_200}; border-radius: 8px; padding: 14px 28px; font-family: 'SF Mono', monospace; font-size: 24px; font-weight: 700; letter-spacing: 5px; color: ${ZINC_900};">${code}</span>
      </div>
      
      <div class="notice" style="font-size: 13px; color: ${ZINC_500}; text-align: ${ta}; padding: 12px 16px; background-color: ${ZINC_50}; border-radius: 8px; border: 1px solid ${ZINC_100}; margin: 16px 0;">
        ${tr.valid15}
      </div>
      
      <p class="text" style="font-size: 14px; color: ${ZINC_600}; text-align: ${ta}; margin-top: 20px;">${tr.clickButton}</p>
      
      <div class="btn-wrap" style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" class="btn" style="display: inline-block; background-color: ${ZINC_900}; color: ${WHITE} !important; text-decoration: none; border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 500;">${tr.buttonText}</a>
      </div>
      
      <div class="link-wrap" style="margin-top: 12px;">
        <p class="link-text" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">${tr.copyLink}</p>
        <p class="link-text" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">
          <a href="${resetUrl}" class="link-url" style="color: ${ZINC_500}; text-decoration: underline;">${resetUrl}</a>
        </p>
      </div>
      
      <div class="sep" style="height: 1px; background-color: ${ZINC_100}; margin: 20px 0;"></div>
      <p class="text-xs" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">${t(lang).layout.securityNotice}</p>
    `
    : `
      <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.greeting(userName)}</p>
      <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.bodyText}</p>
      
      <p class="text" style="font-size: 14px; color: ${ZINC_600}; text-align: ${ta}; margin-top: 16px;">${tr.clickButton}</p>
      
      <div class="btn-wrap" style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" class="btn" style="display: inline-block; background-color: ${ZINC_900}; color: ${WHITE} !important; text-decoration: none; border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 500;">${tr.buttonText}</a>
      </div>
      
      <div class="notice" style="font-size: 13px; color: ${ZINC_500}; text-align: ${ta}; padding: 12px 16px; background-color: ${ZINC_50}; border-radius: 8px; border: 1px solid ${ZINC_100}; margin: 16px 0;">
        ${tr.valid15}
      </div>
      
      <div class="link-wrap" style="margin-top: 12px;">
        <p class="link-text" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">${tr.copyLink}</p>
        <p class="link-text" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">
          <a href="${resetUrl}" class="link-url" style="color: ${ZINC_500}; text-decoration: underline;">${resetUrl}</a>
        </p>
      </div>
      
      <div class="sep" style="height: 1px; background-color: ${ZINC_100}; margin: 20px 0;"></div>
      <p class="text-xs" style="font-size: 12px; color: ${ZINC_400}; text-align: ${ta};">${t(lang).layout.securityNotice}</p>
    `

  return { html: baseTemplate(content, lang), subject: tr.subject }
}

// ─── Welcome Email ────────────────────────────────────

export function welcomeTemplate(
  userName: string,
  loginUrl?: string,
  lang: Lang = "ar"
) {
  const tr = t(lang).welcome
  const isRtl = lang === "ar"
  const ta = isRtl ? "right" : "left"
  const url = loginUrl ?? `${APP_URL}/auth/login`

  const content = `
    <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.greeting(userName)}</p>
    <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.bodyText}</p>
    
    <p class="text text-strong" style="font-size: 14px; color: ${ZINC_700}; font-weight: 600; text-align: ${ta}; margin-top: 20px;">${tr.nowYouCan}</p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr><td class="feature" style="padding: 6px 0; font-size: 14px; color: ${ZINC_600}; text-align: ${ta};">&check; ${tr.browse}</td></tr>
      <tr><td class="feature" style="padding: 6px 0; font-size: 14px; color: ${ZINC_600}; text-align: ${ta};">&check; ${tr.createOrders}</td></tr>
      <tr><td class="feature" style="padding: 6px 0; font-size: 14px; color: ${ZINC_600}; text-align: ${ta};">&check; ${tr.manageAddresses}</td></tr>
      <tr><td class="feature" style="padding: 6px 0; font-size: 14px; color: ${ZINC_600}; text-align: ${ta};">&check; ${tr.contactSupport}</td></tr>
    </table>
    
    <div class="btn-wrap" style="text-align: center; margin: 24px 0;">
      <a href="${url}" class="btn" style="display: inline-block; background-color: ${ZINC_900}; color: ${WHITE} !important; text-decoration: none; border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 500;">${tr.buttonText}</a>
    </div>
  `

  return { html: baseTemplate(content, lang), subject: tr.subject }
}

// ─── Order Confirmation ───────────────────────────────

export function orderConfirmationTemplate(
  userName: string,
  orderNumber: string,
  total: string,
  orderUrl?: string,
  lang: Lang = "ar"
) {
  const tr = t(lang).order
  const isRtl = lang === "ar"
  const ta = isRtl ? "right" : "left"
  const url = orderUrl ?? `${APP_URL}/orders/${orderNumber}`

  const content = `
    <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.greeting(userName)}</p>
    <p class="text text-strong" style="font-size: 15px; color: ${ZINC_900}; font-weight: 600; text-align: ${ta};">${tr.confirmed}</p>
    
    <div class="card" style="background-color: ${WHITE}; border: 1px solid ${ZINC_200}; border-radius: 10px; margin: 20px 0; overflow: hidden;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td class="card-row" style="padding: 14px 20px; border-bottom: 1px solid ${ZINC_100}; text-align: ${ta};">
            <span class="card-label" style="font-size: 12px; color: ${ZINC_500}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">${tr.orderNumber}</span>
            <div class="card-value" style="font-size: 15px; color: ${ZINC_900}; font-weight: 600; margin-top: 2px;">${orderNumber}</div>
          </td>
          <td class="card-row" style="padding: 14px 20px; border-bottom: 1px solid ${ZINC_100}; text-align: ${ta};">
            <span class="card-label" style="font-size: 12px; color: ${ZINC_500}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">${tr.total}</span>
            <div class="card-value" style="font-size: 15px; color: ${ZINC_900}; font-weight: 600; margin-top: 2px;">${total}</div>
          </td>
        </tr>
        <tr>
          <td class="card-row" style="padding: 14px 20px; text-align: ${ta}; border-bottom: none;">
            <span class="card-label" style="font-size: 12px; color: ${ZINC_500}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">${tr.status}</span>
            <div style="margin-top: 4px;">
              <span class="badge badge-green" style="display: inline-block; background-color: #ecfdf5; color: #065f46; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500;">${tr.processing}</span>
            </div>
          </td>
          <td class="card-row" style="padding: 14px 20px; text-align: ${ta}; border-bottom: none;"></td>
        </tr>
      </table>
    </div>
    
    <div class="btn-wrap" style="text-align: center; margin: 24px 0;">
      <a href="${url}" class="btn" style="display: inline-block; background-color: ${ZINC_900}; color: ${WHITE} !important; text-decoration: none; border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 500;">${tr.buttonText}</a>
    </div>
  `

  return { html: baseTemplate(content, lang), subject: tr.subject(orderNumber) }
}

// ─── Support Ticket ───────────────────────────────────

export function supportTicketTemplate(
  userName: string,
  ticketNumber: string,
  subjectText: string,
  ticketUrl?: string,
  lang: Lang = "ar"
) {
  const tr = t(lang).ticket
  const isRtl = lang === "ar"
  const ta = isRtl ? "right" : "left"
  const url = ticketUrl ?? `${APP_URL}/support/${ticketNumber}`

  const content = `
    <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.greeting(userName)}</p>
    <p class="text" style="font-size: 15px; color: ${ZINC_600}; text-align: ${ta};">${tr.created}</p>
    
    <div class="card" style="background-color: ${WHITE}; border: 1px solid ${ZINC_200}; border-radius: 10px; margin: 20px 0; overflow: hidden;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td class="card-row" style="padding: 14px 20px; border-bottom: 1px solid ${ZINC_100}; text-align: ${ta};">
            <span class="card-label" style="font-size: 12px; color: ${ZINC_500}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">${tr.ticketNumber}</span>
            <div class="card-value" style="font-size: 15px; color: ${ZINC_900}; font-weight: 600; margin-top: 2px;">${ticketNumber}</div>
          </td>
          <td class="card-row" style="padding: 14px 20px; border-bottom: 1px solid ${ZINC_100}; text-align: ${ta};">
            <span class="card-label" style="font-size: 12px; color: ${ZINC_500}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">${tr.topic}</span>
            <div class="card-value" style="font-size: 15px; color: ${ZINC_900}; font-weight: 600; margin-top: 2px;">${subjectText}</div>
          </td>
        </tr>
        <tr>
          <td class="card-row" style="padding: 14px 20px; text-align: ${ta}; border-bottom: none;">
            <span class="card-label" style="font-size: 12px; color: ${ZINC_500}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">${tr.status}</span>
            <div style="margin-top: 4px;">
              <span class="badge" style="display: inline-block; background-color: ${ZINC_100}; color: ${ZINC_700}; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500;">${tr.open}</span>
            </div>
          </td>
          <td class="card-row" style="padding: 14px 20px; text-align: ${ta}; border-bottom: none;"></td>
        </tr>
      </table>
    </div>
    
    <div class="btn-wrap" style="text-align: center; margin: 24px 0;">
      <a href="${url}" class="btn" style="display: inline-block; background-color: ${ZINC_900}; color: ${WHITE} !important; text-decoration: none; border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 500;">${tr.buttonText}</a>
    </div>
    
    <p class="text-sm" style="font-size: 13px; color: ${ZINC_500}; text-align: ${ta}; margin-top: 16px;">${tr.replySoon}</p>
  `

  return {
    html: baseTemplate(content, lang),
    subject: tr.subject(ticketNumber),
  }
}
