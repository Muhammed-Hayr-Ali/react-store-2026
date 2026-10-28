-- =========================================================
-- أولاً: جدول carts (سلات التسوق)
-- =========================================================

-- 1. تفعيل الحماية وتعيين القيمة الافتراضية للمستخدم تلقائياً
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. تنظيف كافة السياسات القديمة لتجنب أي تضارب
DROP POLICY IF EXISTS "carts_owner_policy" ON public.carts;
DROP POLICY IF EXISTS "carts_policy" ON public.carts;
DROP POLICY IF EXISTS "carts_all_policy" ON public.carts;
DROP POLICY IF EXISTS "carts_select_policy" ON public.carts;
DROP POLICY IF EXISTS "carts_insert_policy" ON public.carts;
DROP POLICY IF EXISTS "carts_update_policy" ON public.carts;
DROP POLICY IF EXISTS "carts_delete_policy" ON public.carts;
DROP POLICY IF EXISTS "Allow cart access based on ownership or manage_cart permission" ON public.carts;

-- 3. السياسات المفصلة كل واحدة على حدة:

-- سياسة القراءة (SELECT): المستخدم يرى سلته فقط
CREATE POLICY "carts_select_policy"
ON public.carts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- سياسة الإدخال (INSERT): مفتوحة للمسجلين وتعتمد على DEFAULT auth.uid() بدون قيود تعطل الإنشاء
CREATE POLICY "carts_insert_policy"
ON public.carts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- سياسة التحديث (UPDATE): المستخدم يحدث سلته فقط
CREATE POLICY "carts_update_policy"
ON public.carts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- سياسة الحذف (DELETE): المستخدم يحذف سلته فقط
CREATE POLICY "carts_delete_policy"
ON public.carts
FOR DELETE
TO authenticated
USING (user_id = auth.uid());


-- =========================================================
-- ثانياً: جدول cart_items (عناصر السلة)
-- =========================================================

-- 1. تفعيل الحماية
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 2. تنظيف كافة السياسات القديمة
DROP POLICY IF EXISTS "cart_items_owner_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_all_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_select_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_insert_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_update_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_delete_policy" ON public.cart_items;
DROP POLICY IF EXISTS "Allow cart items access based on cart ownership or manage_cart permission" ON public.cart_items;

-- 3. السياسات المفصلة كل واحدة على حدة:

-- سياسة القراءة (SELECT): رؤية العناصر التابعة لسلة المستخدم فقط
CREATE POLICY "cart_items_select_policy"
ON public.cart_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE public.carts.id = public.cart_items.cart_id
    AND public.carts.user_id = auth.uid()
  )
);

-- سياسة الإدخال (INSERT): إضافة عناصر بشكل مباشر وسلس للمستخدم المسجل
CREATE POLICY "cart_items_insert_policy"
ON public.cart_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- سياسة التحديث (UPDATE): تعديل الكميات أو العناصر داخل سلة المستخدم فقط
CREATE POLICY "cart_items_update_policy"
ON public.cart_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE public.carts.id = public.cart_items.cart_id
    AND public.carts.user_id = auth.uid()
  )
);

-- سياسة الحذف (DELETE): حذف العناصر من سلة المستخدم فقط
CREATE POLICY "cart_items_delete_policy"
ON public.cart_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE public.carts.id = public.cart_items.cart_id
    AND public.carts.user_id = auth.uid()
  )
);