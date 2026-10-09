# الدليل المعماري لوحدة المصادقة والحسابات (Authentication Module)

---

## 1. مقدمة ونظرة عامة على الميزة (Feature Overview)
تُمثل هذه الوحدة النواة الأساسية لإدارة الهوية والجلسات في المنصة. توفر دورة حياة متكاملة للمصادقة تعتمد على **Supabase Auth** وخدمات البريد الإلكتروني، وتلبي احتياجات:
1. **واجهة المتجر والعملاء (Storefront)**: تمكين الزوار من تسجيل حسابات جديدة، تسجيل الدخول التقليدي أو السحابي عبر مزود Google OAuth، وتأمين الجلسات عبر ملفات تعريف ارتباط (Cookies) مشفرة ومحمية.
2. **استعادة وأمان الحسابات**: دورة عمل موثوقة ومحمية من هجمات التوقيت (Timing Attacks) وإعادة الاستخدام (Replay Attacks) لاستعادة كلمات المرور عبر رموز مؤقتة ذات صلاحية محدودة (15 دقيقة).
3. **لوحة الإدارة والخدمات الداخلية**: توفير استعلام معياري لجلب بيانات المستخدم الحالي وصورته الشخصية لتغذية الواجهات ومراقبة حالة تسجيل الدخول.

---

## 2. تفاصيل بنية جدول قاعدة البيانات (Database Schema & Fields)

### جدول رموز استعادة كلمة المرور (`public.password_reset_tokens`)
يُستخدم لتخزين وإدارة الرموز المؤقتة للتحقق من هوية صاحب الحساب عند نسيان كلمة المرور:

| اسم الحقل (Column Name) | نوع البيانات (Data Type) | القيود (Constraints) | القيمة الافتراضية | الوصف البرمجي والتجاري |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | المعرف الرقمي الفريد لسجل رمز الاستعادة. |
| `user_id` | `UUID` | `NOT NULL`, `REFERENCES auth.users(id)` | لا يوجد | معرّف الحساب في جدول المستخدمين الخاص بـ Supabase. |
| `token` | `TEXT` | `NOT NULL`, `UNIQUE` | لا يوجد | الرمز المشفر العشوائي الممرر في رابط البريد الإلكتروني. |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | لا يوجد | وقت انتهاء صلاحية الرمز بدقة (محدد بـ 15 دقيقة من الإنشاء). |
| `used_at` | `TIMESTAMPTZ` | `NULLABLE` | `NULL` | توقيت استهلاك الرمز؛ يمنع استخدام الرابط أكثر من مرة. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `now()` | طابع التدقيق الزمني لإنشاء طلب الاستعادة. |

### المفاتيح الأجنبية وسلوك الحذف التعاقبي (Foreign Keys & Cascading)
* **العلاقة مع المستخدمين**: يرتبط `user_id` بجدول `auth.users(id)` مع خاصية `ON DELETE CASCADE`. في حال تم حذف حساب المستخدم نهائياً من النظام، يتم تطهير جميع الرموز المرتبطة به تلقائياً لتفادي بقاء سجلات يتيمة في قاعدة البيانات.
* **فهارس الأداء والحماية**:
  * `idx_password_reset_tokens_lookup`: فهرس مخصص للبحث السريع عن الرموز الصالحة وغير المستهلكة (`WHERE used_at IS NULL`).
  * `idx_password_reset_tokens_user`: فهرس لسرعة تتبع تاريخ طلبات المستخدم وتفريغها.

---

## 3. سياسات الأمان والحماية (Row Level Security - RLS)
تم تفعيل عزل كامل لجدول `password_reset_tokens` لضمان عدم إمكانية قراءته أو تعديله من أي واجهة أمامية:

| اسم السياسة | العملية (Command) | الفئة المستهدفة (Target Role) | شرط التحقق (USING / WITH CHECK) | الغرض الأمني |
| :--- | :--- | :--- | :--- | :--- |
| `password_reset_tokens_service_role_policy` | `ALL` (CRUD) | `service_role` | `true` | حصر الصلاحيات بالكامل في العميل الإداري `createAdminClient()` والإجراء المخزن `verify_and_use_reset_token`. |

* **سياسة الحظر العام**: المستخدمون العاديون (`anon` و `authenticated`) لا يمتلكون أي سياسة وصول (SELECT/INSERT/UPDATE/DELETE)، وتُرفض أي محاولة استعلام مباشرة عبر PostgREST تلقائياً.
* **إجراء قاعدة البيانات الآمن (RPC)**:
  * الدالة `verify_and_use_reset_token(p_token)` مُعرفة كـ `SECURITY DEFINER` ومحصورة الصلاحية بـ `service_role` فقط. تقوم بفحص الرمز وتأكيده ووسمه بـ `used_at = now()` ذرياً (`FOR UPDATE`) لمنع تعارض الطلبات المتزامنة (Race Conditions).

---

## 4. مصفوفة الصلاحيات وتصنيفها (Permissions & Groups Matrix)

* **استثناء الصلاحيات في وحدة المصادقة**:
  بما أن عمليات تسجيل الحساب، الدخول، استعادة كلمة المرور، واستقبال رمز OAuth تمثل بوابات عامة يدخل منها الزوار قبل امتلاك هوية موثقة داخل النظام، فإن هذه الدوال **مُعفاة صراحة من فحص الخطوة رقم 2 (`hasPermission`)** في نمط الطفرات.
* **الجلسة الموثقة**:
  دالة الاستعلام `getCurrentUser` تعتمد على التحقق من وجود جلسة صالحة نشطة عبر `supabase.auth.getUser()`. وفي حال عدم وجود جلسة، تُرجع الدالة `data: null` بنجاح دون إطلاق أي استثناءات، لتمكين واجهات الـ Header والشريط الجانبي من التبديل بين وضع الزائر ووضع المستخدم المسجل بسلاسة.

---

## 5. الدليل المرجعي للدوال والعمليات (Functions, Inputs & Outputs)

### أولاً: الطفرات (Mutations)

#### 1. `signInWithPassword`
* **المسار**: `lib/actions/authentication/mutations/sign-in-with-password.ts`
* **الصلاحية**: وصول عام (Public).
* **المدخلات**: `signInWithPasswordSchema` (`email`, `password`).
* **المخرجات**: `Promise<ApiResult<null>>`
* **أكواد الأخطاء المحتملة**:
  * `VALIDATION_ERROR`: بيانات الدخول غير مطابقة للمخطط.
  * `INVALID_CREDENTIALS`: البريد الإلكتروني أو كلمة المرور غير صحيحة.
  * `EMAIL_NOT_CONFIRMED`: البريد الإلكتروني بانتظار التأكيد.
  * `SIGN_IN_USER_ERROR`: خطأ غير متوقع في خادم المصادقة.

#### 2. `signInWithGoogle`
* **المسار**: `lib/actions/authentication/mutations/sign-in-with-google.ts`
* **الصلاحية**: وصول عام (Public).
* **المدخلات**: لا يوجد.
* **المخرجات**: `Promise<ApiResult<OAuthSignInResult>>` (`{ url: string }`)
* **أكواد الأخطاء المحتملة**:
  * `SIGN_IN_GOOGLE_ERROR`: تعذر توليد رابط تفويض OAuth من مزود Google.

#### 3. `signUpWithPassword`
* **المسار**: `lib/actions/authentication/mutations/sign-up-with-password.ts`
* **الصلاحية**: وصول عام (Public).
* **المدخلات**: `signUpWithPasswordSchema` (`name`, `email`, `password`).
* **المخرجات**: `Promise<ApiResult<null>>`
* **أكواد الأخطاء المحتملة**:
  * `VALIDATION_ERROR`: المدخلات غير مستوفية لشروط الحقول.
  * `EMAIL_ALREADY_EXISTS`: البريد الإلكتروني مسجل مسبقاً في النظام.
  * `SIGN_UP_USER_ERROR`: فشل إنشاء سجل المستخدم.

#### 4. `signOut`
* **المسار**: `lib/actions/authentication/mutations/sign-out.ts`
* **الصلاحية**: وصول عام / مستخدم مسجل.
* **المدخلات**: لا يوجد.
* **المخرجات**: `Promise<ApiResult<null>>`
* **أكواد الأخطاء المحتملة**:
  * `SIGN_OUT_USER_ERROR`: فشل إنهاء الجلسة أو حذف ملفات تعريف الارتباط.

#### 5. `requestPasswordReset`
* **المسار**: `lib/actions/authentication/mutations/request-password-reset.ts`
* **الصلاحية**: وصول عام (Public).
* **المدخلات**: `requestPasswordResetSchema` (`email`).
* **المخرجات**: `Promise<ApiResult<null>>`
* **أكواد الأخطاء المحتملة**:
  * `VALIDATION_ERROR`: صيغة البريد الإلكتروني غير صحيحة.
  * `CREATE_RESET_TOKEN_ERROR`: تعذر حفظ رمز الاستعادة في قاعدة البيانات.
  * `REQUEST_PASSWORD_RESET_ERROR`: خطأ غير متوقع أثناء إرسال البريد الإلكتروني.
* **ملاحظة أمنية**: تُرجع الدالة حالة نجاح دائماً حتى إن لم يكن البريد مسجلاً، لمنع استكشاف الحسابات النشطة (Timing Attack Mitigation).

#### 6. `confirmPasswordReset`
* **المسار**: `lib/actions/authentication/mutations/confirm-password-reset.ts`
* **الصلاحية**: وصول عام (عبر الرمز المؤقت).
* **المدخلات**: `confirmPasswordResetSchema` (`token`, `password`, `confirmPassword`).
* **المخرجات**: `Promise<ApiResult<null>>`
* **أكواد الأخطاء المحتملة**:
  * `VALIDATION_ERROR`: عدم تطابق كلمتي المرور أو عدم كفاية الطول.
  * `VERIFY_RESET_TOKEN_ERROR`: الرمز غير صالح، مستخدم مسبقاً، أو منتهي الصلاحية.
  * `UPDATE_USER_PASSWORD_ERROR`: فشل تحديث كلمة المرور في مزود الهوية.
  * `CONFIRM_PASSWORD_RESET_ERROR`: خطأ تقني غير متوقع.

#### 7. `handleCallback`
* **المسار**: `lib/actions/authentication/mutations/handle-callback.ts`
* **الصلاحية**: وصول عام (مستقبل مزود OAuth).
* **المدخلات**: `oauthCallbackSchema` (`code`).
* **المخرجات**: `Promise<ApiResult<null>>`
* **أكواد الأخطاء المحتملة**:
  * `VALIDATION_ERROR`: رمز التفويض مفقود أو فارغ.
  * `EXCHANGE_OAUTH_CODE_ERROR`: فشل تبادل رمز التفويض مع الجلسة.
  * `HANDLE_OAUTH_CALLBACK_ERROR`: خطأ عام أثناء معالجة الرد.

---

### ثانياً: الاستعلامات (Queries)

#### `getCurrentUser`
* **المسار**: `lib/actions/authentication/queries/get-current-user.ts`
* **الصلاحية**: عامة (Safe Session Guard).
* **المدخلات**: لا يوجد.
* **المخرجات**: `Promise<ApiResult<AuthenticatedUser | null>>`
* **أكواد الأخطاء المحتملة**:
  * `GET_CURRENT_USER_ERROR`: فشل الاستعلام عن بيانات الملف الشخصي في قاعدة البيانات.

---

## 6. مسارات الـ REST API التجريبية (Testing GET Route Endpoints)
تم توفير مسارات GET مهيأة ببيانات تجريبية مدمجة لفحص كافة الوظائف مباشرة عبر المتصفح أو أدوات الفحص:

| العملية المستهدفة | رابط الفحص المحلي (Localhost Test URL) | المتغيرات الاختيارية (Query Params) |
| :--- | :--- | :--- |
| **تسجيل الدخول** | `http://localhost:3000/api/authentication/sign-in` | `?email=...&password=...` |
| **دخول Google OAuth** | `http://localhost:3000/api/authentication/sign-in-google` | لا يوجد |
| **إنشاء حساب جديد** | `http://localhost:3000/api/authentication/sign-up` | يُولد بريداً فريداً تلقائياً عبر الطابع الزمني |
| **تسجيل الخروج** | `http://localhost:3000/api/authentication/sign-out` | لا يوجد |
| **طلب استعادة كلمة المرور** | `http://localhost:3000/api/authentication/request-password-reset` | `?email=user@example.com` |
| **تأكيد كلمة المرور الجديدة** | `http://localhost:3000/api/authentication/confirm-password-reset` | `?token=[UUID]&password=...` |
| **معالجة عودة OAuth** | `http://localhost:3000/api/authentication/callback` | `?code=[AUTH_CODE]` |
| **بيانات المستخدم الحالي** | `http://localhost:3000/api/authentication/get-user` | لا يوجد |

---

## 7. استراتيجية الكاش وتفريغ المسارات (Cache Revalidation Strategy)
تعتمد الوحدة على استراتيجية تفريغ شاملة للجلسات لضمان عدم بقاء أي بيانات كاش متقادمة:
1. **تفريغ شجرة التطبيق الشامل (`revalidatePath("/", "layout")`)**:
   * يتم استدعاؤه فورياً عند نجاح العمليات التالية:
     * `signInWithPassword`
     * `signUpWithPassword`
     * `signOut`
     * `handleCallback`
   * **الهدف**: إبطال ذاكرة التخزين المؤقت لجميع مكونات التنقل، شريط الهيدر، والأزرار التي تعتمد على حالة المصادقة لعرض بيانات الحساب فوراً دون الحاجة لتحديث الصفحة يدوياً.