# 📘 توثيق دالة الأمان الديناميكية (Dynamic RLS Generator)

## 📌 نبذة عامة (Overview)
دالة `apply_table_rls` هي محرك أتمتة (Automation Engine) مكتوب بـ PL/pgSQL، وظيفته توليد وتطبيق سياسات الأمان على مستوى الصفوف (Row Level Security - RLS) بشكل ديناميكي وموحد لجميع جداول النظام.

تُغني هذه الدالة عن كتابة مئات الأسطر من كود SQL لكل جدول، وتضمن **تطابقاً معمارياً بنسبة 100%** مع نظام الصلاحيات المعتمد `has_permission()` وربط ملكية السجلات بـ `user_id`.

---

## ⚙️ هيكل الدالة والمتغيرات (Function Signature & Parameters)

```sql
apply_table_rls(
    p_table TEXT, 
    p_perm_base TEXT, 
    p_is_public BOOLEAN, 
    p_has_user_id BOOLEAN DEFAULT false, 
    p_owner_column TEXT DEFAULT 'user_id'
)
```

| المتغير | النوع | الوظيفة | مثال |
| :--- | :--- | :--- | :--- |
| `p_table` | `TEXT` | **(إلزامي)** اسم الجدول في قاعدة البيانات كما هو تماماً. | `'brands'`, `'todos'`, `'comments'` |
| `p_perm_base` | `TEXT` | **(إلزامي)** الاسم المفرد للكيان، والذي ستُبنى عليه الصلاحيات تلقائياً (`create_X`, `update_X`, `delete_X`, `manage_X`, `view_X`). | `'brand'`, `'todo'`, `'comment'` |
| `p_is_public` | `BOOLEAN` | **(إلزامي)** يحدد ما إذا كان الجدول متاحاً للقراءة من قبل الزوار (`true`)، أم أنه مغلق ويتطلب تسجيل دخول وصلاحيات (`false`). | `true` (للكتالوج), `false` (للوحة التحكم) |
| `p_has_user_id`| `BOOLEAN` | *(اختياري)* يحدد ما إذا كان الجدول يحتوي على حقل يمثل "مالك السجل" لمنحه صلاحية الإدارة الذاتية لسجلاته. الافتراضي `false`. | `true`, `false` |
| `p_owner_column`| `TEXT` | *(اختياري)* اسم عمود مالك السجل. يُستخدم فقط إذا كان `p_has_user_id = true`. الافتراضي `'user_id'`. | `'user_id'`, `'reporter_id'` |

---

## 🧠 الأنماط المعمارية المدعومة (Supported Architectural Patterns)

تدعم الدالة 4 أنماط أمنية رئيسية تغطي 99% من حالات الاستخدام:

### 1. الكتالوج العام (Public Catalog - No Owner)
* **الوصف:** جداول تُعرض للجمهور العام، ولا يملكها مستخدم معين. إدارتها محصورة بالمشرفين فقط.
* **مثال:** جدول العلامات التجارية (`brands`)، التصنيفات (`categories`).
* **القراءة (`SELECT`):** متاحة للجميع (`public`).
* **الكتابة (`INSERT`, `UPDATE`, `DELETE`):** فقط لمن يملك الصلاحية (مثال: `create_brand`).
* **الاستدعاء:**
  ```sql
  SELECT public.apply_table_rls('brands', 'brand', true, false);
  ```

### 2. الكتالوج التفاعلي العام (Public Interactive - Has Owner)
* **الوصف:** جداول محتواها يُعرض للجمهور، ولكن كل سجل له "مالك" يستطيع تعديل وحذف ما يخصه.
* **مثال:** جدول التعليقات المفتوحة (`comments`).
* **القراءة (`SELECT`):** متاحة للجميع (`public`).
* **الكتابة:** مسموحة للمالك (`user_id = auth.uid()`) **أو** للمشرف صاحب الصلاحية.
* **الاستدعاء:**
  ```sql
  SELECT public.apply_table_rls('comments', 'comment', true, true);
  ```

### 3. النظام الخاص المغلق (Private Owner-Isolated)
* **الوصف:** جداول مغلقة تماماً للزوار، يرى فيها المستخدم بياناته فقط، ويديرها بنفسه. المشرفون يتولون الإدارة الكلية.
* **مثال:** جدول المهام (`todos`)، سلة المشتريات (`cart_items`).
* **القراءة (`SELECT`):** فقط للمالك **أو** المشرف صاحب صلاحية `view_` أو `manage_`.
* **الكتابة:** فقط للمالك **أو** المشرف صاحب الصلاحيات.
* **الاستدعاء:**
  ```sql
  SELECT public.apply_table_rls('todos', 'todo', false, true);
  ```

### 4. النظام الخاص بأسماء أعمدة مخصصة (Custom Owner Column)
* **الوصف:** نفس النمط السابق، لكن اسم عمود المالك ليس `user_id`.
* **مثال:** جدول البلاغات (`reports`)، حيث يسمى العمود `reporter_id`.
* **الاستدعاء:**
  ```sql
  SELECT public.apply_table_rls('reports', 'report', false, true, 'reporter_id');
  ```

---

## 🛠️ كيف تعمل الدالة من الداخل؟ (Under the Hood)
عند استدعاء الدالة، تقوم بالتالي ميكانيكياً:
1. إجبار تفعيل الحماية `ENABLE ROW LEVEL SECURITY`.
2. تنظيف (DROP) أي سياسات سابقة لتجنب التعارض.
3. دمج شرط الهوية `(%I = auth.uid())` فقط إذا تم تمرير `p_has_user_id = true`.
4. حقن اسم الكيان `p_perm_base` داخل دالة `has_permission('...'::text)`.
5. طباعة رسالة تأكيد (Notice) بنجاح التطبيق.