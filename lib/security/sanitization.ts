// =====================================================
// 🛡️ XSS Sanitization Helpers
// =====================================================
// ✅ ينظف المدخلات من scripts و HTML الضار
// ✅ يستخدم DOMPurify (موجود بالفعل في المشروع)
// ✅ يمنع XSS attacks
// =====================================================

import createDOMPurify from "isomorphic-dompurify";

const DOMPurify = createDOMPurify();

export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "title", "target", "rel"],
    ADD_ATTR: ["rel"],
    ADD_DATA_URI: false,
    ADD_URI_SAFE_ATTR: ["data-*"],
  });
}

export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

export function sanitizeUrl(input: string): string {
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
  return sanitized || "#";
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeAttributeValue(value: string): string {
  return value.replace(/[&<>"']/g, (match) => {
    const escapeMap: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
    };
    return escapeMap[match];
  });
}
