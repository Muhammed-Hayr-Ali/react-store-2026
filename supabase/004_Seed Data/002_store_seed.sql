-- =====================================================
-- 🌱 Seed Data - إعدادات المتجر وأسعار الصرف
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف خامساً
--    بعد: 004_Seed Data/001_role_seed.sql
-- =====================================================
-- متوافق مع جداول: store_settings, exchange_rates
-- =====================================================

-- =====================================================
-- 🏪 إعدادات المتجر الافتراضية
-- =====================================================

INSERT INTO public.store_settings (
  "name_ar",
  "name_en",
  "description_ar",
  "description_en",
  "email",
  "phone",
  "address",
  "city",
  "default_currency",
  "is_active"
)
VALUES (
  'متجر الأغذية الطازجة',
  'Fresh Food Store',
  'متجر متخصص في المنتجات الغذائية الطازجة والعضوية',
  'Specialized store for fresh and organic food products',
  'info@freshfood.store',
  '+963-11-123-4567',
  'دمشق، سوريا',
  'دمشق',
  'USD',
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 💱 أسعار الصرف الافتراضية
-- =====================================================

INSERT INTO public.exchange_rates (
  "currency_code",
  "rate_from_usd",
  "last_updated_at"
)
VALUES
  -- دولار أمريكي (العملة الأساسية)
  ('USD', 1.000000, NOW()),
  
  -- ريال سعودي
  ('SAR', 3.750000, NOW()),
  
  -- درهم إماراتي
  ('AED', 3.672500, NOW()),
  
  -- جنيه مصري
  ('EGP', 49.500000, NOW()),
  
  -- دينار كويتي
  ('KWD', 0.307000, NOW()),
  
  -- ليرة سورية (سعر تقريبي)
  ('SYP', 13000.000000, NOW()),
  
  -- يورو
  ('EUR', 0.920000, NOW()),
  
  -- جنيه إسترليني
  ('GBP', 0.790000, NOW())
ON CONFLICT ("currency_code") DO UPDATE
SET
  "rate_from_usd" = EXCLUDED."rate_from_usd",
  "last_updated_at" = NOW();

-- =====================================================
-- ✅ التحقق من نجاح الإدراج
-- =====================================================

-- التحقق من إعدادات المتجر
SELECT name_ar, name_en, default_currency, is_active
FROM store_settings
LIMIT 1;

-- التحقق من أسعار الصرف
SELECT currency_code, rate_from_usd, last_updated_at
FROM exchange_rates
ORDER BY currency_code;

-- =====================================================
-- ✅ END OF SEED DATA
-- =====================================================
