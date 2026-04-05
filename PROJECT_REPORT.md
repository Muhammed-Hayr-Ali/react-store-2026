# 📊 تقرير المشروع الكامل -- Marketna

> **تاريخ التقرير:** 2026-04-05  
> **الإصدار:** 0.1.0  
> **الحالة:** قيد التطوير النشط

---

## 📋 جدول المحتويات

1. [معلومات عامة](#1-معلومات-عامة)
2. [التقنية المستخدمة](#2-التقنية-المستخدمة)
3. [هيكل المجلدات](#3-هيكل-المجلدات)
4. [قاعدة البيانات](#4-قاعدة-البيانات)
5. [المصادقة والحماية](#5-المصادقة-والحماية)
6. [نظام الإشعارات](#6-نظام-الإشعارات)
7. [الصفحات والمسارات](#7-الصفحات-والمسارات)
8. [API Routes](#8-api-routes)
9. [المكونات](#9-المكونات)
10. [التدويل (i18n)](#10-التدويل-i18n)
11. [ملفات البيئة](#11-ملفات-البيئة)
12. [النشر](#12-النشر)
13. [المهام المكتملة](#13-المهام-المكتملة)
14. [المهام المعلقة](#14-المهام-المعلقة)
15. [المشاكل المعروفة](#15-المشاكل-المعروفة)
16. [أحدث التعديلات](#16-أحدث-التعديلات)

---

## 1. معلومات عامة

| البند | القيمة |
|------|--------|
| **اسم المشروع** | Marketna (ماركتنا) |
| **نوع المشروع** | منصة تجارة إلكترونية متعددة البائعين |
| **المستودع** | https://github.com/Muhammed-Hayr-Ali/react-store-2026 |
| **الإصدار** | 0.1.0 |
| **حالة الواجهة** | قيد التطوير (صفحات المصادقة + الإشعارات جاهزة) |
| **عدد الجداول** | 23 جدول |
| **اللغات** | العربية + الإنجليزية |
| **بيئة التشغيل** | Next.js 16.1.5 + Turbopack |

---

## 2. التقنية المستخدمة

### Frontend
| التقنية | الإصدار | الوظيفة |
|---------|---------|---------|
| Next.js | 16.1.5 | إطار العمل |
| React | 19.2.4 | مكتبة الواجهات |
| TypeScript | 5.9.3 | الأنواع |
| TailwindCSS | 4.1.18 | التنسيقات |
| shadcn/ui | - | مكتبة المكونات |
| lucide-react | 0.563.0 | الأيقونات |
| next-intl | 4.7.0 | التدويل |
| date-fns | 4.1.0 | صياغة التواريخ |
| framer-motion | 12.29.2 | الحركات |
| sonner | 2.0.7 | الإشعارات المنبثقة |
| react-hook-form | 7.71.1 | نماذج الإدخال |
| zod | 4.3.6 | التحقق من المدخلات |
| isomorphic-dompurify | 3.0.0 | حماية XSS |

### Backend & Database
| التقنية | الوظيفة |
|---------|---------|
| Supabase | قاعدة البيانات + المصادقة |
| Supabase SSR | إدارة الجلسات |
| Supabase Realtime | إشعارات فورية |

### Email & Communication
| التقنية | الوظيفة |
|---------|---------|
| nodemailer | إرسال البريد |
| @react-email | قوالب البريد |
| Gmail SMTP | خادم الإرسال |

---

## 3. هيكل المجلدات

```
d:\Next.JS 2026\application\
├── app/                          ← Next.js App Router
│   ├── page.tsx                  ← إعادة توجيه للغة الافتراضية
│   ├── global-error.tsx          ← معالجة الأخطاء العامة
│   ├── globals.css               ← التنسيقات العامة
│   ├── manifest.ts               ← PWA manifest
│   ├── [locale]/                 ← مسار اللغة الديناميكي
│   │   ├── layout.tsx            ← التخطيط الرئيسي (خطوط + موفرين)
│   │   ├── error.tsx             ← صفحة الخطأ
│   │   ├── not-found.tsx         ← صفحة 404
│   │   ├── (auth)/               ← مجموعة المصادقة
│   │   │   ├── layout.tsx        ← GuestGuard
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── callback/
│   │   ├── (mfa)/                ← مجموعة المصادقة الثنائية
│   │   │   ├── layout.tsx        ← AuthGuard
│   │   │   ├── verify/
│   │   │   └── two-factor/setup/
│   │   ├── (site)/               ← مجموعة الموقع العام
│   │   │   ├── layout.tsx        ← عام + AuthDebug
│   │   │   ├── page.tsx          ← ComingSoonPage
│   │   │   └── home/
│   │   ├── terms/
│   │   └── privacy/
│   └── api/                      ← مسارات API
│       ├── csrf-token/
│       ├── api-tester/
│       └── cron/
│           ├── update-rates/
│           └── cleanup-tokens/
├── components/                   ← مكونات React
│   ├── auth/                     ← نماذج المصادقة
│   ├── notifications/            ← نظام الإشعارات
│   ├── ui/                       ← 30 مكون shadcn
│   ├── shared/                   ← مكونات مشتركة
│   ├── legal/                    ← صفحات قانونية
│   ├── debug/                    ← مكونات تصحيح
│   └── common-soon/              ← صفحة قريباً
├── lib/                          ← منطق الأعمال
│   ├── actions/                  ← Server Actions
│   │   ├── authentication/       ← تسجيل دخول/خروج
│   │   └── mfa/                  ← مصادقة ثنائية
│   ├── security/                 ← حماية وأمان
│   ├── database/                 ← Supabase + أنواع
│   ├── middleware/               ← Guards
│   ├── providers/                ← React Providers
│   ├── navigation/               ← خريطة المسارات
│   ├── email/                    ← إرسال البريد
│   └── config/                   ← إعدادات
├── supabase/                     ← ملفات SQL
│   ├── 001_Schema/
│   ├── 002_Utility Functions/
│   ├── 003_RLS Policies/
│   ├── 004_Seed Data/
│   ├── 005_Trigger Functions/
│   ├── 006_Tests/
│   ├── 007_Password Reset/
│   └── 008_Notifications/
├── messages/                     ← ملفات الترجمة
│   ├── ar.json
│   └── en.json
├── i18n/                         ← إعدادات التدويل
├── hooks/                        ← React Hooks مخصصة
├── docs/                         ← توثيق
├── scripts/                      ← سكريبتات مساعدة
└── public/                       ← ملفات ثابتة
```

---

## 4. قاعدة البيانات

### 23 جدول موزعة على 9 وحدات

#### 🔐 Core Module (5 جداول)
| الجدول | الوظيفة |
|--------|---------|
| `core_profile` | بيانات المستخدمين |
| `core_role` | الأدوار والصلاحيات |
| `core_profile_role` | ربط المستخدم بالدور |
| `core_address` | عناوين المستخدمين |
| `auth_password_reset` | رموز إعادة تعيين كلمة المرور |

#### 💱 Exchange Rates (1 جدول)
| الجدول | الوظيفة |
|--------|---------|
| `exchange_rates` | أسعار الصرف (SYP, SAR, EGP, TRY, EUR, AED) |

#### 💰 SaaS Module (2 جدول)
| الجدول | الوظيفة |
|--------|---------|
| `saas_plan` | خطط الاشتراك (free, seller, delivery, enterprise) |
| `saas_subscription` | اشتراكات المستخدمين |

#### 🏪 Store Module (5 جداول)
| الجدول | الوظيفة |
|--------|---------|
| `store_vendor` | متاجر البائعين |
| `store_category` | تصنيفات المنتجات |
| `store_product` | المنتجات |
| `product_image` | صور المنتجات |
| `product_variant` | متغيرات المنتجات (الحجم، اللون...) |

#### 🛒 Trade Module (2 جدول)
| الجدول | الوظيفة |
|--------|---------|
| `trade_order` | الطلبات |
| `trade_order_item` | عناصر الطلب |

#### 🚚 Fleet Module (2 جدول)
| الجدول | الوظيفة |
|--------|---------|
| `fleet_driver` | السائقين |
| `fleet_delivery` | طلبات التوصيل |

#### 💬 Social Module (2 جدول)
| الجدول | الوظيفة |
|--------|---------|
| `social_review` | التقييمات |
| `customer_favorite` | المفضلة |

#### 🎫 Support Module (2 جدول)
| الجدول | الوظيفة |
|--------|---------|
| `support_ticket` | تذاكر الدعم |
| `ticket_message` | رسائل التذاكر |

#### 🔔 System Module (2 جدول)
| الجدول | الوظيفة |
|--------|---------|
| `sys_notification` | الإشعارات |
| `system_error_log` | سجل الأخطاء |

### 14 نوع Enum
`delivery_status`, `vendor_status`, `role_name`, `plan_category`, `sub_status`, `notify_type`, `order_status`, `ticket_status`, `ticket_priority`, `error_severity`, `payment_method`, `payment_status`, + 2 إضافيين

---

## 5. المصادقة والحماية

### Guards (3)
| Guard | الموقع | الوظيفة |
|-------|--------|---------|
| **AuthGuard** | `(mfa)/layout.tsx` | يمنع الزوار من صفحات MFA |
| **GuestGuard** | `(auth)/layout.tsx` | يمنع المسجلين من صفحات الدخول |
| **MfaGuard** | `[locale]/layout.tsx` (Root) | يتحقق من مستوى MFA لكل المسجلين |

### Security Modules
| الملف | الوظيفة |
|------|---------|
| `lib/security/rate-limiter.ts` | تحديد الطلبات حسب IP |
| `lib/security/csrf.ts` | حماية CSRF |
| `lib/security/csrf-server-action.ts` | التحقق من CSRF في Server Actions |
| `lib/security/validation-schemas.ts` | Zod schemas للتحقق من المدخلات |
| `lib/security/sanitization.ts` | حماية XSS |
| `lib/security/env-validation.ts` | التحقق من متغيرات البيئة |
| `lib/security/cors.ts` | سياسة CORS |
| `lib/security/audit-logger.ts` | تسجيل الأحداث الأمنية |
| `lib/security/api-middleware.ts` | حماية API Routes |

### Auth Actions
| الدالة | الوظيفة | الحماية |
|--------|---------|---------|
| `signInWithPassword` | تسجيل دخول | CSRF + Zod + Audit |
| `signUpWithPassword` | إنشاء حساب | Zod + Audit |
| `signOut` | تسجيل خروج | - |
| `signIn-with-google` | OAuth | - |
| `requestPasswordReset` | طلب إعادة تعيين | CSRF + Rate Limit + Audit |
| `resetPassword` | إعادة تعيين كلمة المرور | CSRF + Zod + Audit |

---

## 6. نظام الإشعارات

### الملفات
```
components/notifications/
├── notification-bell.tsx      ← الجرس + Popover + Dropdown
├── notification-item.tsx      ← عنصر الإشعار
├── index.ts                   ← تصدير مركزي
└── README.md                  ← توثيق

supabase/008_Notifications/
├── 001_notifications_functions.sql   ← 11 دالة RPC
├── 002_notifications_rls.sql         ← سياسات أمان
├── 003_notifications_triggers.sql    ← 5 مشغلات تلقائية
└── README.md                         ← توثيق SQL
```

### الوظائف المنفذة
| الوظيفة | الحالة | ملاحظات |
|---------|--------|---------|
| إنشاء إشعار | ✅ | `create_notification` |
| إشعارات جماعية | ✅ | `create_bulk_notifications` |
| جلب الإشعارات | ✅ | `get_user_notifications` |
| عدد غير المقروءة | ✅ | `get_unread_count` |
| تحديد كمقروء | ✅ | حذف مباشر من الجدول (بدون RPC) |
| حذف الكل | ✅ | `Promise.all` متوازي |
| Realtime | ✅ | Supabase Realtime مع deduplication |
| تبويبات زمنية | ✅ | اليوم / هذا الأسبوع / السابق |
| قائمة منسدلة | ✅ | جعل مقروء + حذف مقروء + حذف الكل |
| التنقل عند النقر | ✅ | يفتح `action_url` |
| أيقونات ملونة | ✅ | حسب نوع الإشعار |
| العداد الديناميكي | ✅ | 1-9 رقم, 10+ → `9+` |

### الإشعارات التلقائية (Triggers)
| المشغل | الجدول | يُرسل إلى |
|--------|--------|----------|
| تغيير حالة الطلب | `trade_order` | العميل |
| إنشاء تذكرة | `support_ticket` | المشرف |
| رد على تذكرة | `ticket_message` | الطرف الآخر |
| إضافة تقييم | `social_review` | البائع |
| تعيين سائق | `fleet_delivery` | العميل |

---

## 7. الصفحات والمسارات

### المسارات المعرفة
```
/                            → إعادة توجيه إلى /en/ أو /ar/
/[locale]/                   → ComingSoonPage
/[locale]/home               → ComingSoonPage
/[locale]/sign-in            ← تسجيل الدخول (زائر فقط)
/[locale]/sign-up            ← إنشاء حساب (زائر فقط)
/[locale]/forgot-password    ← نسيت كلمة المرور (زائر فقط)
/[locale]/reset-password     ← إعادة تعيين (زائر فقط)
/[locale]/callback           ← OAuth callback (زائر فقط)
/[locale]/verify             ← MFA verification (مسجل فقط)
/[locale]/two-factor/setup   ← إعداد MFA (مسجل فقط)
/[locale]/terms              ← شروط الخدمة
/[locale]/privacy            ← سياسة الخصوصية
```

### خريطة المسارات المركزية
```
lib/navigation/routes.ts → appRouter (25+ مسار)
```

---

## 8. API Routes

| المسار | الطريقة | الوظيفة | الحماية |
|--------|---------|---------|---------|
| `/api/csrf-token` | GET | إنشاء CSRF token | - |
| `/api/api-tester` | GET | اختبار API | - |
| `/api/cron/update-rates` | GET | تحديث أسعار العملات | Rate Limit + CRON_SECRET |
| `/api/cron/cleanup-tokens` | GET | تنظيف رموز إعادة التعيين | Rate Limit + CRON_SECRET |

---

## 9. المكونات

### UI Components (30 مكون)
accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, button-group, card, collapsible, dialog, dropdown-menu, field, input, input-otp, label, mobile-menu, popover, progress, progress-bar, radio-group, select, separator, sheet, sidebar, skeleton, sonner, spinner, table, tabs, textarea, tooltip

### Auth Forms (7 مكونات)
sign-in-form, sign-up-form, forgot-password-form, reset-password-form, verify-form, two-factor-setup-page, callback-page

---

## 10. التدويل (i18n)

| البند | القيمة |
|------|--------|
| **المكتبة** | next-intl 4.7.0 |
| **اللغات** | العربية (ar) + الإنجليزية (en) |
| **اللغة الافتراضية** | en |
| **localePrefix** | never (مخفي من URL) |
| **الخطوط** | Inter (Latin) + Cairo (Arabic) |
| **الاتجاه** | RTL للعربية, LTR للإنجليزية |
| **ملفات الترجمة** | `messages/ar.json`, `messages/en.json` |
| **مفاتيح Errors** | 11 مفتاح ترجمة للأخطاء |

---

## 11. ملفات البيئة

| الملف | المحتويات |
|------|-----------|
| `.env.example` | قالب عام (بدون أسرار) |
| `.env` | قيم افتراضية للتطوير |
| `.env.local` | أسرار حقيقية (محفوظة في .gitignore) |

### المتغيرات المطلوبة
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
CRON_SECRET
NEWSLETTER_JWT_SECRET
EXCHANGERATE_API_KEY
ONESIGNAL_APP_ID
EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM
```

---

## 12. النشر

| البند | القيمة |
|------|--------|
| **المنصة** | Vercel |
| **Cron Job مُفعّل** | `/api/cron/update-rates` يومياً 05:00 UTC |
| **Cron Job غير مُفعّل** | `/api/cron/cleanup-tokens` ⚠️ |
| **Security Headers** | ✅ كاملة (HSTS, CSP, X-Frame, etc.) |
| **poweredByHeader** | ❌ مُعطّل |

---

## 13. المهام المكتملة

### ✅ نظام المصادقة
- [x] تسجيل دخول بالبريد + كلمة المرور
- [x] تسجيل دخول بـ Google OAuth
- [x] إنشاء حساب
- [x] نسيت كلمة المرور
- [x] إعادة تعيين كلمة المرور
- [x] مصادقة ثنائية (MFA) - إعداد + تحقق
- [x] OAuth Callback
- [x] Guards (Auth, Guest, MFA)
- [x] AuthProvider مع Profile + Roles + Permissions

### ✅ الحماية والأمان
- [x] CSRF Protection (Double Submit Cookie)
- [x] Rate Limiting (IP-based)
- [x] Zod Validation لكل Forms
- [x] XSS Sanitization
- [x] Security Headers (HSTS, CSP, etc.)
- [x] CORS Configuration
- [x] Audit Logging
- [x] Environment Validation
- [x] API Security Middleware
- [x] Error Boundaries (global-error, error, not-found)
- [x] Log Sanitization (حذف بيانات حساسة)

### ✅ نظام الإشعارات
- [x] جرس الإشعارات مع عداد
- [x] Popover مع تبويبات زمنية
- [x] Dropdown Menu (3 خيارات)
- [x] Realtime عبر Supabase
- [x] تحديد كمقروء عند النقر
- [x] حذف المقروء + حذف الكل
- [x] أيقونات ملونة حسب النوع
- [x] 11 دالة SQL
- [x] 5 مشغلات تلقائية
- [x] RLS Policies
- [x] توثيق كامل

### ✅ الترجمة
- [x] 11 مفتاح خطأ (AR + EN)
- [x] كل Forms تستخدم الترجمات
- [x] تحديث Auth Actions

---

## 14. المهام المعلقة

### 🔴 عاجل
- [ ] **تدوير الأسرار** في `.env.local` (Supabase, Gmail, API Keys)
- [ ] **تفعيل env validation** عند التشغيل (`validateEnvOrThrow`)
- [ ] **تفعيل Realtime** لجدول `sys_notification` في Supabase Dashboard
- [ ] **تنفيذ ملفات SQL** للإشعارات على Supabase (`008_Notifications/`)

### 🟡 متوسط
- [ ] **تفعيل cron job** لـ `cleanup-tokens` في `vercel.json`
- [ ] **إزالة AuthDebug** من الإنتاج أو جعلها مشروطة
- [ ] **CSRF client integration** في النماذج المتبقية
- [ ] **إصلاح bنية i18n** (مطابقة en.json مع ar.json)
- [ ] **إضافة صفحة Dashboard** مع Guards
- [ ] **إضافة صفحة المنتجات** (Product Listing, Product Detail)
- [ ] **إضافة صفحة السلة** (Cart)
- [ ] **إضافة صفحة الدفع** (Checkout)
- [ ] **إضافة لوحة البائع** (Vendor Dashboard)
- [ ] **إضافة لوحة الإدارة** (Admin Dashboard)

### 🟢 مستقبلي
- [ ] نظام الدفع (Payment Gateway)
- [ ] نظام التقييمات (Reviews)
- [ ] نظام التوصيل (Fleet Management)
- [ ] لوحة السائق (Driver Dashboard)
- [ ] تطبيق الموبايل
- [ ] OneSignal Push Notifications
- [ ] Newsletter System

---

## 15. المشاكل المعروفة

| # | المشكلة | الملف | التأثير | الحالة |
|---|---------|-------|---------|--------|
| 1 | `AuthDebug` في إنتاج | `app/[locale]/(site)/layout.tsx` | يعرض بيانات حساسة | ⚠️ يجب إزالتها |
| 2 | Cron غير مُفعّل | `vercel.json` | لا تنظيف للرموز | 🟡 إضافة جدول |
| 3 | Realtime غير مُفعّل | Supabase Dashboard | إشعارات غير فورية | 🔴 يجب تفعيله |
| 4 | ملفات SQL غير منفذة | Supabase | دوال الإشعارات غير موجودة | 🔴 يجب تنفيذها |
| 5 | بنية i18n غير متطابقة | `messages/en.json` vs `ar.json` | خطأ ترجمة محتمل | 🟡 مطابقة |
| 6 | تعليق `// kjl` | `app/[locale]/layout.tsx:38` | تنظيف | 🟢 إزالة |
| 7 | خطأ TypeScript في RPC | `notification-bell.tsx` | `as unknown as RpcCall` | ✅ مُعالجة مؤقتاً |
| 8 | حذف بدون RPC | `notification-bell.tsx` | يعتمد على حذف مباشر | ✅ بديل عملي |

---

## 16. أحدث التعديلات (آخر 15 commit)

```
559b5b9 notifications
3ef7d65 fix: replace useEffect with event handler for popover open
271f024 fix: add explicit type to realtime payload parameter
f603edb fix: prevent cascading renders in notification bell
41aec70 fix: resolve TypeScript any warnings and reduce padding
218c5fc style: slim down notification bell and use default shadcn tabs
79bc900 feat: replace notification action buttons with dropdown menu
4f24913 fix: use direct table delete instead of RPC for notifications
42fcc6e fix: resolve TypeScript RPC type errors with type assertions
2c13650 fix: add notification RPC types to Database interface
b824e86 fix: add notification RPC functions to Database types
03bc40a fix: address all code review findings for notifications
df9d1d2 feat: add notification bell component
2b92bc3 feat: add real-time notifications system
f788ba1 notifications
```

---

## 📌 ملاحظات مهمة للمتابعة

1. **قبل أي تطوير جديد**: تأكد من تنفيذ ملفات `008_Notifications/` على Supabase
2. **قبل النشر للإنتاج**: أزل `AuthDebug` + فعّل Realtime + أضف cron job
3. **أمان**: دوّر كل الأسرار الموجودة في `.env.local`
4. **i18n**: وحّد بنية ملفات الترجمة بين en.json و ar.json
5. **الأداء**: استخدم `useMemo` و `useCallback` حيثما أمكن
