// =====================================================
// 🛡️ XSS Sanitization Helpers
// =====================================================
// ✅ ينظف المدخلات من scripts و HTML الضار
// ✅ يستخدم sanitize-html (لا يعتمد على jsdom)
// ✅ يمنع XSS attacks
// =====================================================

import sanitizeHtmlLib from "sanitize-html";

export function sanitizeHtml(input: string): string {
  return sanitizeHtmlLib(input, {
    allowedTags: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
    },
  });
}

export function sanitizeText(input: string): string {
  return sanitizeHtmlLib(input, { allowedTags: [] });
}

export function sanitizeUrl(input: string): string {
  const sanitized = sanitizeHtmlLib(input, {
    allowedTags: [],
    allowedSchemes: ["http", "https", "mailto", "tel"],
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
