-- ============================================================================
-- جدول التصنيفات (Categories) - Marketna
-- الاسم الإنجليزي أساسي، العربي اختياري
-- ============================================================================

CREATE TABLE public.categories (
  -- المعرف الفريد
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- التسلسل الهرمي (اختياري - للتصنيفات الفرعية)
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  
  -- الأسماء (الإنجليزي أساسي)
  name TEXT NOT NULL,                    -- الاسم الإنجليزي (أساسي)
  name_ar TEXT,                          -- الاسم العربي (اختياري)
  
  -- الرابط الصديق لمحركات البحث
  slug TEXT UNIQUE NOT NULL,             -- يُشتق من name الإنجليزي
  
  -- الوصف والصورة
  description TEXT,
  image_url TEXT,
  image_alt TEXT,                        -- نص بديل للصورة (للوصولية و SEO)
  
  -- حالة التصنيف
  is_active BOOLEAN DEFAULT true,
  
  -- الترتيب
  sort_order INTEGER DEFAULT 0,
  
  -- الطوابع الزمنية
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.categories IS 'تصنيفات المنتجات - الاسم الإنجليزي أساسي';

-- ============================================================================
-- القيود (Constraints)
-- ============================================================================

-- التأكد من أن الاسم الإنجليزي ليس فارغاً أو مسافات فقط
ALTER TABLE public.categories 
ADD CONSTRAINT check_name_not_empty 
CHECK (length(trim(name)) > 0);

-- التأكد من أن الـ slug ليس فارغاً
ALTER TABLE public.categories 
ADD CONSTRAINT check_slug_not_empty 
CHECK (length(trim(slug)) > 0);

-- ============================================================================
-- الفهارس (Indexes) لتحسين الأداء
-- ============================================================================

-- فهرس على parent_id للاستعلامات الهرمية
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- فهرس على is_active للفلترة السريعة
CREATE INDEX idx_categories_is_active ON public.categories(is_active);

-- فهرس على sort_order للترتيب
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);

-- ============================================================================
-- دالة تحديث updated_at تلقائياً
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_categories ON public.categories;
CREATE TRIGGER set_updated_at_categories 
  BEFORE UPDATE ON public.categories 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- تفعيل RLS
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 1. إنشاء دالة مساعدة للتحقق من صلاحية المدير (تتجاوز RLS بأمان)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- هذا هو السحر: يتجاوز RLS ويمنع التكرار اللانهائي
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  );
$$;

-- ============================================================================
-- 2. إصلاح سياسات جدول user_roles
-- ============================================================================

-- حذف السياسات القديمة المسببة للمشكلة
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins manage roles" ON public.user_roles;

-- سياسة جديدة: المستخدم يرى بياناته، أو المدير يرى كل شيء
CREATE POLICY "Users view own roles" ON public.user_roles
FOR SELECT USING (
  user_id = auth.uid() OR public.is_admin()
);

-- سياسة جديدة: فقط المدير يمكنه إدارة الأدوار
CREATE POLICY "Only admins manage roles" ON public.user_roles
FOR ALL USING (
  public.is_admin()
);

-- ============================================================================
-- 3. إصلاح سياسات جدول categories (لتعتمد على الدالة الجديدة)
-- ============================================================================

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins manage categories" ON public.categories;

-- سياسة جديدة موحدة للقراءة: الجميع يرى النشط، والمدير يرى كل شيء
CREATE POLICY "View categories policy" ON public.categories
FOR SELECT USING (
  is_active = true OR public.is_admin()
);

-- سياسة جديدة للإدارة: فقط المدير
CREATE POLICY "Manage categories policy" ON public.categories
FOR ALL USING (
  public.is_admin()
);

-- -- ============================================================================
-- -- 4. (اختياري لكن موصى به) إصلاح سياسات جدول المنتجات إذا كانت موجودة
-- -- ============================================================================
-- DROP POLICY IF EXISTS "View products policy" ON public.products;
-- DROP POLICY IF EXISTS "Insert products policy" ON public.products;
-- DROP POLICY IF EXISTS "Update products policy" ON public.products;
-- DROP POLICY IF EXISTS "Delete products policy" ON public.products;

-- CREATE POLICY "View products policy" ON public.products
-- FOR SELECT USING (status = 'active' OR public.is_admin());

-- CREATE POLICY "Manage products policy" ON public.products
-- FOR ALL USING (public.is_admin());










-- ============================================================================
-- تصنيفات السوبر ماركت - Marketna
-- ============================================================================

-- 1. مشروبات (Beverages)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Beverages', 'مشروبات', 'beverages', 'جميع أنواع المشروبات', 10);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Water', 'مياه', 'water', 
   (SELECT id FROM public.categories WHERE slug = 'beverages'), 'مياه طبيعية ومعدنية', 1),
  ('Juices', 'عصائر', 'juices', 
   (SELECT id FROM public.categories WHERE slug = 'beverages'), 'عصائر طبيعية ومصنعة', 2),
  ('Soft Drinks', 'مشروبات غازية', 'soft-drinks', 
   (SELECT id FROM public.categories WHERE slug = 'beverages'), 'مشروبات غازية ومنعشة', 3),
  ('Energy Drinks', 'مشروبات الطاقة', 'energy-drinks', 
   (SELECT id FROM public.categories WHERE slug = 'beverages'), 'مشروبات الطاقة والمنشطة', 4),
  ('Tea & Coffee', 'شاي وقهوة', 'tea-coffee', 
   (SELECT id FROM public.categories WHERE slug = 'beverages'), 'شاي، قهوة، وكاكاو', 5);

-- 2. ألبان وبيض (Dairy & Eggs)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Dairy & Eggs', 'ألبان وبيض', 'dairy-eggs', 'منتجات الألبان والبيض الطازج', 20);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Milk', 'حليب', 'milk', 
   (SELECT id FROM public.categories WHERE slug = 'dairy-eggs'), 'حليب طازج ومبستر', 1),
  ('Cheese', 'جبنة', 'cheese', 
   (SELECT id FROM public.categories WHERE slug = 'dairy-eggs'), 'أنواع الجبن المختلفة', 2),
  ('Yogurt', 'زبادي', 'yogurt', 
   (SELECT id FROM public.categories WHERE slug = 'dairy-eggs'), 'زبادي ولبنة', 3),
  ('Butter & Cream', 'زبدة وكريمة', 'butter-cream', 
   (SELECT id FROM public.categories WHERE slug = 'dairy-eggs'), 'زبدة، كريمة، وقشطة', 4),
  ('Eggs', 'بيض', 'eggs', 
   (SELECT id FROM public.categories WHERE slug = 'dairy-eggs'), 'بيض طازج', 5);

-- 3. لحوم ودواجن وأسماك (Meat, Poultry & Seafood)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Meat & Seafood', 'لحوم ودواجن وأسماك', 'meat-seafood', 'لحوم طازجة ومجمدة', 30);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Chicken', 'دواجن', 'chicken', 
   (SELECT id FROM public.categories WHERE slug = 'meat-seafood'), 'دجاج طازج ومجمد', 1),
  ('Red Meat', 'لحوم حمراء', 'red-meat', 
   (SELECT id FROM public.categories WHERE slug = 'meat-seafood'), 'لحم بقري وغنم', 2),
  ('Fish & Seafood', 'أسماك ومأكولات بحرية', 'fish-seafood', 
   (SELECT id FROM public.categories WHERE slug = 'meat-seafood'), 'أسماك وروبيان', 3),
  ('Processed Meat', 'لحوم مصنعة', 'processed-meat', 
   (SELECT id FROM public.categories WHERE slug = 'meat-seafood'), 'نقانق، برجر، وناجتس', 4);

-- 4. معلبات (Canned Goods)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Canned Goods', 'معلبات', 'canned-goods', 'أغذية معلبة ومحفوظة', 40);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Canned Fish', 'أسماك معلبة', 'canned-fish', 
   (SELECT id FROM public.categories WHERE slug = 'canned-goods'), 'تونة، سردين، سلمون', 1),
  ('Canned Vegetables', 'خضار معلبة', 'canned-vegetables', 
   (SELECT id FROM public.categories WHERE slug = 'canned-goods'), 'ذرة، بازلاء، فطر', 2),
  ('Canned Fruits', 'فواكه معلبة', 'canned-fruits', 
   (SELECT id FROM public.categories WHERE slug = 'canned-goods'), 'أناناس، خوخ، كوكتيل', 3),
  ('Soups & Broths', 'شوربات ومرق', 'soups-broths', 
   (SELECT id FROM public.categories WHERE slug = 'canned-goods'), 'شوربات جاهزة ومرق', 4);

-- 5. حبوب وإفطار (Cereals & Breakfast)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Breakfast & Cereals', 'إفطار وحبوب', 'breakfast-cereals', 'حبوب الإفطار والشوفان', 50);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Corn Flakes', 'كورن فليكس', 'corn-flakes', 
   (SELECT id FROM public.categories WHERE slug = 'breakfast-cereals'), 'رقائق الذرة', 1),
  ('Oats', 'شوفان', 'oats', 
   (SELECT id FROM public.categories WHERE slug = 'breakfast-cereals'), 'شوفان طبيعي ومُنكّه', 2),
  ('Granola & Muesli', 'جرانولا وموسلي', 'granola-muesli', 
   (SELECT id FROM public.categories WHERE slug = 'breakfast-cereals'), 'خلطات الحبوب', 3),
  ('Pancake Mix', 'خليط البانكيك', 'pancake-mix', 
   (SELECT id FROM public.categories WHERE slug = 'breakfast-cereals'), 'خلطات الفطائر', 4);

-- 6. وجبات خفيفة (Snacks)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Snacks', 'وجبات خفيفة', 'snacks', 'سناكس ومقرمشات', 60);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Chips & Crisps', 'شيبس ومقرمشات', 'chips-crisps', 
   (SELECT id FROM public.categories WHERE slug = 'snacks'), 'رقائق البطاطس والمقرمشات', 1),
  ('Nuts & Seeds', 'مكسرات وبذور', 'nuts-seeds', 
   (SELECT id FROM public.categories WHERE slug = 'snacks'), 'مكسرات نيئة ومحمصة', 2),
  ('Popcorn', 'فشار', 'popcorn', 
   (SELECT id FROM public.categories WHERE slug = 'snacks'), 'فشار جاهز للتحضير', 3),
  ('Crackers', 'بiscuits مالح', 'crackers', 
   (SELECT id FROM public.categories WHERE slug = 'snacks'), 'بسكويت مالح وكراكرز', 4);

-- 7. حلويات وشوكولاتة (Sweets & Chocolate)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Sweets & Chocolate', 'حلويات وشوكولاتة', 'sweets-chocolate', 'حلويات وشوكولاتة', 70);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Chocolate Bars', 'ألواح شوكولاتة', 'chocolate-bars', 
   (SELECT id FROM public.categories WHERE slug = 'sweets-chocolate'), 'شوكولاتة داكنة وحليب', 1),
  ('Candies & Gummies', 'حلويات وجيلي', 'candies-gummies', 
   (SELECT id FROM public.categories WHERE slug = 'sweets-chocolate'), 'حلويات صلبة وطرية', 2),
  ('Cookies & Biscuits', 'كوكيز وبسكويت', 'cookies-biscuits', 
   (SELECT id FROM public.categories WHERE slug = 'sweets-chocolate'), 'بسكويت حلو وكوكيز', 3),
  ('Ice Cream', 'آيس كريم', 'ice-cream', 
   (SELECT id FROM public.categories WHERE slug = 'sweets-chocolate'), 'آيس كريم ومثلجات', 4);

-- 8. أرز ومعكرونة وحبوب (Rice, Pasta & Grains)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Rice, Pasta & Grains', 'أرز ومعكرونة وحبوب', 'rice-pasta-grains', 'الحبوب والنشويات', 80);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Rice', 'أرز', 'rice', 
   (SELECT id FROM public.categories WHERE slug = 'rice-pasta-grains'), 'أرز أبيض وبسمتي', 1),
  ('Pasta & Noodles', 'معكرونة ونودلز', 'pasta-noodles', 
   (SELECT id FROM public.categories WHERE slug = 'rice-pasta-grains'), 'معكرونة بأنواعها', 2),
  ('Flour', 'دقيق', 'flour', 
   (SELECT id FROM public.categories WHERE slug = 'rice-pasta-grains'), 'دقيق قمح وذرة', 3),
  ('Legumes', 'بقوليات', 'legumes', 
   (SELECT id FROM public.categories WHERE slug = 'rice-pasta-grains'), 'عدس، فاصوليا، حمص', 4);

-- 9. زيوت وتوابل (Oils & Spices)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Oils & Spices', 'زيوت وتوابل', 'oils-spices', 'زيوت الطهي والبهارات', 90);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Cooking Oils', 'زيوت طهي', 'cooking-oils', 
   (SELECT id FROM public.categories WHERE slug = 'oils-spices'), 'زيت زيتون، دوار الشمس', 1),
  ('Spices & Herbs', 'بهارات وأعشاب', 'spices-herbs', 
   (SELECT id FROM public.categories WHERE slug = 'oils-spices'), 'بهارات مشكلة وأعشاب', 2),
  ('Vinegar & Pickles', 'خل ومخللات', 'vinegar-pickles', 
   (SELECT id FROM public.categories WHERE slug = 'oils-spices'), 'خل، مخلل، طرشي', 3),
  ('Sauces & Dressings', 'صلصات', 'sauces-dressings', 
   (SELECT id FROM public.categories WHERE slug = 'oils-spices'), 'كتشب، مايونيز، صويا', 4);

-- 10. أطعمة مجمدة (Frozen Foods)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Frozen Foods', 'أطعمة مجمدة', 'frozen-foods', 'منتجات مجمدة', 100);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Frozen Vegetables', 'خضار مجمدة', 'frozen-vegetables', 
   (SELECT id FROM public.categories WHERE slug = 'frozen-foods'), 'خضار مجمدة جاهزة', 1),
  ('Frozen Meals', 'وجبات مجمدة', 'frozen-meals', 
   (SELECT id FROM public.categories WHERE slug = 'frozen-foods'), 'بيتزا، برجر، ناجتس', 2),
  ('Frozen Dess', 'حلويات مجمدة', 'frozen-dess', 
   (SELECT id FROM public.categories WHERE slug = 'frozen-foods'), 'آيس كريم، كنافة', 3);

-- 11. منظفات (Cleaning Supplies)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Cleaning Supplies', 'منظفات', 'cleaning-supplies', 'منتجات التنظيف', 110);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Dishwashing', 'غسيل الصحون', 'dishwashing', 
   (SELECT id FROM public.categories WHERE slug = 'cleaning-supplies'), 'سائل وم порошوك الصحون', 1),
  ('Laundry', 'غسيل الملابس', 'laundry', 
   (SELECT id FROM public.categories WHERE slug = 'cleaning-supplies'), 'مسحوق وسائل الغسيل', 2),
  ('Surface Cleaners', 'منظفات الأسطح', 'surface-cleaners', 
   (SELECT id FROM public.categories WHERE slug = 'cleaning-supplies'), 'منظفات الأرضيات والزجاج', 3),
  ('Air Fresheners', 'معطرات الجو', 'air-fresheners', 
   (SELECT id FROM public.categories WHERE slug = 'cleaning-supplies'), 'معطرات ومزيلات روائح', 4);

-- 12. العناية الشخصية (Personal Care)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Personal Care', 'العناية الشخصية', 'personal-care', 'مستلزمات النظافة الشخصية', 120);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Hair Care', 'العناية بالشعر', 'hair-care', 
   (SELECT id FROM public.categories WHERE slug = 'personal-care'), 'شامبو وبلسم', 1),
  ('Skin Care', 'العناية بالبشرة', 'skin-care', 
   (SELECT id FROM public.categories WHERE slug = 'personal-care'), 'صابون، لوشن، كريمات', 2),
  ('Oral Care', 'العناية بالفم', 'oral-care', 
   (SELECT id FROM public.categories WHERE slug = 'personal-care'), 'معجون وفرش أسنان', 3),
  ('Deodorants', 'مزيلات العرق', 'deodorants', 
   (SELECT id FROM public.categories WHERE slug = 'personal-care'), 'مزيلات ومضادات العرق', 4);

-- 13. أغذية أطفال (Baby Food)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Baby Food', 'أغذية أطفال', 'baby-food', 'طعام ومستلزمات الأطفال', 130);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Baby Formula', 'حليب أطفال', 'baby-formula', 
   (SELECT id FROM public.categories WHERE slug = 'baby-food'), 'حليب صناعي للأطفال', 1),
  ('Baby Cereals', 'حبوب أطفال', 'baby-cereals', 
   (SELECT id FROM public.categories WHERE slug = 'baby-food'), 'حبوب الإفطار للأطفال', 2),
  ('Baby Snacks', 'سناكس أطفال', 'baby-snacks', 
   (SELECT id FROM public.categories WHERE slug = 'baby-food'), 'بسكويت وفواكه للأطفال', 3);

-- 14. مستلزمات الحيوانات الأليفة (Pet Supplies)
INSERT INTO public.categories (name, name_ar, slug, description, sort_order) VALUES
  ('Pet Supplies', 'مستلزمات الحيوانات', 'pet-supplies', 'طعام ومستلزمات الحيوانات الأليفة', 140);

INSERT INTO public.categories (name, name_ar, slug, parent_id, description, sort_order) VALUES
  ('Cat Food', 'طعام القطط', 'cat-food', 
   (SELECT id FROM public.categories WHERE slug = 'pet-supplies'), 'طعام جاف وعلب قطط', 1),
  ('Dog Food', 'طعام الكلاب', 'dog-food', 
   (SELECT id FROM public.categories WHERE slug = 'pet-supplies'), 'طعام جاف وعلب كلاب', 2),
  ('Pet Treats', 'مكافآت الحيوانات', 'pet-treats', 
   (SELECT id FROM public.categories WHERE slug = 'pet-supplies'), 'سناكس للحيوانات', 3);