import { createOpenWAClient } from "@/lib/openwa/openWAClient"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  // استخراج رقم الهاتف من الـ Query Parameters (رابط الطلب)
  const url = new URL(request.url)
  const phoneNumber = url.searchParams.get("phoneNumber")

  if (!phoneNumber) {
    return Response.json(
      { success: false, error: "Phone number is required" },
      { status: 400 }
    )
  }

  const openWA = createOpenWAClient()
  const sessionId = process.env.OPENWA_SESSION_ID

  if (!sessionId) {
    return Response.json(
      { success: false, error: "Session ID is not set" },
      { status: 400 }
    )
  }

  const result = await openWA.messages.sendText(sessionId, {
    chatId: `${phoneNumber}@c.us`,
    text: "Hello from OpenWA!",
  })

  return Response.json({ success: true, result })
}