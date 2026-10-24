-- جدول السلة الرئيسي لكل مستخدم (أو جلسة)
create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- جدول عناصر السلة (المنتجات والمتغيرات والكميات)
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references carts(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  variant_id uuid references product_variants(id) on delete cascade not null,
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(cart_id, variant_id)
);



-- 1. تطبيق الأمان على جدول السلال الرئيسية (carts) باستخدام الدالة الديناميكية
SELECT public.apply_table_rls('carts', 'cart', false, true, 'user_id');

-- 2. تفعيل الأمان وسياسات الحماية المخصصة لجدول عناصر السلة (cart_items)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- حذف أي سياسات سابقة منعاً للتعارض
DROP POLICY IF EXISTS "cart_items_select_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_insert_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_update_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_delete_policy" ON cart_items;

-- سياسة القراءة (SELECT)
CREATE POLICY "cart_items_select_policy" ON cart_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND carts.user_id = auth.uid()
        )
        OR public.has_permission('view_cart'::text)
        OR public.has_permission('manage_cart'::text)
    );

-- سياسة الإضافة (INSERT)
CREATE POLICY "cart_items_insert_policy" ON cart_items
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND carts.user_id = auth.uid()
        )
        OR public.has_permission('create_cart'::text)
        OR public.has_permission('manage_cart'::text)
    );

-- سياسة التعديل (UPDATE)
CREATE POLICY "cart_items_update_policy" ON cart_items
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND carts.user_id = auth.uid()
        )
        OR public.has_permission('update_cart'::text)
        OR public.has_permission('manage_cart'::text)
    );

-- سياسة الحذف (DELETE)
CREATE POLICY "cart_items_delete_policy" ON cart_items
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND carts.user_id = auth.uid()
        )
        OR public.has_permission('delete_cart'::text)
        OR public.has_permission('manage_cart'::text)
    );