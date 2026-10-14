# 📁 وثيقة هيكل جدول التصنيفات (Categories Schema Documentation)

تحدد هذه الوثيقة المعمارية الهيكل القياسي لجدول التصنيفات (`categories`) في مشروع **Marketna**، متوافقة تماماً مع القاموس الموحد لأسماء الأعمدة ومعيار التطابق التام (Strict 1:1 Mapping).

---

## 📊 هيكل الأعمدة وقاعدة البيانات (Database & TypeScript Mapping)

| اسم الحقل القياسي | النوع في PostgreSQL | النوع في TypeScript | نوع التحقق في Zod | الغرض والاستخدام |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `string` | `z.string().uuid()` | المعرف الأساسي للكيان (Primary Key). |
| `parent_id` | `UUID` | `string \| null` | `z.string().uuid().nullable()` | معرف التصنيف الأب لدعم التصنيفات الهرمية المتداخلة. |
| `name` | `VARCHAR(255)` | `string` | `z.string().min(1)` | اسم التصنيف باللغة الإنجليزية / اللغة الافتراضية. |
| `name_ar` | `VARCHAR(255)` | `string \| null` | `z.string().nullable()` | اسم التصنيف باللغة العربية. |
| `slug` | `VARCHAR(255)` | `string` | `z.string().min(1)` | المعرف النصي الفريد المستعمل في روابط المتجر (URLs). |
| `description` | `TEXT` | `string \| null` | `z.string().nullable()` | الوصف التفصيلي باللغة الإنجليزية. |
| `description_ar` | `TEXT` | `string \| null` | `z.string().nullable()` | الوصف التفصيلي باللغة العربية. |
| `image_url` | `VARCHAR(508)` | `string \| null` | رابط مطلق بـ HTTP(S) أو مسار يبدأ بشرطة مائلة واحدة، مثل `/categories/Snacks.png`. |
| `image_alt` | `VARCHAR(255)` | `string \| null` | `z.string().nullable()` | النص البديل للصورة لأغراض محركات البحث والوصول (SEO). |
| `sort_order` | `INTEGER` | `number` | `z.number().int().default(0)` | حقل رقمي للتحكم بترتيب عرض التصنيفات يدوياً. |
| `is_active` | `BOOLEAN` | `boolean` | `z.boolean().default(true)` | حالة تفعيل أو إيقاف عرض التصنيف في المتجر. |
| `created_at` | `TIMESTAMPTZ` | `string \| Date` | `z.string().or(z.date())` | طابع زمني يحدد وقت إنشاء السجل. |
| `updated_at` | `TIMESTAMPTZ` | `string \| Date` | `z.string().or(z.date())` | طابع زمني يحدد وقت آخر تعديل على السجل. |

---

## ⚙️ القواعد المعمارية المطبقة
1. **التطابق التام:** أسماء الحقول موحدة كلياً (`snake_case`) بين قاعدة البيانات، خوادم الـ API، مخططات Zod، وأنواع الـ TypeScript.
2. **إدارة الأخطاء:** جميع رسائل التحقق في Zod معتمدة على مفاتيح ترجمة نظامية (مثل `CATEGORY_NAME_REQUIRED_ERROR`) لدعم تعدد اللغات (`next-intl`) بسلاسة.
3. **الفهارس (Indexes):** تم بناء فهارس على حقول (`parent_id`, `slug`, `sort_order`) لضمان أداء فائق وسريع عند جلب وعرض شجرات التصنيفات.