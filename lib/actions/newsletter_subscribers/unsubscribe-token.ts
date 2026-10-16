/**
 * @file lib/actions/newsletter_subscribers/unsubscribe-token.ts
 * @description إنشاء رموز إلغاء الاشتراك المشفرة وقراءتها والتحقق منها.
 */

import "server-only"

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto"

import { newsletterSubscriberSchema } from "./schemas"

const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000
const TOKEN_IV_LENGTH = 12
const TOKEN_AUTH_TAG_LENGTH = 16
const MAX_TOKEN_LENGTH = 2048

interface NewsletterUnsubscribePayload {
  email: string
  issuedAt: number
}

export class NewsletterUnsubscribeConfigurationError extends Error {
  constructor() {
    super("NEWSLETTER_UNSUBSCRIBE_SECRET must be set to at least 32 characters")
    this.name = "NewsletterUnsubscribeConfigurationError"
  }
}

function getEncryptionKey() {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET
  if (!secret || secret.length < 32) {
    throw new NewsletterUnsubscribeConfigurationError()
  }

  return createHash("sha256").update(secret).digest()
}

/**
 * تنشئ رمز إلغاء اشتراك مشفرًا ومحدود الصلاحية.
 */
export function createNewsletterUnsubscribeToken(
  email: string,
  issuedAt = Date.now()
) {
  const iv = randomBytes(TOKEN_IV_LENGTH)
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify({ email, issuedAt }), "utf8"),
    cipher.final(),
  ])

  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".")
}

/**
 * تفك رمز إلغاء الاشتراك وتتحقق من سلامته وصلاحيته.
 */
export function readNewsletterUnsubscribeToken(
  token: string,
  now = Date.now()
): NewsletterUnsubscribePayload | null {
  if (token.length > MAX_TOKEN_LENGTH) return null

  const parts = token.split(".")
  if (parts.length !== 3) return null

  const [encodedIv, encodedAuthTag, encodedCiphertext] = parts
  const iv = Buffer.from(encodedIv, "base64url")
  const authTag = Buffer.from(encodedAuthTag, "base64url")
  const ciphertext = Buffer.from(encodedCiphertext, "base64url")

  if (
    iv.length !== TOKEN_IV_LENGTH ||
    authTag.length !== TOKEN_AUTH_TAG_LENGTH ||
    ciphertext.length === 0
  ) {
    return null
  }

  let payload: unknown
  try {
    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf8")
    payload = JSON.parse(decrypted)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("NEWSLETTER_UNSUBSCRIBE_SECRET")
    ) {
      throw error
    }
    return null
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("email" in payload) ||
    !("issuedAt" in payload) ||
    typeof payload.email !== "string" ||
    typeof payload.issuedAt !== "number" ||
    !Number.isSafeInteger(payload.issuedAt) ||
    payload.issuedAt > now ||
    now - payload.issuedAt >= TOKEN_LIFETIME_MS
  ) {
    return null
  }

  const emailValidation = newsletterSubscriberSchema.safeParse({
    email: payload.email,
  })
  if (!emailValidation.success) return null

  return {
    email: emailValidation.data.email,
    issuedAt: payload.issuedAt,
  }
}
