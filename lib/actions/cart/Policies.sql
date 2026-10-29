-- =========================================================
-- 1. جدول carts (سلال التسوق الرئيسية)
-- =========================================================
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "carts_select_policy" ON public.carts;
DROP POLICY IF EXISTS "carts_insert_policy" ON public.carts;
DROP POLICY IF EXISTS "carts_update_policy" ON public.carts;
DROP POLICY IF EXISTS "carts_delete_policy" ON public.carts;

CREATE POLICY "carts_select_policy" ON public.carts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "carts_insert_policy" ON public.carts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "carts_update_policy" ON public.carts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "carts_delete_policy" ON public.carts FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- =========================================================
-- 2. جدول cart_items (عناصر سلة التسوق) - التصحيح المبني على cart_id
-- =========================================================
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_select_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_insert_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_update_policy" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_delete_policy" ON public.cart_items;

-- أ) سياسة القراءة: السماح للمستخدم برؤية عناصر السلة إذا كانت السلة المرتبطة تملكه
CREATE POLICY "cart_items_select_policy" ON public.cart_items FOR SELECT TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.carts WHERE public.carts.id = public.cart_items.cart_id AND public.carts.user_id = auth.uid())
);

-- ب) سياسة الإدخال: السماح بإضافة عناصر للسلة إذا كان المستخدم هو مالك السلة
CREATE POLICY "cart_items_insert_policy" ON public.cart_items FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.carts WHERE public.carts.id = public.cart_items.cart_id AND public.carts.user_id = auth.uid())
);

-- ج) سياسة التحديث: السماح بتعديل الكميات أو العناصر إذا كانت السلة تملكه
CREATE POLICY "cart_items_update_policy" ON public.cart_items FOR UPDATE TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.carts WHERE public.carts.id = public.cart_items.cart_id AND public.carts.user_id = auth.uid())
) 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.carts WHERE public.carts.id = public.cart_items.cart_id AND public.carts.user_id = auth.uid())
);

-- د) سياسة الحذف: السماح بحذف عناصر من السلة إذا كان المستخدم هو مالك السلة
CREATE POLICY "cart_items_delete_policy" ON public.cart_items FOR DELETE TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.carts WHERE public.carts.id = public.cart_items.cart_id AND public.carts.user_id = auth.uid())
);