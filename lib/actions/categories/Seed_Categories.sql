create or replace function public.seed_supermarket_categories()
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_count integer := 0;
begin
  insert into public.categories (
    id,
    parent_id,
    name,
    name_ar,
    slug,
    description,
    description_ar,
    image_url,
    image_alt,
    sort_order,
    is_active,
    created_at,
    updated_at
  )
  values
    -- 1. Grains, Pasta & Pulses
    ('10000000-0000-4000-8000-000000000001', null, 'Grains, Pasta & Pulses', 'الحبوب والمعكرونة والبقوليات', 'grains-pasta-pulses', 'Rice, bulgur, pasta, lentils, chickpeas, and dry pantry staples.', 'أرز، برغل، معكرونة، عدس، حمص، ومونة الحبوب الأساسية.', '/categories/grains-pasta-pulses.png', 'الحبوب والمعكرونة والبقوليات - Grains, Pasta & Pulses', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000001', 'Rice & Bulgur', 'الأرز والبرغل والفريكة', 'rice-bulgur', 'Basmati rice, short-grain rice, fine and coarse bulgur, and freekeh.', 'أرز بسمتي ومصري، برغل ناعم وخشن، وفريكة.', '/categories/rice-bulgur.png', 'الأرز والبرغل والفريكة - Rice & Bulgur', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000001', 'Pasta & Noodles', 'المعكرونة والشعيرية', 'pasta-noodles', 'Spaghetti, penne, vermicelli, lasagna, and instant noodles.', 'سباغيتي، معكرونة مشكلة، شعيرية، وإندومي ونودلز.', '/categories/pasta-noodles.png', 'المعكرونة والشعيرية - Pasta & Noodles', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000103', '10000000-0000-4000-8000-000000000001', 'Dried Lentils & Beans', 'البقوليات الجافة', 'dried-lentils-beans', 'Red and brown lentils, chickpeas, fava beans, and white beans.', 'عدس أحمر وأسود، حمص، فول يابس، وفاصولياء بيضاء.', '/categories/dried-lentils-beans.png', 'البقوليات الجافة - Dried Lentils & Beans', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000104', '10000000-0000-4000-8000-000000000001', 'Flour, Semolina & Starch', 'الطحين والسميد والنشا', 'flour-semolina-starch', 'All-purpose flour, semolina, cornstarch, and baking mixes.', 'طحين أبيض وأسمر، سميد ناعم وخشن، ونشا الذرة.', '/categories/flour-semolina-starch.png', 'الطحين والسميد والنشا - Flour, Semolina & Starch', 4, true, v_now, v_now),

    -- 2. Oils, Ghee & Sauces
    ('10000000-0000-4000-8000-000000000002', null, 'Oils, Ghee & Sauces', 'الزيوت والسمن والصلصات', 'oils-ghee-sauces', 'Cooking oils, olive oil, ghee, tomato paste, and table condiments.', 'زيوت الطبخ، زيت الزيتون، السمن، رب البندورة، والصلصات.', '/categories/oils-ghee-sauces.png', 'الزيوت والسمن والصلصات - Oils, Ghee & Sauces', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000002', 'Cooking & Frying Oils', 'زيوت القلي والطبخ', 'cooking-frying-oils', 'Sunflower oil, corn oil, and vegetable frying oils.', 'زيت دوار الشمس، زيت الذرة، وزيوت القلي النباتية.', '/categories/cooking-frying-oils.png', 'زيوت القلي والطبخ - Cooking & Frying Oils', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000002', 'Olive Oil & Ghee', 'زيت الزيتون والسمن', 'olive-oil-ghee', 'Extra virgin olive oil, vegetable ghee, and animal ghee.', 'زيت زيتون بكر، سمن نباتي، وسمن عربي.', '/categories/olive-oil-ghee.png', 'زيت الزيتون والسمن - Olive Oil & Ghee', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000203', '10000000-0000-4000-8000-000000000002', 'Tomato & Pepper Paste', 'رب البندورة ودبس الفليفلة', 'tomato-pepper-paste', 'Concentrated tomato paste, red pepper paste, and pomegranate molasses.', 'معجون الطماطم، دبس الفليفلة الحلوة والحارة، ودبس الرمان.', '/categories/tomato-pepper-paste.png', 'رب البندورة ودبس الفليفلة - Tomato & Pepper Paste', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000204', '10000000-0000-4000-8000-000000000002', 'Ketchup, Mayonnaise & Vinegar', 'الكاتشب والمايونيز والخل', 'ketchup-mayo-vinegar', 'Ketchup, mayonnaise, mustard, hot sauces, and natural vinegar.', 'كاتشب، مايونيز، خردل، صلصات حارة، وخل أبيض وتفاح.', '/categories/ketchup-mayo-vinegar.png', 'الكاتشب والمايونيز والخل - Ketchup, Mayonnaise & Vinegar', 4, true, v_now, v_now),

    -- 3. Canned & Jarred Foods
    ('10000000-0000-4000-8000-000000000003', null, 'Canned & Jarred Foods', 'المعلبات والمرطبانات', 'canned-jarred-foods', 'Canned fish, ready beans, olives, pickles, and preserved vegetables.', 'تونة وسردين، فول وحمص معلب، زيتون، ومخللات.', '/categories/canned-jarred-foods.png', 'المعلبات والمرطبانات - Canned & Jarred Foods', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000301', '10000000-0000-4000-8000-000000000003', 'Tuna, Sardines & Meat Cans', 'التونة والسردين واللحوم المعلبة', 'tuna-sardines-meat', 'Canned tuna in oil or water, sardines, and luncheon meat.', 'علب تونة، سردين بالزيت أو الفلفل، ومرتديلا ولانشون.', '/categories/tuna-sardines-meat.png', 'التونة والسردين واللحوم المعلبة - Tuna, Sardines & Meat Cans', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000302', '10000000-0000-4000-8000-000000000003', 'Canned Beans & Vegetables', 'الفول والحمص والخضار المعلبة', 'canned-beans-vegetables', 'Ready fava beans, tahini hummus, sweet corn, mushrooms, and peas.', 'فول مدمس، حمص بالطحينة، ذرة حلوة، فطر، وبازلاء.', '/categories/canned-beans-vegetables.png', 'الفول والحمص والخضار المعلبة - Canned Beans & Vegetables', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000303', '10000000-0000-4000-8000-000000000003', 'Olives, Pickles & Makdous', 'الزيتون والمخللات والمكدوس', 'olives-pickles-makdous', 'Green and black olives, cucumber pickles, and stuffed eggplant makdous.', 'زيتون أخضر وأسود، مخلل خيار ومشكل، ومكدوس بالجوز.', '/categories/olives-pickles-makdous.png', 'الزيتون والمخللات والمكدوس - Olives, Pickles & Makdous', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000304', '10000000-0000-4000-8000-000000000003', 'Jams, Honey & Tahini', 'المربيات والعسل والطحينة', 'jams-honey-tahini', 'Fruit jams, natural honey, sesame tahini, halva, and chocolate spreads.', 'مربى المشمش والفريز، عسل، طحينة، حلاوة، وشوكولاتة قابلة للدهن.', '/categories/jams-honey-tahini.png', 'المربيات والعسل والطحينة - Jams, Honey & Tahini', 4, true, v_now, v_now),

    -- 4. Dairy, Cheese & Eggs
    ('10000000-0000-4000-8000-000000000004', null, 'Dairy, Cheese & Eggs', 'الألبان والأجبان والبيض', 'dairy-cheese-eggs', 'Fresh milk, yogurt, labneh, white and yellow cheeses, butter, and eggs.', 'حليب، لبن زبادي، لبنة، أجبان متنوعة، زبدة، وبيض طازج.', '/categories/dairy-cheese-eggs.png', 'الألبان والأجبان والبيض - Dairy, Cheese & Eggs', 4, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000401', '10000000-0000-4000-8000-000000000004', 'Milk & Powdered Milk', 'الحليب السائل والمجفف', 'milk-powdered-milk', 'UHT liquid milk, flavored milk, and full-cream milk powder.', 'حليب طويل الأمد، حليب بالشوكولاتة والفراولة، وحليب بودرة.', '/categories/milk-powdered-milk.png', 'الحليب السائل والمجفف - Milk & Powdered Milk', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000402', '10000000-0000-4000-8000-000000000004', 'Yogurt, Labneh & Ayran', 'اللبن واللبنة والعيران', 'yogurt-labneh-ayran', 'Natural yogurt, strained labneh, and salted ayran drinks.', 'لبن زبادي، لبنة بلدية ومعلبة، ولبن عيران.', '/categories/yogurt-labneh-ayran.png', 'اللبن واللبنة والعيران - Yogurt, Labneh & Ayran', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000403', '10000000-0000-4000-8000-000000000004', 'White & Yellow Cheeses', 'الأجبان البيضاء والصفراء', 'white-yellow-cheeses', 'Akkawi, halloumi, feta, kashkaval, mozzarella, and triangle cheese.', 'جبنة عكاوي وحلوم، فيتا، قشقوان، موزاريلا، وجبنة مثلثات.', '/categories/white-yellow-cheeses.png', 'الأجبان البيضاء والصفراء - White & Yellow Cheeses', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000404', '10000000-0000-4000-8000-000000000004', 'Butter, Cream & Eggs', 'الزبدة والقشطة والبيض', 'butter-cream-eggs', 'Table butter, cooking cream, qishta, and farm fresh eggs.', 'زبدة نباتية وحيوانية، قشطة، كريمة طبخ، وبيض المائدة.', '/categories/butter-cream-eggs.png', 'الزبدة والقشطة والبيض - Butter, Cream & Eggs', 4, true, v_now, v_now),

    -- 5. Cold & Hot Beverages
    ('10000000-0000-4000-8000-000000000005', null, 'Cold & Hot Beverages', 'المشروبات الباردة والساخنة', 'beverages', 'Drinking water, juices, soft drinks, tea, coffee, and yerba mate.', 'مياه الشرب، العصائر، المشروبات الغازية، الشاي، القهوة، والمتة.', '/categories/beverages.png', 'المشروبات الباردة والساخنة - Cold & Hot Beverages', 5, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000501', '10000000-0000-4000-8000-000000000005', 'Drinking Water', 'مياه الشرب', 'drinking-water', 'Bottled mineral water in small, medium, and family sizes.', 'عبوات مياه معدنية بأحجام صغيرة وعائلية وكراتين.', '/categories/drinking-water.png', 'مياه الشرب - Drinking Water', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000502', '10000000-0000-4000-8000-000000000005', 'Fruit Juices & Nectars', 'العصائر الطبيعية والمعلبة', 'fruit-juices', 'Orange, mango, apple, and mixed fruit juices and nectars.', 'عصير برتقال، مانجو، تفاح، كوكتيل، وعصائر الأطفال.', '/categories/fruit-juices.png', 'العصائر الطبيعية والمعلبة - Fruit Juices & Nectars', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000503', '10000000-0000-4000-8000-000000000005', 'Soft & Energy Drinks', 'المشروبات الغازية ومشروبات الطاقة', 'soft-energy-drinks', 'Cola, lemon-lime sodas, sparkling water, and energy drinks.', 'كولا، مشروبات غازية متنوعة، مياه فوارة، ومشروبات طاقة.', '/categories/soft-energy-drinks.png', 'المشروبات الغازية ومشروبات الطاقة - Soft & Energy Drinks', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000504', '10000000-0000-4000-8000-000000000005', 'Coffee, Tea & Mate', 'القهوة والشاي والمتة', 'coffee-tea-mate', 'Arabic coffee, instant coffee, black and green tea, herbs, and mate.', 'قهوة عربية وتركية، نسكافيه، شاي فرط وأكياس، أعشاب، ومتة.', '/categories/coffee-tea-mate.png', 'القهوة والشاي والمتة - Coffee, Tea & Mate', 4, true, v_now, v_now),

    -- 6. Snacks, Biscuits & Sweets
    ('10000000-0000-4000-8000-000000000006', null, 'Snacks, Biscuits & Sweets', 'الشيبس والبسكويت والحلويات', 'snacks-biscuits-sweets', 'Potato chips, corn puffs, chocolate bars, biscuits, wafers, and cakes.', 'شيبس ومقرمشات، شوكولاتة، بسكويت، ويفر، وكيك مغلف.', '/categories/snacks-biscuits-sweets.png', 'الشيبس والبسكويت والحلويات - Snacks, Biscuits & Sweets', 6, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000601', '10000000-0000-4000-8000-000000000006', 'Chips & Savoury Snacks', 'الشيبس والمقرمشات', 'chips-savoury-snacks', 'Potato chips, tortilla chips, popcorn, and extruded corn snacks.', 'شيبس بطاطا، ذرة مقرمشة، بوشار، ومقرمشات مالحة.', '/categories/chips-savoury-snacks.png', 'الشيبس والمقرمشات - Chips & Savoury Snacks', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000602', '10000000-0000-4000-8000-000000000006', 'Biscuits, Wafers & Cakes', 'البسكويت والويفر والكيك', 'biscuits-wafers-cakes', 'Tea biscuits, cream-filled wafers, croissants, and mini cakes.', 'بسكويت شاي، ويفر محشي، كرواسان، وكيك مغلف.', '/categories/biscuits-wafers-cakes.png', 'البسكويت والويفر والكيك - Biscuits, Wafers & Cakes', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000603', '10000000-0000-4000-8000-000000000006', 'Chocolates & Candies', 'الشوكولاتة والسكاكر', 'chocolates-candies', 'Chocolate bars, pralines, lollipops, gummies, and chewing gum.', 'ألواح شوكولاتة، ضيافة، مصاصات، جيلي، وعلكة.', '/categories/chocolates-candies.png', 'الشوكولاتة والسكاكر - Chocolates & Candies', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000604', '10000000-0000-4000-8000-000000000006', 'Dates & Oriental Sweets', 'التمور والحلويات الشرقية', 'dates-oriental-sweets', 'Packaged dates, date paste, maamoul, and traditional sweets.', 'تمور فاخرة، عجوة، معمول بالتمر، وراحة وحلويات شرقية.', '/categories/dates-oriental-sweets.png', 'التمور والحلويات الشرقية - Dates & Oriental Sweets', 4, true, v_now, v_now),

    -- 7. Nuts, Seeds & Dried Fruits
    ('10000000-0000-4000-8000-000000000007', null, 'Nuts, Seeds & Dried Fruits', 'المكسرات والبزورات والفواكه المجففة', 'nuts-seeds-dried-fruits', 'Roasted nuts, sunflower and pumpkin seeds, mixed crackers, and raisins.', 'مكسرات محمصة، بزر دوار الشمس ويقطين، موالح، وزبيب.', '/categories/nuts-seeds-dried-fruits.png', 'المكسرات والبزورات والفواكه المجففة - Nuts, Seeds & Dried Fruits', 7, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000701', '10000000-0000-4000-8000-000000000007', 'Roasted & Raw Nuts', 'المكسرات المحمصة والنيئة', 'roasted-raw-nuts', 'Pistachios, cashews, almonds, walnuts, hazelnuts, and peanuts.', 'فستق حلبي، كاجو، لوز، جوز، بندق، وفستق سوداني.', '/categories/roasted-raw-nuts.png', 'المكسرات المحمصة والنيئة - Roasted & Raw Nuts', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000702', '10000000-0000-4000-8000-000000000007', 'Sunflower & Pumpkin Seeds', 'البزورات بأنواعها', 'sunflower-pumpkin-seeds', 'Salted sunflower seeds, pumpkin seeds, and watermelon seeds.', 'بزر دوار الشمس مملح، بزر يقطين أبيض، وبزر بطيخ.', '/categories/sunflower-pumpkin-seeds.png', 'البزورات بأنواعها - Sunflower & Pumpkin Seeds', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000703', '10000000-0000-4000-8000-000000000007', 'Mixed Crackers & Roasted Chickpeas', 'الموالح والقضامة', 'mixed-crackers-chickpeas', 'Japanese crackers, coated peanuts, yellow and salted chickpeas.', 'موالح صينية، فستق مقرمش، قضامة صفراء ومملحة ومغلفة.', '/categories/mixed-crackers-chickpeas.png', 'الموالح والقضامة - Mixed Crackers & Roasted Chickpeas', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000704', '10000000-0000-4000-8000-000000000007', 'Dried Fruits & Raisins', 'الفواكه المجففة والزبيب', 'dried-fruits-raisins', 'Golden and black raisins, dried figs, dried apricots, and coconut flakes.', 'زبيب أشقر وأسود، تين مجفف، مشمش مجفف، وجوز الهند.', '/categories/dried-fruits-raisins.png', 'الفواكه المجففة والزبيب - Dried Fruits & Raisins', 4, true, v_now, v_now),

    -- 8. Spices, Herbs & Baking
    ('10000000-0000-4000-8000-000000000008', null, 'Spices, Herbs & Baking', 'البهارات والتوابل ومستلزمات الحلويات', 'spices-herbs-baking', 'Ground spices, whole herbs, salt, sugar, yeast, and baking ingredients.', 'بهارات وتوابل مشكلة، ملح، سكر، خميرة، وفانيليا وبيكنج باودر.', '/categories/spices-herbs-baking.png', 'البهارات والتوابل ومستلزمات الحلويات - Spices, Herbs & Baking', 8, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000801', '10000000-0000-4000-8000-000000000008', 'Ground Spices & Seasonings', 'البهارات والتوابل المطحونة', 'ground-spices-seasonings', 'Seven spices, black pepper, cumin, paprika, turmeric, and kabsa spices.', 'سبع بهارات، فلفل أسود، كمون، بابريكا، كركم، وبهارات كبسة.', '/categories/ground-spices-seasonings.png', 'البهارات والتوابل المطحونة - Ground Spices & Seasonings', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000802', '10000000-0000-4000-8000-000000000008', 'Thyme, Sumac & Dried Herbs', 'الزعتر والسماق والأعشاب المجففة', 'thyme-sumac-herbs', 'Aleppo thyme mix, sumac, dried mint, bay leaves, and oregano.', 'زعتر حلبي، سماق بلدي، نعناع يابس، ورق غار، وأوريغانو.', '/categories/thyme-sumac-herbs.png', 'الزعتر والسماق والأعشاب المجففة - Thyme, Sumac & Dried Herbs', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000803', '10000000-0000-4000-8000-000000000008', 'Sugar, Salt & Stock Cubes', 'السكر والملح ومكعبات المرق', 'sugar-salt-stock', 'White sugar, sugar cubes, table salt, sea salt, and chicken stock.', 'سكر ناعم ومكعبات، ملح طعام وصخري، ومكعبات مرقة الدجاج.', '/categories/sugar-salt-stock.png', 'السكر والملح ومكعبات المرق - Sugar, Salt & Stock Cubes', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000804', '10000000-0000-4000-8000-000000000008', 'Baking & Dessert Supplies', 'مستلزمات الكيك والحلويات', 'baking-dessert-supplies', 'Instant yeast, baking powder, vanilla, cocoa powder, and jelly.', 'خميرة فورية، بيكنج باودر، فانيليا، كاكاو خام، وجيلي وكاسترد.', '/categories/baking-dessert-supplies.png', 'مستلزمات الكيك والحلويات - Baking & Dessert Supplies', 4, true, v_now, v_now),

    -- 9. Bakery & Breakfast
    ('10000000-0000-4000-8000-000000000009', null, 'Bakery & Breakfast', 'المخبوزات والإفطار', 'bakery-breakfast', 'Arabic bread, bran bread, toast, rusks, oats, and breakfast cereals.', 'خبز عربي ونخالة، توست، بقسماط، شوفان، ورقائق الإفطار.', '/categories/bakery-breakfast.png', 'المخبوزات والإفطار - Bakery & Breakfast', 9, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000901', '10000000-0000-4000-8000-000000000009', 'Arabic & Bran Bread', 'الخبز العربي وخبز النخالة', 'arabic-bran-bread', 'White flatbread, whole wheat bran bread, and saj bread.', 'خبز عربي أبيض، خبز نخالة صحي، وخبز صاج وتورتيلا.', '/categories/arabic-bran-bread.png', 'الخبز العربي وخبز النخالة - Arabic & Bran Bread', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000902', '10000000-0000-4000-8000-000000000009', 'Toast, Burger Buns & Samoon', 'التوست والصمون وخبز البرغر', 'toast-buns-samoon', 'Sliced white and brown toast, burger buns, and sandwich rolls.', 'توست أبيض وأسمر، خبز برغر، وصمون طازج.', '/categories/toast-buns-samoon.png', 'التوست والصمون وخبز البرغر - Toast, Burger Buns & Samoon', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000903', '10000000-0000-4000-8000-000000000009', 'Rusks, Kaak & Breadcrumbs', 'الكعك والبقسماط', 'rusks-kaak-breadcrumbs', 'Sesame kaak, dry rusks, and fine breadcrumbs for frying.', 'كعك بالسمسم، شابورة، وبقسماط مطحون للقلي.', '/categories/rusks-kaak-breadcrumbs.png', 'الكعك والبقسماط - Rusks, Kaak & Breadcrumbs', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000000904', '10000000-0000-4000-8000-000000000009', 'Oats & Breakfast Cereals', 'الشوفان ورقائق الذرة', 'oats-breakfast-cereals', 'Rolled oats, quick oats, corn flakes, and kids cereals.', 'شوفان كامل وسريع التحضير، كورن فليكس، وحبوب إفطار.', '/categories/oats-breakfast-cereals.png', 'الشوفان ورقائق الذرة - Oats & Breakfast Cereals', 4, true, v_now, v_now),

    -- 10. Household Detergents & Cleaning
    ('10000000-0000-4000-8000-000000000010', null, 'Household Detergents & Cleaning', 'المنظفات ومواد الغسيل', 'household-cleaning', 'Laundry detergents, dishwashing liquids, bleach, and surface cleaners.', 'مساحيق وجل الغسيل، سائل الجلي، الكلور، ومنظفات الأرضيات والأسطح.', '/categories/household-cleaning.png', 'المنظفات ومواد الغسيل - Household Detergents & Cleaning', 10, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001001', '10000000-0000-4000-8000-000000000010', 'Laundry Detergents & Softeners', 'مساحيق الغسيل ومنعمات الأقمشة', 'laundry-detergents', 'Automatic and hand-wash powders, liquid gels, and fabric softeners.', 'مسحوق غسيل أوتوماتيك وعادي، جل غسيل، ومعطر ومنعم ملابس.', '/categories/laundry-detergents.png', 'مساحيق الغسيل ومنعمات الأقمشة - Laundry Detergents & Softeners', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001002', '10000000-0000-4000-8000-000000000010', 'Dishwashing Liquids & Sponges', 'سائل الجلي وإسفنج المطبخ', 'dishwashing-sponges', 'Dishwashing liquid, dishwasher tablets, sponges, and steel wool.', 'سائل جلي، أقراص جلاية، ليف وإسفنج، وسلك جلي.', '/categories/dishwashing-sponges.png', 'سائل الجلي وإسفنج المطبخ - Dishwashing Liquids & Sponges', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001003', '10000000-0000-4000-8000-000000000010', 'Bleach, Disinfectants & Floor Cleaners', 'الكلور والمعقمات ومنظفات الأرضيات', 'bleach-floor-cleaners', 'Liquid bleach, pine disinfectants, and scented floor cleaners.', 'كلور مبيض، ديتول ومعقمات، ومنظفات أرضيات معطرة.', '/categories/bleach-floor-cleaners.png', 'الكلور والمعقمات ومنظفات الأرضيات - Bleach, Disinfectants & Floor Cleaners', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001004', '10000000-0000-4000-8000-000000000010', 'Glass, Kitchen & Bathroom Cleaners', 'منظفات الزجاج والمطبخ والحمام', 'glass-kitchen-bathroom-cleaners', 'Glass spray cleaners, degreasers, limescale removers, and air fresheners.', 'ملمع زجاج، مزيل دهون، منظف حمامات، ومعطرات جو.', '/categories/glass-kitchen-bathroom-cleaners.png', 'منظفات الزجاج والمطبخ والحمام - Glass, Kitchen & Bathroom Cleaners', 4, true, v_now, v_now),

    -- 11. Personal Care & Baby
    ('10000000-0000-4000-8000-000000000011', null, 'Personal Care & Baby', 'العناية الشخصية ومستلزمات الأطفال', 'personal-care-baby', 'Shampoo, soap, oral care, tissues, diapers, and baby food.', 'شامبو وصابون، العناية بالأسنان، محارم ورقية، حفاضات، وأغذية أطفال.', '/categories/personal-care-baby.png', 'العناية الشخصية ومستلزمات الأطفال - Personal Care & Baby', 11, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001101', '10000000-0000-4000-8000-000000000011', 'Shampoo, Soap & Body Care', 'الشامبو والصابون والاستحمام', 'shampoo-soap-body', 'Hair shampoo, conditioner, shower gel, hand wash, and bar soap.', 'شامبو وبلسم، سائل استحمام، غسول يدين، وصابون غار ومعطر.', '/categories/shampoo-soap-body.png', 'الشامبو والصابون والاستحمام - Shampoo, Soap & Body Care', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001102', '10000000-0000-4000-8000-000000000011', 'Dental & Shaving Care', 'العناية بالأسنان والحلاقة', 'dental-shaving-care', 'Toothpaste, toothbrushes, mouthwash, razors, and deodorants.', 'معجون وفرشاة أسنان، شفرات حلاقة، ومزيلات عرق.', '/categories/dental-shaving-care.png', 'العناية بالأسنان والحلاقة - Dental & Shaving Care', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001103', '10000000-0000-4000-8000-000000000011', 'Baby Diapers & Wipes', 'حفاضات الأطفال والمناديل المبللة', 'baby-diapers-wipes', 'Baby diapers in all sizes, wet wipes, and baby powder.', 'حفاضات أطفال بجميع المقاسات، مناديل مبللة، وبودرة أطفال.', '/categories/baby-diapers-wipes.png', 'حفاضات الأطفال والمناديل المبللة - Baby Diapers & Wipes', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001104', '10000000-0000-4000-8000-000000000011', 'Baby Food & Formula', 'أغذية وحليب الأطفال', 'baby-food', 'Infant formula, purees, baby cereals, and snacks.', 'حليب أطفال، وجبات مهروسة، بسكويت أطفال، وسيريلاك.', '/categories/baby-food.png', 'أغذية وحليب الأطفال - Baby Food & Formula', 4, true, v_now, v_now),

    -- 12. Paper Products & Kitchen Disposables
    ('10000000-0000-4000-8000-000000000012', null, 'Paper Products & Kitchen Disposables', 'الورقيات وأدوات المطبخ', 'paper-kitchen-disposables', 'Facial tissues, kitchen rolls, aluminum foil, cling film, and trash bags.', 'محارم وجه، رول مطبخ، قصدير، نايلون تغليف، وأكياس قمامة.', '/categories/paper-kitchen-disposables.png', 'الورقيات وأدوات المطبخ - Paper Products & Kitchen Disposables', 12, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001201', '10000000-0000-4000-8000-000000000012', 'Tissues & Kitchen Paper Rolls', 'المحارم الورقية ورولات المطبخ', 'tissues-kitchen-rolls', 'Facial tissue boxes, pocket tissues, toilet paper, and kitchen towels.', 'علب محارم وجه، محارم جيب، ورق تواليت، ورول تنشيف المطبخ.', '/categories/tissues-kitchen-rolls.png', 'المحارم الورقية ورولات المطبخ - Tissues & Kitchen Paper Rolls', 1, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001202', '10000000-0000-4000-8000-000000000012', 'Aluminum Foil, Cling Film & Baking Paper', 'القصدير ونايلون التغليف وورق الزبدة', 'foil-cling-film-baking-paper', 'Heavy-duty aluminum foil, food wrap cling film, and parchment paper.', 'ورق ألمنيوم قصدير، نايلون تغليف الطعام، وورق زبدة للفرن.', '/categories/foil-cling-film-baking-paper.png', 'القصدير ونايلون التغليف وورق الزبدة - Aluminum Foil, Cling Film & Baking Paper', 2, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001203', '10000000-0000-4000-8000-000000000012', 'Trash Bags & Freezer Bags', 'أكياس القمامة وأكياس التفريز', 'trash-freezer-bags', 'Heavy-duty garbage bags in various sizes and food storage freezer bags.', 'أكياس قمامة بأحجام مختلفة، وأكياس تفريز وحفظ الطعام.', '/categories/trash-freezer-bags.png', 'أكياس القمامة وأكياس التفريز - Trash Bags & Freezer Bags', 3, true, v_now, v_now),
    ('10000000-0000-4000-8000-000000001204', '10000000-0000-4000-8000-000000000012', 'Disposable Cups, Plates & Batteries', 'الأكواب والصحون الورقية والبطاريات', 'disposable-tableware-batteries', 'Paper and plastic cups, plates, cutlery, lighters, and household batteries.', 'أكواب وصحون سفري، ملاعق بلاستيك، قداحات، وبطاريات منزلية.', '/categories/disposable-tableware-batteries.png', 'الأكواب والصحون الورقية والبطاريات - Disposable Cups, Plates & Batteries', 4, true, v_now, v_now)
  on conflict (id) do update
  set
    parent_id = excluded.parent_id,
    name = excluded.name,
    name_ar = excluded.name_ar,
    slug = excluded.slug,
    description = excluded.description,
    description_ar = excluded.description_ar,
    image_url = excluded.image_url,
    image_alt = excluded.image_alt,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    updated_at = v_now;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;






select public.seed_supermarket_categories();




