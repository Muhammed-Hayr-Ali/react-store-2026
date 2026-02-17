// =================================================================
// القسم 1: الأنواع العامة والأدوات المساعدة
// =================================================================

/**
 * نوع موحد لجميع استجابات Server Actions.
 * يضمن أن كل استجابة لها شكل متسق.
 */
export type ServerActionResponse = {
  success: boolean;
  error?: string;
  message?: string;
  requiresReauthentication?: boolean;
};

// =================================================================
// القسم 2: أنواع بيانات المستخدم والعناوين
// =================================================================

/**
 * يمثل بنية عنوان المستخدم كما هي مخزنة في قاعدة البيانات.
 */

// =================================================================
// القسم 3: أنواع بيانات المنتجات وتفاصيلها
// =================================================================

/**
 * يمثل جدول الفئات (categories).
 */
export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
  description: string | null;
  created_at: string;
};

/**
 * يمثل جدول الماركات (brands).
 */
export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  created_at: string;
};

/**
 * يمثل جدول المنتجات الرئيسي (products).
 */
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  main_image_url: string | null;
  image_urls: string[] | null;
  category_id: string | null;
  brand_id: string | null;
  tags: string[] | null;
  is_available: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

// --- أنواع خيارات المنتج ومتغيراته ---

export type ProductOption = {
  id: string;
  name: string;
};



export type VariantOptionValue = {
  id: string;
  value: string;
  option_id: string;
  product_options: ProductOption;

};

export type ProductVariant = {
  id: string;
  sku: string;
  price: number;
  image_url: string | null;
  is_default: boolean;
  product_id: string;
  discount_price: number | null;
  stock_quantity: number;
  discount_expires_at: string | null;
  variant_option_values: VariantOptionValue[];
  created_at: string;
};

/**
 * يمثل المنتج الكامل مع جميع علاقاته المتداخلة.
 */
export type FullProduct = Product & {
  brand: Brand | null;
  category: Category | null;
  variants: ProductVariant[];
  reviews: Review[];
};

// =================================================================
// القسم 4: أنواع بيانات سلة المشتريات
// =================================================================

export type CartItem = {
  id: string;
  quantity: number;
  product_variants: {
    id: string;
    price: number;
    discount_price: number | null;
    products: {
      id: string;
      name: string;
      slug: string;
      main_image_url: string | null;
    } | null;
    variant_option_values:
      | {
          product_option_values: {
            id: string;
            value: string;
            option_id: string;
          } | null;
        }[]
      | null;
  } | null;
};

export type Cart = {
  id: string;
  cart_items: CartItem[];
};

// =================================================================
// القسم 5: أنواع بيانات الطلبات
// =================================================================
// =================================================================
// القسم 6: أنواع بيانات قائمة الرغبات (Wishlist)
// =================================================================

/**
 * يمثل بنية عنصر قائمة الرغبات كما هو مخزن في قاعدة البيانات.
 */

/**
 * /**
 * يمثل جدول التقييمات (reviews).
 */

export type Review = {
  id: number;
  created_at: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  product: {
    name: string;
    slug: string;
    main_image_url: string | null;
  };
  is_verified_purchase: boolean;
};
