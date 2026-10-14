import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // ==========================================
  // 🛡️ القواعد المعمارية المخصصة للمشروع
  // ==========================================
  {
    rules: {
      // ❌ 1. المنع البات لاستخدام any (يجب استخدام unknown بدلاً منه)
      "@typescript-eslint/no-explicit-any": "error",

      // إيقاف قاعدة camelCase الافتراضية للتمكن من تخصيصها بدقة
      "camelcase": "off",

      // ✅ 2. فرض قواعد التسمية (Naming Conventions)
      "@typescript-eslint/naming-convention": [
        "error",
        // 💡 الحل هنا: تجاهل فحص الخصائص التي تُكتب بين علامات تنصيص (مثل أسماء قواعد ESLint)
        {
          "selector": ["property", "typeProperty"],
          "modifiers": ["requiresQuotes"],
          "format": null
        },
        // القواعد الأساسية لخصائص البيانات العادية
        {
          "selector": "property",
          "format": ["snake_case", "camelCase", "UPPER_CASE"],
          "leadingUnderscore": "allow"
        },
        {
          "selector": "typeProperty",
          "format": ["snake_case", "camelCase"],
          "leadingUnderscore": "allow"
        },
        // القواعد الأساسية للدوال والمتغيرات
        {
          "selector": ["function", "variable"],
          "format": ["camelCase", "PascalCase", "snake_case", "UPPER_CASE"]        }
      ]
    }
  }
]);

export default eslintConfig;
