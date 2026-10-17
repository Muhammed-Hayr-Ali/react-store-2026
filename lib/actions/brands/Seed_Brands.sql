insert into public.brands (name, name_ar, slug, description, description_ar, image_url, image_alt, is_active, sort_order, meta_title, meta_description)
values
  -- 🇸🇾 الماركات السورية (Syrian Brands)
  (
    'Ghassan',
    'غسان',
    'ghassan',
    'Famous Syrian brand specialized in high-quality canned foods, olives, and local preserves.',
    'علامة تجارية سورية شهيرة متخصصة في الأغذية المعلبة، الزيتون، والمؤونة المحلية الفاخرة.',
    'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=60',
    'Ghassan Brand Logo',
    true,
    1,
    'Ghassan Syrian Products - Marketna',
    'Shop authentic Syrian preserves, olives, and canned goods from Ghassan.'
  ),
  (
    'Al-Master',
    'الماستر',
    'al-master',
    'Leading Syrian manufacturer of delicious potato chips, snacks, and crispy corn puffs.',
    'شركة سورية رائدة في تصنيع رقائق البطاطس (الشيبس)، المقرمشات، ووجبات الذرة الخفيفة.',
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format&fit=crop&q=60',
    'Al-Master Chips Logo',
    true,
    2,
    'Al-Master Snacks & Chips - Marketna',
    'Enjoy crispy and delicious Al-Master chips and snacks.'
  ),
  (
    'Durra',
    'الدرة',
    'durra',
    'Renowned brand originating from Syria providing top-quality pickles, canned vegetables, thyme, and condiments.',
    'علامة تجارية عريقة نشأت في سوريا توفر المخللات عالية الجودة، الخضار المعلبة، الزعتر، والمنكهات.',
    'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&auto=format&fit=crop&q=60',
    'Durra Brand Logo',
    true,
    3,
    'Durra Food Products - Marketna',
    'Find premium Durra pickles, thyme, and kitchen essentials.'
  ),

  -- 🌍 الماركات العربية (Arab Brands)
  (
    'Almarai',
    'المراعي',
    'almarai',
    'Leading food and beverage manufacturing and distribution company in the Middle East, offering dairy, juice, and bakery products.',
    'شركة رائدة في تصنيع وتوزيع الأغذية والمشروبات في الشرق الأوسط، تقدم منتجات الألبان، العصائر، والخبز.',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=60',
    'Almarai Brand Logo',
    true,
    4,
    'Almarai Dairy & Food Products - Marketna',
    'Shop fresh Almarai milk, laban, cheese, and juices at Marketna.'
  ),
  (
    'Halwani Bros',
    'حلواني برذرز',
    'halwani-bros',
    'Historic food brand known for traditional sweets, halva, tahini, meat products, and jams.',
    'علامة تجارية عريقة متخصصة في الحلويات التقليدية، الحلاوة الطحينية، الطحينة، اللحوم المصنعة، والمربيات.',
    'https://images.unsplash.com/photo-1584776296944-ab6fb5763d73?w=800&auto=format&fit=crop&q=60',
    'Halwani Bros Logo',
    true,
    5,
    'Halwani Food Products - Marketna',
    'Explore quality Halwani halva, jams, and food essentials.'
  ),
  (
    'Al Ameed',
    'العميد',
    'al-ameed',
    'Famous coffee roasting brand delivering authentic and premium quality Arabic and Turkish coffee.',
    'علامة تجارية شهيرة لتحميص القهوة تقدم القهوة العربية والتركية الأصيلة بجودة ممتازة.',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=60',
    'Al Ameed Coffee Logo',
    true,
    6,
    'Al Ameed Coffee & Beverages - Marketna',
    'Enjoy rich and aromatic Al Ameed coffee blends.'
  ),

  -- 🌐 الماركات الأجنبية والعالمية (International Brands)
  (
    'Nestle',
    'نستله',
    'nestle',
    'The largest food and drink conglomerate in the world, offering chocolates, coffee, dairy, and infant nutrition.',
    'أكبر تكتل للأغذية والمشروبات في العالم، يقدم الشوكولاتة، القهوة، الألبان، وتغذية الأطفال.',
    'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&auto=format&fit=crop&q=60',
    'Nestle Brand Logo',
    true,
    7,
    'Nestle Products - Marketna',
    'Discover world-famous Nestle chocolates, coffee, and beverages.'
  ),
  (
    'Pepsi',
    'بيبسي',
    'pepsi',
    'Global carbonated soft drink brand enjoyed by millions worldwide.',
    'علامة تجارية عالمية للمشروبات الغازية يستمتع بها الملايين حول العالم.',
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=60',
    'Pepsi Brand Logo',
    true,
    8,
    'Pepsi Beverages - Marketna',
    'Quench your thirst with refreshing Pepsi soft drinks.'
  ),
  (
    'Unilever',
    'يونيليفر',
    'unilever',
    'Multinational consumer goods company providing trusted household cleaning and personal care products.',
    'شركة متعددة الجنسيات للسلع الاستهلاكية توفر منتجات العناية الشخصية والتنظيف المنزلي الموثوقة.',
    'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&auto=format&fit=crop&q=60',
    'Unilever Logo',
    true,
    9,
    'Unilever Household & Care - Marketna',
    'Shop reliable Unilever detergents and personal care items.'
  )
on conflict (slug) do update set
  name = excluded.name,
  name_ar = excluded.name_ar,
  description = excluded.description,
  description_ar = excluded.description_ar,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = timezone('utc'::text, now());