-- 1. إنشاء نوع الخصومات المدعومة
DO $$ BEGIN
    CREATE TYPE flash_sale_discount_type AS ENUM ('percentage', 'fixed_amount', 'fixed_price', 'none');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. جدول حملات البيع السريع (Flash Sales)
CREATE TABLE IF NOT EXISTS public.flash_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- قيد يضمن أن وقت الانتهاء يأتي دائماً بعد وقت البدء
    CONSTRAINT check_flash_sale_dates CHECK (ends_at > starts_at)
);

-- 3. جدول عناصر الحملة (Flash Sale Items)
CREATE TABLE IF NOT EXISTS public.flash_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flash_sale_id UUID NOT NULL REFERENCES public.flash_sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    discount_type flash_sale_discount_type NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2), -- يمكن أن يكون فارغاً إذا كان النوع 'none'
    quantity_limit INTEGER DEFAULT NULL, -- الحد الأقصى للكمية المعروضة بالخصم
    sold_count INTEGER NOT NULL DEFAULT 0, -- عدد القطع المباعة ضمن الحملة
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- منع تكرار نفس المنتج داخل نفس الحملة
    CONSTRAINT unique_product_per_flash_sale UNIQUE (flash_sale_id, product_id),
    -- التحقق من صحة قيمة الخصم بناءً على نوعه
    CONSTRAINT check_discount_validity CHECK (
        (discount_type = 'none' AND discount_value IS NULL) OR
        (discount_type != 'none' AND discount_value IS NOT NULL AND discount_value >= 0)
    )
);

-- 4. فهارس تسريع الاستعلامات (Indexes)
CREATE INDEX IF NOT EXISTS idx_flash_sales_active_dates 
ON public.flash_sales (is_active, starts_at, ends_at);

CREATE INDEX IF NOT EXISTS idx_flash_sale_items_sale_id 
ON public.flash_sale_items (flash_sale_id);

CREATE INDEX IF NOT EXISTS idx_flash_sale_items_product_id 
ON public.flash_sale_items (product_id);

-- 5. إعداد سياسات الأمان (RLS)
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sale_items ENABLE ROW LEVEL SECURITY;

-- السماح للجميع (الزوار والمسجلين) بقراءة العروض
CREATE POLICY "Allow public read access for flash_sales"
ON public.flash_sales FOR SELECT
USING (true);

CREATE POLICY "Allow public read access for flash_sale_items"
ON public.flash_sale_items FOR SELECT
USING (true);

-- السماح للمشرفين فقط (Admins) بالإدارة (إضافة، تعديل، حذف)
-- ملاحظة: يمكنك مطابقة هذا الشرط مع دالة فحص الأدمن الخاصة بمشروعك (مثل role = 'admin')
CREATE POLICY "Allow admin full access for flash_sales"
ON public.flash_sales FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access for flash_sale_items"
ON public.flash_sale_items FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');