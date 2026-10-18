-- 1. جدول حملات التخفيضات (Flash Sales)
CREATE TABLE IF NOT EXISTS flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  discount_type VARCHAR(50) NOT NULL, -- 'percentage' or 'fixed'
  discount_value INTEGER NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. جدول المنتجات المرتبطة بالتخفيض (Flash Sale Items)
CREATE TABLE IF NOT EXISTS flash_sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flash_sale_id UUID NOT NULL REFERENCES flash_sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  calculated_percentage INTEGER NOT NULL DEFAULT 0,
  quantity_limit INTEGER,
  sold_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- منع تكرار نفس المنتج في نفس حملة التخفيض
  UNIQUE(flash_sale_id, product_id)
);

-- 3. تطبيق سياسات الأمان للقراءة فقط للزوار (بناءً على دالتك السابقة)
SELECT public.apply_table_rls('flash_sales', 'flash_sale', true, false);
SELECT public.apply_table_rls('flash_sale_items', 'flash_sale', true, false);

-- 4. إجبار تحديث الكاش بعد إنشاء الجداول
NOTIFY pgrst, 'reload schema';