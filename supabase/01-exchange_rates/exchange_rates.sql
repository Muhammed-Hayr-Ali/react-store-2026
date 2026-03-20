-- =====================================================
-- Marketna E-Commerce - Exchange Rates Schema
-- =====================================================
-- جدول أسعار صرف العملات - مُحدَّث تلقائياً عبر Cron Job
-- المصدر: https://v6.exchangerate-api.com/v6/{KEY}/latest/USD
-- =====================================================

-- 1. EXCHANGE RATES TABLE
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code TEXT NOT NULL,
  rate_from_usd NUMERIC(18, 6) NOT NULL,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT currency_code_unique UNIQUE (currency_code),
  CONSTRAINT rate_from_usd_positive CHECK (rate_from_usd > 0)
);

-- 2. INDEXES (فهارس للبحث السريع)
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_code ON exchange_rates(currency_code);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_last_updated ON exchange_rates(last_updated_at DESC);

-- 3. COMMENTS (تعليقات توضيحية)
COMMENT ON TABLE exchange_rates IS 'أسعار صرف العملات محدثة تلقائياً كل ساعة عبر Cron Job';
COMMENT ON COLUMN exchange_rates.currency_code IS 'رمز العملة (ISO 4217) مثل USD, SAR, EGP';
COMMENT ON COLUMN exchange_rates.rate_from_usd IS 'سعر الصرف مقابل الدولار الأمريكي';
COMMENT ON COLUMN exchange_rates.last_updated_at IS 'آخر مرة تم فيها تحديث سعر الصرف';

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- سياسة: السماح للجميع بالقراءة (عام)
DROP POLICY IF EXISTS "exchange_rates_public_read" ON exchange_rates;
CREATE POLICY "exchange_rates_public_read"
  ON exchange_rates FOR SELECT
  TO authenticated, anon
  USING (true);

-- سياسة: فقط للمسؤولين (Service Role) يمكنهم التعديل
-- ملاحظة: Cron Job يستخدم SUPABASE_SERVICE_ROLE_KEY لذا لديه صلاحيات كاملة
DROP POLICY IF EXISTS "exchange_rates_service_write" ON exchange_rates;
CREATE POLICY "exchange_rates_service_write"
  ON exchange_rates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. HELPER FUNCTION (دالة مساعدة لجلب سعر صرف معين)
CREATE OR REPLACE FUNCTION get_exchange_rate(target_currency TEXT)
RETURNS NUMERIC(18, 6) AS $$
BEGIN
  RETURN (
    SELECT rate_from_usd
    FROM exchange_rates
    WHERE currency_code = target_currency
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_exchange_rate IS 'دالة مساعدة لجلب سعر صرف عملة معينة مقابل الدولار';

-- 6. VIEW (عرض مبسط لأسعار العملات)
CREATE OR REPLACE VIEW exchange_rates_summary AS
SELECT
  currency_code,
  rate_from_usd,
  last_updated_at,
  CASE
    WHEN last_updated_at > NOW() - INTERVAL '1 hour' THEN 'current'
    WHEN last_updated_at > NOW() - INTERVAL '24 hours' THEN 'recent'
    ELSE 'stale'
  END as status
FROM exchange_rates
ORDER BY currency_code;

COMMENT ON VIEW exchange_rates_summary IS 'عرض مبسط لأسعار العملات مع حالة التحديث';

-- =====================================================
-- أمثلة على البيانات (للاختبار فقط)
-- =====================================================
-- INSERT INTO exchange_rates (currency_code, rate_from_usd, last_updated_at) VALUES
--   ('USD', 1.000000, NOW()),
--   ('SAR', 3.750000, NOW()),
--   ('EGP', 30.900000, NOW()),
--   ('TRY', 29.500000, NOW()),
--   ('EUR', 0.920000, NOW()),
--   ('AED', 3.672500, NOW());

-- =====================================================
-- استعلامات مفيدة
-- =====================================================
-- جلب جميع الأسعار:
-- SELECT * FROM exchange_rates ORDER BY currency_code;

-- جلب سعر صرف معين:
-- SELECT get_exchange_rate('SAR');

-- عرض ملخص الأسعار:
-- SELECT * FROM exchange_rates_summary;

-- معرفة عمر آخر تحديث:
-- SELECT 
--   currency_code,
--   last_updated_at,
--   EXTRACT(EPOCH FROM (NOW() - last_updated_at)) / 60 as minutes_ago
-- FROM exchange_rates
-- ORDER BY currency_code;

-- =====================================================
-- ملاحظات هامة
-- =====================================================
-- 1. Cron Job يعمل كل ساعة لتحديث الأسعار تلقائياً
-- 2. الأسعار مخزنة مقابل الدولار الأمريكي (USD) كعملة أساس
-- 3. RLS مفعّل للسماح بالقراءة العامة ومنع الكتابة إلا للمسؤولين
-- 4. الدالة get_exchange_rate() تساعد في جلب الأسعار بسرعة
-- 5. عرض exchange_rates_summary يوضح حالة التحديث (current/recent/stale)
