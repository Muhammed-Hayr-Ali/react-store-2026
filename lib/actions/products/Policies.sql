-- =========================================================
-- 1. جدول products (المنتجات)
-- =========================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_policy" ON public.products;
DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
DROP POLICY IF EXISTS "products_update_policy" ON public.products;
DROP POLICY IF EXISTS "products_delete_policy" ON public.products;

CREATE POLICY "products_select_policy" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "products_insert_policy" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_permission('manage_products'::text));
CREATE POLICY "products_update_policy" ON public.products FOR UPDATE TO authenticated USING (public.has_permission('manage_products'::text)) WITH CHECK (public.has_permission('manage_products'::text));
CREATE POLICY "products_delete_policy" ON public.products FOR DELETE TO authenticated USING (public.has_permission('manage_products'::text));


-- =========================================================
-- 2. جدول product_variants (متغيرات المنتجات)
-- =========================================================
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_variants_select_policy" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_insert_policy" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_update_policy" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_delete_policy" ON public.product_variants;

CREATE POLICY "product_variants_select_policy" ON public.product_variants FOR SELECT TO public USING (true);
CREATE POLICY "product_variants_insert_policy" ON public.product_variants FOR INSERT TO authenticated WITH CHECK (public.has_permission('manage_products'::text));
CREATE POLICY "product_variants_update_policy" ON public.product_variants FOR UPDATE TO authenticated USING (public.has_permission('manage_products'::text)) WITH CHECK (public.has_permission('manage_products'::text));
CREATE POLICY "product_variants_delete_policy" ON public.product_variants FOR DELETE TO authenticated USING (public.has_permission('manage_products'::text));


-- =========================================================
-- 3. جدول product_images (صور المنتجات)
-- =========================================================
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_images_select_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_insert_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_update_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_delete_policy" ON public.product_images;

CREATE POLICY "product_images_select_policy" ON public.product_images FOR SELECT TO public USING (true);
CREATE POLICY "product_images_insert_policy" ON public.product_images FOR INSERT TO authenticated WITH CHECK (public.has_permission('manage_products'::text));
CREATE POLICY "product_images_update_policy" ON public.product_images FOR UPDATE TO authenticated USING (public.has_permission('manage_products'::text)) WITH CHECK (public.has_permission('manage_products'::text));
CREATE POLICY "product_images_delete_policy" ON public.product_images FOR DELETE TO authenticated USING (public.has_permission('manage_products'::text));