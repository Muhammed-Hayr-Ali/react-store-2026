app/
└── [locale]/
│
├── (auth)/
│ ├── callback/
│ | ├── loading.tsx
│ | └── page.tsx
│ ├── forgot-password/
│ | └── page.tsx
│ ├── reset-password/
│ | └── page.tsx
│ ├── sign-in/
│ | └── page.tsx
│ ├── sign-up/
│ | └── page.tsx
│ └── layout.tsx # تصميم بسيط (بدون هيدر/فوتر المتجر المعقد)
│
├── (mfa)/
│ ├── two-factor/setup/
│ | └── page.tsx
│ ├── verify/
│ | └── page.tsx
│ └── layout.tsx # إدخال كود الـ OTP
│
├── (shop)/ # 🛒 واجهة المتجر الرئيسية (للعملاء والزوار)
│ ├── layout.tsx # تصميم المتجر (الهيدر، الفوتر، سلة المشتريات الجانبية)
│ ├── page.tsx # الصفحة الرئيسية (العروض، التصنيفات، أحدث المنتجات)
│ ├── categories/
│ │ ├── page.tsx # صفحة كل التصنيفات
│ │ └── [slug]/page.tsx # عرض منتجات تصنيف معين
│ ├── products/
│ │ └── [slug]/page.tsx # صفحة تفاصيل المنتج (الصور، السعر، التقييمات)
│ ├── cart/page.tsx # سلة المشتريات
│ └── checkout/page.tsx # صفحة الدفع وتأكيد الطلب (تدعم الدفع عند الاستلام COD)
│
├── (dashboard)/ # 📊 لوحات التحكم (محمية وتحتاج تسجيل دخول)
│ ├── layout.tsx # تصميم لوحة التحكم (Sidebar جانبي، Header علوي)
│ │
│ ├── account/ # 👤 لوحة تحكم العميل (Customer)
│ │ ├── page.tsx # ملخص الحساب
│ │ ├── profile/page.tsx # تعديل البيانات الشخصية
│ │ ├── addresses/page.tsx# إدارة العناوين
│ │ ├── favorites/page.tsx# المنتجات المفضلة
│ │ ├── orders/
│ │ │ ├── page.tsx # سجل الطلبات
│ │ │ └── [id]/page.tsx # تتبع حالة الطلب الفردي
│ │ └── tickets/page.tsx # تذاكر الدعم الفني الخاصة به
│ │
│ ├── admin/ # 👑 لوحة تحكم الإدارة (Admin & Vendor)
│ │ ├── page.tsx # الإحصائيات (المبيعات، الطلبات المعلقة)
│ │ ├── products/page.tsx # إدارة المنتجات وإضافة جديد
│ │ ├── categories/page.tsx# إدارة التصنيفات
│ │ ├── orders/page.tsx # إدارة الطلبات وتغيير حالاتها
│ │ ├── users/page.tsx # إدارة المستخدمين والصلاحيات
│ │ ├── support/page.tsx # الرد على تذاكر الدعم الفني
│ │ └── settings/page.tsx # إعدادات المتجر (الاسم، العملة، إلخ)
│ │
│ └── delivery/ # 🚚 واجهة تطبيق السائق (Delivery)
│ ├── page.tsx # الطلبات المسندة إليه اليوم
│ └── [orderId]/
│ ├── page.tsx # تفاصيل الطلب وخريطة التوصيل
│ └── scan/page.tsx # 📷 واجهة مسح الـ QR Code لتأكيد التسليم
