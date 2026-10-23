-- 1. إنشاء جدول قائمة الأمنيات (Wishlists)
create table if not exists public.wishlists (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- قيد لمنع تكرار نفس المنتج في قائمة أمنيات نفس المستخدم
    constraint unique_user_product_wishlist unique (user_id, product_id)
);

-- 2. إنشاء الفهارس (Indexes) لتحسين الأداء وسرعة الاستعلام
create index if not exists wishlists_user_id_idx on public.wishlists(user_id);
create index if not exists wishlists_product_id_idx on public.wishlists(product_id);

-- 3. تطبيق سياسات الأمان (RLS) ديناميكياً باستخدام الدالة المعتمدة
-- النمط: نظام خاص مغلق، غير عام (false)، ويحتوي على مالك عبر حقل user_id (true)
select public.apply_table_rls(
    'wishlists',     -- اسم الجدول
    'wishlist',      -- قاعدة الصلاحيات (سيتم التعامل مع صلاحيات مثل view_wishlist, create_wishlist إلخ إن وجدت)
    false,           -- الجدول ليس عاماً (خاص بكل مستخدم)
    true             -- الجدول يحتوي على عمود ملكية (user_id)
);