-- ==========================================================
-- SQL Seed Script for Categories (Marketna / ميني ماركت أبو وسيم)
-- ==========================================================

INSERT INTO categories (
    name,
    name_ar,
    slug,
    description,
    description_ar,
    image_url,
    image_alt,
    sort_order,
    is_active
) 
VALUES
(
    'Dairy & Eggs',
    'الألبان والبيض',
    'dairy-eggs',
    'Fresh milk, cheese, labneh, butter, and farm fresh eggs.',
    'حليب طازج، أجبان، لبنة، زبدة، وبيض بلدي طازج.',
    '/categories/dairy-eggs.png',
    'الألبان والبيض - Dairy & Eggs',
    1,
    TRUE
),
(
    'Beverages',
    'المشروبات والعصائر',
    'beverages',
    'Soft drinks, natural juices, mineral water, tea, and coffee.',
    'مشروبات غازية، عصائر طبيعية، مياه معدنية، شاي، وقهوة.',
    '/categories/Beverages.png',
    'المشروبات والعصائر - Beverages',
    2,
    TRUE
),
(
    'Snacks',
    'المسليات والمكسرات',
    'snacks',
    'Chips, biscuits, nuts, popcorn, and tasty crackers.',
    'شيبس، بسكويت، مكسرات، فوشار، ومقرمشات لذيذة.',
    '/categories/Snacks.png',
    'المسليات والمكسرات - Snacks',
    3,
    TRUE
),
(
    'Canned Goods',
    'العلب والمؤونة والمعلبات',
    'canned-goods',
    'Tuna, tomato paste, beans, corn, and canned vegetables.',
    'تونة، رب بندرة، فول، ذرة، وخضار معلبة.',
    '/categories/canned-goods.png',
    'المعلبات والمؤونة - Canned Goods',
    4,
    TRUE
),
(
    'Rice, Pasta & Grains',
    'الأرز، المعكرونة والحبوب',
    'rice-pasta-grains',
    'High quality rice, pasta, lentils, beans, and grains.',
    'أرز عالي الجودة، معكرونة، عدس، فريكة، وحبوب متنوعة.',
    '/categories/rice-pasta-grains.png',
    'الأرز والمعكرونة والحبوب - Rice, Pasta & Grains',
    5,
    TRUE
),
(
    'Oils & Spices',
    'الزيوت والبهارات والتوابل',
    'oils-spices',
    'Cooking oils, olive oil, natural spices, and seasonings.',
    'زيوت طهي، زيت زيتون بكر، بهارات مطحونة، وتوابل أصلية.',
    '/categories/oils-spices.png',
    'الزيوت والبهارات - Oils & Spices',
    6,
    TRUE
),
(
    'Sweets & Chocolate',
    'الحلويات والشوكولاتة',
    'sweets-chocolate',
    'Premium chocolates, candies, wafers, and sweet treats.',
    'شوكولاتة فاخرة، سكاكر، ويفر، وحلويات منوعة.',
    '/categories/sweets-chocolate.png',
    'الحلويات والشوكولاتة - Sweets & Chocolate',
    7,
    TRUE
),
(
    'Breakfast Cereals',
    'حبوب الإفطار',
    'breakfast-cereals',
    'Nutritious breakfast cereals, oats, and honey.',
    'حبوب إفطار مغذية، شوفان، وعسل طبيعي.',
    '/categories/breakfast-cereals.png',
    'حبوب الإفطار - Breakfast Cereals',
    8,
    TRUE
),
(
    'Cleaning Supplies',
    'منظفات ومستلزمات منزلية',
    'cleaning-supplies',
    'Detergents, surface cleaners, dishwashing soaps, and tissues.',
    'مساحيق غسيل، منظفات أسطح، سائل جلي، ومحارم ورقية.',
    '/categories/cleaning-supplies.png',
    'منظفات منزلية - Cleaning Supplies',
    9,
    TRUE
),
(
    'Personal Care',
    'العناية الشخصية',
    'personal-care',
    'Shampoo, soaps, toothpastes, and personal hygiene products.',
    'شامبو، صابون استرخاء، معجون أسنان، ومنتجات عناية شخصية.',
    '/categories/personal-care.png',
    'العناية الشخصية - Personal Care',
    10,
    TRUE
),
(
    'Frozen Foods',
    'الأغذية المجمدة',
    'frozen-foods',
    'Frozen vegetables, nuggets, fries, and ready meals.',
    'خضار مجمدة، ناجتس، بطاطس مقلية، ووجبات جاهزة.',
    '/categories/frozen-foods.png',
    'الأغذية المجمدة - Frozen Foods',
    11,
    TRUE
),
(
    'Meat & Seafood',
    'اللحوم والأسماك المجمدة',
    'meat-seafood',
    'Quality frozen meats, chicken, and seafood selections.',
    'لحوم ودجاج مجمد عالي الجودة ومأكولات بحرية.',
    '/categories/meat-seafood.png',
    'اللحوم والأسماك - Meat & Seafood',
    12,
    TRUE
),
(
    'Baby Food',
    'أغذية الأطفال',
    'baby-food',
    'Infant formula, purees, baby cereals, and snacks.',
    'حليب أطفال، وجبات مهروسة، بسكويت أطفال، ومستلزمات صغار.',
    '/categories/baby-food.png',
    'أغذية الأطفال - Baby Food',
    13,
    TRUE
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    name_ar = EXCLUDED.name_ar,
    description = EXCLUDED.description,
    description_ar = EXCLUDED.description_ar,
    image_url = EXCLUDED.image_url,
    image_alt = EXCLUDED.image_alt,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();