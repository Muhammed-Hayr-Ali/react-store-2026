# الدليل المعماري والتقني لنطاق التصنيفات (Categories Domain)

يوثق هذا الدليل البنية التحتية، ونماذج التحقق، وسياسات الحماية RLS، ومصفوفة الصلاحيات، وكافة دوال الاستعلام والعمليات الخاصة بنطاق التصنيفات في منصة **ماركتنا (Marketna)**، وذلك استناداً إلى المعايير القياسية الصارمة `DOMAIN_ARCHITECTURE_STANDARDS`.

---

## 1. مقدمة ونظرة عامة على الميزة (Feature Overview)

يمثل نطاق التصنيفات العمود الفقري لتنظيم فهرس المنتجات وسهولة تصفح المتجر. يدعم هذا النطاق بنية هرمية مرنة متعددة المستويات (Parent-Child Hierarchy) تتيح:
* **واجهة المتجر العامة (Storefront):** تصفح القوائم العلوية والشجرة التصنيفية السريعة، وعرض التصنيفات الرئيسية في الصفحة الأولى، والوصول المباشر عبر روابط الـ SEO المحسنة (`/category/[slug]`).
* **لوحة الإدارة الخلفية (Admin Dashboard):** إدارة متكاملة (CRUD) للتصنيفات والتصنيفات الفرعية، فحص الارتباط التلقائي مع المنتجات قبل الحذف، دعم السحب والإفلات لإعادة الترتيب (`reorder`)، والتبديل السريع لحالة الظهور (`toggle-status`).

---

## 2. تفاصيل بنية جدول قاعدة البيانات (Database Schema & Fields)

الجدول المنفذ في Supabase هو `public.categories`:

| اسم الحقل (Column Name) | النوع (Postgres Type) | القيود والخصائص (Constraints) | القيمة الافتراضية | الوظيفة البرمجية والتجارية |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY` | `gen_random_uuid()` | المعرف الفريد للتصنيف عالمياً. |
| `parent_id` | `uuid` | `FOREIGN KEY` (references `categories.id`) `ON DELETE SET NULL` | `null` | يربط التصنيف بالأب لتكوين الهيكل الشجري. |
| `name` | `text` | `NOT NULL`, `CHECK (length(trim(name)) > 0)` | — | الاسم بالإنجليزية أو الاسم الافتراضي. |
| `name_ar` | `text` | `NULL` | `null` | الاسم باللغة العربية لدعم تعدد اللغات. |
| `slug` | `text` | `NOT NULL`, `UNIQUE`, `CHECK (length(trim(slug)) > 0)` | — | الرابط المخصص والفريد لمحركات البحث. |
| `description` | `text` | `NULL` | `null` | نبذة توضيحية عن التصنيف لأغراض الـ SEO. |
| `image_url` | `text` | `NULL` | `null` | رابط صورة التصنيف أو أيقونته التعبيرية. |
| `image_alt` | `text` | `NULL` | `null` | النص البديل للصورة لتحسين محركات البحث وسهولة الوصول. |
| `is_active` | `boolean` | `NOT NULL` | `true` | محدد التفعيل؛ المعطل يُحجب تلقائياً عن واجهة المتجر. |
| `sort_order` | `integer` | `NOT NULL` | `0` | وزن الترتيب الرقمي في القوائم والشاشات. |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | طابع الإنشاء الزمني المدقق تلقائياً. |
| `updated_at` | `timestamptz` | `NOT NULL` | `now()` | طابع التحديث الزمني عبر تريجر `set_updated_at_categories`. |

### الفهارس المطبقة (Database Indexes)
* `idx_categories_parent_id`: تسريع استعلامات الربط الهرمي بين الأب والأبناء.
* `idx_categories_is_active`: تسريع فلترة التصنيفات المفعلة لواجهة المتجر.
* `idx_categories_sort_order`: تحسين سرعة الفرز التنازلي والتصاعدي.

---

## 3. سياسات الأمان والحماية (Row Level Security - RLS)

تم تفعيل حماية الصفوف (RLS) ومزامنة الصلاحيات عبر سكربت الـ `DO \$\$` الموحد:

1. **`categories_select_policy` (SELECT):**
   * متاحة للعامة (`public`) لعرض السجلات النشطة فقط (`is_active = true`).
   * متاحة للمستخدمين المصادق عليهم ممن يملكون صلاحية `view_categories_management` لعرض كافة السجلات (نشطة ومعطلة).
2. **`categories_insert_policy` (INSERT):**
   * مقتصرة على المستخدمين المصادق عليهم مع التحقق من الصلاحية: `has_permission('create_category')`.
3. **`categories_update_policy` (UPDATE):**
   * مقتصرة على: `has_permission('update_category')`.
4. **`categories_delete_policy` (DELETE):**
   * مقتصرة على: `has_permission('delete_category')`.

---

## 4. مصفوفة الصلاحيات وتصنيفها (Permissions & Groups Matrix)

| المفتاح البرمجي (Permission Key) | القيمة النصية في الـ Database | الواجهة والتصنيف (UI Group) | المسمى في النظام (Label) | الوصف البرمجي (Description) |
| :--- | :--- | :--- | :--- | :--- |
| `PERMISSIONS.VIEW_CATEGORIES_MANAGEMENT` | `view_categories_management` | `dashboard_views` | View Categories Management | الوصول لصفحة إدارة التصنيفات وجلب السجلات المعطلة. |
| `PERMISSIONS.CREATE_CATEGORY` | `create_category` | `categories_management` | Create Category | إنشاء تصنيفات جديدة في النظام. |
| `PERMISSIONS.UPDATE_CATEGORY` | `update_category` | `categories_management` | Update Category | تعديل البيانات، الترتيب، والتبديل السريع للحالة. |
| `PERMISSIONS.DELETE_CATEGORY` | `delete_category` | `categories_management` | Delete Category | حذف التصنيفات بشكل فردي أو جماعي. |

---

## 5. الدليل المرجعي لدوال وعمليات النطاق (Functions Reference)

### أ. دوال القراءة (Queries)

| اسم الدالة | مسار الملف | الصلاحية المطلوبة | المدخلات (Input) | المخرجات (Output) |
| :--- | :--- | :--- | :--- | :--- |
| `getAllCategories` | `queries/get-all.ts` | عام للمفعل / `VIEW_CATEGORIES_MANAGEMENT` لغير المفعل | `GetCategoriesFilterOptions` | `ApiResult<{ items: Category[]; total: number }>` |
| `getCategoryById` | `queries/get-by-id.ts` | عام | `id: string` (UUID) | `ApiResult<Category \| null>` |
| `getCategoryBySlug` | `queries/get-by-slug.ts` | عام | `slug: string` | `ApiResult<Category \| null>` |
| `getRootCategories` | `queries/get-root-categories.ts` | عام | `{ activeOnly?: boolean; limit?: number }` | `ApiResult<Category[]>` |
| `getCategoryTree` | `queries/get-tree.ts` | عام للمفعل / `VIEW_CATEGORIES_MANAGEMENT` لغير المفعل | `{ activeOnly?: boolean }` | `ApiResult<CategoryTreeNode[]>` |
| `getCategoriesSelector` | `queries/get-selector.ts` | عام | `{ activeOnly?: boolean }` | `ApiResult<CategorySelectorItem[]>` |
| `getCategoriesSummary` | `queries/get-summary.ts` | `VIEW_CATEGORIES_MANAGEMENT` | لا يوجد | `ApiResult<CategoriesSummary>` |

### ب. دوال التعديل (Mutations - The 6-Step Pattern)

| اسم الدالة | مسار الملف | الصلاحية المطلوبة | المدخلات (Input) | المخرجات (Output) |
| :--- | :--- | :--- | :--- | :--- |
| `createCategory` | `mutations/create.ts` | `CREATE_CATEGORY` | `CreateCategoryInput` | `ApiResult<Category \| null>` |
| `updateCategory` | `mutations/update.ts` | `UPDATE_CATEGORY` | `id: string`, `UpdateCategoryInput` | `ApiResult<Category \| null>` |
| `toggleCategoryStatus`| `mutations/toggle-status.ts` | `UPDATE_CATEGORY` | `id: string`, `isActive: boolean` | `ApiResult<null>` |
| `reorderCategories` | `mutations/reorder.ts` | `UPDATE_CATEGORY` | `ReorderCategoriesInput` | `ApiResult<BatchCountResult>` |
| `deleteCategory` | `mutations/delete.ts` | `DELETE_CATEGORY` | `id: string` (UUID) | `ApiResult<{ id: string } \| null>` |
| `deleteBatchCategories`| `mutations/delete-batch.ts` | `DELETE_CATEGORY` | `DeleteBatchCategoriesInput` | `ApiResult<BatchCountResult>` |

---

## 6. استراتيجية تفريغ الكاش (Cache Revalidation Strategy)

عند تنفيذ أي عملية تعديل، يتم إبطال الكاش طبقاً لطبقتين لضمان الاتساق الفوري:
1. **تفريغ المسار الديناميكي المستهدف (Targeted Invalidation):**
   * عند الإنشاء أو التعديل: يتم تفريغ صفحة التصنيف العامة `revalidatePath('/category/' + slug)`.
2. **تفريغ لوحة الإدارة وشجرة المتجر الشاملة (Global Storefront & Dashboard Invalidation):**
   * تفريغ مسار لوحة الإدارة: `revalidatePath('/dashboard/x9k2-panel/categories')`.
   * تفريغ الشجرة العالمية وقوائم التنقل العلوية: `revalidatePath('/', 'layout')`.

---

## 7. مسارات الفحص السريع عبر المتصفح (Testing Endpoints)

| العملية | مسار الفحص (Endpoint URL) | ملاحظات الفحص |
| :--- | :--- | :--- |
| **إنشاء تجريبي** | `http://localhost:3000/api/categories/create` | يولد اسماً و Slug فريداً عبر طابع زمني. |
| **تعديل تجريبي** | `http://localhost:3000/api/categories/update?id=[UUID]` | يقبل معرف التصنيف كمعامل. |
| **تبديل الحالة** | `http://localhost:3000/api/categories/toggle-status?id=[UUID]&active=false` | يقبل `active=true` أو `false`. |
| **حذف تصنيف** | `http://localhost:3000/api/categories/delete?id=[UUID]` | يفحص الارتباط مع المنتجات قبل الحذف. |
| **إعادة ترتيب** | `http://localhost:3000/api/categories/reorder?id=[UUID]&order=3` | يختبر تحديث حقل `sort_order`. |
| **حذف جماعي** | `http://localhost:3000/api/categories/delete-batch?ids=[UUID_1],[UUID_2]` | يقبل مصفوفة معرفات مفصولة بفاصلة. |
| **القائمة المرقمة** | `http://localhost:3000/api/categories/get-all?page=1&limit=10&search=food` | يختبر الترقيم والبحث والفرز. |
| **جلب بالـ UUID** | `http://localhost:3000/api/categories/get-by-id?id=[UUID]` | يختبر الاسترجاع المباشر أو `null`. |
| **جلب بالـ Slug** | `http://localhost:3000/api/categories/get-by-slug?slug=[SLUG]` | مخصص لصفحات التوجيه الديناميكي. |
| **الشجرة الهرمية** | `http://localhost:3000/api/categories/get-tree?activeOnly=true` | يختبر بناء الشجرة بدون أيتام. |
| **موجز الاختيار** | `http://localhost:3000/api/categories/get-selector?activeOnly=true` | قائمة خفيفة لحقول الاختيار. |
| **ملخص الإحصاء** | `http://localhost:3000/api/categories/get-summary` | إحصائيات لوحة التحكم والبطاقات العلوية. |
| **التصنيفات الأب** | `http://localhost:3000/api/categories/get-root-categories?limit=8` | مخصص لقوائم الواجهة الرئيسية. |