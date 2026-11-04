import { OpenWAClient } from "@rmyndharis/openwa"

export function createOpenWAClient() {
  return new OpenWAClient({
    baseUrl: process.env.OPENWA_API_URL || "",
    apiKey: process.env.OPENWA_API_KEY || "",
  })
}
