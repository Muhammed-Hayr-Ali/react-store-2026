interface EmailTemplateProps {
  title: string
  greeting?: string
  body: string
  ctaText?: string
  ctaLink?: string
  footerText?: string
  companyName?: string
}

export function EmailTemplate({
  title,
  greeting = "مرحباً",
  body,
  ctaText,
  ctaLink,
  footerText = "شكراً لاستخدامك خدماتنا",
  companyName = "MarketNA",
}: EmailTemplateProps) {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f4f4f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #000000 0%, #18181b 100%); padding: 32px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${companyName}</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px 32px;">
                <h2 style="margin: 0 0 24px 0; color: #18181b; font-size: 20px; font-weight: 600;">${greeting}،</h2>
                
                <div style="color: #52525b; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
                  ${body}
                </div>
                
                ${ctaLink && ctaText ? `
                <table role="presentation" style="margin: 32px 0; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="border-radius: 8px; background-color: #000000;">
                      <a href="${ctaLink}" style="display: inline-block; padding: 12px 32px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 8px;">
                        ${ctaText}
                      </a>
                    </td>
                  </tr>
                </table>
                ` : ''}
                
                <div style="border-top: 1px solid #e4e4e7; margin-top: 32px; padding-top: 24px;">
                  <p style="margin: 0; color: #71717a; font-size: 14px;">${footerText}</p>
                  <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 12px;">فريق ${companyName}</p>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #fafafa; padding: 24px 32px; text-align: center; border-top: 1px solid #e4e4e7;">
                <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                  © ${new Date().getFullYear()} ${companyName}. جميع الحقوق محفوظة.
                </p>
                <p style="margin: 8px 0 0 0; color: #d4d4d8; font-size: 11px;">
                  تم إرسال هذا البريد الإلكتروني من ${companyName}
                </p>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim()
}
