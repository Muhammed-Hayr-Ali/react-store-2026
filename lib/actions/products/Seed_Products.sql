DO $$
DECLARE
    v_category_id UUID;
    v_brand_id UUID;
    v_product_id UUID;
BEGIN
    SELECT id INTO v_category_id FROM categories LIMIT 1;
    SELECT id INTO v_brand_id FROM brands LIMIT 1;

    -- 1. حليب طازج
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'حليب طازج كامل الدسم', 'milk-full-fat-1', 'حليب بقري طازج 100%', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-001', '1 لتر', '{"الحجم": "1 لتر"}', 5.50, 40);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk1/800', 'حليب', true);

    -- 2. زبادي طازج
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'زبادي طازج سادة', 'yogurt-plain-2', 'زبادي طبيعي بدون إضافات', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-002', '2 كيلو', '{"الوزن": "2 كيلو"}', 12.00, 25);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk2/800', 'زبادي', true);

    -- 3. بيض مائدة
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'بيض مائدة طازج', 'eggs-fresh-3', 'بيض مائدة درجة أولى كبير', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-003', '30 حبة', '{"العدد": "30 حبة"}', 18.50, 60);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk3/800', 'بيض', true);

    -- 4. جبنة شيدر
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'جبنة شيدر بلوك', 'cheddar-cheese-4', 'جبنة شيدر غنية ومثالية للسندويشات', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-004', '250 جرام', '{"الوزن": "250 جرام"}', 8.75, 30);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk4/800', 'شيدر', true);

    -- 5. لبنة تركية
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'لبنة تركية فاخرة', 'labneh-turkish-5', 'لبنة تركية طرية ولذيذة', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-005', '500 جرام', '{"الوزن": "500 جرام"}', 14.00, 45);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk5/800', 'لبنة', true);

    -- 6. زبدة غير مملحة
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'زبدة غير مملحة', 'butter-unsalted-6', 'زبدة طبيعية للطبخ والحلويات', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-006', '200 جرام', '{"الوزن": "200 جرام"}', 6.50, 50);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk6/800', 'زبدة', true);

    -- 7. خبز أبيض مقطع
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'خبز أبيض توست', 'toast-white-7', 'خبز توست أبيض طازج', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-007', 'عبوة', '{"النوع": "أبيض"}', 4.00, 20);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk7/800', 'توست', true);

    -- 8. خبز أسمر
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'خبز أسمر بالردة', 'toast-brown-8', 'توست أسمر صحي للدايت', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-008', 'عبوة', '{"النوع": "أسمر"}', 5.00, 20);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk8/800', 'توست أسمر', true);

    -- 9. أرز مصري
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'أرز مصري ممتاز', 'rice-egyptian-9', 'أرز مصري حبة قصيرة', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-009', '5 كيلو', '{"الوزن": "5 كيلو"}', 35.00, 100);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk9/800', 'أرز مصري', true);

    -- 10. أرز بسمتي
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'أرز بسمتي هندي', 'rice-basmati-10', 'أرز بسمتي حبة طويلة للمندي', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-010', '5 كيلو', '{"الوزن": "5 كيلو"}', 42.00, 80);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk10/800', 'أرز بسمتي', true);

    -- 11. مكرونة قواقع
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'مكرونة قواقع', 'pasta-shells-11', 'مكرونة قواقع للصلصات والشوربة', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-011', '500 جرام', '{"الوزن": "500 جرام"}', 4.50, 150);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk11/800', 'مكرونة', true);

    -- 12. دقيق أبيض
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'دقيق أبيض فاخر', 'flour-white-12', 'دقيق متعدد الاستخدامات للمخبوزات', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-012', '1 كيلو', '{"الوزن": "1 كيلو"}', 3.50, 100);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk12/800', 'دقيق', true);

    -- 13. سكر ناعم
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'سكر أبيض ناعم', 'sugar-white-13', 'سكر أبيض نقي للتحلية', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-013', '2 كيلو', '{"الوزن": "2 كيلو"}', 7.50, 120);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk13/800', 'سكر', true);

    -- 14. شوفان كامل
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'شوفان حبة كاملة', 'oats-whole-14', 'شوفان صحي للإفطار والدايت', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-014', '500 جرام', '{"الوزن": "500 جرام"}', 9.00, 40);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk14/800', 'شوفان', true);

    -- 15. زيت زيتون
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'زيت زيتون بكر', 'olive-oil-15', 'زيت زيتون عصرة أولى على البارد', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-015', '500 مل', '{"الحجم": "500 مل"}', 22.00, 30);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk15/800', 'زيت زيتون', true);

    -- 16. زيت دوار الشمس
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'زيت دوار الشمس للطبخ', 'sunflower-oil-16', 'زيت نباتي نقي للطبخ والقلي', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-016', '1.5 لتر', '{"الحجم": "1.5 لتر"}', 14.50, 60);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk16/800', 'زيت طبخ', true);

    -- 17. معجون طماطم
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'معجون طماطم مركز', 'tomato-paste-17', 'صلصة طماطم كثيفة للطبخ', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-017', '8 × 135ج', '{"العبوة": "8 حبات"}', 11.00, 80);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk17/800', 'معجون طماطم', true);

    -- 18. تونة بالماء
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'تونة خفيفة بالماء', 'tuna-water-18', 'تونة دايت محفوظة بالماء والملح', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-018', '185 جرام', '{"الوزن": "185 جرام"}', 6.50, 100);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk18/800', 'تونة', true);

    -- 19. فول مدمس
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'فول مدمس سادة', 'fava-beans-19', 'فول مدمس جاهز للأكل', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-019', '400 جرام', '{"الوزن": "400 جرام"}', 3.00, 150);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk19/800', 'فول معلب', true);

    -- 20. ذرة حلوة
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'ذرة حلوة معلبة', 'sweet-corn-20', 'ذرة حلوة ومقرمشة للسلطات', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-020', '340 جرام', '{"الوزن": "340 جرام"}', 4.25, 90);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk20/800', 'ذرة', true);

    -- 21. ملح طعام
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'ملح طعام باليود', 'table-salt-21', 'ملح بحري مكرر ناعم', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-021', '700 جرام', '{"الوزن": "700 جرام"}', 1.50, 200);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk21/800', 'ملح', true);

    -- 22. فلفل أسود
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'فلفل أسود مطحون', 'black-pepper-22', 'فلفل أسود نقي 100%', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-022', '100 جرام', '{"الوزن": "100 جرام"}', 8.00, 60);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk22/800', 'فلفل أسود', true);

    -- 23. كمون مطحون
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'كمون مطحون بلدي', 'cumin-powder-23', 'كمون مطحون ممتاز', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-023', '100 جرام', '{"الوزن": "100 جرام"}', 6.50, 50);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk23/800', 'كمون', true);

    -- 24. مايونيز
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'مايونيز الأصلي', 'mayo-original-24', 'مايونيز غني وكريمي', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-024', '500 مل', '{"الحجم": "500 مل"}', 12.50, 40);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk24/800', 'مايونيز', true);

    -- 25. كاتشب
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'كاتشب طماطم', 'ketchup-tomato-25', 'كاتشب مصنوع من طماطم طازجة', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-025', '500 جرام', '{"الوزن": "500 جرام"}', 10.00, 50);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk25/800', 'كاتشب', true);

    -- 26. شطة حارة
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'شطة حارة سائلة', 'hot-sauce-26', 'شطة حمراء حارة للساندويشات', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-026', '88 مل', '{"الحجم": "88 مل"}', 3.50, 80);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk26/800', 'شطة', true);

    -- 27. مياه شرب
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'مياه شرب معبأة', 'bottled-water-27', 'مياه شرب نقية ومنعشة', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-027', '6 × 1.5 لتر', '{"العبوة": "6 قوارير"}', 7.50, 100);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk27/800', 'مياه', true);

    -- 28. كولا
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'مشروب غازي كولا', 'cola-drink-28', 'مشروب كولا غازي منعش', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-028', '2.25 لتر', '{"الحجم": "2.25 لتر"}', 6.00, 120);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk28/800', 'كولا', true);

    -- 29. عصير برتقال
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'عصير برتقال 100%', 'orange-juice-29', 'عصير برتقال طبيعي بدون سكر مضاف', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-029', '1 لتر', '{"الحجم": "1 لتر"}', 8.50, 60);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk29/800', 'عصير', true);

    -- 30. شاي أخضر
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'شاي أخضر نقي', 'green-tea-30', 'أكياس شاي أخضر طبيعي للرجيم', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-030', '100 كيس', '{"العبوة": "100 كيس"}', 19.00, 40);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk30/800', 'شاي أخضر', true);

    -- 31. قهوة سريعة التحضير
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'قهوة سريعة التحضير جولد', 'coffee-gold-31', 'حبيبات قهوة غنية بالنكهة', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-031', '100 جرام', '{"الوزن": "100 جرام"}', 22.50, 30);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk31/800', 'قهوة', true);

    -- 32. قهوة تركية
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'قهوة تركية بالهيل', 'turkish-coffee-32', 'قهوة تركية محمصة ومطحونة بالهيل', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-032', '250 جرام', '{"الوزن": "250 جرام"}', 14.00, 50);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk32/800', 'قهوة تركية', true);

    -- 33. شيبس جبنة
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'شيبس بطاطس بالجبنة', 'cheese-chips-33', 'رقائق بطاطس مقرمشة بنكهة الجبنة', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-033', '160 جرام', '{"الوزن": "160 جرام"}', 5.50, 90);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk33/800', 'شيبس', true);

    -- 34. مكسرات مشكلة
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'مكسرات مشكلة محمصة', 'mixed-nuts-34', 'تشكيلة مكسرات محمصة ومملحة', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-034', '300 جرام', '{"الوزن": "300 جرام"}', 28.00, 40);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk34/800', 'مكسرات', true);

    -- 35. شوكولاتة سادة
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'لوح شوكولاتة سادة', 'milk-chocolate-35', 'شوكولاتة بالحليب غنية وناعمة', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-035', '100 جرام', '{"الوزن": "100 جرام"}', 4.00, 150);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk35/800', 'شوكولاتة', true);

    -- 36. بسكويت شاي
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'بسكويت شاي كلاسيك', 'tea-biscuit-36', 'بسكويت سادة مقرمش للشاي والقهوة', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-036', '12 × 100ج', '{"العبوة": "12 حبة"}', 12.50, 70);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk36/800', 'بسكويت', true);

    -- 37. سائل غسيل صحون
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'سائل غسيل أطباق بالتفاح', 'dishwash-apple-37', 'منظف أطباق قوي على الدهون', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-037', '1 لتر', '{"الحجم": "1 لتر"}', 10.00, 60);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk37/800', 'غسيل صحون', true);

    -- 38. مسحوق غسيل
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'مسحوق غسيل أوتوماتيك', 'laundry-powder-38', 'مسحوق غسيل للغسالات الأوتوماتيك', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-038', '3 كيلو', '{"الوزن": "3 كيلو"}', 38.00, 40);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk38/800', 'مسحوق غسيل', true);

    -- 39. منعم أقمشة
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'منعم أقمشة بعطر الورد', 'fabric-softener-39', 'منعم للملابس يترك رائحة تدوم طويلاً', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-039', '2 لتر', '{"الحجم": "2 لتر"}', 16.50, 50);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk39/800', 'منعم أقمشة', true);

    -- 40. منظف زجاج
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'بخاخ منظف زجاج', 'glass-cleaner-40', 'منظف زجاج يمنع التبقع بلمعان فائق', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-040', '500 مل', '{"الحجم": "500 مل"}', 8.50, 60);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk40/800', 'منظف زجاج', true);

    -- 41. مناديل وجه
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'مناديل وجه ناعمة', 'facial-tissues-41', 'مناديل ورقية فائقة النعومة وقوية', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-041', '10 عبوات', '{"العبوة": "10 حبات"}', 20.00, 40);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk41/800', 'مناديل', true);

    -- 42. ورق تواليت
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'ورق تواليت 3 طبقات', 'toilet-paper-42', 'ورق حمام ناعم ومتين', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-042', '12 رول', '{"العبوة": "12 رول"}', 18.00, 30);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk42/800', 'ورق تواليت', true);

    -- 43. شامبو شعر
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'شامبو للعناية بالشعر', 'hair-shampoo-43', 'شامبو مرطب يغذي الشعر من الجذور', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-043', '400 مل', '{"الحجم": "400 مل"}', 15.00, 50);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk43/800', 'شامبو', true);

    -- 44. صابون سائل لليدين
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'صابون سائل مضاد للبكتيريا', 'hand-wash-44', 'غسول يدين ينظف ويحمي من الجراثيم', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-044', '500 مل', '{"الحجم": "500 مل"}', 9.50, 70);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk44/800', 'صابون يدين', true);

    -- 45. معجون أسنان
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'معجون أسنان بالفلورايد', 'toothpaste-45', 'معجون لحماية الأسنان من التسوس وتبييضها', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-045', '100 مل', '{"الحجم": "100 مل"}', 7.00, 100);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk45/800', 'معجون أسنان', true);

    -- 46. أكياس نفايات
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'أكياس نفايات بربطة', 'garbage-bags-46', 'أكياس قمامة قوية وشديدة التحمل', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-046', '50 جالون', '{"الحجم": "50 جالون"}', 12.00, 50);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk46/800', 'أكياس نفايات', true);

    -- 47. كورن فليكس
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'حبوب إفطار كورن فليكس', 'corn-flakes-47', 'رقائق ذرة محمصة ومقرمشة للإفطار', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-047', '500 جرام', '{"الوزن": "500 جرام"}', 16.50, 45);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk47/800', 'كورن فليكس', true);

    -- 48. معكرونة سريعة التحضير (إندومي)
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'نودلز دجاج سريعة التحضير', 'noodles-chicken-48', 'نودلز سريعة التحضير بنكهة الدجاج', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-048', '5 × 75ج', '{"العبوة": "5 حبات"}', 6.00, 150);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk48/800', 'نودلز', true);

    -- 49. دجاج مجمد
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'دجاج كامل مجمد', 'frozen-chicken-49', 'دجاج نظيف ومجمد جاهز للطبخ', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-049', '1000 جرام', '{"الوزن": "1 كيلو"}', 17.50, 80);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk49/800', 'دجاج مجمد', true);

    -- 50. لحم مفروم بقري مجمد
    INSERT INTO products (category_id, brand_id, name, slug, description, is_active) VALUES 
    (v_category_id, v_brand_id, 'لحم بقري مفروم مجمد', 'minced-beef-50', 'لحم بقري مفروم عالي الجودة للطبخ', true) RETURNING id INTO v_product_id;
    INSERT INTO product_variants (product_id, sku, name, attributes, price, stock_quantity) VALUES 
    (v_product_id, 'MK-050', '400 جرام', '{"الوزن": "400 جرام"}', 11.00, 60);
    INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (v_product_id, 'https://picsum.photos/seed/mk50/800', 'لحم مفروم', true);

END $$;